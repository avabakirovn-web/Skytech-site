import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ProductCard = ({ product }) => {
  const { user, token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isWishlist, setIsWishlist] = useState(false);

  useEffect(() => {
    if (token) {
      axios.get(`${API}/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setIsWishlist(res.data.product_ids?.includes(product.id)))
        .catch(() => {});
    }
  }, [token, product.id]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Iltimos, avval tizimga kiring");
      navigate('/auth');
      return;
    }

    const success = await addToCart(product.id);
    if (success) {
      toast.success("Mahsulot savatchaga qo'shildi");
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Iltimos, avval tizimga kiring");
      navigate('/auth');
      return;
    }
    navigate(`/checkout?product=${product.id}`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Iltimos, avval tizimga kiring");
      navigate('/auth');
      return;
    }
    try {
      if (isWishlist) {
        await axios.delete(`${API}/wishlist/remove/${product.id}`, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Sevimlilardan o'chirildi");
      } else {
        await axios.post(`${API}/wishlist/add/${product.id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Sevimlilarga qo'shildi");
      }
      setIsWishlist(!isWishlist);
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const discountPercent = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  const displayPrice = product.discount_price || product.price;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-[#F5F7FA] dark:bg-[#0A2540]/20 rounded-3xl border border-black/5 dark:border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(10,37,64,0.08)] hover:border-[#3B82F6]/20 overflow-hidden"
      data-testid={`product-card-${product.id}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name_uz}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.is_new && (
            <span className="bg-[#10B981] text-white text-xs font-medium px-3 py-1 rounded-full">
              Yangi
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#EF4444] text-white text-xs font-medium px-3 py-1 rounded-full">
              -{discountPercent}%
            </span>
          )}
          {product.is_best_seller && (
            <span className="bg-[#3B82F6] text-white text-xs font-medium px-3 py-1 rounded-full">
              Top
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleWishlist}
            className={`p-2 rounded-full transition-all ${
              isWishlist
                ? 'bg-[#EF4444] text-white'
                : 'bg-white/90 text-[#0A2540] hover:bg-[#EF4444] hover:text-white'
            }`}
            data-testid={`wishlist-btn-${product.id}`}
          >
            <Heart className={`w-5 h-5 ${isWishlist ? 'fill-current' : ''}`} />
          </button>
          <button
            className="p-2 bg-white/90 text-[#0A2540] rounded-full hover:bg-[#3B82F6] hover:text-white transition-all"
            data-testid={`quick-view-btn-${product.id}`}
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-lg ${
                  i < Math.floor(product.rating) ? 'text-[#FBBF24]' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-[#475569] dark:text-gray-400">
            ({product.reviews_count})
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-medium text-[#0A2540] dark:text-white mb-2 line-clamp-2"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {product.name_uz}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-[#3B82F6]">
            {displayPrice.toLocaleString()} so'm
          </span>
          {product.discount_price && (
            <span className="text-sm text-gray-400 line-through">
              {product.price.toLocaleString()} so'm
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock > 0 ? (
          <p className="text-sm text-[#10B981] mb-4">Omborda mavjud</p>
        ) : (
          <p className="text-sm text-[#EF4444] mb-4">Omborda yo'q</p>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid={`add-to-cart-btn-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Savat
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1 bg-[#0A2540] hover:bg-black text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid={`buy-now-btn-${product.id}`}
          >
            Sotib olish
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
