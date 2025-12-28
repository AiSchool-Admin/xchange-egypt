'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface PriceHistory {
  date: string;
  price: number;
}

interface PricePrediction {
  predictedPrice: number;
  confidenceScore: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketAnalysis: {
    trend: 'UP' | 'DOWN' | 'STABLE';
    demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    competitionLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    seasonalFactor: number;
  };
  recommendations: {
    type: string;
    price: number;
    description: string;
    descriptionAr: string;
    expectedDays: number;
  }[];
  dataQuality: string;
  sampleSize: number;
  modelVersion: string;
}

interface SearchResult {
  id: string;
  title: string;
  category: string;
  categoryId?: string;
  currentPrice: number;
  condition?: string;
  image?: string;
}

// Search items from API
const searchItems = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await apiClient.get('/price-prediction/search', {
      params: { q: query }
    });
    return response.data.data?.items || [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
};

// Get price prediction from API
const getPricePrediction = async (categoryId: string, condition: string, title?: string): Promise<PricePrediction | null> => {
  try {
    const response = await apiClient.post('/price-prediction/predict', {
      categoryId,
      condition,
      title
    });
    return response.data.data;
  } catch (error) {
    console.error('Prediction error:', error);
    return null;
  }
};

// Get price history from API
const getPriceHistory = async (categoryId: string, condition?: string): Promise<PriceHistory[]> => {
  try {
    const response = await apiClient.get(`/price-prediction/history/${categoryId}`, {
      params: { condition, days: 30 }
    });
    const history = response.data.data?.history || [];
    return history.map((h: any) => ({
      date: h.date,
      price: h.avgPrice || h.medianPrice || 0
    }));
  } catch (error) {
    console.error('History error:', error);
    return [];
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price);
};

