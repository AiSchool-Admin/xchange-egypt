'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getRecommendations,
  getSimilarProperties,
  getTrendingProperties,
  recordPropertyView,
  RecommendedProperty,
  RecommendationsResponse,
  PROPERTY_TYPE_AR,
  PropertyType,
} from '@/lib/api/real-estate-advanced';

// Egyptian governorates
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية'
];

// Property types
const PROPERTY_TYPES: PropertyType[] = [
  'APARTMENT', 'VILLA', 'DUPLEX', 'PENTHOUSE', 'STUDIO', 'CHALET'
];

export default function RealEstateRecommendationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Recommendations
  const [recommendations, setRecommendations] = useState<RecommendedProperty[]>([]);
  const [trendingProperties, setTrendingProperties] = useState<RecommendedProperty[]>([]);
  const [diversityScore, setDiversityScore] = useState(0);

  // Filters
  const [selectedTab, setSelectedTab] = useState<'for_you' | 'trending'>('for_you');
  const [governorate, setGovernorate] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType | ''>('');
  const [diversityWeight, setDiversityWeight] = useState(0.5);
  const [excludeViewed, setExcludeViewed] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [diversityWeight, excludeViewed]);

  useEffect(() => {
    loadTrending();
  }, [governorate, propertyType]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await getRecommendations({
        limit: 20,
        excludeViewed,
        includeReasons: true,
        diversityWeight,
      });
      setRecommendations(result.recommendations || []);
      setDiversityScore(result.diversityScore || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل تحميل التوصيات');
    } finally {
      setLoading(false);
    }
  };

  const loadTrending = async () => {
    try {
      const result = await getTrendingProperties({
        governorate: governorate || undefined,
        propertyType: propertyType || undefined,
        limit: 12,
      });
      setTrendingProperties(result.trending || []);
    } catch (err) {
      console.error('Failed to load trending:', err);
    }
  };

  const handlePropertyClick = async (propertyId: string) => {
    try {
      await recordPropertyView(propertyId);
    } catch (err) {
      console.error('Failed to record view:', err);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(2)} مليون`;
    }
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'CONTENT_BASED': return 'مشابه لتفضيلاتك';
      case 'COLLABORATIVE': return 'أعجب مستخدمين مشابهين';
      case 'TRENDING': return 'رائج الآن';
      case 'DISCOVERY': return 'اكتشف جديد';
      default: return source;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'CONTENT_BASED': return 'bg-blue-100 text-blue-700';
      case 'COLLABORATIVE': return 'bg-purple-100 text-purple-700';
      case 'TRENDING': return 'bg-red-100 text-red-700';
      case 'DISCOVERY': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderPropertyCard = (property: RecommendedProperty) => (
    <Link
      key={property.id}
      href={`/properties/${property.id}`}
      onClick={() => handlePropertyClick(property.id)}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
    >
      {/* Image */}
      <div className="relative h-48">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
            <span className="text-6xl">&#x1F3E0;</span>
          </div>
        )}

        {/* Match Score */}
        <div className="absolute top-3 left-3 bg-emerald-500 text-white px-2 py-1 rounded-lg text-sm font-bold">
          {Math.round(property.matchScore * 100)}% مطابقة
        </div>

        {/* Source Badge */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium ${getSourceColor(property.source)}`}>
          {getSourceLabel(property.source)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
          {property.title}
        </h3>

        {/* Property Details */}
        <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <span>&#x1F4D0;</span>
            {property.area} م&#178;
          </span>
          {property.bedrooms && (
            <span className="flex items-center gap-1">
              <span>&#x1F6CF;</span>
              {property.bedrooms} غرف
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <span>&#x1F6BF;</span>
              {property.bathrooms} حمام
            </span>
          )}
        </div>

        {/* Type Badge */}
        <div className="mb-3">
          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">
            {PROPERTY_TYPE_AR[property.propertyType as PropertyType] || property.propertyType}
          </span>
        </div>

        {/* Match Reasons */}
        {property.matchReasons && property.matchReasons.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">لماذا نوصي به:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {property.matchReasons.slice(0, 2).map((reason, idx) => (
                <li key={idx} className="flex items-center gap-1">
                  <span className="text-emerald-500">&#x2713;</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Price & Location */}
        <div className="flex items-center justify-between border-t pt-3">
          <p className="text-lg font-bold text-emerald-600">
            {formatPrice(property.price)} ج.م
          </p>
          <span className="text-xs text-gray-500">
            &#x1F4CD; {property.governorate}
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-purple-200 text-sm mb-2">
                <Link href="/real-estate" className="hover:text-white">سوق العقارات</Link>
                <span>/</span>
                <span>التوصيات</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <span className="text-4xl">&#x2728;</span>
                توصيات مخصصة لك
              </h1>
              <p className="text-purple-100 mt-2">
                عقارات مختارة بعناية بناءً على تفضيلاتك وسلوكك
              </p>
            </div>

            {/* Diversity Score */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-purple-200 text-sm mb-1">تنوع التوصيات</p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-purple-300/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${diversityScore * 100}%` }}
                  ></div>
                </div>
                <span className="font-bold">{Math.round(diversityScore * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedTab('for_you')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              selectedTab === 'for_you'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="ml-2">&#x2764;</span>
            مخصص لك
          </button>
          <button
            onClick={() => setSelectedTab('trending')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              selectedTab === 'trending'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="ml-2">&#x1F525;</span>
            الأكثر رواجاً
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {selectedTab === 'for_you' ? (
              <>
                {/* Diversity Slider */}
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600">التنوع:</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={diversityWeight}
                    onChange={(e) => setDiversityWeight(parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">{Math.round(diversityWeight * 100)}%</span>
                </div>

                {/* Exclude Viewed */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={excludeViewed}
                    onChange={(e) => setExcludeViewed(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">استبعاد ما شاهدته</span>
                </label>

                {/* Refresh Button */}
                <button
                  onClick={loadRecommendations}
                  disabled={loading}
                  className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium"
                >
                  &#x21BB; تحديث
                </button>
              </>
            ) : (
              <>
                {/* Governorate Filter */}
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">كل المحافظات</option>
                  {GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>

                {/* Property Type Filter */}
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType | '')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                >
                  <option value="">كل الأنواع</option>
                  {PROPERTY_TYPES.map((type) => (
                    <option key={type} value={type}>{PROPERTY_TYPE_AR[type]}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* For You Tab */}
            {selectedTab === 'for_you' && (
              <>
                {recommendations.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <span className="text-6xl block mb-4">&#x1F914;</span>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد توصيات حالياً</h3>
                    <p className="text-gray-600 mb-6">
                      تصفح المزيد من العقارات لنتمكن من تقديم توصيات مخصصة لك
                    </p>
                    <Link
                      href="/real-estate"
                      className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                      تصفح العقارات
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendations.map(renderPropertyCard)}
                  </div>
                )}
              </>
            )}

            {/* Trending Tab */}
            {selectedTab === 'trending' && (
              <>
                {trendingProperties.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <span className="text-6xl block mb-4">&#x1F525;</span>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد عقارات رائجة</h3>
                    <p className="text-gray-600">جرب تغيير الفلاتر للعثور على عقارات رائجة</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingProperties.map(renderPropertyCard)}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Explanation Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">كيف تعمل التوصيات؟</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">&#x1F4CA;</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-1">تحليل المحتوى</h4>
              <p className="text-sm text-gray-600">نحلل العقارات التي أعجبتك لفهم تفضيلاتك</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">&#x1F465;</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-1">تصفية تعاونية</h4>
              <p className="text-sm text-gray-600">نقترح ما أعجب مستخدمين لديهم اهتمامات مشابهة</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">&#x1F525;</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-1">الرائج</h4>
              <p className="text-sm text-gray-600">نضيف العقارات الأكثر شعبية حالياً</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">&#x1F31F;</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-1">الاكتشاف</h4>
              <p className="text-sm text-gray-600">نضيف تنوعاً لمساعدتك على اكتشاف فرص جديدة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
