'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface GoldPrice {
  karat: string;
  buyPrice: number;
  sellPrice: number;
  updatedAt: string;
}

interface PriceRange {
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  marketSellPrice: number;
  newGoldPrice: number;
}

const KARAT_INFO = {
  K18: { label: 'عيار 18', purity: 75, color: '#DAA520' },
  K21: { label: 'عيار 21', purity: 87.5, color: '#FFD700' },
  K24: { label: 'عيار 24', purity: 99.9, color: '#FFF8DC' },
};

export default function GoldCalculatorPage() {
  const [prices, setPrices] = useState<GoldPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKarat, setSelectedKarat] = useState<string>('K21');
  const [weight, setWeight] = useState<string>('5');
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [calculatedPrice, setCalculatedPrice] = useState<any>(null);

  // Fetch gold prices
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await apiClient.get('/gold/prices');
        setPrices(res.data.data);
      } catch (err) {
        console.error('Error fetching prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Fetch price range when karat changes
  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const res = await apiClient.get(`/gold/price-range/${selectedKarat}`);
        setPriceRange(res.data.data);
      } catch (err) {
        console.error('Error fetching price range:', err);
      }
    };

    if (selectedKarat) {
      fetchPriceRange();
    }
  }, [selectedKarat]);

  // Calculate price when weight or karat changes
  useEffect(() => {
    const calculate = async () => {
      if (!weight || parseFloat(weight) <= 0) {
        setCalculatedPrice(null);
        return;
      }

      try {
        // Get market price for seller calculation
        const currentPrice = prices.find(p => p.karat === selectedKarat);
        if (!currentPrice) return;

        const res = await apiClient.post('/gold/calculate', {
          weightGrams: parseFloat(weight),
          karat: selectedKarat,
          sellerPricePerGram: currentPrice.sellPrice * 0.92, // Assume 8% below market
        });
        setCalculatedPrice(res.data.data);
      } catch (err) {
        console.error('Error calculating:', err);
      }
    };

    calculate();
  }, [weight, selectedKarat, prices]);

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

  const currentPrice = prices.find(p => p.karat === selectedKarat);
  const weightNum = parseFloat(weight) || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">جارٍ تحميل الأسعار...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/gold" className="text-yellow-600 hover:underline text-sm mb-2 inline-block">
            ← العودة لسوق الذهب
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">حاسبة أسعار الذهب</h1>
          <p className="text-gray-600 mt-2">
            احسب قيمة ذهبك الحقيقية وقارن الأسعار
          </p>
        </div>

        {/* Current Gold Prices */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            أسعار الذهب اليوم
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {prices.map((price) => {
              const info = KARAT_INFO[price.karat as keyof typeof KARAT_INFO];
              return (
                <div
                  key={price.karat}
                  className={`rounded-xl p-4 border-2 transition-all cursor-pointer ${
                    selectedKarat === price.karat
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                  onClick={() => setSelectedKarat(price.karat)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-lg">{info?.label || price.karat}</span>
                    <span
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: info?.color }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">سعر الشراء</span>
                      <span className="font-medium text-green-600">{formatPrice(price.buyPrice)} ج.م</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">سعر البيع</span>
                      <span className="font-medium text-red-600">{formatPrice(price.sellPrice)} ج.م</span>
                    </div>
                  </div>
                  {info && (
                    <div className="mt-3 text-xs text-gray-400">
                      نقاء {info.purity}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {prices.length > 0 && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              آخر تحديث: {formatDate(prices[0].updatedAt)}
            </p>
          )}
        </div>

        {/* Calculator */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚖️</span>
              احسب قيمة ذهبك
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
                  className="w-full px-4 py-4 text-2xl font-bold text-center border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="0"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                  جرام
                </span>
              </div>
            </div>

            {/* Quick Weight Buttons */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {[1, 5, 10, 21, 50].map((w) => (
                <button
                  key={w}
                  onClick={() => setWeight(w.toString())}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    weight === w.toString()
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                  }`}
                >
                  {w}g
                </button>
              ))}
            </div>

            {/* Karat Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العيار
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(KARAT_INFO).map(([karat, info]) => (
                  <button
                    key={karat}
                    onClick={() => setSelectedKarat(karat)}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      selectedKarat === karat
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-yellow-100'
                    }`}
                  >
                    {info.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Value Display */}
            {currentPrice && weightNum > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <div className="text-center">
                  <div className="text-sm text-yellow-700 mb-1">القيمة التقريبية</div>
                  <div className="text-4xl font-bold text-yellow-800 mb-2">
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
                          {formatPrice(priceRange.avgPrice * weightNum)} ج.م
                        </div>
                      </div>
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        الأفضل
                      </div>
                    </div>
                    <div className="text-xs text-green-600 mt-2">
                      متوسط السعر: {formatPrice(priceRange.avgPrice)} ج.م/جرام
                    </div>
                  </div>

                  {/* New Gold Shop Price */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-600">في محل المجوهرات (جديد)</div>
                        <div className="text-2xl font-bold text-gray-700">
                          {formatPrice(priceRange.newGoldPrice * weightNum)} ج.م
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      سعر الذهب الجديد: {formatPrice(priceRange.newGoldPrice)} ج.م/جرام
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-yellow-50 rounded-xl p-4 text-center">
                    <div className="text-sm text-yellow-700">توفيرك المحتمل</div>
                    <div className="text-3xl font-bold text-yellow-800">
                      {formatPrice((priceRange.newGoldPrice - priceRange.avgPrice) * weightNum)} ج.م
                    </div>
                    <div className="text-sm text-yellow-600">
                      ({(((priceRange.newGoldPrice - priceRange.avgPrice) / priceRange.newGoldPrice) * 100).toFixed(1)}% أقل من المحلات)
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
                    <span className="font-medium">0.7%</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                    <span className="text-gray-600">عمولة البائع</span>
                    <span className="font-medium">0.7%</span>
                  </div>
                  <div className="flex justify-between text-sm py-2 font-bold">
                    <span>إجمالي العمولات</span>
                    <span className="text-yellow-700">1.4%</span>
                  </div>
                </div>

                <div className="mt-4 bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                  <strong>مثال:</strong> لقطعة بـ {formatPrice(calculatedPrice.askingPrice)} ج.م
                  <br />
                  • المشتري يدفع: {formatPrice(calculatedPrice.buyerPays)} ج.م
                  <br />
                  • البائع يحصل على: {formatPrice(calculatedPrice.sellerReceives)} ج.م
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-2">جاهز للتداول؟</h3>
              <p className="text-yellow-100 mb-4">
                اشترِ أو بِع ذهبك بأفضل الأسعار وأقل العمولات
              </p>
              <div className="flex gap-3">
                <Link
                  href="/gold"
                  className="flex-1 bg-white text-yellow-600 py-3 rounded-xl font-bold hover:bg-yellow-50 transition-colors"
                >
                  🛒 تصفح الذهب
                </Link>
                <Link
                  href="/gold/sell"
                  className="flex-1 bg-yellow-600 text-white py-3 rounded-xl font-bold hover:bg-yellow-700 transition-colors"
                >
                  💰 بيع ذهبك
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            دليل عيارات الذهب
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(KARAT_INFO).map(([karat, info]) => {
              const price = prices.find(p => p.karat === karat);
              return (
                <div key={karat} className="text-center p-6 bg-gray-50 rounded-xl">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold"
                    style={{ backgroundColor: info.color }}
                  >
                    {karat.replace('K', '')}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{info.label}</h3>
                  <div className="text-sm text-gray-600 mb-3">
                    نقاء {info.purity}% ذهب خالص
                  </div>
                  {price && (
                    <div className="text-lg font-bold text-yellow-700">
                      {formatPrice(price.sellPrice)} ج.م/جرام
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-3">
                    {karat === 'K18' && 'الأنسب للمجوهرات اليومية - قوي ومتين'}
                    {karat === 'K21' && 'الأكثر شيوعاً في مصر - توازن مثالي'}
                    {karat === 'K24' && 'ذهب خالص - مثالي للاستثمار والسبائك'}
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
                q: 'كيف يتم تحديد سعر الذهب؟',
                a: 'يتم تحديث أسعار الذهب يومياً بناءً على السعر العالمي للأونصة وسعر صرف الدولار. نوفر أسعار الشراء والبيع لكل عيار.',
              },
              {
                q: 'ما الفرق بين سعر الشراء وسعر البيع؟',
                a: 'سعر الشراء هو ما تدفعه عند شراء الذهب، وسعر البيع هو ما تحصل عليه عند بيعه. الفرق يسمى "السبريد" وهو هامش ربح التاجر.',
              },
              {
                q: 'لماذا أسعار XChange أقل من المحلات؟',
                a: 'لأننا نربط البائعين والمشترين مباشرة بدون وسطاء. الذهب المستعمل لا يتحمل تكلفة التصنيع الجديد، وعمولتنا 1.4% فقط.',
              },
              {
                q: 'هل الأسعار المعروضة شاملة المصنعية؟',
                a: 'الأسعار المعروضة هي لقيمة الذهب الخام. المصنعية تختلف حسب القطعة ويحددها البائع.',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 group"
              >
                <summary className="font-bold text-gray-800 cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <span className="text-yellow-500 group-open:rotate-180 transition-transform">▼</span>
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
