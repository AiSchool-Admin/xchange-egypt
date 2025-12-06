'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

// ============================================
// Types
// ============================================
export interface ItemCardProps {
  id: string;
  title: string;
  price: number;
  images: string[] | { url: string; isPrimary?: boolean }[];
  condition?: string;
  location?: string;
  governorate?: string;
  listingType?: 'DIRECT_SALE' | 'AUCTION' | 'BARTER' | 'DIRECT_BUY' | 'REVERSE_AUCTION';
  category?: string;
  seller?: {
    id: string;
    name: string;
    avatar?: string;
  };
  isFeatured?: boolean;
  promotionTier?: 'GOLD' | 'PREMIUM' | 'STANDARD' | 'BASIC';
  createdAt?: string;
  views?: number;
  // Variant options
  variant?: 'default' | 'compact' | 'horizontal';
  showActions?: boolean;
  showSeller?: boolean;
  className?: string;
}

// ============================================
// Condition Labels
// ============================================
const CONDITIONS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'جديد', color: 'bg-green-500' },
  LIKE_NEW: { label: 'شبه جديد', color: 'bg-emerald-500' },
  GOOD: { label: 'جيد', color: 'bg-blue-500' },
  FAIR: { label: 'مقبول', color: 'bg-amber-500' },
  POOR: { label: 'مستعمل', color: 'bg-gray-500' },
};

// ============================================
// Listing Type Labels
// ============================================
const LISTING_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  DIRECT_SALE: { label: 'للبيع', icon: '🏷️', color: 'bg-emerald-500' },
  AUCTION: { label: 'مزاد', icon: '🔨', color: 'bg-purple-500' },
  BARTER: { label: 'مقايضة', icon: '🔄', color: 'bg-blue-500' },
  DIRECT_BUY: { label: 'مطلوب', icon: '🔍', color: 'bg-orange-500' },
  REVERSE_AUCTION: { label: 'مزاد عكسي', icon: '📢', color: 'bg-pink-500' },
};

// ============================================
// Price Formatter
// ============================================
const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون`;
  } else if (price >= 1000) {
    return `${Math.floor(price / 1000)} ألف`;
  }
  return price.toLocaleString('ar-EG');
};

// ============================================
// Time Ago Formatter
// ============================================
const timeAgo = (dateString?: string): string => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'الآن';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} د`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} س`;
  if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} ي`;
  return `منذ ${Math.floor(diffInSeconds / 604800)} أ`;
};

