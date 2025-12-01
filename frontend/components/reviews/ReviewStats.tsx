'use client';

import React from 'react';
import { ReviewStats as ReviewStatsType } from '@/lib/api/reviews';
import StarRating from './StarRating';

interface ReviewStatsProps {
  stats: ReviewStatsType;
  className?: string;
}

export default function ReviewStats({ stats, className = '' }: ReviewStatsProps) {
  const getRatingPercentage = (count: number) => {
    if (stats.totalReviews === 0) return 0;
    return (count / stats.totalReviews) * 100;
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`} dir="rtl">
      {/* Overall Rating */}
      <div className="flex items-start gap-6 mb-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-1">
            {stats.averageRating.toFixed(1)}
          </div>
          <StarRating rating={stats.averageRating} size="md" />
          <div className="text-sm text-gray-500 mt-2">
            {stats.totalReviews} تقييم
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown];
            const percentage = getRatingPercentage(count);

            return (
              <div key={rating} className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-600 w-12">{rating} نجوم</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      rating >= 4 ? 'bg-emerald-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Purchase Badge */}
      {stats.verifiedPurchasePercentage > 0 && (
        <div className="flex items-center gap-2 mb-6 p-3 bg-emerald-50 rounded-xl">
          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
          <span className="text-sm text-emerald-700">
            {stats.verifiedPurchasePercentage}% من التقييمات من مشتريات موثقة
          </span>
        </div>
      )}

      {/* Detailed Ratings */}
      {(stats.detailedRatings.itemAsDescribed > 0 ||
        stats.detailedRatings.communication > 0 ||
        stats.detailedRatings.shippingSpeed > 0 ||
        stats.detailedRatings.packaging > 0) && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">التقييمات التفصيلية</h3>
          <div className="grid grid-cols-2 gap-4">
            {stats.detailedRatings.itemAsDescribed > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">مطابقة الوصف</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{stats.detailedRatings.itemAsDescribed.toFixed(1)}</span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            )}
            {stats.detailedRatings.communication > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">التواصل</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{stats.detailedRatings.communication.toFixed(1)}</span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            )}
            {stats.detailedRatings.shippingSpeed > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">سرعة الشحن</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{stats.detailedRatings.shippingSpeed.toFixed(1)}</span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            )}
            {stats.detailedRatings.packaging > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">التغليف</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{stats.detailedRatings.packaging.toFixed(1)}</span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
