import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Cart = () => {
  const { token } = useAuth();
  const { cart, updateCartItem, removeFromCart, fetchCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      loadCart();
    }
  }, [token, cart]);

  const loadCart = async () => {
    try {
      setLoading(true);
      if (cart.items && cart.items.length > 0) {
        const productPromises = cart.items.map(item =>
          axios.get(`${API}/products/${item.product_id}`)
        );
        const responses = await Promise.all(productPromises);
        setProducts(responses.map(res => res.data));
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Savatchani yuklashda xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(productId, newQuantity);
  };

  const handleRemove = async (productId) => {
    await removeFromCart(productId);
    toast.success("Mahsulot o'chirildi");
  };

  const calculateSubtotal = () => {
    return cart.items?.reduce((total, item) => {
      const product = products.find(p => p.id === item.product_id);
      if (product) {
        const price = product.discount_price || product.price;
        return total + (price * item.quantity);
      }
      return total;
    }, 0) || 0;
  };

  const subtotal = calculateSubtotal();
  const shippingCost = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shippingCost;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-[#0A2540] dark:text-white mb-4" data-testid="empty-cart">
            Savatingiz bo'sh
          </h2>
          <p className="text-[#475569] dark:text-gray-300 mb-6">
            Mahsulot qo'shish uchun katalogga o'ting
          </p>
          <Link to="/products">
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full px-8">
              Mahsulotlarni ko'rish
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1
          className="text-3xl sm:text-4xl font-medium text-[#0A2540] dark:text-white mb-8"
          style={{ fontFamily: 'Poppins, sans-serif' }}
          data-testid="cart-title"
        >
          Savatcha
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              const product = products.find(p => p.id === item.product_id);
              if (!product) return null;

              const price = product.discount_price || product.price;

              return (
                <div
                  key={item.product_id}
                  className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  <div className="flex gap-6">
                    <img
                      src={product.image}
                      alt={product.name_uz}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-[#0A2540] dark:text-white mb-2">
                        {product.name_uz}
                      </h3>
                      <p className="text-[#3B82F6] font-bold mb-4">
                        {price.toLocaleString()} so'm
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                            className="p-2 bg-[#F5F7FA] dark:bg-white/5 rounded-lg hover:bg-[#3B82F6] hover:text-white transition-all"
                            data-testid={`decrease-qty-${item.product_id}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-[#0A2540] dark:text-white font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                            className="p-2 bg-[#F5F7FA] dark:bg-white/5 rounded-lg hover:bg-[#3B82F6] hover:text-white transition-all"
                            data-testid={`increase-qty-${item.product_id}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.product_id)}
                          className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-all"
                          data-testid={`remove-item-${item.product_id}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6">
                Buyurtma xulosasi
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-[#475569] dark:text-gray-300">Oraliq summa:</span>
                  <span className="font-medium text-[#0A2540] dark:text-white">
                    {subtotal.toLocaleString()} so'm
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569] dark:text-gray-300">Yetkazib berish:</span>
                  <span className="font-medium text-[#0A2540] dark:text-white">
                    {shippingCost === 0 ? 'Bepul' : `${shippingCost.toLocaleString()} so'm`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-sm text-[#3B82F6]">
                    500,000 so'mdan yuqori xaridlarda yetkazib berish bepul
                  </p>
                )}
                <div className="border-t border-black/5 dark:border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-[#0A2540] dark:text-white">Jami:</span>
                    <span className="text-lg font-bold text-[#3B82F6]">
                      {total.toLocaleString()} so'm
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full py-3 font-medium transition-all"
                data-testid="checkout-btn"
              >
                Rasmiylashtirish
              </Button>

              <Link to="/products">
                <Button className="w-full mt-3 bg-transparent border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white rounded-full py-3 font-medium transition-all">
                  Xaridni davom ettirish
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
