'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from '@/lib/api/client';
import { getCategories, Category } from '@/lib/api/categories';

interface ImportItem {
  title: string;
  description: string;
  categoryId?: string;
  condition: string;
  estimatedValue: number;
  stockQuantity: number;
  sku?: string;
  barcode?: string;
  lowStockThreshold?: number;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  items: { id: string; title: string; stockQuantity: number; sku: string | null }[];
}

const CONDITIONS = [
  { value: 'NEW', label: 'جديد' },
  { value: 'LIKE_NEW', label: 'شبه جديد' },
  { value: 'GOOD', label: 'جيد' },
  { value: 'FAIR', label: 'مقبول' },
  { value: 'POOR', label: 'ضعيف' },
];

export default function BulkImportPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [items, setItems] = useState<ImportItem[]>([]);
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories({ includeChildren: true });
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Example CSV format
  const exampleCsv = `العنوان,الوصف,الفئة,الحالة,السعر,الكمية,SKU,الباركود,حد التنبيه
هاتف سامسونج جالاكسي,هاتف ذكي بحالة ممتازة,electronics,LIKE_NEW,5000,10,SAM-001,123456789,3
لابتوب ديل,لابتوب للأعمال,electronics,GOOD,15000,5,DELL-001,987654321,2
كرسي مكتب,كرسي مريح للعمل,furniture,NEW,2000,20,CHR-001,,5`;

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCsv(text);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const parseCsv = (text: string) => {
    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setError('الملف يجب أن يحتوي على عنوان وصف واحد على الأقل');
        return;
      }

      // Skip header row
      const dataLines = lines.slice(1);
      const parsedItems: ImportItem[] = [];

      for (const line of dataLines) {
        const cols = line.split(',').map(col => col.trim());
        if (cols.length < 6) continue;

        parsedItems.push({
          title: cols[0],
          description: cols[1],
          categoryId: cols[2] || undefined,
          condition: cols[3] || 'GOOD',
          estimatedValue: parseFloat(cols[4]) || 0,
          stockQuantity: parseInt(cols[5]) || 0,
          sku: cols[6] || undefined,
          barcode: cols[7] || undefined,
          lowStockThreshold: cols[8] ? parseInt(cols[8]) : undefined,
        });
      }

      setItems(parsedItems);
      setError('');
    } catch (err) {
      setError('خطأ في تحليل الملف');
    }
  };

  const handleImport = async () => {
    if (items.length === 0) {
      setError('لا توجد بيانات للاستيراد');
      return;
    }

    // Validate items
    const invalidItems = items.filter(item => !item.title || item.title.length < 3);
    if (invalidItems.length > 0) {
      setError(`يوجد ${invalidItems.length} منتج بدون عنوان صحيح (3 حروف على الأقل)`);
      return;
    }

    try {
      setIsImporting(true);
      setError('');

      const response = await apiClient.post('/inventory/bulk-import', { items });
      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في استيراد البيانات');
    } finally {
      setIsImporting(false);
    }
  };

  const addManualItem = () => {
    setItems([
      ...items,
      {
        title: '',
        description: '',
        condition: 'GOOD',
        estimatedValue: 0,
        stockQuantity: 1,
      },
    ]);
  };

  const duplicateItem = (index: number) => {
    const itemToDuplicate = items[index];
    const newItem = { ...itemToDuplicate, title: itemToDuplicate.title + ' (نسخة)' };
    const newItems = [...items];
    newItems.splice(index + 1, 0, newItem);
    setItems(newItems);
  };

  const updateItem = (index: number, field: keyof ImportItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setItems([]);
    setCsvText('');
    setError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/inventory" className="text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold mb-2">إضافة منتجات متعددة</h1>
                <p className="text-purple-100">أضف عدة منتجات دفعة واحدة بسهولة</p>
              </div>
            </div>
            {items.length > 0 && (
              <div className="bg-white/20 rounded-xl px-4 py-2">
                <span className="text-2xl font-bold">{items.length}</span>
                <span className="text-purple-100 mr-2">منتج</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Result */}
        {result && (
          <div className={`mb-6 p-6 rounded-2xl ${result.failed > 0 ? 'bg-yellow-50' : 'bg-green-50'}`}>
            <h3 className="font-bold text-lg mb-4">
              {result.failed === 0 ? '✅ تم الاستيراد بنجاح' : '⚠️ تم الاستيراد مع بعض الأخطاء'}
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-3xl font-bold text-green-600">{result.success}</div>
                <div className="text-gray-600">تم استيرادها</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-3xl font-bold text-red-600">{result.failed}</div>
                <div className="text-gray-600">فشل استيرادها</div>
              </div>
            </div>
            {result.errors.length > 0 && (
              <div className="bg-white rounded-xl p-4">
                <h4 className="font-medium text-red-600 mb-2">الأخطاء:</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4 flex gap-3">
              <Link
                href="/inventory"
                className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition"
              >
                عرض المخزون
              </Link>
              <button
                onClick={() => {
                  setResult(null);
                  setItems([]);
                  setCsvText('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition"
              >
                استيراد جديد
              </button>
            </div>
          </div>
        )}

        {!result && (
          <>
            {/* Tab Selector */}
            <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'manual'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">✍️</span>
                إدخال يدوي
              </button>
              <button
                onClick={() => setActiveTab('csv')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'csv'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">📁</span>
                رفع ملف CSV
              </button>
            </div>

            {/* CSV Tab */}
            {activeTab === 'csv' && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">📁 رفع ملف CSV</h2>
                <p className="text-gray-600 text-sm mb-4">
                  قم برفع ملف CSV يحتوي على بيانات المنتجات
                </p>

                <label className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                  <div className="text-5xl mb-3">📄</div>
                  <div className="font-medium text-gray-700 text-lg">اضغط لرفع ملف CSV</div>
                  <div className="text-sm text-gray-500">أو اسحب الملف هنا</div>
                </label>

                {csvText && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                    ✅ تم تحميل الملف - {items.length} منتج
                  </div>
                )}

                {/* CSV Format Example */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-3">📋 صيغة ملف CSV المطلوبة:</h3>
                  <pre className="bg-white p-4 rounded-lg text-sm overflow-x-auto text-left border" dir="ltr">
                    {exampleCsv}
                  </pre>
                  <p className="text-gray-500 text-sm mt-3">
                    الأعمدة: العنوان, الوصف, الفئة, الحالة (NEW/LIKE_NEW/GOOD/FAIR/POOR), السعر, الكمية, SKU, الباركود, حد التنبيه
                  </p>
                </div>
              </div>
            )}

            {/* Manual Entry Tab */}
            {activeTab === 'manual' && (
              <div className="space-y-4">
                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h3 className="font-bold text-blue-900 mb-2">📝 كيفية الاستخدام:</h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>اضغط على "➕ إضافة منتج جديد" لإضافة منتج</li>
                    <li>أدخل بيانات كل منتج (العنوان مطلوب، الباقي اختياري)</li>
                    <li>كرر الخطوات لإضافة جميع المنتجات</li>
                    <li>اضغط "استيراد الكل" لإضافة جميع المنتجات دفعة واحدة</li>
                  </ol>
                </div>

                {/* Add Product Button - Always Visible */}
                <button
                  onClick={addManualItem}
                  className="w-full p-6 bg-white border-2 border-dashed border-purple-300 rounded-2xl hover:border-purple-500 hover:bg-purple-50 transition flex items-center justify-center gap-3 group"
                >
                  <span className="text-4xl group-hover:scale-110 transition-transform">➕</span>
                  <div className="text-right">
                    <div className="font-bold text-purple-700 text-lg">إضافة منتج جديد</div>
                    <div className="text-sm text-gray-500">اضغط هنا لإضافة منتج إلى القائمة</div>
                  </div>
                </button>

                {/* Products List */}
                {items.length > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold text-gray-900">
                        قائمة المنتجات ({items.length})
                      </h2>
                      <button
                        onClick={clearAll}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                      >
                        🗑️ مسح الكل
                      </button>
                    </div>

                    <div className="space-y-4">
                      {items.map((item, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </span>
                              <span className="font-medium text-gray-700">
                                {item.title || 'منتج جديد'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => duplicateItem(index)}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                title="نسخ المنتج"
                              >
                                📋
                              </button>
                              <button
                                onClick={() => removeItem(index)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="حذف المنتج"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Title - Required */}
                            <div className="lg:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                العنوان <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateItem(index, 'title', e.target.value)}
                                placeholder="مثال: هاتف سامسونج جالاكسي S21"
                                className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                                  item.title.length > 0 && item.title.length < 3 ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                }`}
                              />
                              {item.title.length > 0 && item.title.length < 3 && (
                                <p className="text-red-500 text-xs mt-1">العنوان يجب أن يكون 3 حروف على الأقل</p>
                              )}
                            </div>

                            {/* Category */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
                              <select
                                value={item.categoryId || ''}
                                onChange={(e) => updateItem(index, 'categoryId', e.target.value || undefined)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="">-- اختر الفئة --</option>
                                {categories.map(cat => (
                                  <React.Fragment key={cat.id}>
                                    <option value={cat.id}>{cat.nameAr || cat.nameEn}</option>
                                    {cat.children?.map(child => (
                                      <option key={child.id} value={child.id}>
                                        &nbsp;&nbsp;↳ {child.nameAr || child.nameEn}
                                      </option>
                                    ))}
                                  </React.Fragment>
                                ))}
                              </select>
                            </div>

                            {/* Condition */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                              <select
                                value={item.condition}
                                onChange={(e) => updateItem(index, 'condition', e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                {CONDITIONS.map(c => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </select>
                            </div>

                            {/* Description */}
                            <div className="lg:col-span-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                              <textarea
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                placeholder="وصف تفصيلي للمنتج..."
                                rows={2}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                              />
                            </div>

                            {/* Price */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">السعر (جنيه)</label>
                              <input
                                type="number"
                                value={item.estimatedValue || ''}
                                onChange={(e) => updateItem(index, 'estimatedValue', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            {/* Quantity */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                              <input
                                type="number"
                                value={item.stockQuantity || ''}
                                onChange={(e) => updateItem(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                                placeholder="1"
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            {/* SKU */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">رمز المنتج (SKU)</label>
                              <input
                                type="text"
                                value={item.sku || ''}
                                onChange={(e) => updateItem(index, 'sku', e.target.value)}
                                placeholder="مثال: PHONE-001"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            {/* Barcode */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
                              <input
                                type="text"
                                value={item.barcode || ''}
                                onChange={(e) => updateItem(index, 'barcode', e.target.value)}
                                placeholder="مثال: 123456789"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>

                            {/* Low Stock Threshold */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">حد التنبيه</label>
                              <input
                                type="number"
                                value={item.lowStockThreshold || ''}
                                onChange={(e) => updateItem(index, 'lowStockThreshold', parseInt(e.target.value) || undefined)}
                                placeholder="تنبيه عند وصول الكمية لهذا الحد"
                                min="0"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Another Button */}
                    <button
                      onClick={addManualItem}
                      className="w-full p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition flex items-center justify-center gap-2 text-gray-600 hover:text-purple-700"
                    >
                      <span className="text-2xl">➕</span>
                      <span className="font-medium">إضافة منتج آخر</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </div>
            )}

            {/* Import Button - Fixed at Bottom */}
            {items.length > 0 && (
              <div className="sticky bottom-4 mt-6">
                <button
                  onClick={handleImport}
                  disabled={isImporting || items.length === 0}
                  className="w-full py-4 bg-gradient-to-l from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      جاري استيراد {items.length} منتج...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">📥</span>
                      استيراد {items.length} منتج دفعة واحدة
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
