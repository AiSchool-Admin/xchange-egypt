'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getComparisonByShareCode, Comparison } from '@/lib/api/comparison';

// ============================================
// Shared Comparison Page
// صفحة المقارنة المشتركة
// ============================================

export default function SharedComparisonPage() {
  const params = useParams();
  const shareCode = params.shareCode as string;

  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shareCode) {
      loadComparison();
    }
  }, [shareCode]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getComparisonByShareCode(shareCode);
      setComparison(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'المقارنة غير موجودة أو تم حذفها');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const lowestPrice = comparison?.items && comparison.items.length > 0
    ? Math.min(...comparison.items.map((item: any) => item.estimatedValue || Infinity))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المقارنة...</p>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">المقارنة غير موجودة</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/items"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition"
          >
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  const items = comparison.items;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">
                📊 {comparison.title || 'مقارنة المنتجات'}
              </h1>
              <p className="text-primary-100 mt-1">
                مقارنة {items.length} منتجات
              </p>
            </div>
            <Link
              href={`/compare?items=${items.map((i: any) => i.id).join(',')}`}
              className="px-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition"
            >
              تعديل المقارنة
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Items Header Row */}
          <div className="grid" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
            <div className="p-4 bg-gray-50 border-b border-l border-gray-200 font-bold text-gray-700">
              المنتج
            </div>
            {items.map((item: any) => (
              <div key={item.id} className="p-4 border-b border-gray-200">
                <Link href={`/items/${item.id}`}>
                  <div className="aspect-square w-full max-w-[200px] mx-auto mb-3 rounded-xl overflow-hidden bg-gray-100">
                    {item.images?.[0]?.url ? (
                      <img
                        src={item.images[0].url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                        📷
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-center line-clamp-2 hover:text-primary-600 transition">
                    {item.title}
                  </h3>
                </Link>
              </div>
            ))}
          </div>

          {/* Price Row */}
          <div className="grid" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
            <div className="p-4 bg-primary-50 border-b border-l border-gray-200 font-bold text-primary-700">
              💰 السعر
            </div>
            {items.map((item: any) => {
              const price = item.estimatedValue || 0;
              const isBest = price === lowestPrice && items.length > 1;
              return (
                <div
                  key={item.id}
                  className={`p-4 border-b border-gray-200 text-center ${isBest ? 'bg-green-50' : ''}`}
                >
                  <span className={`text-xl font-bold ${isBest ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatPrice(price)}
                  </span>
                  {isBest && (
                    <span className="block text-xs text-green-600 mt-1">✨ أفضل سعر</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Comparison Fields */}
          {comparison.comparisonFields
            .filter((field) => field.field !== 'estimatedValue')
            .map((field, fieldIndex) => (
              <div
                key={field.field}
                className="grid"
                style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}
              >
                <div className={`p-4 border-b border-l border-gray-200 font-medium text-gray-700 ${
                  fieldIndex % 2 === 0 ? 'bg-gray-50' : ''
                }`}>
                  {field.labelAr}
                </div>
                {field.values.map((value, valueIndex) => (
                  <div
                    key={valueIndex}
                    className={`p-4 border-b border-gray-200 text-center text-gray-900 ${
                      fieldIndex % 2 === 0 ? 'bg-gray-50' : ''
                    }`}
                  >
                    {value !== null && value !== undefined ? String(value) : '-'}
                  </div>
                ))}
              </div>
            ))}

          {/* Actions Row */}
          <div className="grid" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
            <div className="p-4 bg-gray-50 border-l border-gray-200"></div>
            {items.map((item: any) => (
              <div key={item.id} className="p-4 text-center">
                <Link
                  href={`/items/${item.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition"
                >
                  عرض التفاصيل
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Create Your Own */}
        <div className="mt-8 text-center">
          <Link
            href="/items"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            📊 إنشاء مقارنة جديدة
          </Link>
        </div>
      </div>
    </div>
  );
}
