'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getMaterialPrices,
  getMetalPrices,
  MATERIAL_CATEGORIES,
  MaterialPrice,
} from '@/lib/api/scrap-marketplace';

// Extended material prices with Egyptian market data
const DEFAULT_PRICES: Record<string, Record<string, { price: number; change: number }>> = {
  metal: {
    copper_red: { price: 220, change: 2.5 },
    copper_yellow: { price: 180, change: 1.8 },
    copper_burnt: { price: 160, change: -0.5 },
    aluminum_soft: { price: 85, change: 3.2 },
    aluminum_hard: { price: 75, change: 2.1 },
    aluminum_cans: { price: 45, change: 0.8 },
    iron: { price: 12, change: -1.2 },
    stainless_steel: { price: 45, change: 1.5 },
    lead: { price: 35, change: 0.5 },
    zinc: { price: 55, change: 2.0 },
    brass: { price: 120, change: 1.0 },
  },
  paper: {
    cardboard: { price: 4.5, change: 0.3 },
    white_paper: { price: 6, change: 0.5 },
    newspaper: { price: 3.5, change: -0.2 },
    mixed_paper: { price: 3, change: 0 },
    books: { price: 5, change: 0.2 },
  },
  plastic: {
    pet: { price: 15, change: 1.0 },
    hdpe: { price: 12, change: 0.5 },
    pvc: { price: 8, change: -0.3 },
    ldpe: { price: 10, change: 0.8 },
    pp: { price: 11, change: 0.6 },
    mixed_plastic: { price: 5, change: 0 },
  },
  electronics: {
    computer_parts: { price: 25, change: 2.0 },
    mobile_phones: { price: 35, change: 3.5 },
    cables: { price: 40, change: 1.5 },
    circuit_boards: { price: 80, change: 5.0 },
    batteries: { price: 15, change: 0.5 },
  },
  appliances: {
    washing_machine: { price: 8, change: 0.3 },
    refrigerator: { price: 10, change: 0.5 },
    air_conditioner: { price: 15, change: 1.0 },
    small_appliances: { price: 12, change: 0.2 },
    motors: { price: 20, change: 1.5 },
  },
  textiles: {
    clothes: { price: 8, change: 0.5 },
    fabric_scraps: { price: 6, change: 0.3 },
    carpets: { price: 4, change: 0 },
    shoes: { price: 3, change: -0.1 },
  },
  glass: {
    clear_glass: { price: 1.5, change: 0.1 },
    colored_glass: { price: 1, change: 0 },
    broken_glass: { price: 0.8, change: 0 },
  },
  wood: {
    furniture_wood: { price: 2, change: 0.1 },
    pallets: { price: 3, change: 0.2 },
    mdf: { price: 1.5, change: 0 },
  },
  oil: {
    cooking_oil: { price: 8, change: 0.5 },
    motor_oil: { price: 5, change: 0.3 },
  },
};

