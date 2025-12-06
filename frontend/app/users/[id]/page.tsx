'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getReviews, getUserReviewStats, Review, ReviewStats as ReviewStatsType } from '@/lib/api/reviews';
import { getItems, Item } from '@/lib/api/items';
import { StarRating, ReviewCard, ReviewStats } from '@/components/reviews';

interface UserProfile {
  id: string;
  fullName: string;
  avatar?: string;
  email?: string;
  phone?: string;
  governorate?: string;
  bio?: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const userId = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStatsType | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'items' | 'reviews'>('items');
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'rating_high' | 'rating_low' | 'helpful'>('recent');

  const isOwnProfile = currentUser?.id === userId;

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load reviews and stats (which also contain user info)
        const [reviewsResponse, statsResponse, itemsResponse] = await Promise.all([
          getReviews({ reviewedId: userId, limit: 10, sortBy }),
          getUserReviewStats(userId),
          getItems({ sellerId: userId, limit: 12, status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        ]);

        setReviews(reviewsResponse.data.reviews);
        setReviewStats(statsResponse.data);
        setItems(itemsResponse.data?.items || []);

        // Extract profile from first review or create placeholder
        if (reviewsResponse.data.reviews.length > 0) {
          const firstReview = reviewsResponse.data.reviews[0];
          setProfile({
            id: userId,
            fullName: firstReview.reviewed?.fullName || 'مستخدم',
            avatar: firstReview.reviewed?.avatar,
            rating: statsResponse.data.averageRating,
            totalReviews: statsResponse.data.totalReviews,
            createdAt: new Date().toISOString(),
          });
        } else {
          setProfile({
            id: userId,
            fullName: 'مستخدم',
            rating: 0,
            totalReviews: 0,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // Load reviews when sort changes
  useEffect(() => {
    const loadReviews = async () => {
      setReviewsLoading(true);
      try {
        const response = await getReviews({ reviewedId: userId, limit: 20, sortBy });
        setReviews(response.data.reviews);
      } catch (error) {
        console.error('Failed to load reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (!loading) {
      loadReviews();
    }
  }, [sortBy, userId, loading]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون ج.م`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} ألف ج.م`;
    }
    return `${price.toLocaleString('ar-EG')} ج.م`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">المستخدم غير موجود</h1>
          <p className="text-gray-500 mb-4">لم نتمكن من العثور على هذا المستخدم</p>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Profile Header */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-4xl font-bold">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.fullName} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                profile.fullName.charAt(0)
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-2xl font-bold mb-2">{profile.fullName}</h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-emerald-100">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <StarRating rating={profile.rating} size="sm" />
                  <span>{profile.rating.toFixed(1)}</span>
                  <span className="text-emerald-200">({profile.totalReviews} تقييم)</span>
                </div>

                {/* Location */}
                {profile.governorate && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{profile.governorate}</span>
                  </div>
                )}

                {/* Member Since */}
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>عضو منذ {formatDate(profile.createdAt)}</span>
                </div>
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="mt-4 text-emerald-100 max-w-2xl">{profile.bio}</p>
              )}
            </div>

            {/* Actions */}
            {!isOwnProfile && currentUser && (
              <div className="flex gap-2">
                <Link
                  href={`/messages?userId=${userId}`}
                  className="px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-medium hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>مراسلة</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('items')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'items'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              الإعلانات ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 border-b-2 font-medium transition ${
                activeTab === 'reviews'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              التقييمات ({profile.totalReviews})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'items' ? (
          /* Items Tab */
          <div>
            {items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد إعلانات</h3>
                <p className="text-gray-500">لم يقم هذا المستخدم بنشر أي إعلانات بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition group"
                  >
                    <div className="relative h-40 bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl opacity-30">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-emerald-600 font-bold mb-1">{formatPrice(item.estimatedValue || 0)}</div>
                      <h3 className="text-gray-900 font-medium line-clamp-2">{item.title}</h3>
                      <div className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {item.governorate || 'مصر'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Reviews Tab */
          <div className="grid md:grid-cols-3 gap-6">
            {/* Stats Sidebar */}
            <div className="md:col-span-1">
              {reviewStats && <ReviewStats stats={reviewStats} />}
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2 space-y-4">
              {/* Sort */}
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">التقييمات</h2>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="recent">الأحدث</option>
                  <option value="rating_high">الأعلى تقييماً</option>
                  <option value="rating_low">الأقل تقييماً</option>
                  <option value="helpful">الأكثر فائدة</option>
                </select>
              </div>

              {/* Loading */}
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <div className="text-6xl mb-4">⭐</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد تقييمات</h3>
                  <p className="text-gray-500">لم يتلق هذا المستخدم أي تقييمات بعد</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
