'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface RecentItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  viewedAt: number;
}

interface RecentlyViewedProps {
  currentItemId?: string;
  maxItems?: number;
}

// Helper to add item to recently viewed
export function addToRecentlyViewed(item: {
  id: string;
  title: string;
  price: number;
  image?: string;
}) {
  if (typeof window === 'undefined') return;

  const key = 'xchange_recently_viewed';
  let items: RecentItem[] = [];

  try {
    const stored = localStorage.getItem(key);
    items = stored ? JSON.parse(stored) : [];
  } catch (e) {
    items = [];
  }

  // Remove if already exists
  items = items.filter(i => i.id !== item.id);

  // Add to front with timestamp
  items.unshift({
    ...item,
    viewedAt: Date.now(),
  });

  // Keep only last 20 items
  items = items.slice(0, 20);

  localStorage.setItem(key, JSON.stringify(items));
}

export default function RecentlyViewed({
  currentItemId,
  maxItems = 6,
}: RecentlyViewedProps) {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const key = 'xchange_recently_viewed';
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        let parsed: RecentItem[] = JSON.parse(stored);
        // Filter out current item
        if (currentItemId) {
          parsed = parsed.filter(i => i.id !== currentItemId);
        }
        setItems(parsed);
      }
    } catch (e) {
      console.error('Failed to load recently viewed');
    }
  }, [currentItemId]);

  const clearAll = () => {
    localStorage.removeItem('xchange_recently_viewed');
    setItems([]);
  };

  if (items.length === 0) return null;

  const displayItems = isExpanded ? items : items.slice(0, maxItems);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toLocaleString('ar-EG');
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'الآن';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} د`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} س`;
    return `منذ ${Math.floor(seconds / 86400)} ي`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🕐</span>
          <h3 className="font-bold text-gray-900">شاهدته مؤخراً</h3>
          <span className="text-sm text-gray-500">({items.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {items.length > maxItems && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              {isExpanded ? 'عرض أقل' : `عرض الكل (${items.length})`}
            </button>
          )}
          <button
            onClick={clearAll}
            className="text-sm text-red-500 hover:text-red-600"
          >
            مسح
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {displayItems.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.id}`}
            className="flex-shrink-0 w-32 group"
          >
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  📦
                </div>
              )}
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded">
                {timeAgo(item.viewedAt)}
              </div>
            </div>
            <p className="text-sm font-medium text-gray-800 truncate group-hover:text-emerald-600 transition-colors">
              {item.title}
            </p>
            <p className="text-sm font-bold text-emerald-600">
              {formatPrice(item.price)} ج.م
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
