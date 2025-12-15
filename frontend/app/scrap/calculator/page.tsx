'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getMaterialPrices,
  calculateScrapValue,
  MATERIAL_CATEGORIES,
  MaterialPrice,
  CalculatorMaterial,
  CalculatorResult,
} from '@/lib/api/scrap-marketplace';

export default function ScrapCalculatorPage() {
  const [prices, setPrices] = useState<MaterialPrice[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [materials, setMaterials] = useState<CalculatorMaterial[]>([]);
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    try {
      const data = await getMaterialPrices();
      setPrices(data || []);
    } catch (error) {
      console.error('Error loading prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMaterial = (materialType: string) => {
    if (materials.find((m) => m.materialType === materialType)) return;
    setMaterials([...materials, { materialType, weightKg: 0 }]);
    setResult(null);
  };

  const updateWeight = (materialType: string, weight: number) => {
    setMaterials(
      materials.map((m) =>
        m.materialType === materialType ? { ...m, weightKg: weight } : m
      )
    );
    setResult(null);
  };

  const removeMaterial = (materialType: string) => {
    setMaterials(materials.filter((m) => m.materialType !== materialType));
    setResult(null);
  };

  const handleCalculate = async () => {
    const validMaterials = materials.filter((m) => m.weightKg > 0);
    if (validMaterials.length === 0) return;

    try {
      setCalculating(true);
      const data = await calculateScrapValue(validMaterials);
      setResult(data);
    } catch (error) {
      console.error('Error calculating:', error);
    } finally {
      setCalculating(false);
    }
  };

  const getMaterialName = (materialType: string): string => {
    for (const category of Object.values(MATERIAL_CATEGORIES)) {
      const found = category.types.find((t) => t.type === materialType);
      if (found) return found.nameAr;
    }
    return materialType;
  };

  const getMaterialPrice = (materialType: string): number => {
    const price = prices.find((p) => p.materialType === materialType);
    return price?.pricePerKg || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-green-600 to-emerald-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/scrap" className="text-white/80 hover:text-white mb-4 inline-block">
            &rarr; العودة لسوق التوالف
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-5xl">🧮</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">حاسبة أسعار الخردة</h1>
              <p className="text-xl opacity-90">
                احسب قيمة الخردة لديك بأسعار السوق المصري الحالية
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Material Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">اختر نوع المادة</h2>
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(MATERIAL_CATEGORIES).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(selectedCategory === key ? '' : key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                      selectedCategory === key
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.nameAr}</span>
                  </button>
                ))}
              </div>

              {/* Material Types */}
              {selectedCategory && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {MATERIAL_CATEGORIES[selectedCategory as keyof typeof MATERIAL_CATEGORIES].types.map(
                    (material) => {
                      const isAdded = materials.some((m) => m.materialType === material.type);
                      const price = getMaterialPrice(material.type);
                      return (
                        <button
                          key={material.type}
                          onClick={() => !isAdded && addMaterial(material.type)}
                          disabled={isAdded}
                          className={`p-3 rounded-lg border-2 text-right transition ${
                            isAdded
                              ? 'border-green-500 bg-green-50 cursor-default'
                              : 'border-gray-200 hover:border-green-400'
                          }`}
                        >
                          <div className="font-medium text-sm">{material.nameAr}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {price > 0 ? `${price} ج.م/كجم` : 'سعر غير متاح'}
                          </div>
                          {isAdded && (
                            <div className="text-green-600 text-xs mt-1">✓ تمت الإضافة</div>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* Selected Materials */}
            {materials.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">المواد المختارة</h2>
                <div className="space-y-4">
                  {materials.map((material) => (
                    <div
                      key={material.materialType}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{getMaterialName(material.materialType)}</div>
                        <div className="text-sm text-gray-500">
                          {getMaterialPrice(material.materialType)} ج.م/كجم
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={material.weightKg || ''}
                          onChange={(e) =>
                            updateWeight(material.materialType, parseFloat(e.target.value) || 0)
                          }
                          placeholder="الوزن"
                          className="w-24 border rounded-lg px-3 py-2 text-center"
                          min="0"
                          step="0.1"
                        />
                        <span className="text-gray-500">كجم</span>
                      </div>
                      <button
                        onClick={() => removeMaterial(material.materialType)}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={calculating || !materials.some((m) => m.weightKg > 0)}
                  className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {calculating ? 'جاري الحساب...' : 'احسب القيمة'}
                </button>
              </div>
            )}
          </div>

          {/* Results Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Calculation Result */}
            {result && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  نتيجة الحساب
                </h2>

                <div className="space-y-3 mb-6">
                  {result.materials.map((m) => (
                    <div
                      key={m.materialType}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-sm">{m.materialNameAr}</div>
                        <div className="text-xs text-gray-500">
                          {m.weightKg} كجم × {m.pricePerKg} ج.م
                        </div>
                      </div>
                      <div className="font-bold text-green-600">
                        {m.subtotal.toLocaleString()} ج.م
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">الإجمالي</span>
                    <span className="text-2xl font-bold text-green-600">
                      {result.totalValue.toLocaleString()} ج.م
                    </span>
                  </div>

                  {result.estimatedCO2Saved > 0 && (
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <span className="text-2xl">🌍</span>
                        <div>
                          <div className="font-medium">الأثر البيئي</div>
                          <div className="text-sm">
                            توفير {result.estimatedCO2Saved.toFixed(1)} كجم CO₂
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    href="/scrap/collection"
                    className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-bold hover:bg-green-700 transition"
                  >
                    اطلب جمع من باب البيت
                  </Link>
                  <Link
                    href="/scrap/dealers"
                    className="block w-full border-2 border-green-600 text-green-600 text-center py-3 rounded-lg font-bold hover:bg-green-50 transition"
                  >
                    تواصل مع تاجر
                  </Link>
                </div>
              </div>
            )}

            {/* Current Prices */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                أسعار اليوم
              </h3>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {prices.slice(0, 15).map((price) => (
                    <div
                      key={price.materialType}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm"
                    >
                      <span>{price.materialNameAr}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-600">
                          {price.pricePerKg} ج.م
                        </span>
                        {price.priceChangeType === 'up' && (
                          <span className="text-green-500 text-xs">↑</span>
                        )}
                        {price.priceChangeType === 'down' && (
                          <span className="text-red-500 text-xs">↓</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/scrap/prices"
                className="block text-center text-green-600 text-sm mt-4 hover:underline"
              >
                عرض جميع الأسعار
              </Link>
            </div>

            {/* Tips */}
            <div className="bg-amber-50 rounded-xl p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-amber-700">
                <span className="text-2xl">💡</span>
                نصائح لأفضل سعر
              </h3>
              <ul className="space-y-2 text-sm text-amber-800">
                <li>• افصل المواد المختلفة عن بعضها</li>
                <li>• نظف المعادن من الشوائب</li>
                <li>• اجمع كمية أكبر للحصول على سعر أفضل</li>
                <li>• تواصل مع أكثر من تاجر للمقارنة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
