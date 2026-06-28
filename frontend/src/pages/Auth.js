import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Muvaffaqiyatli kirdingiz!');
      } else {
        await register(formData.email, formData.password, formData.full_name, formData.phone);
        toast.success("Ro'yxatdan o'tdingiz!");
      }
      navigate(from, { replace: true });
    } catch (error) {
      const message = error.response?.data?.detail || "Xatolik yuz berdi";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-[#0A2540] rounded-3xl border border-black/5 dark:border-white/10 shadow-lg p-8" data-testid="auth-form">
          <div className="text-center mb-8">
            <h2
              className="text-3xl font-semibold text-[#0A2540] dark:text-white mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {isLogin ? 'Kirish' : "Ro'yxatdan o'tish"}
            </h2>
            <p className="text-[#475569] dark:text-gray-300">
              {isLogin ? 'Hisobingizga kiring' : "Yangi hisob yarating"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">
                    To'liq ismingiz
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all text-[#0A2540] dark:text-white"
                    data-testid="register-fullname"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">
                    Telefon raqami (ixtiyoriy)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all text-[#0A2540] dark:text-white"
                    data-testid="register-phone"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all text-[#0A2540] dark:text-white"
                data-testid="auth-email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">
                Parol
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all text-[#0A2540] dark:text-white"
                data-testid="auth-password"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full py-3 font-medium transition-all disabled:opacity-50"
              data-testid="auth-submit"
            >
              {loading ? 'Yuklanmoqda...' : isLogin ? 'Kirish' : "Ro'yxatdan o'tish"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#3B82F6] hover:text-[#2563EB] font-medium"
              data-testid="auth-toggle"
            >
              {isLogin ? "Hisobingiz yo'qmi? Ro'yxatdan o'ting" : "Hisobingiz bormi? Kiring"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;