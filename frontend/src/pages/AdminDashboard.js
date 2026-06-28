import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '', name_uz: '', description: '', description_uz: '',
    price: 0, discount_price: null, category: 'smartphones', image: '',
    stock: 0, is_featured: false, is_new: false, is_best_seller: false
  });

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    if (user && !user.is_admin) {
      navigate('/');
      toast.error("Ruxsat yo'q");
      return;
    }
    if (user) fetchData();
  }, [token, user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      if (activeTab === 'overview' || !stats) {
        const statsRes = await axios.get(`${API}/admin/stats`, { headers });
        setStats(statsRes.data);
      }
      if (activeTab === 'orders') {
        const ordersRes = await axios.get(`${API}/admin/orders`, { headers });
        setOrders(ordersRes.data);
      }
      if (activeTab === 'products') {
        const productsRes = await axios.get(`${API}/products`);
        setProducts(productsRes.data);
      }
      if (activeTab === 'customers') {
        const customersRes = await axios.get(`${API}/admin/customers`, { headers });
        setCustomers(customersRes.data);
      }
    } catch (error) {
      console.error('Xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Buyurtma holati yangilandi");
      fetchData();
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleAddProduct = async () => {
    try {
      await axios.post(
        `${API}/products`,
        { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock), discount_price: productForm.discount_price ? Number(productForm.discount_price) : null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Mahsulot qo'shildi");
      setShowAddProduct(false);
      setProductForm({ name: '', name_uz: '', description: '', description_uz: '', price: 0, discount_price: null, category: 'smartphones', image: '', stock: 0, is_featured: false, is_new: false, is_best_seller: false });
      fetchData();
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Mahsulotni o'chirishni xohlaysizmi?")) return;
    try {
      await axios.delete(`${API}/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Mahsulot o'chirildi");
      fetchData();
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    }
  };

  const tabs = [
    { id: 'overview', label: 'Statistika', icon: TrendingUp },
    { id: 'orders', label: 'Buyurtmalar', icon: ShoppingBag },
    { id: 'products', label: 'Mahsulotlar', icon: Package },
    { id: 'customers', label: 'Mijozlar', icon: Users }
  ];

  if (!user || !user.is_admin) return null;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#0A2540] dark:text-white mb-8" style={{ fontFamily: 'Poppins, sans-serif' }} data-testid="admin-title">
          Admin Panel
        </h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                activeTab === tab.id ? 'bg-[#3B82F6] text-white' : 'text-[#475569] dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              data-testid={`admin-tab-${tab.id}`}>
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto"></div></div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-8" data-testid="admin-overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-[#3B82F6]" />
                      </div>
                    </div>
                    <p className="text-sm text-[#475569] dark:text-gray-300 mb-1">Umumiy daromad</p>
                    <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{stats.total_revenue.toLocaleString()} so'm</p>
                  </div>
                  <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#10B981]/10 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-[#10B981]" />
                      </div>
                    </div>
                    <p className="text-sm text-[#475569] dark:text-gray-300 mb-1">Buyurtmalar</p>
                    <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{stats.total_orders}</p>
                  </div>
                  <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#FBBF24]/10 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-[#FBBF24]" />
                      </div>
                    </div>
                    <p className="text-sm text-[#475569] dark:text-gray-300 mb-1">Mahsulotlar</p>
                    <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{stats.total_products}</p>
                  </div>
                  <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-[#EF4444]/10 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-[#EF4444]" />
                      </div>
                    </div>
                    <p className="text-sm text-[#475569] dark:text-gray-300 mb-1">Mijozlar</p>
                    <p className="text-2xl font-bold text-[#0A2540] dark:text-white">{stats.total_customers}</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6">
                  <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6">So'nggi buyurtmalar</h3>
                  {stats.recent_orders?.length > 0 ? (
                    <div className="space-y-3">
                      {stats.recent_orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-[#F5F7FA] dark:bg-white/5 rounded-xl">
                          <div>
                            <p className="font-medium text-[#0A2540] dark:text-white">#{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-[#475569] dark:text-gray-300">{new Date(order.created_at).toLocaleDateString('uz-UZ')}</p>
                          </div>
                          <p className="text-lg font-bold text-[#3B82F6]">{order.total.toLocaleString()} so'm</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-[#475569] dark:text-gray-300 py-8">Buyurtmalar yo'q</p>
                  )}
                </div>
              </div>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6" data-testid="admin-orders">
                <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6">Barcha buyurtmalar</h3>
                {orders.length === 0 ? (
                  <p className="text-center text-[#475569] dark:text-gray-300 py-12">Buyurtmalar yo'q</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="p-6 bg-[#F5F7FA] dark:bg-white/5 rounded-xl">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div>
                            <p className="font-medium text-[#0A2540] dark:text-white">#{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-[#475569] dark:text-gray-300">{order.shipping_address.full_name} - {order.shipping_address.phone}</p>
                          </div>
                          <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="px-3 py-2 rounded-lg bg-white dark:bg-[#0A2540] border border-black/10 dark:border-white/10 text-[#0A2540] dark:text-white"
                            data-testid={`order-status-${order.id}`}>
                            <option value="pending">Kutilmoqda</option>
                            <option value="processing">Tayyorlanmoqda</option>
                            <option value="shipped">Yuborildi</option>
                            <option value="delivered">Yetkazib berildi</option>
                            <option value="cancelled">Bekor qilindi</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/10">
                          <span className="text-sm text-[#475569] dark:text-gray-300">{order.items.length} ta mahsulot</span>
                          <span className="text-lg font-bold text-[#3B82F6]">{order.total.toLocaleString()} so'm</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Products */}
            {activeTab === 'products' && (
              <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6" data-testid="admin-products">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white">Mahsulotlar boshqaruvi</h3>
                  <Button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full" data-testid="add-product-btn">
                    <Plus className="w-4 h-4 mr-2" /> Yangi
                  </Button>
                </div>

                {showAddProduct && (
                  <div className="p-6 bg-[#F5F7FA] dark:bg-white/5 rounded-xl mb-6">
                    <h4 className="font-semibold text-[#0A2540] dark:text-white mb-4">Yangi mahsulot qo'shish</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Nomi (UZ)" value={productForm.name_uz} onChange={(e) => setProductForm({ ...productForm, name_uz: e.target.value, name: e.target.value })} className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A2540] text-[#0A2540] dark:text-white" />
                      <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A2540] text-[#0A2540] dark:text-white">
                        <option value="smartphones">Smartfonlar</option>
                        <option value="laptops">Noutbuklar</option>
                        <option value="smartwatches">Aqlli soatlar</option>
                        <option value="headphones">Naushniklar</option>
                        <option value="gaming">O'yin jihozlari</option>
                        <option value="accessories">Aksessuarlar</option>
                      </select>
                      <input type="number" placeholder="Narx (so'm)" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A2540] text-[#0A2540] dark:text-white" />
                      <input type="number" placeholder="Chegirma narx" value={productForm.discount_price || ''} onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value || null })} className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A2540] text-[#0A2540] dark:text-white" />
                      <input type="number" placeholder="Omborda" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A2540] text-[#0A2540] dark:text-white" />
                      <input type="url" placeholder="Rasm URL" value={productForm.image} onChange={(e) => setProductForm({ ...productForm, image: e.target.value })} className="px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A2540] text-[#0A2540] dark:text-white" />
                      <textarea placeholder="Tavsif" value={productForm.description_uz} onChange={(e) => setProductForm({ ...productForm, description_uz: e.target.value, description: e.target.value })} className="md:col-span-2 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A2540] text-[#0A2540] dark:text-white" rows="3" />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <label className="flex items-center gap-2 text-[#0A2540] dark:text-white">
                        <input type="checkbox" checked={productForm.is_featured} onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })} /> Tavsiya etilgan
                      </label>
                      <label className="flex items-center gap-2 text-[#0A2540] dark:text-white">
                        <input type="checkbox" checked={productForm.is_new} onChange={(e) => setProductForm({ ...productForm, is_new: e.target.checked })} /> Yangi
                      </label>
                      <label className="flex items-center gap-2 text-[#0A2540] dark:text-white">
                        <input type="checkbox" checked={productForm.is_best_seller} onChange={(e) => setProductForm({ ...productForm, is_best_seller: e.target.checked })} /> Top
                      </label>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button onClick={handleAddProduct} className="bg-[#10B981] hover:bg-[#059669] text-white rounded-full">Saqlash</Button>
                      <Button onClick={() => setShowAddProduct(false)} className="bg-transparent border border-[#0A2540] text-[#0A2540] dark:text-white dark:border-white hover:bg-[#0A2540] hover:text-white rounded-full">Bekor qilish</Button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-center gap-4 p-4 bg-[#F5F7FA] dark:bg-white/5 rounded-xl">
                      <img src={product.image} alt={product.name_uz} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="font-medium text-[#0A2540] dark:text-white">{product.name_uz}</p>
                        <p className="text-sm text-[#475569] dark:text-gray-300">{product.category} • Omborda: {product.stock}</p>
                      </div>
                      <p className="font-bold text-[#3B82F6]">{(product.discount_price || product.price).toLocaleString()} so'm</p>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg" data-testid={`delete-product-${product.id}`}>
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customers */}
            {activeTab === 'customers' && (
              <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6" data-testid="admin-customers">
                <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6">Mijozlar</h3>
                <div className="space-y-3">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center gap-4 p-4 bg-[#F5F7FA] dark:bg-white/5 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-full flex items-center justify-center text-white font-semibold">
                        {customer.full_name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#0A2540] dark:text-white">{customer.full_name}</p>
                        <p className="text-sm text-[#475569] dark:text-gray-300">{customer.email}</p>
                      </div>
                      <p className="text-sm text-[#475569] dark:text-gray-300">{customer.phone || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
