'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface Activity {
  id: number;
  type: 'sale' | 'barter' | 'auction' | 'signup';
  userAr: string;
  userEn: string;
  itemAr?: string;
  itemEn?: string;
  price?: number;
  cityAr: string;
  cityEn: string;
  timeAgoKey: string;
}

// Sample activities - in production, these would come from a WebSocket
const SAMPLE_ACTIVITIES: Activity[] = [
  { id: 1, type: 'sale', userAr: 'أحمد م.', userEn: 'Ahmed M.', itemAr: 'iPhone 14 Pro', itemEn: 'iPhone 14 Pro', price: 28500, cityAr: 'القاهرة', cityEn: 'Cairo', timeAgoKey: 'now' },
  { id: 2, type: 'barter', userAr: 'سارة أ.', userEn: 'Sara A.', itemAr: 'MacBook مقابل كاميرا Canon', itemEn: 'MacBook for Canon Camera', cityAr: 'الإسكندرية', cityEn: 'Alexandria', timeAgoKey: '1min' },
  { id: 3, type: 'auction', userAr: 'محمد ع.', userEn: 'Mohamed A.', itemAr: 'سيارة Hyundai Elantra', itemEn: 'Hyundai Elantra Car', price: 450000, cityAr: 'الجيزة', cityEn: 'Giza', timeAgoKey: '2min' },
  { id: 4, type: 'signup', userAr: 'نور الدين', userEn: 'Nour El Din', cityAr: 'المنصورة', cityEn: 'Mansoura', timeAgoKey: '3min' },
  { id: 5, type: 'sale', userAr: 'خالد س.', userEn: 'Khaled S.', itemAr: 'شقة 120م²', itemEn: 'Apartment 120m²', price: 1500000, cityAr: 'المعادي', cityEn: 'Maadi', timeAgoKey: '5min' },
  { id: 6, type: 'barter', userAr: 'هدى م.', userEn: 'Hoda M.', itemAr: 'ذهب عيار 21 مقابل سيارة', itemEn: '21K Gold for Car', cityAr: 'الزقازيق', cityEn: 'Zagazig', timeAgoKey: '7min' },
  { id: 7, type: 'sale', userAr: 'يوسف أ.', userEn: 'Youssef A.', itemAr: 'PlayStation 5', itemEn: 'PlayStation 5', price: 18000, cityAr: 'طنطا', cityEn: 'Tanta', timeAgoKey: '8min' },
  { id: 8, type: 'auction', userAr: 'مريم ك.', userEn: 'Mariam K.', itemAr: 'ساعة Rolex أصلية', itemEn: 'Original Rolex Watch', price: 85000, cityAr: 'الإسماعيلية', cityEn: 'Ismailia', timeAgoKey: '10min' },
];

export default function LiveActivityFeed() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [activities] = useState(SAMPLE_ACTIVITIES);
  const t = useTranslations('liveActivity');
  const locale = useLocale();

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

  const ACTIVITY_CONFIG = {
    sale: { icon: '💰', color: 'bg-emerald-500', labelKey: 'types.sale' },
    barter: { icon: '🔄', color: 'bg-orange-500', labelKey: 'types.barter' },
    auction: { icon: '🔨', color: 'bg-purple-500', labelKey: 'types.auction' },
    signup: { icon: '👋', color: 'bg-blue-500', labelKey: 'types.signup' },
  };

  const config = ACTIVITY_CONFIG[activity.type];

  const formatPrice = (price: number) => {
    if (locale === 'ar') {
      if (price >= 1000000) return `${(price / 1000000).toFixed(1)} ${t('currency.million')}`;
      if (price >= 1000) return `${Math.floor(price / 1000)} ${t('currency.thousand')}`;
      return `${price.toLocaleString('ar-EG')} ${t('currency.egp')}`;
    } else {
      if (price >= 1000000) return `${(price / 1000000).toFixed(1)}M EGP`;
      if (price >= 1000) return `${Math.floor(price / 1000)}K EGP`;
      return `${price.toLocaleString('en-US')} EGP`;
    }
  };

  const user = locale === 'ar' ? activity.userAr : activity.userEn;
  const city = locale === 'ar' ? activity.cityAr : activity.cityEn;
  const item = locale === 'ar' ? activity.itemAr : activity.itemEn;

  return (
    <div className={`fixed bottom-6 ${locale === 'ar' ? 'left-6' : 'right-6'} z-50`}>
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
              <span className="font-bold text-gray-900 text-sm">{user}</span>
              <span className="text-xs text-gray-400">• {city}</span>
            </div>

            {activity.type === 'signup' ? (
              <p className="text-sm text-gray-600">{t('joinedPlatform')} 🎉</p>
            ) : (
              <>
                <p className="text-sm text-gray-600 truncate">{item}</p>
                {activity.price && (
                  <p className="text-sm font-bold text-emerald-600 mt-0.5">
                    {formatPrice(activity.price)}
                  </p>
                )}
              </>
            )}

            <p className="text-xs text-gray-400 mt-1">{t(`timeAgo.${activity.timeAgoKey}`)}</p>
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
