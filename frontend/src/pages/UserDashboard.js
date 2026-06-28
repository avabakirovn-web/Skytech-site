import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, MapPin, Bell, Package } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const UserDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, wishlistRes] = await Promise.all([
        axios.get(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setOrders(ordersRes.data);

      if (wishlistRes.data.product_ids?.length > 0) {
        const productPromises = wishlistRes.data.product_ids.map(id => axios.get(`${API}/products/${id}`));
        const responses = await Promise.all(productPromises);
        setWishlist(responses.map(r => r.data));
      }
    } catch (error) {
      console.error('Xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    const labels = {
      pending: 'Kutilmoqda',
      processing: 'Tayyorlanmoqda',
      shipped: 'Yuborildi',
      delivered: 'Yetkazib berildi',
      cancelled: 'Bekor qilindi'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const tabs = [
    { id: 'orders', label: 'Buyurtmalarim', icon: ShoppingBag },
    { id: 'wishlist', label: 'Sevimlilar', icon: Heart },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'addresses', label: 'Manzillar', icon: MapPin },
    { id: 'notifications', label: 'Bildirishnomalar', icon: Bell }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#0A2540] dark:text-white mb-8" style={{ fontFamily: 'Poppins, sans-serif' }} data-testid="dashboard-title">
          Mening hisobim
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div>
            <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-black/5 dark:border-white/10">
                <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-[#0A2540] dark:text-white">{user?.full_name}</p>
                  <p className="text-sm text-[#475569] dark:text-gray-300 truncate">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id ? 'bg-[#3B82F6] text-white' : 'text-[#475569] dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                    data-testid={`tab-${tab.id}`}>
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto"></div></div>
            ) : (
              <>
                {activeTab === 'orders' && (
                  <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6" data-testid="orders-content">
                    <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6">Buyurtmalarim</h3>
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-[#475569] mx-auto mb-4" />
                        <p className="text-[#475569] dark:text-gray-300 mb-4">Hozircha buyurtmalaringiz yo'q</p>
                        <Link to="/products">
                          <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full">Xarid qilish</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="p-6 bg-[#F5F7FA] dark:bg-white/5 rounded-xl" data-testid={`order-${order.id}`}>
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="font-medium text-[#0A2540] dark:text-white">Buyurtma #{order.id.slice(0, 8)}</p>
                                <p className="text-sm text-[#475569] dark:text-gray-300">{new Date(order.created_at).toLocaleDateString('uz-UZ')}</p>
                              </div>
                              {getStatusBadge(order.status)}
                            </div>
                            <div className="space-y-2 mb-4">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm">
                                  <img src={item.image} alt="" className="w-10 h-10 object-cover rounded" />
                                  <span className="flex-1 text-[#0A2540] dark:text-white">{item.product_name} x {item.quantity}</span>
                                  <span className="font-medium text-[#0A2540] dark:text-white">{(item.price * item.quantity).toLocaleString()} so'm</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-black/5 dark:border-white/10">
                              <span className="text-[#475569] dark:text-gray-300">Jami:</span>
                              <span className="text-xl font-bold text-[#3B82F6]">{order.total.toLocaleString()} so'm</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'wishlist' && (
                  <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6" data-testid="wishlist-content">
                    <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6">Sevimli mahsulotlar</h3>
                    {wishlist.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-[#475569] mx-auto mb-4" />
                        <p className="text-[#475569] dark:text-gray-300">Sevimli mahsulotlaringiz yo'q</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {wishlist.map((product) => (
                          <Link key={product.id} to={`/products/${product.id}`} className="flex items-center gap-4 p-4 bg-[#F5F7FA] dark:bg-white/5 rounded-xl hover:bg-[#3B82F6]/10 transition-all">
                            <img src={product.image} alt={product.name_uz} className="w-20 h-20 object-cover rounded-lg" />
                            <div>
                              <p className="font-medium text-[#0A2540] dark:text-white">{product.name_uz}</p>
                              <p className="text-[#3B82F6] font-bold">{(product.discount_price || product.price).toLocaleString()} so'm</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6" data-testid="profile-content">
                    <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6">Profil ma'lumotlari</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#475569] dark:text-gray-300 mb-2">To'liq ism</label>
                        <input type="text" value={user?.full_name || ''} readOnly className="w-full px-4 py-3 rounded-xl bg-[#F5F7FA] dark:bg-white/5 text-[#0A2540] dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#475569] dark:text-gray-300 mb-2">Email</label>
                        <input type="email" value={user?.email || ''} readOnly className="w-full px-4 py-3 rounded-xl bg-[#F5F7FA] dark:bg-white/5 text-[#0A2540] dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#475569] dark:text-gray-300 mb-2">Telefon</label>
                        <input type="tel" value={user?.phone || ''} readOnly className="w-full px-4 py-3 rounded-xl bg-[#F5F7FA] dark:bg-white/5 text-[#0A2540] dark:text-white" />
                      </div>
                    </div>
                  </div>
                )}

                {(activeTab === 'addresses' || activeTab === 'notifications') && (
                  <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-12 text-center">
                    <p className="text-[#475569] dark:text-gray-300">Bu bo'lim tez orada ishlashga tushadi</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