export default function MarketPricesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [prices, setPrices] = useState<Record<string, Record<string, { price: number; change: number }>>>(DEFAULT_PRICES);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      setLoading(true);
      // Try to get prices from API
      const [materialPrices, metalPrices] = await Promise.all([
        getMaterialPrices().catch(() => null),
        getMetalPrices().catch(() => null),
      ]);

      // Merge API prices with defaults
      if (materialPrices) {
        // Update prices from API
        const apiPrices = { ...DEFAULT_PRICES };
        materialPrices.forEach((p: MaterialPrice) => {
          if (apiPrices[p.materialCategory] && apiPrices[p.materialCategory][p.materialType]) {
            apiPrices[p.materialCategory][p.materialType] = {
              price: p.pricePerKg,
              change: p.priceChange || 0,
            };
          }
        });
        setPrices(apiPrices);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '▲';
    if (change < 0) return '▼';
    return '─';
  };

  const filteredCategories = selectedCategory === 'all'
    ? Object.entries(MATERIAL_CATEGORIES)
    : Object.entries(MATERIAL_CATEGORIES).filter(([key]) => key === selectedCategory);

  const searchFilteredCategories = filteredCategories.map(([catKey, category]) => ({
    key: catKey,
    category,
    types: category.types.filter((t) =>
      t.nameAr.includes(searchTerm) || t.type.includes(searchTerm.toLowerCase())
    ),
  })).filter((c) => c.types.length > 0);

  // Calculate top gainers and losers
  const allMaterials = Object.entries(prices).flatMap(([catKey, catPrices]) =>
    Object.entries(catPrices).map(([type, data]) => ({
      category: catKey,
      type,
      ...data,
      nameAr: MATERIAL_CATEGORIES[catKey as keyof typeof MATERIAL_CATEGORIES]?.types.find((t) => t.type === type)?.nameAr || type,
    }))
  );

  const topGainers = [...allMaterials].sort((a, b) => b.change - a.change).slice(0, 5);
  const topLosers = [...allMaterials].sort((a, b) => a.change - b.change).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-600 to-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/scrap" className="text-white/80 hover:text-white mb-4 inline-block">
            &rarr; العودة لسوق التوالف
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">📊</span>
                <h1 className="text-4xl font-bold">أسعار السوق اليومية</h1>
              </div>
              <p className="text-xl opacity-90">
                أحدث أسعار المواد القابلة لإعادة التدوير في السوق المصري
              </p>
            </div>
            <div className="bg-white/20 rounded-xl px-6 py-4 text-center">
              <div className="text-sm opacity-80">آخر تحديث</div>
              <div className="text-lg font-bold">
                {lastUpdated.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm opacity-80">
                {lastUpdated.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Market Summary */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
              <div className="text-3xl">📈</div>
              <div>
                <div className="text-sm text-gray-500">أعلى ارتفاع</div>
                <div className="font-bold text-green-600">
                  {topGainers[0]?.nameAr} (+{topGainers[0]?.change.toFixed(1)}%)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
              <div className="text-3xl">📉</div>
              <div>
                <div className="text-sm text-gray-500">أكبر انخفاض</div>
                <div className="font-bold text-red-600">
                  {topLosers[0]?.nameAr} ({topLosers[0]?.change.toFixed(1)}%)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
              <div className="text-3xl">⚙️</div>
              <div>
                <div className="text-sm text-gray-500">أعلى سعر</div>
                <div className="font-bold text-amber-600">
                  نحاس أحمر (220 ج.م/كجم)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
              <div className="text-3xl">🔄</div>
              <div>
                <div className="text-sm text-gray-500">إجمالي المواد</div>
                <div className="font-bold text-blue-600">{allMaterials.length} مادة</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن مادة..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-lg mb-4">الفئات</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-right px-4 py-2 rounded-lg transition ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  🔄 جميع الفئات
                </button>
                {Object.entries(MATERIAL_CATEGORIES).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full text-right px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                      selectedCategory === key
                        ? 'bg-emerald-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.nameAr}</span>
                    <span className="mr-auto text-sm opacity-70">
                      ({cat.types.length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Top Gainers */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-lg mb-4 text-green-600">📈 الأكثر ارتفاعاً</h3>
              <div className="space-y-2">
                {topGainers.map((m, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span>{m.nameAr}</span>
                    <span className="text-green-600 font-medium">+{m.change.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-bold text-lg mb-4 text-red-600">📉 الأكثر انخفاضاً</h3>
              <div className="space-y-2">
                {topLosers.filter((m) => m.change < 0).map((m, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span>{m.nameAr}</span>
                    <span className="text-red-600 font-medium">{m.change.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">احسب قيمة خردتك</h3>
              <p className="text-sm opacity-90 mb-4">
                استخدم حاسبة الأسعار لمعرفة القيمة التقريبية
              </p>
              <Link
                href="/scrap/calculator"
                className="block text-center bg-white text-emerald-600 px-4 py-2 rounded-lg font-bold hover:bg-emerald-50 transition"
              >
                حاسبة الأسعار
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* View Toggle */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {selectedCategory === 'all'
                  ? 'جميع أسعار المواد'
                  : MATERIAL_CATEGORIES[selectedCategory as keyof typeof MATERIAL_CATEGORIES]?.nameAr}
              </h2>
              <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-lg transition ${
                    viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  شبكة
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 rounded-lg transition ${
                    viewMode === 'table' ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  جدول
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">جاري تحميل الأسعار...</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="space-y-8">
                {searchFilteredCategories.map(({ key: catKey, category, types }) => (
                  <div key={catKey} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-l from-gray-100 to-gray-50 px-6 py-4 border-b">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{category.icon}</span>
                        <h3 className="text-xl font-bold">{category.nameAr}</h3>
                        <span className="text-sm text-gray-500 mr-auto">
                          {types.length} نوع
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {types.map((material) => {
                        const priceData = prices[catKey]?.[material.type] || { price: 0, change: 0 };
                        return (
                          <div
                            key={material.type}
                            className="border rounded-xl p-4 hover:shadow-md transition"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{material.nameAr}</h4>
                              <span
                                className={`text-sm font-medium ${getChangeColor(priceData.change)}`}
                              >
                                {getChangeIcon(priceData.change)} {Math.abs(priceData.change).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-end gap-2">
                              <span className="text-2xl font-bold text-emerald-600">
                                {priceData.price}
                              </span>
                              <span className="text-sm text-gray-500 mb-1">ج.م/كجم</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-right px-6 py-4 font-bold">المادة</th>
                      <th className="text-right px-6 py-4 font-bold">الفئة</th>
                      <th className="text-right px-6 py-4 font-bold">السعر (ج.م/كجم)</th>
                      <th className="text-right px-6 py-4 font-bold">التغيير</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {searchFilteredCategories.flatMap(({ key: catKey, category, types }) =>
                      types.map((material) => {
                        const priceData = prices[catKey]?.[material.type] || { price: 0, change: 0 };
                        return (
                          <tr key={`${catKey}-${material.type}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span>{category.icon}</span>
                                <span className="font-medium">{material.nameAr}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{category.nameAr}</td>
                            <td className="px-6 py-4">
                              <span className="font-bold text-emerald-600">{priceData.price}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-medium ${getChangeColor(priceData.change)}`}>
                                {getChangeIcon(priceData.change)} {Math.abs(priceData.change).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h4 className="font-bold text-amber-800 mb-1">تنويه هام</h4>
                  <p className="text-sm text-amber-700">
                    الأسعار المعروضة هي أسعار استرشادية وقد تختلف حسب الكمية والجودة والموقع الجغرافي.
                    للحصول على أدق سعر، يرجى التواصل مع التجار مباشرة أو استخدام خدمة الجمع من الباب.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
