'use client';

import React, { useState } from 'react';
import { CreateReviewInput, createReview } from '@/lib/api/reviews';
import StarRating from './StarRating';

interface ReviewFormProps {
  transactionId: string;
  reviewedId: string;
  reviewedName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  transactionId,
  reviewedId,
  reviewedName,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [itemAsDescribed, setItemAsDescribed] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [shippingSpeed, setShippingSpeed] = useState(0);
  const [packaging, setPackaging] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (overallRating === 0) {
      setError('يرجى اختيار تقييم عام');
      return;
    }

    setSubmitting(true);

    try {
      const input: CreateReviewInput = {
        transactionId,
        reviewedId,
        overallRating,
        title: title.trim() || undefined,
        comment: comment.trim() || undefined,
        itemAsDescribed: itemAsDescribed || undefined,
        communication: communication || undefined,
        shippingSpeed: shippingSpeed || undefined,
        packaging: packaging || undefined,
      };

      await createReview(input);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    if (rating === 0) return 'اختر تقييمك';
    if (rating === 1) return 'سيء جداً';
    if (rating === 2) return 'سيء';
    if (rating === 3) return 'مقبول';
    if (rating === 4) return 'جيد';
    if (rating === 5) return 'ممتاز';
    return '';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100" dir="rtl">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        تقييم تجربتك مع {reviewedName}
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Overall Rating */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">التقييم العام *</label>
          <div className="flex items-center gap-4">
            <StarRating
              rating={overallRating}
              interactive
              onChange={setOverallRating}
              size="lg"
            />
            <span className={`text-sm font-medium ${overallRating > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
              {getRatingLabel(overallRating)}
            </span>
          </div>
        </div>

        {/* Detailed Ratings Toggle */}
        <button
          type="button"
          onClick={() => setShowDetailedRatings(!showDetailedRatings)}
          className="flex items-center gap-2 text-emerald-600 text-sm mb-4 hover:text-emerald-700"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showDetailedRatings ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showDetailedRatings ? 'إخفاء التقييمات التفصيلية' : 'إضافة تقييمات تفصيلية'}
        </button>

        {/* Detailed Ratings */}
        {showDetailedRatings && (
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <div>
              <label className="block text-xs text-gray-600 mb-2">مطابقة الوصف</label>
              <StarRating
                rating={itemAsDescribed}
                interactive
                onChange={setItemAsDescribed}
                size="sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">التواصل</label>
              <StarRating
                rating={communication}
                interactive
                onChange={setCommunication}
                size="sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">سرعة الشحن</label>
              <StarRating
                rating={shippingSpeed}
                interactive
                onChange={setShippingSpeed}
                size="sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-2">التغليف</label>
              <StarRating
                rating={packaging}
                interactive
                onChange={setPackaging}
                size="sm"
              />
            </div>
          </div>
        )}

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">عنوان التقييم (اختياري)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="أضف عنواناً لتقييمك..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            maxLength={100}
          />
        </div>

        {/* Comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">التعليق (اختياري)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="شارك تجربتك مع الآخرين..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            maxLength={1000}
          />
          <div className="text-xs text-gray-500 mt-1 text-left">{comment.length}/1000</div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
            >
              إلغاء
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || overallRating === 0}
            className="flex-1 px-4 py-3 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>جاري الإرسال...</span>
              </div>
            ) : (
              'إرسال التقييم'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
