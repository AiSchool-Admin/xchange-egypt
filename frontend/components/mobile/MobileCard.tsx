'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Shield, RefreshCw, Battery, Eye, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface MobileListing {
  id: string;
  title: string;
  titleAr?: string;
  brand: string;
  model: string;
  storageGb: number;
  priceEgp: number;
  conditionGrade: string;
  batteryHealth?: number;
  imeiVerified: boolean;
  imeiStatus: string;
  acceptsBarter: boolean;
  images: string[];
  governorate: string;
  city?: string;
  viewsCount: number;
  favoritesCount: number;
  featured: boolean;
  createdAt: string;
  seller: {
    id: string;
    fullName: string;
    avatar?: string;
    rating: number;
    totalReviews: number;
  };
}

interface MobileCardProps {
  listing: MobileListing;
  viewMode?: 'grid' | 'list';
  featured?: boolean;
}

const BRAND_COLORS: Record<string, string> = {
  APPLE: 'bg-gray-900',
  SAMSUNG: 'bg-blue-600',
  XIAOMI: 'bg-orange-500',
  OPPO: 'bg-green-600',
  HUAWEI: 'bg-red-600',
  REALME: 'bg-yellow-500',
  INFINIX: 'bg-cyan-600',
  TECNO: 'bg-indigo-600',
};

const CONDITION_BADGES: Record<string, { label: string; color: string; bg: string }> = {
  A: { label: 'ممتاز', color: 'text-green-700', bg: 'bg-green-100' },
  B: { label: 'جيد جداً', color: 'text-blue-700', bg: 'bg-blue-100' },
  C: { label: 'جيد', color: 'text-yellow-700', bg: 'bg-yellow-100' },
  D: { label: 'مقبول', color: 'text-orange-700', bg: 'bg-orange-100' },
};

export default function MobileCard({ listing, viewMode = 'grid', featured = false }: MobileCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const condition = CONDITION_BADGES[listing.conditionGrade] || CONDITION_BADGES.B;
  const brandColor = BRAND_COLORS[listing.brand] || 'bg-gray-600';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'منذ دقائق';
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `منذ ${diffInDays} يوم`;
    if (diffInDays < 30) return `منذ ${Math.floor(diffInDays / 7)} أسبوع`;
    return `منذ ${Math.floor(diffInDays / 30)} شهر`;
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Call API to add/remove favorite
  };

  const primaryImage = listing.images?.[0] || '/images/phone-placeholder.png';

  if (viewMode === 'list') {
    return (
      <Link href={`/mobiles/${listing.id}`}>
        <div className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
          featured ? 'ring-2 ring-amber-400' : ''
        }`}>
          <div className="flex">
            {/* Image */}
            <div className="relative w-48 h-40 flex-shrink-0">
              {!imageError ? (
                <Image
                  src={primaryImage}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-4xl">📱</span>
                </div>
              )}

              {/* Brand Badge */}
              <div className={`absolute top-2 right-2 ${brandColor} text-white text-xs px-2 py-1 rounded-md font-medium`}>
                {listing.brand}
              </div>

              {/* Featured Badge */}
              {featured && (
                <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-md font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  مميز
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{listing.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {listing.model} - {listing.storageGb}GB
                  </p>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-indigo-600">
                    {formatPrice(listing.priceEgp)}
                    <span className="text-sm font-normal text-gray-500 mr-1">ج.م</span>
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`${condition.bg} ${condition.color} text-xs px-2 py-1 rounded-full font-medium`}>
                  حالة {condition.label}
                </span>

                {listing.imeiVerified && (
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    IMEI نظيف
                  </span>
                )}

                {listing.acceptsBarter && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    يقبل المقايضة
                  </span>
                )}

                {listing.batteryHealth && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Battery className="w-3 h-3" />
                    {listing.batteryHealth}%
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {listing.governorate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {listing.viewsCount}
                  </span>
                </div>
                <span>{getTimeAgo(listing.createdAt)}</span>
              </div>
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavorite}
              className="absolute top-3 left-3 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View
  return (
    <Link href={`/mobiles/${listing.id}`}>
      <div className={`group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
        featured ? 'ring-2 ring-amber-400' : ''
      }`}>
        {/* Image Section */}
        <div className="relative aspect-square">
          {!imageError ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-6xl">📱</span>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Brand Badge */}
          <div className={`absolute top-3 right-3 ${brandColor} text-white text-xs px-2.5 py-1 rounded-lg font-medium shadow-lg`}>
            {listing.brand}
          </div>

          {/* Featured Badge */}
          {featured && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs px-2.5 py-1 rounded-lg font-medium shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              مميز
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 left-3 p-2.5 bg-white/90 backdrop-blur rounded-full shadow-lg hover:bg-white transition-all hover:scale-110"
            style={{ display: featured ? 'none' : 'block' }}
          >
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
          </button>

          {/* IMEI Verified Badge */}
          {listing.imeiVerified && (
            <div className="absolute bottom-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 shadow-lg">
              <Shield className="w-3 h-3" />
              IMEI ✓
            </div>
          )}

          {/* Barter Badge */}
          {listing.acceptsBarter && (
            <div className="absolute bottom-3 left-3 bg-purple-500 text-white text-xs px-2 py-1 rounded-lg font-medium flex items-center gap-1 shadow-lg">
              <RefreshCw className="w-3 h-3" />
              مقايضة
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Title & Model */}
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {listing.title}
          </h3>
          <p className="text-gray-500 text-sm mb-3">
            {listing.model} • {listing.storageGb}GB
          </p>

          {/* Condition & Battery */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`${condition.bg} ${condition.color} text-xs px-2.5 py-1 rounded-full font-medium`}>
              {condition.label}
            </span>
            {listing.batteryHealth && (
              <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <Battery className="w-3 h-3" />
                {listing.batteryHealth}%
              </span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl font-bold text-indigo-600">
              {formatPrice(listing.priceEgp)}
              <span className="text-sm font-normal text-gray-400 mr-1">ج.م</span>
            </div>
          </div>

          {/* Seller & Location */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {listing.seller.avatar ? (
                  <Image
                    src={listing.seller.avatar}
                    alt={listing.seller.fullName}
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-xs">👤</span>
                )}
              </div>
              <span className="truncate max-w-[80px]">{listing.seller.fullName}</span>
              {listing.seller.rating > 0 && (
                <span className="flex items-center gap-0.5 text-amber-500">
                  <Star className="w-3 h-3 fill-current" />
                  {listing.seller.rating.toFixed(1)}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {listing.governorate}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {listing.viewsCount} مشاهدة
            </span>
            <span>{getTimeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
