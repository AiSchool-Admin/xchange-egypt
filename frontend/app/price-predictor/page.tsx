'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface PriceHistory {
  date: string;
  price: number;
}

interface PricePrediction {
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  recommendation: 'BUY_NOW' | 'WAIT' | 'BEST_PRICE';
  bestTimeToBuy?: string;
  priceHistory: PriceHistory[];
  factors: {
    name: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    description: string;
  }[];
  similarItems: {
    id: string;
    title: string;
    price: number;
    priceChange: number;
  }[];
}

interface SearchResult {
  id: string;
  title: string;
  category: string;
  currentPrice: number;
  image?: string;
}

const mockSearchResults: SearchResult[] = [
  { id: '1', title: 'iPhone 15 Pro Max 256GB', category: 'هواتف', currentPrice: 62000 },
  { id: '2', title: 'iPhone 15 Pro 128GB', category: 'هواتف', currentPrice: 52000 },
  { id: '3', title: 'Samsung Galaxy S24 Ultra', category: 'هواتف', currentPrice: 55000 },
  { id: '4', title: 'MacBook Pro M3 14"', category: 'لابتوب', currentPrice: 95000 },
];

const mockPrediction: PricePrediction = {
  currentPrice: 62000,
  predictedPrice: 58000,
  confidence: 87,
  trend: 'DOWN',
  recommendation: 'WAIT',
  bestTimeToBuy: '2024-02-15',
  priceHistory: [
    { date: '2024-01-01', price: 68000 },
    { date: '2024-01-05', price: 67000 },
    { date: '2024-01-10', price: 65000 },
    { date: '2024-01-15', price: 64000 },
    { date: '2024-01-20', price: 63000 },
    { date: '2024-01-25', price: 62500 },
    { date: '2024-01-30', price: 62000 },
  ],
  factors: [
    {
      name: 'إطلاق iPhone 16',
      impact: 'NEGATIVE',
      description: 'من المتوقع إطلاق الجيل الجديد في سبتمبر، مما سيخفض أسعار الموديل الحالي',
    },
    {
      name: 'سعر الدولار',
      impact: 'NEGATIVE',
      description: 'استقرار سعر الصرف يساعد على انخفاض الأسعار',
    },
    {
      name: 'موسم العروض',
      impact: 'POSITIVE',
      description: 'رمضان والعيد قادمان، توقع عروض خاصة',
    },
    {
      name: 'العرض والطلب',
      impact: 'NEUTRAL',
      description: 'الطلب مستقر مع توفر جيد في السوق',
    },
  ],
  similarItems: [
    { id: '1', title: 'iPhone 15 Pro 128GB', price: 52000, priceChange: -5 },
    { id: '2', title: 'iPhone 14 Pro Max', price: 45000, priceChange: -8 },
    { id: '3', title: 'Samsung S24 Ultra', price: 55000, priceChange: -3 },
  ],
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price);
};

