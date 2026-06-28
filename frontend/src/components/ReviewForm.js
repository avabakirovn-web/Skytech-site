import React, { useState } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ReviewForm = ({ productId, onSubmit }) => {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Iltimos, yulduzcha bahosini tanlang");
      return;
    }
    if (comment.trim().length < 3) {
      toast.error("Sharh kamida 3 ta belgidan iborat bo'lishi kerak");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API}/reviews`,
        { product_id: productId, rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Sharhingiz uchun rahmat!");
      setRating(0);
      setComment('');
      onSubmit?.();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#F5F7FA] dark:bg-[#0A2540]/20 rounded-2xl p-6 mb-8"
      data-testid="review-form"
    >
      <h3 className="text-lg font-semibold text-[#0A2540] dark:text-white mb-4">
        Sharh qoldiring
      </h3>

      {/* Rating Stars */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">
          Bahoyingiz
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
              data-testid={`rating-star-${star}`}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoverRating || rating)
                    ? 'fill-[#FBBF24] text-[#FBBF24]'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#0A2540] dark:text-white mb-2">
          Sharhingiz
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          placeholder="Mahsulot haqidagi fikringizni baham ko'ring..."
          className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all text-[#0A2540] dark:text-white resize-none"
          data-testid="review-comment"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-full px-8 py-3 font-medium disabled:opacity-50"
        data-testid="submit-review-btn"
      >
        {loading ? "Yuborilmoqda..." : "Sharhni yuborish"}
      </Button>
    </form>
  );
};

export default ReviewForm;
