import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { useTranslation } from 'react-i18next';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Home = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [featuredRes, newRes, bestRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/products?featured=true`),
        axios.get(`${API}/products?new=true`),
        axios.get(`${API}/products?best_seller=true`),
        axios.get(`${API}/categories`)
      ]);

      setFeaturedProducts(featuredRes.data);
      setNewProducts(newRes.data);
      setBestSellers(bestRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Ma\'lumotlarni yuklashda xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultCategories = [
    {
      id: 'smartphones',
      name_uz: 'Smartfonlar',
      icon: '📱',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'
    },
    {
      id: 'laptops',
      name_uz: 'Noutbuklar',
      icon: '💻',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'
    },
    {
      id: 'smartwatches',
      name_uz: 'Aqlli soatlar',
      icon: '⌚',
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400'
    },
    {
      id: 'headphones',
      name_uz: 'Naushniklar',
      icon: '🎧',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    },
    {
      id: 'gaming',
      name_uz: "O'yin jihozlari",
      icon: '🎮',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400'
    },
    {
      id: 'accessories',
      name_uz: 'Aksessuarlar',
      icon: '🔌',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400'
    }
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative py-20 md:py-32 px-6 md:px-12 overflow-hidden"
        data-testid="hero-section"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1426024084828-5da21e13f5dc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzZ8MHwxfHNlYXJjaHwzfHxwcmVtaXVtJTIwc21hcnRwaG9uZSUyMGxhcHRvcCUyMHRlY2glMjBnYWRnZXRzfGVufDB8fHx8MTc4MjYyNzYxMnww&ixlib=rb-4.1.0&q=85"
            alt="Hero"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-[#0A2540] dark:via-[#0A2540]/95"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span
              className="text-xs font-semibold tracking-[0.2em] uppercase text-[#3B82F6] mb-4 block"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {t('home.tagline')}
            </span>
            <h1
              className="text-5xl sm:text-6xl font-semibold tracking-tight leading-none text-[#0A2540] dark:text-white mb-6"
              style={{ fontFamily: 'Poppins, sans-serif' }}
              data-testid="hero-title"
            >
              {t('home.hero_title')}
            </h1>
            <p
              className="text-base leading-relaxed text-[#475569] dark:text-gray-300 mb-8 text-lg"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {t('home.hero_subtitle')}
            </p>
            <Link to="/products">
              <Button
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full px-8 py-6 text-lg font-medium transition-all shadow-[0_4px_14px_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)]"
                data-testid="hero-shop-now-btn"
              >
                {t('home.shop_now')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 md:py-32 px-6 md:px-12" data-testid="categories-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2
                className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0A2540] dark:text-white mb-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Kategoriyalar
              </h2>
              <p className="text-[#475569] dark:text-gray-300">Qiziqtirgan mahsulotingizni toping</p>
            </div>
            <Link
              to="/products"
              className="text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center gap-1"
            >
              Barchasini ko'rish
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {displayCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  to={`/products?category=${category.id}`}
                  className="group block bg-[#F5F7FA] dark:bg-[#0A2540]/20 rounded-3xl p-6 text-center border border-black/5 dark:border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(10,37,64,0.08)] hover:border-[#3B82F6]/20"
                  data-testid={`category-card-${category.id}`}
                >
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="font-medium text-[#0A2540] dark:text-white group-hover:text-[#3B82F6] transition-all">
                    {category.name_uz}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 md:py-32 px-6 md:px-12 bg-[#F5F7FA]/50 dark:bg-[#0A2540]/10" data-testid="featured-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2
                  className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0A2540] dark:text-white mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Tavsiya etilgan mahsulotlar
                </h2>
                <p className="text-[#475569] dark:text-gray-300">Bizning eng yaxshi tanlovimiz</p>
              </div>
              <Link
                to="/products?featured=true"
                className="text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center gap-1"
              >
                Barchasini ko'rish
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 4)?.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="py-20 md:py-32 px-6 md:px-12" data-testid="new-arrivals-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2
                  className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0A2540] dark:text-white mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Yangi kelganlar
                </h2>
                <p className="text-[#475569] dark:text-gray-300">Eng so'nggi mahsulotlar</p>
              </div>
              <Link
                to="/products?new=true"
                className="text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center gap-1"
              >
                Barchasini ko'rish
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newProducts.slice(0, 4)?.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-20 md:py-32 px-6 md:px-12 bg-[#F5F7FA]/50 dark:bg-[#0A2540]/10" data-testid="best-sellers-section">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2
                  className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0A2540] dark:text-white mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Eng ko'p sotilganlar
                </h2>
                <p className="text-[#475569] dark:text-gray-300">Mijozlar tanlovlari</p>
              </div>
              <Link
                to="/products?best_seller=true"
                className="text-[#3B82F6] hover:text-[#2563EB] font-medium flex items-center gap-1"
              >
                Barchasini ko'rish
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestSellers.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#3B82F6] to-[#2563EB] rounded-3xl p-12 text-center text-white">
            <h2
              className="text-3xl sm:text-4xl font-medium mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Maxsus takliflardan foydalaning
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Yangiliklar va eksklyuziv chegirmalar haqida birinchilardan xabardor bo'ling
            </p>
            <Link to="/products">
              <Button className="bg-white text-[#3B82F6] hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-medium transition-all">
                Mahsulotlarni ko'rish
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
