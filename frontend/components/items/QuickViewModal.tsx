'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface QuickViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    description?: string;
    price: number;
    images: string[];
    condition?: string;
    governorate?: string;
    city?: string;
    category?: string;
    seller?: {
      id: string;
      name: string;
      avatar?: string;
      rating?: number;
    };
    listingType?: string;
    createdAt?: string;
  } | null;
}

const CONDITIONS: Record<string, { label: string; color: string; icon: string }> = {
  NEW: { label: 'جديد', color: 'bg-green-100 text-green-700', icon: '✨' },
  LIKE_NEW: { label: 'شبه جديد', color: 'bg-blue-100 text-blue-700', icon: '🌟' },
  GOOD: { label: 'جيد', color: 'bg-yellow-100 text-yellow-700', icon: '👍' },
  FAIR: { label: 'مقبول', color: 'bg-orange-100 text-orange-700', icon: '👌' },
  POOR: { label: 'مستعمل', color: 'bg-gray-100 text-gray-700', icon: '📦' },
};

const LISTING_TYPES: Record<string, { label: string; icon: string }> = {
  DIRECT_SALE: { label: 'بيع مباشر', icon: '🏷️' },
  AUCTION: { label: 'مزاد', icon: '🔨' },
  BARTER: { label: 'مقايضة', icon: '🔄' },
  DIRECT_BUY: { label: 'مطلوب', icon: '🔍' },
};

export default function QuickViewModal({ isOpen, onClose, item }: QuickViewModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset state when item changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoaded(false);
  }, [item?.id]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const condition = item.condition ? CONDITIONS[item.condition] : null;
  const listingType = item.listingType ? LISTING_TYPES[item.listingType] : null;

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} ألف`;
    }
    return price.toLocaleString('ar-EG');
  };

  const nextImage = () => {
    if (item.images.length > 1) {
      setImageLoaded(false);
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item.images.length > 1) {
      setImageLoaded(false);
      setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative aspect-square bg-gray-100">
            {item.images.length > 0 ? (
              <>
                {/* Main Image */}
                <div className="relative w-full h-full">
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <Image
                    src={item.images[currentImageIndex]}
                    alt={item.title}
                    fill
                    className={`object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImageLoaded(true)}
                  />
                </div>

                {/* Navigation Arrows */}
                {item.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image Indicators */}
                {item.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {item.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setImageLoaded(false);
                          setCurrentImageIndex(i);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentImageIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Image Count */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm text-white rounded-full text-sm">
                  {currentImageIndex + 1} / {item.images.length}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                📦
              </div>
            )}

            {/* Thumbnails */}
            {item.images.length > 1 && (
              <div className="absolute bottom-16 left-0 right-0 px-4">
                <div className="flex gap-2 justify-center overflow-x-auto">
                  {item.images.slice(0, 5).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setImageLoaded(false);
                        setCurrentImageIndex(i);
                      }}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                        i === currentImageIndex
                          ? 'ring-2 ring-emerald-500 ring-offset-2'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {condition && (
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${condition.color}`}>
                  {condition.icon} {condition.label}
                </span>
              )}
              {listingType && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                  {listingType.icon} {listingType.label}
                </span>
              )}
              {item.category && (
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                  {item.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{item.title}</h2>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-black text-emerald-600">
                {formatPrice(item.price)}
              </span>
              <span className="text-lg text-gray-500">ج.م</span>
            </div>

            {/* Location */}
            {item.governorate && (
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{item.city ? `${item.city}، ` : ''}{item.governorate}</span>
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-2">الوصف</h3>
                <p className="text-gray-700 leading-relaxed line-clamp-4">
                  {item.description}
                </p>
              </div>
            )}

            {/* Seller */}
            {item.seller && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
                  {item.seller.avatar ? (
                    <Image
                      src={item.seller.avatar}
                      alt={item.seller.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    '👤'
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.seller.name}</p>
                  {item.seller.rating && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <span className="text-yellow-500">⭐</span>
                      <span>{item.seller.rating}</span>
                    </div>
                  )}
                </div>
                <Link
                  href={`/users/${item.seller.id}`}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                >
                  عرض الملف
                </Link>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                href={`/items/${item.id}`}
                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-center hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
              >
                <span>عرض التفاصيل الكاملة</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                  <span>💬</span>
                  <span>تواصل</span>
                </button>
                <button className="py-3 bg-pink-50 text-pink-600 rounded-xl font-medium hover:bg-pink-100 transition-colors flex items-center justify-center gap-2">
                  <span>❤️</span>
                  <span>المفضلة</span>
                </button>
              </div>

              {item.listingType === 'BARTER' && (
                <button className="w-full py-3 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-2">
                  <span>🔄</span>
                  <span>اقترح مقايضة</span>
                </button>
              )}
            </div>

            {/* Time */}
            {item.createdAt && (
              <p className="text-center text-sm text-gray-400 mt-4">
                تم النشر {new Date(item.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
