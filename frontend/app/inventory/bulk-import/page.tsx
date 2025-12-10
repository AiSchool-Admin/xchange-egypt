'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from '@/lib/api/client';

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

export default function BulkImportPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [items, setItems] = useState<ImportItem[]>([]);
  const [csvText, setCsvText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');

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
        stockQuantity: 0,
      },
    ]);
  };

  const updateItem = (index: number, field: keyof ImportItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
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
          <div className="flex items-center gap-4">
            <Link href="/inventory/stock" className="text-white/80 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2">استيراد مجمع للمنتجات</h1>
              <p className="text-purple-100">أضف عدة منتجات دفعة واحدة</p>
            </div>
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
                href="/inventory/stock"
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
            {/* Upload Methods */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* CSV Upload */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">📁 رفع ملف CSV</h2>
                <p className="text-gray-600 text-sm mb-4">
                  قم برفع ملف CSV يحتوي على بيانات المنتجات
                </p>

                <label className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition text-center">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                  />
                  <div className="text-4xl mb-2">📄</div>
                  <div className="font-medium text-gray-700">اضغط لرفع ملف CSV</div>
                  <div className="text-sm text-gray-500">أو اسحب الملف هنا</div>
                </label>

                {csvText && (
                  <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                    تم تحميل الملف - {items.length} منتج
                  </div>
                )}
              </div>

              {/* Manual Entry */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">✍️ إدخال يدوي</h2>
                <p className="text-gray-600 text-sm mb-4">
                  أضف المنتجات واحداً تلو الآخر
                </p>

                <button
                  onClick={addManualItem}
                  className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition"
                >
                  <div className="text-4xl mb-2">➕</div>
                  <div className="font-medium text-gray-700">إضافة منتج</div>
                </button>
              </div>
            </div>

            {/* CSV Format Example */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">📋 صيغة ملف CSV</h2>
              <pre className="bg-gray-50 p-4 rounded-xl text-sm overflow-x-auto text-left" dir="ltr">
                {exampleCsv}
              </pre>
              <p className="text-gray-500 text-sm mt-4">
                الأعمدة: العنوان, الوصف, الفئة, الحالة (NEW/LIKE_NEW/GOOD/FAIR/POOR), السعر, الكمية, SKU, الباركود, حد التنبيه
              </p>
            </div>

            {/* Items List */}
            {items.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900">المنتجات ({items.length})</h2>
                  <button
                    onClick={() => setItems([])}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    مسح الكل
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm text-gray-500">منتج #{index + 1}</span>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItem(index, 'title', e.target.value)}
                          placeholder="العنوان"
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          value={item.estimatedValue || ''}
                          onChange={(e) => updateItem(index, 'estimatedValue', parseFloat(e.target.value))}
                          placeholder="السعر"
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          value={item.stockQuantity || ''}
                          onChange={(e) => updateItem(index, 'stockQuantity', parseInt(e.target.value))}
                          placeholder="الكمية"
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleImport}
                  disabled={isImporting || items.length === 0}
                  className="mt-6 w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري الاستيراد...
                    </>
                  ) : (
                    <>
                      📥 استيراد {items.length} منتج
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
