import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import ProductCard from '../components/ProductCard';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const [productRes, reviewsRes] = await Promise.all([
        axios.get(`${API}/products/${id}`),
        axios.get(`${API}/reviews/product/${id}`)
      ]);

      setProduct(productRes.data);
      setReviews(reviewsRes.data);

      // Fetch related products
      const relatedRes = await axios.get(`${API}/products?category=${productRes.data.category}`);
      setRelatedProducts(relatedRes.data.filter(p => p.id !== id).slice(0, 4));
    } catch (error) {
      console.error('Mahsulotni yuklashda xato:', error);
      toast.error('Mahsulot topilmadi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Iltimos, avval tizimga kiring");
      navigate('/auth');
      return;
    }

    const success = await addToCart(product.id, quantity);
    if (success) {
      toast.success("Mahsulot savatchaga qo'shildi");
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error("Iltimos, avval tizimga kiring");
      navigate('/auth');
      return;
    }
    await addToCart(product.id, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#0A2540] dark:text-white mb-4">Mahsulot topilmadi</h2>
          <Link to="/products">
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full px-8">
              Mahsulotlarga qaytish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayPrice = product.discount_price || product.price;
  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#475569] dark:text-gray-300 mb-8">
          <Link to="/" className="hover:text-[#3B82F6]">Bosh sahifa</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-[#3B82F6]">Mahsulotlar</Link>
          <span>/</span>
          <span className="text-[#0A2540] dark:text-white">{product.name_uz}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <div>
            <div className="bg-[#F5F7FA] dark:bg-[#0A2540]/20 rounded-3xl p-8 mb-4">
              <img
                src={product.images[selectedImage] || product.image}
                alt={product.name_uz}
                className="w-full h-96 object-contain"
                data-testid="product-main-image"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`bg-[#F5F7FA] dark:bg-[#0A2540]/20 rounded-2xl p-4 transition-all ${
                      selectedImage === index ? 'ring-2 ring-[#3B82F6]' : 'hover:ring-2 hover:ring-[#3B82F6]/50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-20 object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1
              className="text-3xl sm:text-4xl font-medium text-[#0A2540] dark:text-white mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              data-testid="product-title"
            >
              {product.name_uz}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating) ? 'fill-[#FBBF24] text-[#FBBF24]' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[#475569] dark:text-gray-300">
                {product.rating} ({product.reviews_count} sharh)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-[#3B82F6]">
                {displayPrice.toLocaleString()} so'm
              </span>
              {product.discount_price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {product.price.toLocaleString()} so'm
                  </span>
                  <span className="bg-[#EF4444] text-white text-sm font-medium px-3 py-1 rounded-full">
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Stock */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="text-[#10B981] font-medium">Omborda: {product.stock} dona</span>
              ) : (
                <span className="text-[#EF4444] font-medium">Omborda yo'q</span>
              )}
            </div>

            {/* Description */}
            <p className="text-[#475569] dark:text-gray-300 mb-6">{product.description_uz}</p>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">Miqdor</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 bg-[#F5F7FA] dark:bg-white/5 rounded-xl hover:bg-[#3B82F6] hover:text-white transition-all"
                  data-testid="decrease-quantity"
                >
                  -
                </button>
                <span className="text-xl font-medium text-[#0A2540] dark:text-white w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-3 bg-[#F5F7FA] dark:bg-white/5 rounded-xl hover:bg-[#3B82F6] hover:text-white transition-all"
                  data-testid="increase-quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mb-8">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full py-6 text-lg font-medium transition-all disabled:opacity-50"
                data-testid="add-to-cart-detail"
              >
                <ShoppingCart className="mr-2" />
                Savatchaga qo'shish
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-[#0A2540] hover:bg-black text-white rounded-full py-6 text-lg font-medium transition-all disabled:opacity-50"
                data-testid="buy-now-detail"
              >
                Hozir sotib olish
              </Button>
              <button className="p-6 bg-[#F5F7FA] dark:bg-white/5 rounded-full hover:bg-[#EF4444] hover:text-white transition-all">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 p-6 bg-[#F5F7FA] dark:bg-[#0A2540]/20 rounded-2xl">
              <div className="text-center">
                <Truck className="w-8 h-8 text-[#3B82F6] mx-auto mb-2" />
                <p className="text-sm text-[#475569] dark:text-gray-300">Bepul yetkazib berish</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-[#3B82F6] mx-auto mb-2" />
                <p className="text-sm text-[#475569] dark:text-gray-300">1 yillik kafolat</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-8 h-8 text-[#3B82F6] mx-auto mb-2" />
                <p className="text-sm text-[#475569] dark:text-gray-300">14 kun qaytarish</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12">
            <h2
              className="text-2xl sm:text-3xl font-medium text-[#0A2540] dark:text-white mb-8"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              O'xshash mahsulotlar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;