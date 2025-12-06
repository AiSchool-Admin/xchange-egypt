'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getFeed, followUser, unfollowUser, discoverUsers, ActivityItem, UserProfile } from '@/lib/api/social';

function ActivityCard({ activity }: { activity: ActivityItem }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'NEW_LISTING': return '&#128230;';
      case 'PRICE_DROP': return '&#128201;';
      case 'SOLD': return '&#127881;';
      case 'NEW_REVIEW': return '&#11088;';
      case 'ACHIEVEMENT': return '&#127942;';
      default: return '&#128276;';
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'NEW_LISTING':
        return `أضاف إعلاناً جديداً: ${activity.data.listingTitle}`;
      case 'PRICE_DROP':
        return `خفّض السعر من ${activity.data.oldPrice?.toLocaleString('ar-EG')} إلى ${activity.data.newPrice?.toLocaleString('ar-EG')} ج.م`;
      case 'SOLD':
        return `باع: ${activity.data.listingTitle}`;
      case 'NEW_REVIEW':
        return `حصل على تقييم ${activity.data.reviewRating} نجوم`;
      case 'ACHIEVEMENT':
        return `حصل على إنجاز: ${activity.data.achievementName}`;
      default:
        return 'نشاط جديد';
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all">
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/users/${activity.userId}`}>
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {activity.user.avatar ? (
              <img src={activity.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              activity.user.fullName?.charAt(0) || '?'
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Link href={`/users/${activity.userId}`} className="font-bold text-gray-800 hover:text-emerald-600">
              {activity.user.fullName}
            </Link>
            <span dangerouslySetInnerHTML={{ __html: getActivityIcon(activity.type) }} />
          </div>
          <p className="text-gray-600">{getActivityText(activity)}</p>
          <span className="text-xs text-gray-400">{timeAgo(activity.createdAt)}</span>
        </div>

        {/* Image Preview */}
        {activity.data.listingImage && (
          <Link href={`/items/${activity.data.listingId}`}>
            <img
              src={activity.data.listingImage}
              alt=""
              className="w-16 h-16 rounded-lg object-cover"
            />
          </Link>
        )}
      </div>
    </div>
  );
}

function UserCard({ user, onFollow, onUnfollow }: { user: UserProfile; onFollow: () => void; onUnfollow: () => void }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <Link href={`/users/${user.id}`}>
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              user.fullName?.charAt(0) || '?'
            )}
          </div>
        </Link>
        <div className="flex-1">
          <Link href={`/users/${user.id}`} className="font-bold text-gray-800 hover:text-emerald-600 block">
            {user.fullName}
          </Link>
          <div className="text-sm text-gray-500">
            {user.listingCount} إعلان &#8226; {user.followerCount} متابع
          </div>
        </div>
        <button
          onClick={user.isFollowing ? onUnfollow : onFollow}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            user.isFollowing
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          {user.isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
        </button>
      </div>
    </div>
  );
}

export default function SocialPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'discover'>('feed');

  useEffect(() => {
    if (user) fetchData();
    else setLoading(false);
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [feedRes, discoverRes] = await Promise.all([
        getFeed().catch(() => ({ success: false, data: { activities: [] } })),
        discoverUsers(10).catch(() => ({ success: false, data: { users: [] } })),
      ]);

      if (feedRes.success) setActivities(feedRes.data.activities);
      if (discoverRes.success) setSuggestedUsers(discoverRes.data.users);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    try {
      await followUser(userId);
      fetchData();
    } catch (error) {
      console.error('Error following:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await unfollowUser(userId);
      fetchData();
    } catch (error) {
      console.error('Error unfollowing:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <span className="text-6xl mb-4 block">&#128101;</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">سجّل دخول لمتابعة البائعين</h2>
          <p className="text-gray-500 mb-4">تابع البائعين المفضلين واحصل على آخر التحديثات</p>
          <Link
            href="/login?redirect=/social"
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors inline-block"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-blue-600 via-indigo-500 to-purple-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-5xl">&#128101;</span> المتابعات
          </h1>
          <p className="text-xl text-white/90">تابع البائعين المفضلين وابقَ على اطلاع</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex-1 py-4 font-bold transition-colors ${
                activeTab === 'feed'
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              &#128240; آخر الأخبار
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex-1 py-4 font-bold transition-colors ${
                activeTab === 'discover'
                  ? 'text-emerald-600 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              &#128269; اكتشف بائعين
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'feed' ? (
          activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <span className="text-6xl mb-4 block">&#128240;</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد أخبار</h3>
              <p className="text-gray-500 mb-4">تابع بعض البائعين لترى آخر أخبارهم</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
              >
                اكتشف بائعين
              </button>
            </div>
          )
        ) : (
          suggestedUsers.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-800 mb-4">بائعون مقترحون لك</h3>
              {suggestedUsers.map((suggestedUser) => (
                <UserCard
                  key={suggestedUser.id}
                  user={suggestedUser}
                  onFollow={() => handleFollow(suggestedUser.id)}
                  onUnfollow={() => handleUnfollow(suggestedUser.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <span className="text-6xl mb-4 block">&#128269;</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد اقتراحات حالياً</h3>
              <p className="text-gray-500">جرّب البحث عن بائعين في صفحة المنتجات</p>
            </div>
          )
        )}
      </section>
    </div>
  );
}