// ============================================
// Image Component with Loading State
// ============================================
function ItemImage({
  src,
  alt,
  className = ''
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {/* Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-shimmer" />
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-4xl opacity-30">📦</span>
        </div>
      )}

      {/* Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  );
}

// ============================================
// Main Item Card Component
// ============================================
export default function ItemCard({
  id,
  title,
  price,
  images,
  condition,
  location,
  governorate,
  listingType = 'DIRECT_SALE',
  category,
  seller,
  isFeatured,
  promotionTier,
  createdAt,
  views,
  variant = 'default',
  showActions = true,
  showSeller = true,
  className = '',
}: ItemCardProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get primary image
  const getImageUrl = (): string => {
    if (!images || images.length === 0) return '';

    // Filter out null/undefined values
    const validImages = images.filter((img): img is string | { url: string; isPrimary?: boolean } =>
      img !== null && img !== undefined
    );

    if (validImages.length === 0) return '';

    const firstImage = validImages[0];
    if (typeof firstImage === 'string') return firstImage;

    // Find primary image or use first
    const primaryImage = validImages.find(
      (img): img is { url: string; isPrimary?: boolean } =>
        typeof img !== 'string' && img?.isPrimary === true
    );
    return primaryImage?.url || (typeof firstImage === 'string' ? firstImage : firstImage?.url || '');
  };

  const imageUrl = getImageUrl();
  const imageCount = images?.filter(img => img !== null && img !== undefined)?.length || 0;
  const conditionInfo = condition ? CONDITIONS[condition] : null;
  const listingInfo = listingType ? LISTING_TYPES[listingType] : null;
  const displayLocation = location || governorate || '';

  // Handle favorite toggle
  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement API call to save favorite
  };

  // Featured badge
  const renderFeaturedBadge = () => {
    if (!isFeatured && promotionTier === 'BASIC') return null;

    const badges: Record<string, { label: string; icon: string; className: string }> = {
      GOLD: { label: 'ذهبي', icon: '👑', className: 'badge-gold' },
      PREMIUM: { label: 'مميز', icon: '⭐', className: 'bg-gradient-to-r from-amber-400 to-amber-500 text-white' },
      STANDARD: { label: 'مروج', icon: '🌟', className: 'bg-orange-500 text-white' },
    };

    const badge = badges[promotionTier || 'STANDARD'];
    if (!badge) return null;

    return (
      <span className={`absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs font-bold ${badge.className}`}>
        {badge.icon} {badge.label}
      </span>
    );
  };

  // ============================================
  // Compact Variant
  // ============================================
  if (variant === 'compact') {
    return (
      <Link
        href={`/items/${id}`}
        className={`group block ${className}`}
      >
        <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100">
          {/* Image */}
          <div className="relative aspect-square bg-gray-100">
            {imageUrl ? (
              <ItemImage src={imageUrl} alt={title} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <span className="text-3xl opacity-30">📦</span>
              </div>
            )}

            {/* Listing Type Badge */}
            {listingType && listingType !== 'DIRECT_SALE' && listingInfo && (
              <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium text-white ${listingInfo.color}`}>
                {listingInfo.icon}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-3">
            <div className="text-primary-600 font-bold text-sm mb-1">
              {formatPrice(price)} ج.م
            </div>
            <h3 className="text-gray-800 text-sm line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            {displayLocation && (
              <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {displayLocation}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ============================================
  // Horizontal Variant
  // ============================================
  if (variant === 'horizontal') {
    return (
      <Link
        href={`/items/${id}`}
        className={`group block ${className}`}
      >
        <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border border-gray-100 flex">
          {/* Image */}
          <div className="relative w-32 h-32 flex-shrink-0 bg-gray-100">
            {imageUrl ? (
              <ItemImage src={imageUrl} alt={title} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl opacity-30">📦</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-800 font-medium line-clamp-2 group-hover:text-primary-600 transition-colors">
                {title}
              </h3>
              {displayLocation && (
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {displayLocation}
                </div>
              )}
            </div>
            <div className="text-primary-600 font-bold">
              {formatPrice(price)} ج.م
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ============================================
  // Default Variant (Rich Card)
  // ============================================
  return (
    <Link
      href={`/items/${id}`}
      className={`group block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden border ${
        isFeatured ? 'border-amber-200' : 'border-gray-100'
      }`}>
        {/* Image Section */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          {imageUrl ? (
            <ItemImage
              src={imageUrl}
              alt={title}
              className={`w-full h-full transition-transform duration-500 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-5xl opacity-30">📦</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Featured Badge */}
          {renderFeaturedBadge()}

          {/* Favorite Button */}
          {showActions && user && (
            <button
              onClick={toggleFavorite}
              className={`absolute top-2 left-2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}

          {/* Condition Badge */}
          {conditionInfo && (
            <span className={`absolute bottom-2 right-2 px-2.5 py-1 rounded-full text-xs font-semibold text-white ${conditionInfo.color}`}>
              {conditionInfo.label}
            </span>
          )}

          {/* Image Count */}
          {imageCount > 1 && (
            <span className="absolute bottom-2 left-2 px-2 py-1 rounded-full text-xs font-medium bg-black/60 text-white flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {imageCount}
            </span>
          )}

          {/* Listing Type Badge (for non-sale items) */}
          {listingType && listingType !== 'DIRECT_SALE' && listingInfo && (
            <span className={`absolute top-2 right-12 px-2 py-1 rounded-full text-xs font-medium text-white ${listingInfo.color}`}>
              {listingInfo.icon} {listingInfo.label}
            </span>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-bold text-primary-600">
              {formatPrice(price)}
            </span>
            <span className="text-sm text-gray-500">ج.م</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
            {title}
          </h3>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {displayLocation && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {displayLocation}
              </span>
            )}
            {createdAt && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {timeAgo(createdAt)}
              </span>
            )}
          </div>

          {/* Seller Info */}
          {showSeller && seller && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  {seller.name?.charAt(0).toUpperCase() || 'م'}
                </div>
                <span className="text-sm text-gray-600 truncate max-w-[100px]">
                  {seller.name}
                </span>
              </div>
              <span className="text-primary-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                عرض ←
              </span>
            </div>
          )}

          {/* Quick Actions - Shows on Hover */}
          {showActions && (
            <div className={`mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 transition-all duration-300 ${
              isHovered ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 overflow-hidden'
            }`}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // TODO: Implement chat
                }}
                className="flex items-center justify-center gap-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                تواصل
              </button>
              {listingType === 'DIRECT_SALE' ? (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // TODO: Implement barter
                  }}
                  className="flex items-center justify-center gap-1 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  مقايضة
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // TODO: View details
                  }}
                  className="flex items-center justify-center gap-1 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  عرض التفاصيل
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ============================================
// Skeleton Loading Component
// ============================================
export function ItemCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'horizontal' }) {
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl shadow-card overflow-hidden border border-gray-100">
        <div className="aspect-square bg-gray-200 animate-shimmer" />
        <div className="p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20 animate-shimmer" />
          <div className="h-3 bg-gray-200 rounded w-full animate-shimmer" />
          <div className="h-3 bg-gray-200 rounded w-2/3 animate-shimmer" />
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="bg-white rounded-xl shadow-card overflow-hidden border border-gray-100 flex">
        <div className="w-32 h-32 bg-gray-200 animate-shimmer" />
        <div className="flex-1 p-3 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full animate-shimmer" />
          <div className="h-3 bg-gray-200 rounded w-2/3 animate-shimmer" />
          <div className="h-5 bg-gray-200 rounded w-24 animate-shimmer mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-gray-100">
      <div className="aspect-[4/3] bg-gray-200 animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-24 animate-shimmer" />
        <div className="h-4 bg-gray-200 rounded w-full animate-shimmer" />
        <div className="h-4 bg-gray-200 rounded w-2/3 animate-shimmer" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-shimmer" />
        <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-200 rounded-full animate-shimmer" />
          <div className="h-3 bg-gray-200 rounded w-20 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
