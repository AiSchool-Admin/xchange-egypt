'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock wishlist data (in production, this would come from API/localStorage)
const MOCK_WISHLIST_ITEMS = [
  {
    id: 'wish-1',
    title: 'آيفون 14 برو ماكس 256GB',
    price: 42000,
    originalPrice: 48000,
    image: '📱',
    condition: 'ممتاز',
    location: 'القاهرة',
    seller: 'أحمد محمد',
    addedAt: '2024-01-15',
    inStock: true,
    discount: 13,
  },
  {
    id: 'wish-2',
    title: 'لابتوب ماك بوك برو M2',
    price: 55000,
    originalPrice: null,
    image: '💻',
    condition: 'جديد',
    location: 'الإسكندرية',
    seller: 'تك شوب',
    addedAt: '2024-01-14',
    inStock: true,
    discount: null,
  },
  {
    id: 'wish-3',
    title: 'ساعة أبل واتش Series 9',
    price: 15000,
    originalPrice: 18000,
    image: '⌚',
    condition: 'مستعمل',
    location: 'الجيزة',
    seller: 'محمد علي',
    addedAt: '2024-01-12',
    inStock: false,
    discount: 17,
  },
  {
    id: 'wish-4',
    title: 'سماعات AirPods Pro 2',
    price: 8500,
    originalPrice: 9500,
    image: '🎧',
    condition: 'ممتاز',
    location: 'القاهرة',
    seller: 'سمير حسن',
    addedAt: '2024-01-10',
    inStock: true,
    discount: 11,
  },
  {
    id: 'wish-5',
    title: 'بلايستيشن 5 مع 2 يد',
    price: 28000,
    originalPrice: 32000,
    image: '🎮',
    condition: 'جديد',
    location: 'المنصورة',
    seller: 'جيمز ستور',
    addedAt: '2024-01-08',
    inStock: true,
    discount: 13,
  },
];

export default function WishlistPage() {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(MOCK_WISHLIST_ITEMS);
  const [sortBy, setSortBy] = useState<'date' | 'price-asc' | 'price-desc'>('date');
  const [filter, setFilter] = useState<'all' | 'in-stock' | 'on-sale'>('all');

  // Sort items
  const sortedItems = [...wishlistItems].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });

  // Filter items
  const filteredItems = sortedItems.filter(item => {
    if (filter === 'in-stock') return item.inStock;
    if (filter === 'on-sale') return item.discount !== null;
    return true;
  });

  const removeFromWishlist = (id: string) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const clearWishlist = () => {
    if (window.confirm('هل أنت متأكد من حذف كل العناصر من المفضلة؟')) {
      setWishlistItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-3xl">❤️</span>
                قائمة المفضلة
              </h1>
              <p className="text-gray-500 mt-1">
                {wishlistItems.length} منتج محفوظ
              </p>
            </div>

            {wishlistItems.length > 0 && (
              <button
                onClick={clearWishlist}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                مسح الكل
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-8xl mb-6">💔</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">قائمة المفضلة فارغة</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              لم تقم بإضافة أي منتجات إلى المفضلة بعد. تصفح المنتجات واضغط على قلب ❤️ لحفظها هنا.
            </p>
            <Link
              href="/items"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              <span>🛒</span>
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <>
            {/* Filters & Sort */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              {/* Filter Tabs */}
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === 'all' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  الكل ({wishlistItems.length})
                </button>
                <button
                  onClick={() => setFilter('in-stock')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === 'in-stock' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  متوفر ({wishlistItems.filter(i => i.inStock).length})
                </button>
                <button
                  onClick={() => setFilter('on-sale')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    filter === 'on-sale' ? 'bg-primary-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  عروض ({wishlistItems.filter(i => i.discount).length})
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              >
                <option value="date">الأحدث</option>
                <option value="price-asc">السعر: من الأقل</option>
                <option value="price-desc">السعر: من الأعلى</option>
              </select>
            </div>

            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden group ${
                    !item.inStock ? 'opacity-75' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                      {item.image}
                    </span>

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {item.discount && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          -{item.discount}%
                        </span>
                      )}
                      {!item.inStock && (
                        <span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded-full">
                          نفذ
                        </span>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 left-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-primary-600">{item.price.toLocaleString()}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">{item.originalPrice.toLocaleString()}</span>
                      )}
                      <span className="text-sm text-gray-500">ج.م</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <span>📍</span>
                        {item.location}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        item.condition === 'جديد' ? 'bg-green-100 text-green-700' :
                        item.condition === 'ممتاز' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.condition}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/items/${item.id}`}
                        className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-medium text-center hover:bg-primary-600 transition-colors"
                      >
                        عرض التفاصيل
                      </Link>
                      {item.inStock && (
                        <button className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                          🛒
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Alert Banner */}
            <div className="mt-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🔔</span>
                  <div>
                    <h3 className="font-bold text-lg">تنبيهات انخفاض السعر</h3>
                    <p className="text-amber-100 text-sm">
                      فعّل التنبيهات لتصلك إشعارات عند انخفاض أسعار منتجاتك المفضلة
                    </p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-white text-amber-600 rounded-xl font-bold hover:bg-amber-50 transition-colors whitespace-nowrap">
                  تفعيل التنبيهات
                </button>
              </div>
            </div>

            {/* Share Wishlist */}
            <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-900">شارك قائمة المفضلة</h3>
                  <p className="text-gray-500 text-sm">شارك قائمتك مع أصدقائك أو عائلتك</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center gap-2">
                    <span>📱</span>
                    واتساب
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2">
                    <span>📋</span>
                    نسخ الرابط
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
