'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getItems, getFeaturedItems, Item, PromotionTier } from '@/lib/api/items';
import { FeaturedIndicator } from './FeaturedBadge';

interface FeaturedSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export default function FeaturedSection({
  title = 'إعلانات مميزة',
  subtitle = 'اكتشف أفضل العروض المختارة بعناية',
  limit = 8,
}: FeaturedSectionProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedItems = async () => {
      try {
        // Try to get actual featured items first
        const featuredResponse = await getFeaturedItems({ limit });

        if (featuredResponse.data?.items && featuredResponse.data.items.length > 0) {
          setItems(featuredResponse.data.items);
        } else {
          // Fallback: Get high-value items as "featured" if no promoted items exist
          const response = await getItems({
            limit,
            minPrice: 10000,
            status: 'ACTIVE',
          });

          const fallbackItems = (response.data?.items || [])
            .sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0))
            .slice(0, limit);

          setItems(fallbackItems);
        }
      } catch (error) {
        console.error('Failed to load featured items:', error);
        // Fallback on error
        try {
          const response = await getItems({
            limit,
            minPrice: 10000,
            status: 'ACTIVE',
          });
          const fallbackItems = (response.data?.items || [])
            .sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0))
            .slice(0, limit);
          setItems(fallbackItems);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedItems();
  }, [limit]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} ألف`;
    }
    return price.toLocaleString('ar-EG');
  };

  const getTier = (item: Item, index: number): 'gold' | 'silver' | 'bronze' => {
    // Use actual promotion tier if available
    if (item.promotionTier) {
      if (item.promotionTier === 'PLATINUM' || item.promotionTier === 'GOLD') return 'gold';
      if (item.promotionTier === 'PREMIUM' || item.promotionTier === 'FEATURED') return 'silver';
      return 'bronze';
    }

    // Fallback to price-based tier
    const price = item.estimatedValue || 0;
    if (index === 0 || price >= 500000) return 'gold';
    if (index < 3 || price >= 100000) return 'silver';
    return 'bronze';
  };

  if (loading) {
    return (
      <section className="py-10" dir="rtl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <p className="text-gray-500 mt-2">{subtitle}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
                <div className="h-40 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  return (
    <section className="py-10 bg-gradient-to-b from-amber-50/50 to-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">✨</span>
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          <Link
            href="/items?featured=true"
            className="text-amber-600 font-medium hover:text-amber-700 flex items-center gap-1"
          >
            عرض الكل
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item, index) => {
            const tier = getTier(item, index);

            return (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100"
              >
                {/* Featured Indicator */}
                <FeaturedIndicator tier={tier} />

                {/* Image */}
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
                      <span className="text-4xl opacity-30">⭐</span>
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Category */}
                  {item.category && (
                    <span className="text-xs text-amber-600 font-medium">
                      {item.category.nameAr}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-gray-800 font-semibold line-clamp-2 mt-1 group-hover:text-amber-600 transition-colors">
                    {item.title}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-amber-600">
                      {formatPrice(item.estimatedValue || 0)} ج.م
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {item.governorate || 'مصر'}
                    </span>
                  </div>
                </div>

                {/* Premium border glow on hover */}
                <div className="absolute inset-0 rounded-xl border-2 border-amber-400/0 group-hover:border-amber-400/50 transition-colors pointer-events-none"></div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/promote"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition shadow-lg"
          >
            <span>👑</span>
            <span>روّج إعلانك الآن</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
