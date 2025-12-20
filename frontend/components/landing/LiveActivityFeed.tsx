'use client';

import React, { useState, useEffect } from 'react';

interface Activity {
  id: number;
  type: 'sale' | 'barter' | 'auction' | 'signup';
  user: string;
  item?: string;
  price?: number;
  city: string;
  timeAgo: string;
}

// Sample activities - in production, these would come from a WebSocket
const SAMPLE_ACTIVITIES: Activity[] = [
  { id: 1, type: 'sale', user: 'أحمد م.', item: 'iPhone 14 Pro', price: 28500, city: 'القاهرة', timeAgo: 'الآن' },
  { id: 2, type: 'barter', user: 'سارة أ.', item: 'MacBook مقابل كاميرا Canon', city: 'الإسكندرية', timeAgo: 'منذ دقيقة' },
  { id: 3, type: 'auction', user: 'محمد ع.', item: 'سيارة Hyundai Elantra', price: 450000, city: 'الجيزة', timeAgo: 'منذ 2 د' },
  { id: 4, type: 'signup', user: 'نور الدين', city: 'المنصورة', timeAgo: 'منذ 3 د' },
  { id: 5, type: 'sale', user: 'خالد س.', item: 'شقة 120م²', price: 1500000, city: 'المعادي', timeAgo: 'منذ 5 د' },
  { id: 6, type: 'barter', user: 'هدى م.', item: 'ذهب عيار 21 مقابل سيارة', city: 'الزقازيق', timeAgo: 'منذ 7 د' },
  { id: 7, type: 'sale', user: 'يوسف أ.', item: 'PlayStation 5', price: 18000, city: 'طنطا', timeAgo: 'منذ 8 د' },
  { id: 8, type: 'auction', user: 'مريم ك.', item: 'ساعة Rolex أصلية', price: 85000, city: 'الإسماعيلية', timeAgo: 'منذ 10 د' },
];

const ACTIVITY_CONFIG = {
  sale: { icon: '💰', color: 'bg-emerald-500', label: 'تم البيع' },
  barter: { icon: '🔄', color: 'bg-orange-500', label: 'تمت المقايضة' },
  auction: { icon: '🔨', color: 'bg-purple-500', label: 'مزايدة جديدة' },
  signup: { icon: '👋', color: 'bg-blue-500', label: 'انضم للمنصة' },
};

export default function LiveActivityFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [activities] = useState(SAMPLE_ACTIVITIES);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length]);

  const activity = activities[currentIndex];
  const config = ACTIVITY_CONFIG[activity.type];

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)} مليون ج.م`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)} ألف ج.م`;
    return `${price.toLocaleString('ar-EG')} ج.م`;
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-w-sm transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-10 h-10 ${config.color} rounded-full flex items-center justify-center text-lg flex-shrink-0`}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 text-sm">{activity.user}</span>
              <span className="text-xs text-gray-400">• {activity.city}</span>
            </div>

            {activity.type === 'signup' ? (
              <p className="text-sm text-gray-600">انضم للمنصة 🎉</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 truncate">{activity.item}</p>
                {activity.price && (
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">
                    {formatPrice(activity.price)}
                  </p>
                )}
              </>
            )}

            <p className="text-xs text-gray-400 mt-1">{activity.timeAgo}</p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-400">LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
