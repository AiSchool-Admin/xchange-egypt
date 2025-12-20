'use client';

import React, { useState, useEffect } from 'react';

interface PsychologicalPrice {
  original: number;
  optimized: number;
  strategy: string;
  confidence: number;
  displayFormats: {
    type: string;
    value: string;
    valueAr: string;
    appeal: number;
  }[];
  urgencyCue?: string;
  culturalNote?: string;
}

interface BuyerPersona {
  type: string;
  description: string;
  descriptionAr: string;
  recommendedApproach: string;
  recommendedApproachAr: string;
}

interface PricingAnalysis {
  recommendations: PsychologicalPrice[];
  optimalPricePoint: number;
  priceElasticity: string;
  buyerPersona: BuyerPersona;
}

interface Props {
  basePrice: number;
  categoryId?: string;
  categoryType?: string;
  onPriceSelect?: (price: number) => void;
  showDetails?: boolean;
}

const STRATEGY_ICONS: Record<string, string> = {
  CHARM_PRICING: '✨',
  ROUND_PRICING: '💎',
  BUNDLE_ANCHOR: '🏷️',
  EGYPTIAN_SWEET_SPOT: '🇪🇬',
  PRESTIGE_PRICING: '👑',
};

const STRATEGY_LABELS: Record<string, { en: string; ar: string }> = {
  CHARM_PRICING: { en: 'Charm Pricing', ar: 'التسعير الجذاب' },
  ROUND_PRICING: { en: 'Premium Pricing', ar: 'التسعير المميز' },
  BUNDLE_ANCHOR: { en: 'Anchor Pricing', ar: 'تسعير التثبيت' },
  EGYPTIAN_SWEET_SPOT: { en: 'Local Optimized', ar: 'محسّن للسوق المحلي' },
  PRESTIGE_PRICING: { en: 'Prestige Pricing', ar: 'التسعير الراقي' },
};

