'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyReviews, AuctionReview } from '@/lib/api/auctions';
import { useAuth } from '@/lib/contexts/AuthContext';

// Star Rating Component
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ rating, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

export default function ReviewsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<AuctionReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [reviewType, setReviewType] = useState<'received' | 'given'>('received');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/auctions/reviews');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user, page, reviewType]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await getMyReviews(reviewType, page, 12);
      setReviews(response.data.reviews || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل التقييمات');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return null;

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-yellow-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/auctions" className="text-white/80 hover:text-white flex items-center gap-2 mb-4">
            <span>العودة للمزادات</span>
          </Link>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            التقييمات
          </h1>
          <p className="text-yellow-100 mt-2">تقييمات المزادات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">إجمالي التقييمات</p>
            <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">متوسط التقييم</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-yellow-600">{avgRating.toFixed(1)}</p>
              <StarRating rating={Math.round(avgRating)} size="lg" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">التقييمات الإيجابية</p>
            <p className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.overallRating >= 4).length}
            </p>
          </div>
        </div>
      </div>

      {/* Type Toggle */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setReviewType('received'); setPage(1); }}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              reviewType === 'received'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            التقييمات المستلمة
          </button>
          <button
            onClick={() => { setReviewType('given'); setPage(1); }}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              reviewType === 'given'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            التقييمات المُعطاة
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button onClick={loadReviews} className="mt-4 text-purple-600 hover:text-purple-700">
              حاول مرة أخرى
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">لا توجد تقييمات</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const otherUser = reviewType === 'received' ? review.reviewer : review.reviewee;

              return (
                <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        {otherUser?.avatar ? (
                          <img src={otherUser.avatar} alt={otherUser.fullName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-xl text-purple-600">{otherUser?.fullName?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{otherUser?.fullName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.overallRating} />
                          <span className="text-sm text-gray-600">({review.overallRating}/5)</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/auctions/${review.auctionId}`}
                      className="text-purple-600 hover:text-purple-700 text-sm"
                    >
                      عرض المزاد
                    </Link>
                  </div>

                  <p className="mt-4 text-gray-700">{review.comment}</p>

                  {/* Sub-ratings */}
                  {(review.accuracyRating || review.communicationRating || review.shippingRating || review.paymentRating) && (
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      {review.accuracyRating && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">الدقة:</span>
                          <StarRating rating={review.accuracyRating} size="sm" />
                        </div>
                      )}
                      {review.communicationRating && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">التواصل:</span>
                          <StarRating rating={review.communicationRating} size="sm" />
                        </div>
                      )}
                      {review.shippingRating && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">الشحن:</span>
                          <StarRating rating={review.shippingRating} size="sm" />
                        </div>
                      )}
                      {review.paymentRating && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">الدفع:</span>
                          <StarRating rating={review.paymentRating} size="sm" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {review.images.map((img, i) => (
                        <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                          <img src={img} alt={`صورة ${i + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Response */}
                  {review.response && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-600 mb-1">الرد:</p>
                      <p className="text-gray-700">{review.response}</p>
                      {review.respondedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(review.respondedAt).toLocaleDateString('ar-EG')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              السابق
            </button>
            <span className="px-4 py-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
