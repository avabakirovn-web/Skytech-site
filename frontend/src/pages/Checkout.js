import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, CreditCard, Truck, MapPin } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Checkout = () => {
  const { token, user } = useAuth();
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: '',
    city: 'Toshkent',
    region: 'Toshkent',
    postal_code: '',
    payment_method: 'card'
  });

  useEffect(() => {
    if (!token) {
      navigate('/auth');
      return;
    }
    loadCart();
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
      }
    } catch (error) {
      console.error('Xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subtotal = cart.items?.reduce((total, item) => {
    const product = products.find(p => p.id === item.product_id);
    if (product) {
      const price = product.discount_price || product.price;
      return total + (price * item.quantity);
    }
    return total;
  }, 0) || 0;

  const shippingCost = subtotal > 500000 ? 0 : 30000;
  const total = subtotal + shippingCost - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const response = await axios.post(
        `${API}/coupons/validate?code=${couponCode}&subtotal=${subtotal}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDiscount(response.data.discount_amount);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Kupon noto'g'ri");
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await axios.post(
        `${API}/orders`,
        {
          shipping_address: {
            full_name: formData.full_name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            region: formData.region,
            postal_code: formData.postal_code
          },
          payment_method: formData.payment_method,
          coupon_code: couponCode || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrderId(response.data.id);
      setOrderPlaced(true);
      await fetchCart();
      toast.success("Buyurtma muvaffaqiyatli rasmiylashtirildi!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div></div>;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-[#0A2540]/20 rounded-3xl border border-black/5 dark:border-white/10 p-8 text-center" data-testid="order-success">
          <div className="w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-semibold text-[#0A2540] dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Buyurtma tasdiqlandi!
          </h2>
          <p className="text-[#475569] dark:text-gray-300 mb-2">
            Buyurtma raqami: <span className="font-bold text-[#3B82F6]">{orderId?.slice(0, 8)}</span>
          </p>
          <p className="text-[#475569] dark:text-gray-300 mb-6">
            Tez orada siz bilan bog'lanamiz
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/dashboard')} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full">
              Buyurtmalarim
            </Button>
            <Button onClick={() => navigate('/products')} className="bg-transparent border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6] hover:text-white rounded-full">
              Xaridni davom ettirish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const steps = [
    { num: 1, title: 'Yetkazib berish', icon: Truck },
    { num: 2, title: "To'lov", icon: CreditCard },
    { num: 3, title: 'Tasdiqlash', icon: Check }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-medium text-[#0A2540] dark:text-white mb-8" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Rasmiylashtirish
        </h1>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  step >= s.num ? 'bg-[#3B82F6] text-white' : 'bg-[#F5F7FA] text-[#475569]'
                }`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className={`mt-2 text-sm font-medium ${step >= s.num ? 'text-[#3B82F6]' : 'text-[#475569]'}`}>
                  {s.title}
                </p>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded transition-all ${step > s.num ? 'bg-[#3B82F6]' : 'bg-[#F5F7FA]'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-8" data-testid="step-shipping">
                <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#3B82F6]" />
                  Yetkazib berish ma'lumotlari
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">To'liq ism</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none text-[#0A2540] dark:text-white"
                      data-testid="shipping-fullname" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">Telefon</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+998 90 123 45 67"
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none text-[#0A2540] dark:text-white"
                      data-testid="shipping-phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">Pochta indeksi</label>
                    <input type="text" name="postal_code" value={formData.postal_code} onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none text-[#0A2540] dark:text-white"
                      data-testid="shipping-postal" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">Manzil</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} required placeholder="Ko'cha, uy raqami"
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none text-[#0A2540] dark:text-white"
                      data-testid="shipping-address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">Shahar</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none text-[#0A2540] dark:text-white"
                      data-testid="shipping-city" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">Viloyat</label>
                    <input type="text" name="region" value={formData.region} onChange={handleChange} required
                      className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none text-[#0A2540] dark:text-white"
                      data-testid="shipping-region" />
                  </div>
                </div>
                <Button onClick={() => setStep(2)} disabled={!formData.full_name || !formData.phone || !formData.address}
                  className="mt-6 w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full py-3 font-medium disabled:opacity-50" data-testid="step-shipping-next">
                  Davom etish
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-8" data-testid="step-payment">
                <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#3B82F6]" />
                  To'lov usulini tanlang
                </h3>
                <div className="space-y-3">
                  {[
                    { id: 'card', name: 'Bank kartasi (Visa, Mastercard)' },
                    { id: 'apple_pay', name: 'Apple Pay' },
                    { id: 'google_pay', name: 'Google Pay' },
                    { id: 'paypal', name: 'PayPal' },
                    { id: 'cash', name: 'Yetkazib berishda naqd' }
                  ].map((method) => (
                    <label key={method.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                      formData.payment_method === method.id ? 'border-[#3B82F6] bg-[#3B82F6]/5' : 'border-black/10 dark:border-white/10 hover:border-[#3B82F6]/50'
                    }`} data-testid={`payment-${method.id}`}>
                      <input type="radio" name="payment_method" value={method.id} checked={formData.payment_method === method.id} onChange={handleChange} className="w-4 h-4 text-[#3B82F6]" />
                      <span className="text-[#0A2540] dark:text-white font-medium">{method.name}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-3 mt-6">
                  <Button onClick={() => setStep(1)} className="flex-1 bg-transparent border border-[#0A2540] text-[#0A2540] dark:text-white dark:border-white hover:bg-[#0A2540] hover:text-white rounded-full py-3">
                    Orqaga
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full py-3" data-testid="step-payment-next">
                    Davom etish
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-8" data-testid="step-confirmation">
                <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6">Buyurtmani tasdiqlang</h3>
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-[#F5F7FA] dark:bg-white/5 rounded-xl">
                    <h4 className="font-medium text-[#0A2540] dark:text-white mb-2">Yetkazib berish manzili:</h4>
                    <p className="text-[#475569] dark:text-gray-300">{formData.full_name}</p>
                    <p className="text-[#475569] dark:text-gray-300">{formData.phone}</p>
                    <p className="text-[#475569] dark:text-gray-300">{formData.address}, {formData.city}, {formData.region}</p>
                  </div>
                  <div className="p-4 bg-[#F5F7FA] dark:bg-white/5 rounded-xl">
                    <h4 className="font-medium text-[#0A2540] dark:text-white mb-2">To'lov usuli:</h4>
                    <p className="text-[#475569] dark:text-gray-300">
                      {formData.payment_method === 'card' && 'Bank kartasi'}
                      {formData.payment_method === 'apple_pay' && 'Apple Pay'}
                      {formData.payment_method === 'google_pay' && 'Google Pay'}
                      {formData.payment_method === 'paypal' && 'PayPal'}
                      {formData.payment_method === 'cash' && 'Yetkazib berishda naqd'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setStep(2)} className="flex-1 bg-transparent border border-[#0A2540] text-[#0A2540] dark:text-white dark:border-white hover:bg-[#0A2540] hover:text-white rounded-full py-3">
                    Orqaga
                  </Button>
                  <Button onClick={handlePlaceOrder} className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white rounded-full py-3" data-testid="place-order-btn">
                    Buyurtma berish
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6 sticky top-24">
              <h3 className="text-xl font-semibold text-[#0A2540] dark:text-white mb-6">Buyurtma xulosasi</h3>
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.items?.map((item) => {
                  const product = products.find(p => p.id === item.product_id);
                  if (!product) return null;
                  const price = product.discount_price || product.price;
                  return (
                    <div key={item.product_id} className="flex items-center gap-3">
                      <img src={product.image} alt={product.name_uz} className="w-12 h-12 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#0A2540] dark:text-white truncate">{product.name_uz}</p>
                        <p className="text-xs text-[#475569] dark:text-gray-300">{item.quantity} x {price.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mb-4">
                <div className="flex gap-2">
                  <input type="text" placeholder="Kupon kodi" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 text-sm text-[#0A2540] dark:text-white"
                    data-testid="coupon-input" />
                  <button onClick={handleApplyCoupon} className="px-4 py-2 bg-[#3B82F6] text-white rounded-lg text-sm font-medium hover:bg-[#2563EB]" data-testid="apply-coupon">
                    Qo'llash
                  </button>
                </div>
              </div>

              <div className="space-y-2 border-t border-black/5 dark:border-white/10 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-[#475569] dark:text-gray-300">Oraliq summa:</span>
                  <span className="text-[#0A2540] dark:text-white">{subtotal.toLocaleString()} so'm</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#475569] dark:text-gray-300">Yetkazib berish:</span>
                  <span className="text-[#0A2540] dark:text-white">{shippingCost === 0 ? 'Bepul' : `${shippingCost.toLocaleString()} so'm`}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#10B981]">Chegirma:</span>
                    <span className="text-[#10B981]">-{discount.toLocaleString()} so'm</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-black/5 dark:border-white/10">
                  <span className="text-[#0A2540] dark:text-white">Jami:</span>
                  <span className="text-[#3B82F6]">{total.toLocaleString()} so'm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
