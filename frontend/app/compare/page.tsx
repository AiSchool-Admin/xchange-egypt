'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getItem, Item } from '@/lib/api/items';
import { createComparison, Comparison, ComparisonField } from '@/lib/api/comparison';
import { useAuth } from '@/lib/contexts/AuthContext';

// ============================================
// Comparison Page
// صفحة مقارنة المنتجات
// ============================================

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Get item IDs from URL
  const itemIdsParam = searchParams.get('items');
  const itemIds = itemIdsParam ? itemIdsParam.split(',') : [];

  // State
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Load items on mount
  useEffect(() => {
    if (itemIds.length >= 2) {
      loadItems();
    } else {
      setLoading(false);
    }
  }, [itemIdsParam]);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');

      const itemPromises = itemIds.map((id) => getItem(id));
      const responses = await Promise.all(itemPromises);
      const loadedItems = responses.map((res) => res.data);

      setItems(loadedItems);

      // Generate comparison fields
      const fields = generateComparisonFields(loadedItems);
      setComparison({
        id: '',
        title: null,
        items: loadedItems,
        comparisonFields: fields,
        shareCode: null,
        createdAt: new Date().toISOString(),
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const generateComparisonFields = (items: Item[]): ComparisonField[] => {
    const fields: ComparisonField[] = [];

    // Price
    fields.push({
      field: 'estimatedValue',
      labelAr: 'السعر',
      labelEn: 'Price',
      values: items.map((item) => item.estimatedValue || 0),
    });

    // Condition
    fields.push({
      field: 'condition',
      labelAr: 'الحالة',
      labelEn: 'Condition',
      values: items.map((item) => translateCondition(item.condition)),
    });

    // Location
    fields.push({
      field: 'governorate',
      labelAr: 'المحافظة',
      labelEn: 'Governorate',
      values: items.map((item) => item.governorate || '-'),
    });

    // Category
    fields.push({
      field: 'category',
      labelAr: 'الفئة',
      labelEn: 'Category',
      values: items.map((item) => item.category?.nameAr || '-'),
    });

    // Seller Rating
    fields.push({
      field: 'sellerRating',
      labelAr: 'تقييم البائع',
      labelEn: 'Seller Rating',
      values: items.map((item) => item.seller ? '⭐'.repeat(Math.round(4)) : '-'),
    });

    return fields;
  };

  const translateCondition = (condition: string): string => {
    const map: Record<string, string> = {
      NEW: 'جديد',
      LIKE_NEW: 'شبه جديد',
      GOOD: 'جيد',
      FAIR: 'مقبول',
      POOR: 'مستعمل',
      FOR_PARTS: 'للقطع',
      DAMAGED: 'تالف',
      SCRAP: 'سكراب',
    };
    return map[condition] || condition;
  };

  const handleSaveComparison = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/compare?items=' + itemIds.join(','));
      return;
    }

    try {
      setSaving(true);
      const response = await createComparison({
        itemIds,
        isPublic: true,
      });

      if (response.data.shareCode) {
        const url = `${window.location.origin}/compare/shared/${response.data.shareCode}`;
        setShareUrl(url);
      }

      setComparison({
        ...comparison!,
        id: response.data.id,
        shareCode: response.data.shareCode,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في حفظ المقارنة');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    // Could add a toast notification here
  };

  const handleRemoveItem = (itemId: string) => {
    const newItemIds = itemIds.filter((id) => id !== itemId);
    if (newItemIds.length >= 2) {
      router.push(`/compare?items=${newItemIds.join(',')}`);
    } else {
      router.push('/items');
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Find best value (lowest price)
  const lowestPrice = items.length > 0
    ? Math.min(...items.map((item) => item.estimatedValue || Infinity))
    : 0;

  if (itemIds.length < 2) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">مقارنة المنتجات</h1>
          <p className="text-gray-600 mb-6">
            اختر منتجين على الأقل للمقارنة بينهما
          </p>
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

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">📊 مقارنة المنتجات</h1>
              <p className="text-primary-100 mt-1">
                مقارنة {items.length} منتجات
              </p>
            </div>
            <div className="flex gap-3">
              {!shareUrl ? (
                <button
                  onClick={handleSaveComparison}
                  disabled={saving}
                  className="px-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? '⏳ جاري الحفظ...' : '💾 حفظ ومشاركة'}
                </button>
              ) : (
                <button
                  onClick={handleCopyShareUrl}
                  className="px-6 py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition flex items-center gap-2"
                >
                  📋 نسخ رابط المشاركة
                </button>
              )}
              <Link
                href="/items"
                className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition"
              >
                + إضافة منتج
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المنتجات...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={loadItems}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition"
            >
              حاول مرة أخرى
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {/* Items Header Row */}
            <div className="grid" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
              <div className="p-4 bg-gray-50 border-b border-l border-gray-200 font-bold text-gray-700">
                المنتج
              </div>
              {items.map((item, index) => (
                <div key={item.id} className="p-4 border-b border-gray-200 relative">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-2 left-2 w-6 h-6 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition text-sm"
                    title="إزالة من المقارنة"
                  >
                    ×
                  </button>
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

            {/* Price Row (Highlighted) */}
            <div className="grid" style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}>
              <div className="p-4 bg-primary-50 border-b border-l border-gray-200 font-bold text-primary-700 flex items-center gap-2">
                💰 السعر
              </div>
              {items.map((item) => {
                const price = item.estimatedValue || 0;
                const isBest = price === lowestPrice && items.length > 1;
                return (
                  <div
                    key={item.id}
                    className={`p-4 border-b border-gray-200 text-center ${
                      isBest ? 'bg-green-50' : ''
                    }`}
                  >
                    <span className={`text-xl font-bold ${isBest ? 'text-green-600' : 'text-gray-900'}`}>
                      {formatPrice(price)}
                    </span>
                    {isBest && (
                      <span className="block text-xs text-green-600 mt-1">
                        ✨ أفضل سعر
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comparison Fields */}
            {comparison?.comparisonFields
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
              {items.map((item) => (
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
        )}

        {/* Share URL Display */}
        {shareUrl && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-700 font-medium mb-2">✅ تم حفظ المقارنة! يمكنك مشاركة الرابط:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white border border-green-200 rounded-lg text-sm"
              />
              <button
                onClick={handleCopyShareUrl}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                نسخ
              </button>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-blue-50 rounded-2xl">
          <h3 className="font-bold text-blue-800 mb-3">💡 نصائح للمقارنة</h3>
          <ul className="space-y-2 text-blue-700 text-sm">
            <li>• قارن بين منتجات من نفس الفئة للحصول على نتائج أفضل</li>
            <li>• لا تنظر للسعر فقط - راجع الحالة والموقع أيضاً</li>
            <li>• تحقق من تقييم البائع قبل اتخاذ القرار</li>
            <li>• يمكنك حفظ المقارنة ومشاركتها مع الآخرين</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
