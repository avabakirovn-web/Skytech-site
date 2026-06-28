import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Products = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    featured: searchParams.get('featured') === 'true',
    new: searchParams.get('new') === 'true',
    best_seller: searchParams.get('best_seller') === 'true'
  });

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.featured) params.append('featured', 'true');
      if (filters.new) params.append('new', 'true');
      if (filters.best_seller) params.append('best_seller', 'true');

      const response = await axios.get(`${API}/products?${params.toString()}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Mahsulotlarni yuklashda xato:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: '', name_uz: 'Barchasi' },
    { id: 'smartphones', name_uz: 'Smartfonlar' },
    { id: 'laptops', name_uz: 'Noutbuklar' },
    { id: 'smartwatches', name_uz: 'Aqlli soatlar' },
    { id: 'headphones', name_uz: 'Naushniklar' },
    { id: 'gaming', name_uz: "O'yin jihozlari" },
    { id: 'accessories', name_uz: 'Aksessuarlar' }
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-3xl sm:text-4xl font-medium text-[#0A2540] dark:text-white mb-2"
            style={{ fontFamily: 'Poppins, sans-serif' }}
            data-testid="products-title"
          >
            Mahsulotlar
          </h1>
          <p className="text-[#475569] dark:text-gray-300">Barcha mahsulotlarni ko'ring</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-[#0A2540]/20 rounded-2xl border border-black/5 dark:border-white/10 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-[#3B82F6]" />
                <h3 className="font-semibold text-[#0A2540] dark:text-white">Filtrlar</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-[#0A2540] dark:text-white mb-3">Kategoriyalar</h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFilters({ ...filters, category: cat.id })}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-all ${
                          filters.category === cat.id
                            ? 'bg-[#3B82F6] text-white'
                            : 'text-[#475569] dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                        }`}
                        data-testid={`filter-category-${cat.id}`}
                      >
                        {cat.name_uz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6] mx-auto"></div>
                <p className="mt-4 text-[#475569] dark:text-gray-300">Yuklanmoqda...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="no-products">
                <p className="text-[#475569] dark:text-gray-300 text-lg">Mahsulotlar topilmadi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;