export default function PricePredictorPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [priceAlert, setPriceAlert] = useState({ enabled: false, targetPrice: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setSearchLoading(true);
      try {
        const results = await searchItems(query);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  }, []);

  const selectItem = async (item: SearchResult) => {
    setSelectedItem(item);
    setSearchResults([]);
    setSearchQuery(item.title);
    setLoading(true);
    setError(null);

    try {
      // Get prediction from API
      const categoryId = item.categoryId || 'default';
      const condition = item.condition || 'GOOD';

      const [predictionData, historyData] = await Promise.all([
        getPricePrediction(categoryId, condition, item.title),
        getPriceHistory(categoryId, condition)
      ]);

      if (predictionData) {
        setPrediction(predictionData);
        setPriceHistory(historyData);
      } else {
        setError('لم نتمكن من الحصول على توقع السعر. قد لا تتوفر بيانات كافية لهذا المنتج.');
      }
    } catch (err: any) {
      console.error('Prediction error:', err);
      setError('حدث خطأ في تحليل السعر. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationStyle = (type: string) => {
    switch (type) {
      case 'QUICK_SALE':
        return { bg: 'bg-green-100', text: 'text-green-700', label: '🛒 بيع سريع', desc: 'سعر للبيع خلال أيام' };
      case 'COMPETITIVE':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: '💪 سعر تنافسي', desc: 'للبيع السريع' };
      case 'VALUE':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: '⭐ القيمة العادلة', desc: 'السعر المناسب للسوق' };
      case 'PREMIUM':
        return { bg: 'bg-purple-100', text: 'text-purple-700', label: '👑 سعر مميز', desc: 'للطلب العالي' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: '📊 تحليل', desc: '' };
    }
  };

  const getTrendStyle = (trend: string) => {
    switch (trend) {
      case 'UP': return { icon: '📈', label: 'في ارتفاع', color: 'text-red-600' };
      case 'DOWN': return { icon: '📉', label: 'في انخفاض', color: 'text-green-600' };
      default: return { icon: '➡️', label: 'مستقر', color: 'text-gray-600' };
    }
  };

  const getDemandStyle = (level: string) => {
    switch (level) {
      case 'HIGH': return { label: 'طلب عالي', color: 'text-red-600' };
      case 'LOW': return { label: 'طلب منخفض', color: 'text-green-600' };
      default: return { label: 'طلب متوسط', color: 'text-yellow-600' };
    }
  };

  const maxPrice = priceHistory.length > 0 ? Math.max(...priceHistory.map(p => p.price)) : 0;
  const minPrice = priceHistory.length > 0 ? Math.min(...priceHistory.map(p => p.price)) : 0;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-4xl font-bold mb-4">متنبئ الأسعار الذكي</h1>
          <p className="text-xl text-indigo-200 mb-8">
            تعرف على أفضل وقت للشراء باستخدام الذكاء الاصطناعي
          </p>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="ابحث عن منتج لتحليل سعره..."
              className="w-full px-6 py-4 rounded-2xl text-gray-900 outline-none text-lg shadow-xl"
            />
            <button className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
              🔍
            </button>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectItem(item)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-right"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      📱
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <div className="text-primary-600 font-bold">
                      {formatPrice(item.currentPrice)} ج.م
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl font-medium text-gray-900 mb-2">جاري تحليل السعر...</p>
            <p className="text-gray-500">الذكاء الاصطناعي يحلل بيانات السوق</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">تعذر التحليل</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              حاول مرة أخرى
            </button>
          </div>
        )}

        {/* Prediction Results */}
        {prediction && !loading && !error && (
          <div className="space-y-6">
            {/* Main Prediction Card */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-3xl">
                      📱
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedItem?.title}</h2>
                      <p className="text-gray-500">{selectedItem?.category}</p>
                    </div>
                  </div>
                  {prediction.recommendations?.[0] && (
                    <div className={`px-6 py-3 rounded-xl ${getRecommendationStyle(prediction.recommendations[0].type).bg}`}>
                      <span className={`text-lg font-bold ${getRecommendationStyle(prediction.recommendations[0].type).text}`}>
                        {getRecommendationStyle(prediction.recommendations[0].type).label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Current Price */}
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">السعر الحالي</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(selectedItem?.currentPrice || 0)} ج.م
                    </p>
                  </div>

                  {/* Predicted Price */}
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <p className="text-sm text-indigo-600 mb-1">السعر المتوقع</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {formatPrice(prediction.predictedPrice)} ج.م
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      ({formatPrice(prediction.priceRange.min)} - {formatPrice(prediction.priceRange.max)})
                    </p>
                  </div>

                  {/* Trend */}
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">اتجاه السعر</p>
                    <p className="text-3xl">
                      {getTrendStyle(prediction.marketAnalysis.trend).icon}
                    </p>
                    <p className={`text-sm mt-1 ${getTrendStyle(prediction.marketAnalysis.trend).color}`}>
                      {getTrendStyle(prediction.marketAnalysis.trend).label}
                    </p>
                  </div>

                  {/* Confidence */}
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">دقة التوقع</p>
                    <p className="text-2xl font-bold text-gray-900">{prediction.confidenceScore}%</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${prediction.confidenceScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Market Analysis */}
                <div className="mt-6 grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-500 mb-1">مستوى الطلب</p>
                    <p className={`font-bold ${getDemandStyle(prediction.marketAnalysis.demandLevel).color}`}>
                      {getDemandStyle(prediction.marketAnalysis.demandLevel).label}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-500 mb-1">المنافسة</p>
                    <p className="font-bold text-gray-700">
                      {prediction.marketAnalysis.competitionLevel === 'HIGH' ? 'منافسة عالية' :
                       prediction.marketAnalysis.competitionLevel === 'LOW' ? 'منافسة منخفضة' : 'منافسة متوسطة'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <p className="text-sm text-gray-500 mb-1">جودة البيانات</p>
                    <p className="font-bold text-gray-700">
                      {prediction.dataQuality === 'EXCELLENT' ? 'ممتازة' :
                       prediction.dataQuality === 'GOOD' ? 'جيدة' : 'محدودة'}
                      <span className="text-xs text-gray-500 mr-1">({prediction.sampleSize} عينة)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price History Chart */}
            {priceHistory.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">📊 تاريخ الأسعار</h3>

                <div className="relative h-64">
                  {/* Simple Chart Visualization */}
                  <div className="absolute inset-0 flex items-end justify-between gap-1 px-4">
                    {priceHistory.map((point, index) => {
                      const height = maxPrice !== minPrice
                        ? ((point.price - minPrice) / (maxPrice - minPrice)) * 100
                        : 50;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all hover:from-indigo-600 hover:to-indigo-500"
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`${formatPrice(point.price)} ج.م`}
                          ></div>
                          <span className="text-xs text-gray-500 mt-2 rotate-45 origin-right">
                            {new Date(point.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Y-axis labels */}
                  <div className="absolute right-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500">
                    <span>{formatPrice(maxPrice)}</span>
                    <span>{formatPrice((maxPrice + minPrice) / 2)}</span>
                    <span>{formatPrice(minPrice)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {prediction.recommendations && prediction.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">💡 توصيات التسعير</h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {prediction.recommendations.map((rec, index) => {
                    const style = getRecommendationStyle(rec.type);
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-xl ${style.bg} border`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-bold ${style.text}`}>{style.label}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          {formatPrice(rec.price)} ج.م
                        </p>
                        <p className="text-sm text-gray-600">{rec.descriptionAr}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          متوقع البيع خلال {rec.expectedDays} يوم
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Alert */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-sm p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">🔔 تنبيه السعر</h3>
                  <p className="text-indigo-100">احصل على إشعار عندما يصل السعر للمبلغ المطلوب</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={priceAlert.targetPrice}
                    onChange={(e) => setPriceAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                    placeholder="السعر المستهدف"
                    className="px-4 py-3 rounded-xl text-gray-900 outline-none w-40"
                  />
                  <button
                    onClick={() => setPriceAlert(prev => ({ ...prev, enabled: true }))}
                    className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors"
                  >
                    {priceAlert.enabled ? '✓ تم التفعيل' : 'فعّل التنبيه'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!prediction && !loading && !error && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">تعرف على السعر المناسب</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              ابحث عن أي منتج وسيقوم الذكاء الاصطناعي بتحليل بيانات السوق وتقديم توصيات التسعير المناسبة
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['iPhone', 'سيارة', 'لابتوب', 'شقة'].map((item) => (
                <button
                  key={item}
                  onClick={() => handleSearch(item)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
