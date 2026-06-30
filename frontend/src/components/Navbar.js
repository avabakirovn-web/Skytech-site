import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const categories = [
    { id: 'smartphones', name_uz: t('categories.smartphones'), path: '/products?category=smartphones' },
    { id: 'laptops', name_uz: t('categories.laptops'), path: '/products?category=laptops' },
    { id: 'smartwatches', name_uz: t('categories.smartwatches'), path: '/products?category=smartwatches' },
    { id: 'headphones', name_uz: t('categories.headphones'), path: '/products?category=headphones' },
    { id: 'gaming', name_uz: t('categories.gaming'), path: '/products?category=gaming' },
    { id: 'accessories', name_uz: t('categories.accessories'), path: '/products?category=accessories' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/70 dark:bg-[#0A2540]/70 backdrop-saturate-150 border-b border-black/5 dark:border-white/10">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" data-testid="nav-logo">
            <Logo size="xl" />
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 pl-12 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all text-[#0A2540] dark:text-white"
                data-testid="search-input"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all"
              data-testid="theme-toggle"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-[#0A2540] dark:text-white" />
              ) : (
                <Sun className="w-5 h-5 text-white" />
              )}
            </button>

            {/* Wishlist */}
            {user && (
              <Link
                to="/wishlist"
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all relative"
                data-testid="nav-wishlist"
              >
                <Heart className="w-5 h-5 text-[#0A2540] dark:text-white" />
              </Link>
            )}

            {/* Cart */}
            {user && (
              <Link
                to="/cart"
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all relative"
                data-testid="nav-cart"
              >
                <ShoppingCart className="w-5 h-5 text-[#0A2540] dark:text-white" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#3B82F6] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {getCartCount()}
                  </span>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <div className="relative group">
                <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-all" data-testid="nav-user">
                  <User className="w-5 h-5 text-[#0A2540] dark:text-white" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0A2540] rounded-2xl shadow-lg border border-black/5 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-4 border-b border-black/5 dark:border-white/10">
                    <p className="font-medium text-[#0A2540] dark:text-white">{user.full_name}</p>
                    <p className="text-sm text-[#475569] dark:text-gray-300">{user.email}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-[#0A2540] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                      data-testid="nav-dashboard"
                    >
                      {t('nav.dashboard')}
                    </Link>
                    {user.is_admin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-[#0A2540] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                        data-testid="nav-admin"
                      >
                        {t('nav.admin')}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-[#EF4444] hover:bg-black/5 dark:hover:bg-white/10"
                      data-testid="nav-logout"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full px-6" data-testid="nav-login">
                  {t('nav.login')}
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
              data-testid="mobile-menu-toggle"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-[#0A2540] dark:text-white" />
              ) : (
                <Menu className="w-6 h-6 text-[#0A2540] dark:text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Categories - Desktop */}
        <div className="hidden lg:flex items-center space-x-8 pb-4 border-t border-black/5 dark:border-white/10 pt-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.path}
              className="text-sm text-[#475569] dark:text-gray-300 hover:text-[#3B82F6] transition-all font-medium"
              data-testid={`category-${category.id}`}
            >
              {category.name_uz}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-black/5 dark:border-white/10 bg-white dark:bg-[#0A2540]">
          {/* Mobile Search */}
          <div className="p-4 border-b border-black/5 dark:border-white/10">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Mahsulotlarni qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-12 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none"
                  data-testid="mobile-search-input"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#475569]" />
              </div>
            </form>
          </div>

          {/* Mobile Categories */}
          <div className="py-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={category.path}
                className="block px-4 py-3 text-[#0A2540] dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name_uz}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
