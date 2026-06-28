from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

security = HTTPBearer()

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# ===== MODELS =====

# Auth Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    full_name: str
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuthResponse(BaseModel):
    token: str
    user: User

# Product Models
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_uz: str
    description: str
    description_uz: str
    price: float
    discount_price: Optional[float] = None
    category: str
    image: str
    images: List[str] = []
    stock: int
    rating: float = 0.0
    reviews_count: int = 0
    specifications: dict = {}
    is_featured: bool = False
    is_new: bool = False
    is_best_seller: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    name_uz: str
    description: str
    description_uz: str
    price: float
    discount_price: Optional[float] = None
    category: str
    image: str
    images: List[str] = []
    stock: int
    specifications: dict = {}
    is_featured: bool = False
    is_new: bool = False
    is_best_seller: bool = False

# Category Model
class Category(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    name_uz: str
    icon: str
    image: str

# Cart Models
class CartItem(BaseModel):
    product_id: str
    quantity: int
    price: float

class Cart(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    items: List[CartItem] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AddToCartRequest(BaseModel):
    product_id: str
    quantity: int = 1

# Wishlist Models
class Wishlist(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    product_ids: List[str] = []
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    image: str

class ShippingAddress(BaseModel):
    full_name: str
    phone: str
    address: str
    city: str
    region: str
    postal_code: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[OrderItem]
    shipping_address: ShippingAddress
    payment_method: str
    subtotal: float
    shipping_cost: float
    discount: float
    total: float
    status: str = "pending"  # pending, processing, shipped, delivered, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    shipping_address: ShippingAddress
    payment_method: str
    coupon_code: Optional[str] = None

# Review Models
class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    user_name: str
    rating: int
    comment: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=3, max_length=500)

# Chat Models
class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    message: str
    is_support: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatMessageCreate(BaseModel):
    message: str

# Coupon Models
class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    code: str
    discount_percent: float
    min_purchase: float
    is_active: bool = True

# ===== AUTH HELPERS =====

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get('user_id')
        
        user_doc = await db.users.find_one({'id': user_id}, {'_id': 0})
        if not user_doc:
            raise HTTPException(status_code=401, detail="Foydalanuvchi topilmadi")
        
        if isinstance(user_doc.get('created_at'), str):
            user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
        
        return User(**user_doc)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token muddati tugagan")
    except Exception:
        raise HTTPException(status_code=401, detail="Noto'g'ri token")

async def get_admin_user(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    return user

# ===== AUTH ROUTES =====

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({'email': data.email}, {'_id': 0})
    if existing:
        raise HTTPException(status_code=400, detail="Bu email allaqachon ro'yxatdan o'tgan")
    
    user = User(
        email=data.email,
        full_name=data.full_name,
        phone=data.phone
    )
    
    user_doc = user.model_dump()
    user_doc['password'] = hash_password(data.password)
    user_doc['created_at'] = user_doc['created_at'].isoformat()
    
    await db.users.insert_one(user_doc)
    
    token = create_token(user.id)
    return AuthResponse(token=token, user=user)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(data: UserLogin):
    user_doc = await db.users.find_one({'email': data.email}, {'_id': 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    
    if not verify_password(data.password, user_doc['password']):
        raise HTTPException(status_code=401, detail="Email yoki parol noto'g'ri")
    
    user_doc.pop('password', None)
    if isinstance(user_doc.get('created_at'), str):
        user_doc['created_at'] = datetime.fromisoformat(user_doc['created_at'])
    
    user = User(**user_doc)
    token = create_token(user.id)
    
    return AuthResponse(token=token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(user: User = Depends(get_current_user)):
    return user

# ===== PRODUCT ROUTES =====

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, search: Optional[str] = None, featured: Optional[bool] = None, new: Optional[bool] = None, best_seller: Optional[bool] = None):
    query = {}
    
    if category:
        query['category'] = category
    if featured is not None:
        query['is_featured'] = featured
    if new is not None:
        query['is_new'] = new
    if best_seller is not None:
        query['is_best_seller'] = best_seller
    if search:
        query['$or'] = [
            {'name_uz': {'$regex': search, '$options': 'i'}},
            {'description_uz': {'$regex': search, '$options': 'i'}}
        ]
    
    products = await db.products.find(query, {'_id': 0}).sort('created_at', -1).to_list(100)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({'id': product_id}, {'_id': 0})
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(data: ProductCreate, admin: User = Depends(get_admin_user)):
    product = Product(**data.model_dump())
    product_doc = product.model_dump()
    product_doc['created_at'] = product_doc['created_at'].isoformat()
    
    await db.products.insert_one(product_doc)
    return product

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, data: ProductCreate, admin: User = Depends(get_admin_user)):
    existing = await db.products.find_one({'id': product_id}, {'_id': 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    
    update_data = data.model_dump()
    await db.products.update_one({'id': product_id}, {'$set': update_data})
    
    updated_product = await db.products.find_one({'id': product_id}, {'_id': 0})
    if isinstance(updated_product.get('created_at'), str):
        updated_product['created_at'] = datetime.fromisoformat(updated_product['created_at'])
    
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: User = Depends(get_admin_user)):
    result = await db.products.delete_one({'id': product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    return {"message": "Mahsulot o'chirildi"}

# ===== CATEGORY ROUTES =====

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find({}, {'_id': 0}).to_list(100)
    return categories

# ===== CART ROUTES =====

@api_router.get("/cart", response_model=Cart)
async def get_cart(user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({'user_id': user.id}, {'_id': 0})
    if not cart:
        cart = Cart(user_id=user.id)
        cart_doc = cart.model_dump()
        cart_doc['updated_at'] = cart_doc['updated_at'].isoformat()
        await db.carts.insert_one(cart_doc)
    else:
        if isinstance(cart.get('updated_at'), str):
            cart['updated_at'] = datetime.fromisoformat(cart['updated_at'])
    
    return Cart(**cart) if isinstance(cart, dict) else cart

@api_router.post("/cart/add")
async def add_to_cart(data: AddToCartRequest, user: User = Depends(get_current_user)):
    product = await db.products.find_one({'id': data.product_id}, {'_id': 0})
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    
    cart = await db.carts.find_one({'user_id': user.id}, {'_id': 0})
    
    if not cart:
        cart = {
            'user_id': user.id,
            'items': [],
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
    
    # Check if product already in cart
    found = False
    for item in cart['items']:
        if item['product_id'] == data.product_id:
            item['quantity'] += data.quantity
            found = True
            break
    
    if not found:
        cart['items'].append({
            'product_id': data.product_id,
            'quantity': data.quantity,
            'price': product.get('discount_price', product['price'])
        })
    
    cart['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(
        {'user_id': user.id},
        {'$set': cart},
        upsert=True
    )
    
    return {"message": "Mahsulot savatchaga qo'shildi"}

@api_router.put("/cart/update")
async def update_cart_item(data: AddToCartRequest, user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({'user_id': user.id}, {'_id': 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Savatcha topilmadi")
    
    found = False
    for item in cart['items']:
        if item['product_id'] == data.product_id:
            item['quantity'] = data.quantity
            found = True
            break
    
    if not found:
        raise HTTPException(status_code=404, detail="Mahsulot savatchada topilmadi")
    
    cart['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(
        {'user_id': user.id},
        {'$set': cart}
    )
    
    return {"message": "Savatcha yangilandi"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({'user_id': user.id}, {'_id': 0})
    if not cart:
        raise HTTPException(status_code=404, detail="Savatcha topilmadi")
    
    cart['items'] = [item for item in cart['items'] if item['product_id'] != product_id]
    cart['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.carts.update_one(
        {'user_id': user.id},
        {'$set': cart}
    )
    
    return {"message": "Mahsulot savatchadan o'chirildi"}

@api_router.delete("/cart/clear")
async def clear_cart(user: User = Depends(get_current_user)):
    await db.carts.update_one(
        {'user_id': user.id},
        {'$set': {'items': [], 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    return {"message": "Savatcha tozalandi"}

# ===== WISHLIST ROUTES =====

@api_router.get("/wishlist", response_model=Wishlist)
async def get_wishlist(user: User = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({'user_id': user.id}, {'_id': 0})
    if not wishlist:
        wishlist = Wishlist(user_id=user.id)
        wishlist_doc = wishlist.model_dump()
        wishlist_doc['updated_at'] = wishlist_doc['updated_at'].isoformat()
        await db.wishlists.insert_one(wishlist_doc)
    else:
        if isinstance(wishlist.get('updated_at'), str):
            wishlist['updated_at'] = datetime.fromisoformat(wishlist['updated_at'])
    
    return Wishlist(**wishlist) if isinstance(wishlist, dict) else wishlist

@api_router.post("/wishlist/add/{product_id}")
async def add_to_wishlist(product_id: str, user: User = Depends(get_current_user)):
    product = await db.products.find_one({'id': product_id}, {'_id': 0})
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    
    wishlist = await db.wishlists.find_one({'user_id': user.id}, {'_id': 0})
    
    if not wishlist:
        wishlist = {
            'user_id': user.id,
            'product_ids': [product_id],
            'updated_at': datetime.now(timezone.utc).isoformat()
        }
    else:
        if product_id not in wishlist['product_ids']:
            wishlist['product_ids'].append(product_id)
        wishlist['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.wishlists.update_one(
        {'user_id': user.id},
        {'$set': wishlist},
        upsert=True
    )
    
    return {"message": "Mahsulot sevimlilarga qo'shildi"}

@api_router.delete("/wishlist/remove/{product_id}")
async def remove_from_wishlist(product_id: str, user: User = Depends(get_current_user)):
    wishlist = await db.wishlists.find_one({'user_id': user.id}, {'_id': 0})
    if not wishlist:
        raise HTTPException(status_code=404, detail="Sevimlilar topilmadi")
    
    wishlist['product_ids'] = [pid for pid in wishlist['product_ids'] if pid != product_id]
    wishlist['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.wishlists.update_one(
        {'user_id': user.id},
        {'$set': wishlist}
    )
    
    return {"message": "Mahsulot sevimlilardan o'chirildi"}

# ===== ORDER ROUTES =====

@api_router.post("/orders", response_model=Order)
async def create_order(data: OrderCreate, user: User = Depends(get_current_user)):
    # Get cart
    cart = await db.carts.find_one({'user_id': user.id}, {'_id': 0})
    if not cart or not cart.get('items'):
        raise HTTPException(status_code=400, detail="Savatcha bo'sh")
    
    # Calculate totals
    order_items = []
    subtotal = 0.0
    
    for cart_item in cart['items']:
        product = await db.products.find_one({'id': cart_item['product_id']}, {'_id': 0})
        if product:
            price = product.get('discount_price', product['price'])
            order_items.append(OrderItem(
                product_id=product['id'],
                product_name=product['name_uz'],
                quantity=cart_item['quantity'],
                price=price,
                image=product['image']
            ))
            subtotal += price * cart_item['quantity']
    
    shipping_cost = 0.0 if subtotal > 500000 else 30000  # Free shipping over 500k
    discount = 0.0
    
    # Apply coupon if provided
    if data.coupon_code:
        coupon = await db.coupons.find_one({'code': data.coupon_code, 'is_active': True}, {'_id': 0})
        if coupon and subtotal >= coupon['min_purchase']:
            discount = subtotal * (coupon['discount_percent'] / 100)
    
    total = subtotal + shipping_cost - discount
    
    order = Order(
        user_id=user.id,
        items=order_items,
        shipping_address=data.shipping_address,
        payment_method=data.payment_method,
        subtotal=subtotal,
        shipping_cost=shipping_cost,
        discount=discount,
        total=total
    )
    
    order_doc = order.model_dump()
    order_doc['created_at'] = order_doc['created_at'].isoformat()
    
    await db.orders.insert_one(order_doc)
    
    # Clear cart
    await db.carts.update_one(
        {'user_id': user.id},
        {'$set': {'items': [], 'updated_at': datetime.now(timezone.utc).isoformat()}}
    )
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_user_orders(user: User = Depends(get_current_user)):
    orders = await db.orders.find({'user_id': user.id}, {'_id': 0}).sort('created_at', -1).to_list(100)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str, user: User = Depends(get_current_user)):
    order = await db.orders.find_one({'id': order_id}, {'_id': 0})
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    
    if order['user_id'] != user.id and not user.is_admin:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return Order(**order)

# ===== REVIEW ROUTES =====

@api_router.get("/reviews/product/{product_id}", response_model=List[Review])
async def get_product_reviews(product_id: str):
    reviews = await db.reviews.find({'product_id': product_id}, {'_id': 0}).sort('created_at', -1).to_list(100)
    
    for review in reviews:
        if isinstance(review.get('created_at'), str):
            review['created_at'] = datetime.fromisoformat(review['created_at'])
    
    return reviews

@api_router.post("/reviews", response_model=Review)
async def create_review(data: ReviewCreate, user: User = Depends(get_current_user)):
    # Check if product exists
    product = await db.products.find_one({'id': data.product_id}, {'_id': 0})
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    
    review = Review(
        product_id=data.product_id,
        user_id=user.id,
        user_name=user.full_name,
        rating=data.rating,
        comment=data.comment
    )
    
    review_doc = review.model_dump()
    review_doc['created_at'] = review_doc['created_at'].isoformat()
    
    await db.reviews.insert_one(review_doc)
    
    # Update product rating
    all_reviews = await db.reviews.find({'product_id': data.product_id}, {'_id': 0}).to_list(1000)
    avg_rating = sum(r['rating'] for r in all_reviews) / len(all_reviews)
    
    await db.products.update_one(
        {'id': data.product_id},
        {'$set': {'rating': round(avg_rating, 1), 'reviews_count': len(all_reviews)}}
    )
    
    return review

# ===== CHAT ROUTES =====

@api_router.get("/chat/messages", response_model=List[ChatMessage])
async def get_chat_messages(user: User = Depends(get_current_user)):
    messages = await db.chat_messages.find({'user_id': user.id}, {'_id': 0}).sort('created_at', 1).to_list(100)
    
    for msg in messages:
        if isinstance(msg.get('created_at'), str):
            msg['created_at'] = datetime.fromisoformat(msg['created_at'])
    
    return messages

@api_router.post("/chat/send", response_model=ChatMessage)
async def send_chat_message(data: ChatMessageCreate, user: User = Depends(get_current_user)):
    message = ChatMessage(
        user_id=user.id,
        message=data.message,
        is_support=False
    )
    
    msg_doc = message.model_dump()
    msg_doc['created_at'] = msg_doc['created_at'].isoformat()
    
    await db.chat_messages.insert_one(msg_doc)
    
    # Auto-reply (simple bot response)
    reply = ChatMessage(
        user_id=user.id,
        message="Rahmat! Tez orada sizga javob beramiz.",
        is_support=True
    )
    
    reply_doc = reply.model_dump()
    reply_doc['created_at'] = reply_doc['created_at'].isoformat()
    
    await db.chat_messages.insert_one(reply_doc)
    
    return message

# ===== ADMIN ROUTES =====

@api_router.get("/admin/stats")
async def get_admin_stats(admin: User = Depends(get_admin_user)):
    total_products = await db.products.count_documents({})
    total_orders = await db.orders.count_documents({})
    total_customers = await db.users.count_documents({'is_admin': False})
    
    # Calculate total revenue
    orders = await db.orders.find({}, {'_id': 0, 'total': 1}).to_list(10000)
    total_revenue = sum(order['total'] for order in orders)
    
    # Recent orders
    recent_orders = await db.orders.find({}, {'_id': 0}).sort('created_at', -1).limit(10).to_list(10)
    for order in recent_orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return {
        'total_products': total_products,
        'total_orders': total_orders,
        'total_customers': total_customers,
        'total_revenue': total_revenue,
        'recent_orders': recent_orders
    }

@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(admin: User = Depends(get_admin_user)):
    orders = await db.orders.find({}, {'_id': 0}).sort('created_at', -1).to_list(1000)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.put("/admin/orders/{order_id}/status")
async def update_order_status(order_id: str, new_status: str, admin: User = Depends(get_admin_user)):
    result = await db.orders.update_one(
        {'id': order_id},
        {'$set': {'status': new_status}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    
    return {"message": "Buyurtma holati yangilandi"}

@api_router.get("/admin/customers")
async def get_customers(admin: User = Depends(get_admin_user)):
    customers = await db.users.find({'is_admin': False}, {'_id': 0, 'password': 0}).to_list(1000)
    
    for customer in customers:
        if isinstance(customer.get('created_at'), str):
            customer['created_at'] = datetime.fromisoformat(customer['created_at'])
    
    return customers

# ===== COUPON ROUTES =====

@api_router.post("/coupons/validate")
async def validate_coupon(code: str, subtotal: float):
    coupon = await db.coupons.find_one({'code': code, 'is_active': True}, {'_id': 0})
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Kupon topilmadi yoki faol emas")
    
    if subtotal < coupon['min_purchase']:
        raise HTTPException(
            status_code=400,
            detail=f"Minimal xarid summasi {coupon['min_purchase']} so'm bo'lishi kerak"
        )
    
    discount = subtotal * (coupon['discount_percent'] / 100)
    
    return {
        'valid': True,
        'discount_percent': coupon['discount_percent'],
        'discount_amount': discount,
        'message': f"{coupon['discount_percent']}% chegirma qo'llanildi"
    }

# ===== AI RECOMMENDATIONS =====

@api_router.get("/recommendations/{product_id}")
async def get_ai_recommendations(product_id: str):
    """Get AI-powered product recommendations based on current product"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    import json
    import re
    
    # Get current product
    current_product = await db.products.find_one({'id': product_id}, {'_id': 0})
    if not current_product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    
    # Get all other products
    all_products = await db.products.find(
        {'id': {'$ne': product_id}},
        {'_id': 0, 'id': 1, 'name_uz': 1, 'category': 1, 'price': 1, 'discount_price': 1}
    ).to_list(50)
    
    if not all_products:
        return {'recommendations': [], 'reasoning': ''}
    
    # Build product list for LLM
    products_text = "\n".join([
        f"- ID: {p['id']}, Nomi: {p['name_uz']}, Kategoriya: {p['category']}, Narx: {p.get('discount_price') or p['price']} so'm"
        for p in all_products
    ])
    
    system_message = """Sen SkyTech elektronika do'koni uchun aqlli mahsulot tavsiyachisisan.
Foydalanuvchi qarayotgan mahsulotga asoslanib, mijozga eng mos 4 ta mahsulotni tavsiya qil.
Tavsiyalar bir-birini to'ldiruvchi yoki muqobil mahsulotlar bo'lishi kerak.
Faqat JSON formatida javob ber: {"product_ids": ["id1", "id2", "id3", "id4"], "reasoning": "qisqa izoh o'zbek tilida"}"""
    
    user_text = f"""Foydalanuvchi quyidagi mahsulotni ko'rmoqda:
Nomi: {current_product['name_uz']}
Kategoriya: {current_product['category']}
Narxi: {current_product.get('discount_price') or current_product['price']} so'm

Mavjud boshqa mahsulotlar:
{products_text}

Ushbu mijozga eng mos 4 ta mahsulot ID'sini tanlang va sababini qisqa o'zbek tilida tushuntiring."""
    
    try:
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=f"recommend-{product_id}",
            system_message=system_message
        ).with_model("openai", "gpt-5.2")
        
        response = await chat.send_message(UserMessage(text=user_text))
        
        # Extract JSON from response
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            data = json.loads(json_match.group())
            recommended_ids = data.get('product_ids', [])
            reasoning = data.get('reasoning', '')
        else:
            recommended_ids = []
            reasoning = ''
        
        # Get full product details
        recommended_products = []
        for rec_id in recommended_ids[:4]:
            prod = await db.products.find_one({'id': rec_id}, {'_id': 0})
            if prod:
                if isinstance(prod.get('created_at'), str):
                    prod['created_at'] = datetime.fromisoformat(prod['created_at'])
                recommended_products.append(prod)
        
        return {
            'recommendations': recommended_products,
            'reasoning': reasoning
        }
    except Exception as e:
        logger.error(f"AI recommendation error: {e}")
        # Fallback: smart algorithm - same category first, then featured/best-seller, then similar price
        current_price = current_product.get('discount_price') or current_product['price']
        
        # Get same category products
        category_products = await db.products.find(
            {'id': {'$ne': product_id}, 'category': current_product['category']},
            {'_id': 0}
        ).to_list(50)
        
        # Get other featured/best-seller products if needed
        if len(category_products) < 4:
            other_featured = await db.products.find(
                {'id': {'$ne': product_id}, 'category': {'$ne': current_product['category']},
                 '$or': [{'is_featured': True}, {'is_best_seller': True}]},
                {'_id': 0}
            ).to_list(20)
            category_products.extend(other_featured)
        
        # Sort by similarity (price closeness, then rating)
        def similarity_score(p):
            p_price = p.get('discount_price') or p['price']
            price_diff = abs(p_price - current_price) / max(current_price, 1)
            return (price_diff, -p.get('rating', 0))
        
        category_products.sort(key=similarity_score)
        fallback = category_products[:4]
        
        for p in fallback:
            if isinstance(p.get('created_at'), str):
                p['created_at'] = datetime.fromisoformat(p['created_at'])
        
        return {
            'recommendations': fallback,
            'reasoning': "Sizga eng mos mahsulotlar: o'xshash kategoriya va narx oralig'idan tanlandi"
        }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()