export default function PricePredictorPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<SearchResult | null>(null);
  const [prediction, setPrediction] = useState<PricePrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [priceAlert, setPriceAlert] = useState({ enabled: false, targetPrice: '' });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      // Simulate search
      const results = mockSearchResults.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const selectItem = (item: SearchResult) => {
    setSelectedItem(item);
    setSearchResults([]);
    setSearchQuery(item.title);
    setLoading(true);

    // Simulate AI prediction
    setTimeout(() => {
      setPrediction(mockPrediction);
      setLoading(false);
    }, 1500);
  };

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case 'BUY_NOW':
        return { bg: 'bg-green-100', text: 'text-green-700', label: '🛒 اشتري الآن!', desc: 'السعر مناسب جداً' };
      case 'WAIT':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: '⏳ انتظر قليلاً', desc: 'السعر سينخفض قريباً' };
      case 'BEST_PRICE':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: '⭐ أفضل سعر!', desc: 'هذا أقل سعر تاريخياً' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: '📊 تحليل', desc: '' };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'UP': return '📈';
      case 'DOWN': return '📉';
      default: return '➡️';
    }
  };

  const maxPrice = prediction ? Math.max(...prediction.priceHistory.map(p => p.price)) : 0;
  const minPrice = prediction ? Math.min(...prediction.priceHistory.map(p => p.price)) : 0;

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

        {/* Prediction Results */}
        {prediction && !loading && (
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
                  <div className={`px-6 py-3 rounded-xl ${getRecommendationStyle(prediction.recommendation).bg}`}>
                    <span className={`text-lg font-bold ${getRecommendationStyle(prediction.recommendation).text}`}>
                      {getRecommendationStyle(prediction.recommendation).label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Current Price */}
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">السعر الحالي</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(prediction.currentPrice)} ج.م
                    </p>
                  </div>

                  {/* Predicted Price */}
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <p className="text-sm text-indigo-600 mb-1">السعر المتوقع</p>
                    <p className="text-2xl font-bold text-indigo-700">
                      {formatPrice(prediction.predictedPrice)} ج.م
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      وفر {formatPrice(prediction.currentPrice - prediction.predictedPrice)} ج.م
                    </p>
                  </div>

                  {/* Trend */}
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">اتجاه السعر</p>
                    <p className="text-3xl">
                      {getTrendIcon(prediction.trend)}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      {prediction.trend === 'DOWN' ? 'في انخفاض' : prediction.trend === 'UP' ? 'في ارتفاع' : 'مستقر'}
                    </p>
                  </div>

                  {/* Confidence */}
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">دقة التوقع</p>
                    <p className="text-2xl font-bold text-gray-900">{prediction.confidence}%</p>
                    <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Best Time to Buy */}
                {prediction.bestTimeToBuy && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-xl flex items-center gap-4">
                    <span className="text-3xl">📅</span>
                    <div>
                      <p className="font-bold text-amber-800">أفضل وقت للشراء</p>
                      <p className="text-amber-700">
                        حوالي {new Date(prediction.bestTimeToBuy).toLocaleDateString('ar-EG', { month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price History Chart */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">📊 تاريخ الأسعار</h3>

              <div className="relative h-64">
                {/* Simple Chart Visualization */}
                <div className="absolute inset-0 flex items-end justify-between gap-1 px-4">
                  {prediction.priceHistory.map((point, index) => {
                    const height = ((point.price - minPrice) / (maxPrice - minPrice)) * 100;
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

            {/* Price Factors */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">🎯 عوامل تؤثر على السعر</h3>

              <div className="grid md:grid-cols-2 gap-4">
                {prediction.factors.map((factor, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      factor.impact === 'POSITIVE'
                        ? 'bg-green-50 border border-green-200'
                        : factor.impact === 'NEGATIVE'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">
                        {factor.impact === 'POSITIVE' ? '📈' : factor.impact === 'NEGATIVE' ? '📉' : '➡️'}
                      </span>
                      <span className="font-bold text-gray-900">{factor.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">🔄 منتجات مشابهة</h3>

              <div className="grid md:grid-cols-3 gap-4">
                {prediction.similarItems.map((item) => (
                  <Link
                    key={item.id}
                    href={`/items/${item.id}`}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <p className="font-medium text-gray-900 mb-2">{item.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary-600">
                        {formatPrice(item.price)} ج.م
                      </span>
                      <span className={`text-sm ${item.priceChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.priceChange > 0 ? '+' : ''}{item.priceChange}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

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
        {!prediction && !loading && (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">اكتشف أفضل وقت للشراء</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              ابحث عن أي منتج وسيقوم الذكاء الاصطناعي بتحليل اتجاهات السوق وتوقع أفضل وقت للشراء
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {['iPhone 15', 'MacBook', 'PlayStation 5', 'تويوتا كورولا'].map((item) => (
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
