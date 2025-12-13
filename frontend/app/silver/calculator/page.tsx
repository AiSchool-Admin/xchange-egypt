'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface SilverPrice {
  purity: string;
  buyPrice: number;
  sellPrice: number;
  updatedAt: string;
}

interface PriceRange {
  marketPrice: number;
  minSuggested: number;
  maxSuggested: number;
}

const PURITY_INFO = {
  S999: { label: 'فضة نقية 999', purity: 99.9, color: '#E8E8E8' },
  S925: { label: 'فضة إسترليني 925', purity: 92.5, color: '#C0C0C0' },
  S900: { label: 'فضة 900', purity: 90, color: '#A8A8A8' },
  S800: { label: 'فضة 800', purity: 80, color: '#909090' },
};

export default function SilverCalculatorPage() {
  const [prices, setPrices] = useState<Record<string, SilverPrice>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPurity, setSelectedPurity] = useState<string>('S925');
  const [weight, setWeight] = useState<string>('10');
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<any>(null);

  // Fetch silver prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await apiClient.get('/silver/prices');
        setPrices(res.data.data);
      } catch (err) {
        console.error('Error fetching prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Fetch price range when purity changes
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const res = await apiClient.get(`/silver/price-range/${selectedPurity}`);
        setPriceRange(res.data.data);
      } catch (err) {
        console.error('Error fetching price range:', err);
      }
    };

    if (selectedPurity) {
      fetchPriceRange();
    }
  }, [selectedPurity]);

  // Calculate price when weight or purity changes
  useEffect(() => {
    const calculate = async () => {
      if (!weight || parseFloat(weight) <= 0) {
        setCalculatedPrice(null);
        return;
      }

      try {
        const currentPrice = prices[selectedPurity];
        if (!currentPrice) return;

        const res = await apiClient.post('/silver/calculate', {
          weightGrams: parseFloat(weight),
          purity: selectedPurity,
          sellerPricePerGram: currentPrice.sellPrice * 0.95,
        });
        setCalculatedPrice(res.data.data);
      } catch (err) {
        console.error('Error calculating:', err);
      }
    };

    calculate();
  }, [weight, selectedPurity, prices]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentPrice = prices[selectedPurity];
  const weightNum = parseFloat(weight) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-slate-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">جارٍ تحميل الأسعار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/silver" className="text-slate-600 hover:underline text-sm mb-2 inline-block">
            ← العودة لسوق الفضة
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">حاسبة أسعار الفضة</h1>
          <p className="text-gray-600 mt-2">
            احسب قيمة فضتك الحقيقية وقارن الأسعار
          </p>
        </div>

        {/* Current Silver Prices */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            أسعار الفضة اليوم
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(PURITY_INFO).map(([purity, info]) => {
              const price = prices[purity];
              return (
                <div
                  key={purity}
                  className={`rounded-xl p-4 border-2 transition-all cursor-pointer ${
                    selectedPurity === purity
                      ? 'border-slate-500 bg-slate-50'
                      : 'border-gray-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedPurity(purity)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm">{info.label}</span>
                    <span
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: info.color }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">شراء</span>
                      <span className="font-medium text-green-600">{price ? formatPrice(price.buyPrice) : '---'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">بيع</span>
                      <span className="font-medium text-red-600">{price ? formatPrice(price.sellPrice) : '---'}</span>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-400">
                    نقاء {info.purity}%
                  </div>
                </div>
              );
            })}
          </div>

          {Object.values(prices).length > 0 && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              آخر تحديث: {formatDate(Object.values(prices)[0]?.updatedAt || new Date().toISOString())}
            </p>
          )}
        </div>

        {/* Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              احسب قيمة فضتك
            </h2>

            {/* Weight Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوزن بالجرام
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-4 text-2xl font-bold text-center border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  placeholder="0"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  جرام
                </span>
              </div>
            </div>

            {/* Quick Weight Buttons */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {[5, 10, 20, 50, 100].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeight(w.toString())}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    weight === w.toString()
                      ? 'bg-slate-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-slate-100'
                  }`}
                >
                  {w}g
                </button>
              ))}
            </div>

            {/* Purity Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                درجة النقاء
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PURITY_INFO).map(([purity, info]) => (
                  <button
                    key={purity}
                    onClick={() => setSelectedPurity(purity)}
                    className={`py-3 rounded-xl font-bold transition-all text-sm ${
                      selectedPurity === purity
                        ? 'bg-slate-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-slate-100'
                    }`}
                  >
                    {info.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Value Display */}
            {currentPrice && weightNum > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
                <div className="text-center">
                  <div className="text-sm text-slate-700 mb-1">القيمة التقريبية</div>
                  <div className="text-4xl font-bold text-slate-800 mb-2">
                    {formatPrice(currentPrice.sellPrice * weightNum)} ج.م
                  </div>
                  <div className="text-sm text-gray-500">
                    بسعر السوق ({formatPrice(currentPrice.sellPrice)} ج.م/جرام)
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comparison Section */}
          <div className="space-y-6">
            {/* Platform vs Shop Comparison */}
            {priceRange && currentPrice && weightNum > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  مقارنة الأسعار
                </h2>

                <div className="space-y-4">
                  {/* XChange Platform Price */}
                  <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-green-600">على XChange</div>
                        <div className="text-2xl font-bold text-green-700">
                          {formatPrice(priceRange.marketPrice * weightNum * 0.95)} ج.م
                        </div>
                      </div>
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        الأفضل
                      </div>
                    </div>
                    <div className="text-xs text-green-600 mt-2">
                      متوسط السعر: {formatPrice(priceRange.marketPrice * 0.95)} ج.م/جرام
                    </div>
                  </div>

                  {/* New Silver Shop Price */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">في محل المجوهرات (جديد)</div>
                        <div className="text-2xl font-bold text-gray-700">
                          {formatPrice(priceRange.marketPrice * weightNum * 1.45)} ج.م
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      سعر الفضة الجديدة (~45% مصنعية): {formatPrice(priceRange.marketPrice * 1.45)} ج.م/جرام
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-green-100 rounded-xl p-4 text-center">
                    <div className="text-sm text-green-700">توفيرك المحتمل</div>
                    <div className="text-3xl font-bold text-green-800">
                      {formatPrice((priceRange.marketPrice * 1.45 - priceRange.marketPrice * 0.95) * weightNum)} ج.م
                    </div>
                    <div className="text-sm text-green-600">
                      (~35% أقل من المحلات)
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Commission Breakdown */}
            {calculatedPrice && weightNum > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  تفاصيل العمولات
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                    <span className="text-gray-600">عمولة المشتري</span>
                    <span className="font-medium">2%</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                    <span className="text-gray-600">عمولة البائع</span>
                    <span className="font-medium">2%</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 font-bold">
                    <span>إجمالي العمولات</span>
                    <span className="text-slate-700">4%</span>
                  </div>
                </div>

                <div className="mt-4 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <strong>مثال:</strong> لقطعة بـ {formatPrice(calculatedPrice.basePrice)} ج.م
                  <br />
                  • المشتري يدفع: {formatPrice(calculatedPrice.buyerPays)} ج.م
                  <br />
                  • البائع يحصل على: {formatPrice(calculatedPrice.sellerGets)} ج.م
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">جاهز للتداول؟</h3>
              <p className="text-slate-200 mb-4">
                اشترِ أو بِع فضتك بأفضل الأسعار
              </p>
              <div className="flex gap-3">
                <Link
                  href="/silver"
                  className="flex-1 bg-white text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  🛒 تصفح الفضة
                </Link>
                <Link
                  href="/silver/sell"
                  className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  💰 بيع فضتك
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            دليل درجات نقاء الفضة
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(PURITY_INFO).map(([purity, info]) => {
              const price = prices[purity];
              return (
                <div key={purity} className="text-center p-6 bg-gray-50 rounded-xl">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold border-4 border-gray-200"
                    style={{ backgroundColor: info.color }}
                  >
                    {purity.replace('S', '')}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{info.label}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    نقاء {info.purity}% فضة
                  </div>
                  {price && (
                    <div className="text-lg font-bold text-slate-700">
                      {formatPrice(price.sellPrice)} ج.م/جرام
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    {purity === 'S999' && 'فضة نقية - مثالية للاستثمار والسبائك'}
                    {purity === 'S925' && 'الأكثر شيوعاً للمجوهرات - متينة وجميلة'}
                    {purity === 'S900' && 'توازن جيد بين النقاء والمتانة'}
                    {purity === 'S800' && 'أقوى وأمتن - مناسبة للاستخدام اليومي'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            أسئلة شائعة
          </h2>

          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              {
                q: 'ما الفرق بين الفضة الإسترليني والفضة النقية؟',
                a: 'الفضة النقية (999) تحتوي على 99.9% فضة وهي أنقى ولكنها لينة. الفضة الإسترليني (925) تحتوي على 92.5% فضة مع 7.5% نحاس مما يجعلها أكثر متانة للمجوهرات.',
              },
              {
                q: 'لماذا الفضة أرخص بكثير من الذهب؟',
                a: 'الفضة أكثر وفرة في الأرض من الذهب. سعر الفضة حالياً ~55-65 ج.م/جرام مقارنة بـ ~5000+ ج.م/جرام للذهب.',
              },
              {
                q: 'هل يمكن مقايضة الفضة بالذهب؟',
                a: 'نعم! XChange يوفر خاصية Cross-Barter التي تتيح مقايضة الفضة بالذهب والعكس مع حساب تلقائي للفروق.',
              },
              {
                q: 'لماذا عمولة الفضة أعلى من الذهب؟',
                a: 'لأن قيمة معاملات الفضة أقل، فالعمولة 4% (2%+2%) تبقى مبلغاً صغيراً. مثلاً: قطعة بـ 500 ج.م عمولتها 20 ج.م فقط.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 group"
              >
                <summary className="font-bold text-gray-800 cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
