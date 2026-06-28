import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid

# Connect to MongoDB
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

async def seed_data():
    print("Seeding database...")
    
    # Clear existing data
    await db.products.delete_many({})
    await db.categories.delete_many({})
    await db.users.delete_many({})
    await db.coupons.delete_many({})
    
    # Seed categories
    categories = [
        {
            'id': 'smartphones',
            'name': 'Smartphones',
            'name_uz': 'Smartfonlar',
            'icon': '📱',
            'image': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
        },
        {
            'id': 'laptops',
            'name': 'Laptops',
            'name_uz': 'Noutbuklar',
            'icon': '💻',
            'image': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
        },
        {
            'id': 'smartwatches',
            'name': 'Smart Watches',
            'name_uz': 'Aqlli soatlar',
            'icon': '⌚',
            'image': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400'
        },
        {
            'id': 'headphones',
            'name': 'Headphones',
            'name_uz': 'Naushniklar',
            'icon': '🎧',
            'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
        },
        {
            'id': 'gaming',
            'name': 'Gaming',
            'name_uz': "O'yin jihozlari",
            'icon': '🎮',
            'image': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400'
        },
        {
            'id': 'accessories',
            'name': 'Accessories',
            'name_uz': 'Aksessuarlar',
            'icon': '🔌',
            'image': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
        }
    ]
    
    await db.categories.insert_many(categories)
    print(f"✓ Created {len(categories)} categories")
    
    # Seed products
    products = [
        # Smartphones
        {
            'id': str(uuid.uuid4()),
            'name': 'iPhone 15 Pro Max',
            'name_uz': 'iPhone 15 Pro Max',
            'description': 'The latest flagship iPhone with A17 Pro chip',
            'description_uz': 'A17 Pro chipli eng yangi iPhone',
            'price': 15000000,
            'discount_price': 13500000,
            'category': 'smartphones',
            'image': 'https://images.unsplash.com/photo-1592286927505-c0d00ae33288?w=500',
            'images': ['https://images.unsplash.com/photo-1592286927505-c0d00ae33288?w=500'],
            'stock': 50,
            'rating': 4.8,
            'reviews_count': 125,
            'specifications': {'RAM': '8GB', 'Storage': '256GB', 'Display': '6.7 inch'},
            'is_featured': True,
            'is_new': True,
            'is_best_seller': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Samsung Galaxy S24 Ultra',
            'name_uz': 'Samsung Galaxy S24 Ultra',
            'description': 'Samsung flagship with S Pen',
            'description_uz': 'S Pen bilan Samsung flagmani',
            'price': 14000000,
            'discount_price': 12600000,
            'category': 'smartphones',
            'image': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
            'images': ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500'],
            'stock': 40,
            'rating': 4.7,
            'reviews_count': 98,
            'specifications': {'RAM': '12GB', 'Storage': '512GB', 'Display': '6.8 inch'},
            'is_featured': True,
            'is_new': True,
            'is_best_seller': False,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        # Laptops
        {
            'id': str(uuid.uuid4()),
            'name': 'MacBook Pro 16 M3',
            'name_uz': 'MacBook Pro 16 M3',
            'description': 'Apple Silicon M3 chip with 18-core GPU',
            'description_uz': '18-yadroli GPU bilan Apple Silicon M3 chip',
            'price': 35000000,
            'discount_price': 33000000,
            'category': 'laptops',
            'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
            'images': ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
            'stock': 30,
            'rating': 4.9,
            'reviews_count': 156,
            'specifications': {'RAM': '32GB', 'Storage': '1TB SSD', 'Display': '16 inch'},
            'is_featured': True,
            'is_new': True,
            'is_best_seller': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Dell XPS 15',
            'name_uz': 'Dell XPS 15',
            'description': 'Premium Windows laptop',
            'description_uz': 'Premium Windows noutbuki',
            'price': 22000000,
            'discount_price': None,
            'category': 'laptops',
            'image': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500',
            'images': ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500'],
            'stock': 25,
            'rating': 4.6,
            'reviews_count': 78,
            'specifications': {'RAM': '16GB', 'Storage': '512GB SSD', 'Display': '15.6 inch'},
            'is_featured': False,
            'is_new': True,
            'is_best_seller': False,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        # Smart Watches
        {
            'id': str(uuid.uuid4()),
            'name': 'Apple Watch Series 9',
            'name_uz': 'Apple Watch Series 9',
            'description': 'The latest Apple Watch',
            'description_uz': 'Eng yangi Apple Watch',
            'price': 6000000,
            'discount_price': 5400000,
            'category': 'smartwatches',
            'image': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500',
            'images': ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500'],
            'stock': 60,
            'rating': 4.7,
            'reviews_count': 234,
            'specifications': {'Display': 'OLED', 'Battery': '18 hours', 'Waterproof': 'Yes'},
            'is_featured': True,
            'is_new': False,
            'is_best_seller': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        # Headphones
        {
            'id': str(uuid.uuid4()),
            'name': 'AirPods Pro 2',
            'name_uz': 'AirPods Pro 2',
            'description': 'Premium noise cancelling earbuds',
            'description_uz': 'Premium shovqinni bekor qiluvchi naushniklar',
            'price': 3500000,
            'discount_price': 3150000,
            'category': 'headphones',
            'image': 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500',
            'images': ['https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=500'],
            'stock': 80,
            'rating': 4.8,
            'reviews_count': 189,
            'specifications': {'Type': 'In-ear', 'Noise Cancellation': 'Yes', 'Battery': '6 hours'},
            'is_featured': True,
            'is_new': True,
            'is_best_seller': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Sony WH-1000XM5',
            'name_uz': 'Sony WH-1000XM5',
            'description': 'Industry leading noise cancellation',
            'description_uz': "Sanoatdagi eng yaxshi shovqin bekor qilish",
            'price': 5000000,
            'discount_price': 4500000,
            'category': 'headphones',
            'image': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
            'images': ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
            'stock': 45,
            'rating': 4.9,
            'reviews_count': 267,
            'specifications': {'Type': 'Over-ear', 'Noise Cancellation': 'Yes', 'Battery': '30 hours'},
            'is_featured': True,
            'is_new': False,
            'is_best_seller': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        # Gaming
        {
            'id': str(uuid.uuid4()),
            'name': 'PlayStation 5',
            'name_uz': 'PlayStation 5',
            'description': 'Next-gen gaming console',
            'description_uz': "Keyingi avlod o'yin konsoli",
            'price': 7500000,
            'discount_price': None,
            'category': 'gaming',
            'image': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
            'images': ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500'],
            'stock': 20,
            'rating': 4.9,
            'reviews_count': 342,
            'specifications': {'Storage': '825GB SSD', 'Resolution': '4K', 'Ray Tracing': 'Yes'},
            'is_featured': True,
            'is_new': False,
            'is_best_seller': True,
            'created_at': datetime.now(timezone.utc).isoformat()
        },
        # Accessories
        {
            'id': str(uuid.uuid4()),
            'name': 'Magic Keyboard',
            'name_uz': 'Magic Keyboard',
            'description': 'Wireless keyboard from Apple',
            'description_uz': "Apple'dan simsiz klaviatura",
            'price': 1500000,
            'discount_price': 1350000,
            'category': 'accessories',
            'image': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
            'images': ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'],
            'stock': 100,
            'rating': 4.6,
            'reviews_count': 89,
            'specifications': {'Type': 'Wireless', 'Battery': '1 month', 'Compatible': 'Mac, iPad'},
            'is_featured': False,
            'is_new': True,
            'is_best_seller': False,
            'created_at': datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(products)
    print(f"✓ Created {len(products)} products")
    
    # Seed admin user
    import bcrypt
    hashed_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    admin_user = {
        'id': str(uuid.uuid4()),
        'email': 'admin@skytech.uz',
        'password': hashed_password,
        'full_name': 'Admin User',
        'phone': '+998901234567',
        'is_admin': True,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(admin_user)
    print("✓ Created admin user (email: admin@skytech.uz, password: admin123)")
    
    # Seed test user
    test_password = bcrypt.hashpw('test123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    test_user = {
        'id': str(uuid.uuid4()),
        'email': 'user@test.uz',
        'password': test_password,
        'full_name': 'Test User',
        'phone': '+998909876543',
        'is_admin': False,
        'created_at': datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(test_user)
    print("✓ Created test user (email: user@test.uz, password: test123)")
    
    # Seed coupons
    coupons = [
        {
            'code': 'WELCOME10',
            'discount_percent': 10,
            'min_purchase': 1000000,
            'is_active': True
        },
        {
            'code': 'SALE20',
            'discount_percent': 20,
            'min_purchase': 5000000,
            'is_active': True
        }
    ]
    
    await db.coupons.insert_many(coupons)
    print(f"✓ Created {len(coupons)} coupons")
    
    print("\n✅ Database seeding completed successfully!")
    print("\nAdmin credentials:")
    print("  Email: admin@skytech.uz")
    print("  Password: admin123")
    print("\nTest user credentials:")
    print("  Email: user@test.uz")
    print("  Password: test123")
    print("\nAvailable coupons:")
    print("  WELCOME10 - 10% off on orders over 1,000,000 so'm")
    print("  SALE20 - 20% off on orders over 5,000,000 so'm")

if __name__ == '__main__':
    asyncio.run(seed_data())