export default function PsychologicalPricing({
  basePrice,
  categoryId,
  categoryType,
  onPriceSelect,
  showDetails = true,
}: Props) {
  const [analysis, setAnalysis] = useState<PricingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showAllFormats, setShowAllFormats] = useState(false);

  useEffect(() => {
    if (basePrice > 0) {
      fetchPricingAnalysis();
    }
  }, [basePrice, categoryId, categoryType]);

  const fetchPricingAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/ai-advanced/pricing/psychological', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: categoryId || 'default',
          condition: 'GOOD',
          basePrice,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing analysis:', error);
      // Generate mock data for demo
      setAnalysis(generateMockAnalysis(basePrice));
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalysis = (price: number): PricingAnalysis => {
    const charmPrice = Math.floor(price / 100) * 100 + 99;
    const roundPrice = Math.round(price / 500) * 500;
    const anchorOriginal = Math.round(price * 1.25 / 100) * 100;
    const egyptianPrice = Math.round(price / 50) * 50 - 1;

    return {
      optimalPricePoint: charmPrice,
      priceElasticity: 'ELASTIC',
      buyerPersona: {
        type: 'VALUE_SEEKER',
        description: 'Researches options, wants best value',
        descriptionAr: 'يبحث عن الخيارات، يريد أفضل قيمة',
        recommendedApproach: 'Highlight value and comparisons',
        recommendedApproachAr: 'أبرز القيمة والمقارنات',
      },
      recommendations: [
        {
          original: price,
          optimized: charmPrice,
          strategy: 'CHARM_PRICING',
          confidence: 85,
          displayFormats: [
            { type: 'MONTHLY', value: `${Math.ceil(charmPrice / 12)} EGP/month`, valueAr: `${Math.ceil(charmPrice / 12)} ج.م/شهر`, appeal: 75 },
            { type: 'DAILY', value: `Only ${Math.ceil(charmPrice / 365)} EGP/day`, valueAr: `فقط ${Math.ceil(charmPrice / 365)} ج.م/يوم`, appeal: 70 },
          ],
          urgencyCue: '🔥 سعر خاص لفترة محدودة!',
          culturalNote: 'الأرقام المنتهية بـ 9 أو 99 شائعة ومحببة',
        },
        {
          original: anchorOriginal,
          optimized: charmPrice - 100,
          strategy: 'BUNDLE_ANCHOR',
          confidence: 88,
          displayFormats: [
            { type: 'SAVINGS', value: `Save ${anchorOriginal - charmPrice + 100} EGP`, valueAr: `وفر ${anchorOriginal - charmPrice + 100} ج.م`, appeal: 90 },
            { type: 'PERCENTAGE_OFF', value: '20% OFF', valueAr: 'خصم 20%', appeal: 85 },
          ],
          urgencyCue: '⚡ خصم 20% لفترة محدودة!',
        },
        {
          original: price,
          optimized: egyptianPrice,
          strategy: 'EGYPTIAN_SWEET_SPOT',
          confidence: 90,
          displayFormats: [
            { type: 'MONTHLY', value: `${Math.ceil(egyptianPrice / 12)} EGP/month`, valueAr: `${Math.ceil(egyptianPrice / 12)} ج.م/شهر`, appeal: 75 },
          ],
          culturalNote: 'محسّن خصيصاً للسوق المصري',
        },
      ],
    };
  };

  const handleSelectPrice = (index: number, price: number) => {
    setSelectedIndex(index);
    onPriceSelect?.(price);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-200 rounded-full" />
          <div className="h-6 bg-purple-200 rounded w-48" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xl">🧠</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">التسعير النفسي الذكي</h3>
            <p className="text-sm text-gray-500">اقتراحات أسعار محسّنة لزيادة المبيعات</p>
          </div>
        </div>
        <div className="text-left">
          <div className="text-xs text-gray-500">السعر الأمثل</div>
          <div className="text-xl font-bold text-purple-600">
            {analysis.optimalPricePoint.toLocaleString('ar-EG')} ج.م
          </div>
        </div>
      </div>

      {/* Price Recommendations */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {analysis.recommendations.map((rec, index) => (
          <button
            key={index}
            onClick={() => handleSelectPrice(index, rec.optimized)}
            className={`relative p-4 rounded-xl text-right transition-all ${
              selectedIndex === index
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300'
            }`}
          >
            {/* Strategy Badge */}
            <div className={`absolute top-3 left-3 text-lg`}>
              {STRATEGY_ICONS[rec.strategy] || '💡'}
            </div>

            {/* Confidence */}
            <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-full ${
              selectedIndex === index ? 'bg-white/20' : 'bg-purple-100 text-purple-700'
            }`}>
              {rec.confidence}% ثقة
            </div>

            {/* Price */}
            <div className="mt-8 mb-2">
              {rec.strategy === 'BUNDLE_ANCHOR' && (
                <div className={`text-sm line-through ${
                  selectedIndex === index ? 'text-white/60' : 'text-gray-400'
                }`}>
                  {rec.original.toLocaleString('ar-EG')} ج.م
                </div>
              )}
              <div className="text-2xl font-bold">
                {rec.optimized.toLocaleString('ar-EG')} ج.م
              </div>
            </div>

            {/* Strategy Name */}
            <div className={`text-sm font-medium ${
              selectedIndex === index ? 'text-white/80' : 'text-gray-600'
            }`}>
              {STRATEGY_LABELS[rec.strategy]?.ar || rec.strategy}
            </div>

            {/* Urgency Cue */}
            {rec.urgencyCue && (
              <div className={`mt-2 text-xs ${
                selectedIndex === index ? 'text-white/90' : 'text-orange-600'
              }`}>
                {rec.urgencyCue}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Buyer Persona */}
      {showDetails && analysis.buyerPersona && (
        <div className="bg-white rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👤</span>
            <span className="font-medium text-gray-900">شخصية المشتري المتوقعة</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{analysis.buyerPersona.descriptionAr}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-purple-600">💡</span>
            <span className="text-gray-700">{analysis.buyerPersona.recommendedApproachAr}</span>
          </div>
        </div>
      )}

      {/* Display Formats */}
      {showDetails && selectedIndex !== null && (
        <div className="bg-white rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-900">طرق عرض السعر</span>
            <button
              onClick={() => setShowAllFormats(!showAllFormats)}
              className="text-xs text-purple-600 hover:underline"
            >
              {showAllFormats ? 'إخفاء' : 'عرض الكل'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {analysis.recommendations[selectedIndex].displayFormats
              .slice(0, showAllFormats ? undefined : 2)
              .map((format, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-700">{format.valueAr}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">جاذبية</span>
                    <span className="text-sm font-medium text-purple-600">{format.appeal}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Cultural Note */}
      {selectedIndex !== null && analysis.recommendations[selectedIndex].culturalNote && (
        <div className="mt-4 flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <span className="text-lg">🇪🇬</span>
          <p className="text-sm text-amber-800">
            {analysis.recommendations[selectedIndex].culturalNote}
          </p>
        </div>
      )}

      {/* Price Elasticity Indicator */}
      {showDetails && (
        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <span className="text-gray-500">مرونة السعر:</span>
          <span className={`px-3 py-1 rounded-full ${
            analysis.priceElasticity === 'ELASTIC'
              ? 'bg-green-100 text-green-700'
              : analysis.priceElasticity === 'INELASTIC'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {analysis.priceElasticity === 'ELASTIC' ? 'مرن - السعر يؤثر على المبيعات' :
             analysis.priceElasticity === 'INELASTIC' ? 'غير مرن - السعر أقل تأثيراً' :
             'متوازن'}
          </span>
        </div>
      )}
    </div>
  );
}
