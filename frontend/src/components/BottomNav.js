import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const location = useLocation();
  const { getCartCount } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();

  const items = [
    { id: 'home', path: '/', icon: Home, label: t('nav.home') },
    { id: 'products', path: '/products', icon: Search, label: t('nav.products') },
    { id: 'cart', path: '/cart', icon: ShoppingCart, label: t('nav.cart'), badge: getCartCount() },
    { id: 'wishlist', path: '/wishlist', icon: Heart, label: t('nav.wishlist'), auth: true },
    { id: 'account', path: user ? '/dashboard' : '/auth', icon: User, label: t('nav.account') }
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-[#0A2540]/95 backdrop-blur-2xl border-t border-black/5 dark:border-white/10 shadow-[0_-4px_20px_rgba(10,37,64,0.05)]"
      data-testid="bottom-nav"
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          if (item.auth && !user) return (
            <div key={item.id} className="flex items-center justify-center opacity-40">
              <item.icon className="w-5 h-5 text-[#475569]" />
            </div>
          );

          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.id}
              to={item.path}
              className="flex flex-col items-center justify-center gap-0.5 relative transition-all"
              data-testid={`bottom-nav-${item.id}`}
            >
              <div className="relative">
                <item.icon
                  className={`w-6 h-6 transition-all ${
                    isActive
                      ? 'text-[#3B82F6] scale-110'
                      : 'text-[#475569] dark:text-gray-400'
                  }`}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#EF4444] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-all ${
                  isActive
                    ? 'text-[#3B82F6]'
                    : 'text-[#475569] dark:text-gray-400'
                }`}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#3B82F6] rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
