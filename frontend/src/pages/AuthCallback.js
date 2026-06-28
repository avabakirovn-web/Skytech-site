import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setGoogleUser } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use useRef to prevent double-processing under StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSession = async () => {
      try {
        // Parse session_id from URL fragment
        const hash = window.location.hash;
        const match = hash.match(/session_id=([^&]+)/);
        if (!match) {
          toast.error("Sessiya ma'lumotlari topilmadi");
          navigate('/auth');
          return;
        }

        const sessionId = match[1];

        // Exchange session_id for session_token cookie
        const response = await axios.post(
          `${API}/auth/google/session`,
          {},
          {
            headers: { 'X-Session-ID': sessionId },
            withCredentials: true
          }
        );

        // Clear URL hash
        window.history.replaceState(null, '', window.location.pathname);

        // Update auth context with new user
        if (response.data.user) {
          setGoogleUser(response.data.user);
          toast.success(`Xush kelibsiz, ${response.data.user.full_name}!`);
        }

        // Navigate to dashboard
        navigate('/dashboard', { replace: true, state: { user: response.data.user } });
      } catch (error) {
        console.error('OAuth callback error:', error);
        toast.error("Google bilan kirishda xatolik yuz berdi");
        navigate('/auth');
      }
    };

    processSession();
  }, [navigate, setGoogleUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A2540]" data-testid="auth-callback">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-4 border-[#3B82F6]/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#3B82F6] animate-spin"></div>
        </div>
        <h2 className="text-xl font-medium text-[#0A2540] dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Tizimga kirilmoqda...
        </h2>
        <p className="text-sm text-[#475569] dark:text-gray-300">
          Iltimos kuting, Google bilan kirish tasdiqlanmoqda
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
