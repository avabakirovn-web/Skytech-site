import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Wishlist = () => {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchWishlist();
  }, [token]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.product_ids?.length > 0) {
        const productPromises = res.data.product_ids.map(id => axios.get(`${API}/products/${id}`));
        const responses = await Promise.all(productPromises);
        setProducts(responses.map(r => r.data));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${API}/wishlist/remove/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Sevimlilardan o'chirildi");
      fetchWishlist();
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleAddToCart = async (productId) => {
    const success = await addToCart(productId);
    if (success) toast.success("Savatchaga qo'shildi");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div></div>;
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#0A2540] dark:text-white mb-8" style={{ fontFamily: 'Poppins, sans-serif' }} data-testid="wishlist-title">
          Sevimli mahsulotlar
        </h1>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-20 h-20 text-[#475569] mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-2">Sevimli mahsulotlaringiz yo'q</h3>
            <p className="text-[#475569] dark:text-gray-300 mb-6">Kataloggadagi mahsulotlarni sevimlilarga qo'shing</p>
            <Link to="/products">
              <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full px-8">Mahsulotlarga o'tish</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden group" data-testid={`wishlist-item-${product.id}`}>
                <Link to={`/products/${product.id}`}>
                  <img src={product.image} alt={product.name_uz} className="w-full h-56 object-cover group-hover:scale-105 transition-transform" />
                </Link>
                <div className="p-6">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-medium text-[#0A2540] dark:text-white mb-2 hover:text-[#3B82F6]">{product.name_uz}</h3>
                  </Link>
                  <p className="text-xl font-bold text-[#3B82F6] mb-4">
                    {(product.discount_price || product.price).toLocaleString()} so'm
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => handleAddToCart(product.id)} className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full" data-testid={`wishlist-add-cart-${product.id}`}>
                      Savatchaga
                    </Button>
                    <button onClick={() => handleRemove(product.id)} className="p-3 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-full transition-all" data-testid={`wishlist-remove-${product.id}`}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
