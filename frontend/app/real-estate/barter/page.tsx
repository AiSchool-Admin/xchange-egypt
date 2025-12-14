'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  findBarterMatches,
  getBarterSuggestions,
  validateBarterChain,
  initiateBarterChain,
  BarterMatch,
  BarterChain,
  PropertyType,
  PROPERTY_TYPE_AR,
} from '@/lib/api/real-estate-advanced';
import { searchProperties, Property } from '@/lib/api/properties';

export default function RealEstateBarterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User's properties
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Matches
  const [directMatches, setDirectMatches] = useState<BarterMatch[]>([]);
  const [multiPartyMatches, setMultiPartyMatches] = useState<BarterMatch[]>([]);

  // Filters
  const [maxCashDifference, setMaxCashDifference] = useState('500000');
  const [maxChainLength, setMaxChainLength] = useState('4');
  const [preferredGovernorate, setPreferredGovernorate] = useState('');

  // Validation modal
  const [validatingChain, setValidatingChain] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Egyptian governorates
  const GOVERNORATES = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
    'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية'
  ];

  useEffect(() => {
    loadUserProperties();
  }, []);

  const loadUserProperties = async () => {
    try {
      setLoadingProperties(true);
      // For demo, search for properties with barter option
      const response = await searchProperties({
        openToBarter: true,
        limit: 20,
      });
      setUserProperties(response.properties || []);
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleFindMatches = async () => {
    if (!selectedProperty) {
      setError('يرجى اختيار عقار للمقايضة');
      return;
    }

    setLoading(true);
    setError('');
    setDirectMatches([]);
    setMultiPartyMatches([]);

    try {
      const result = await findBarterMatches(selectedProperty, {
        maxChainLength: parseInt(maxChainLength),
        maxCashDifference: parseFloat(maxCashDifference),
        preferredGovernorate: preferredGovernorate || undefined,
      });

      setDirectMatches(result.directMatches || []);
      setMultiPartyMatches(result.multiPartyMatches || []);

      if ((result.directMatches?.length || 0) + (result.multiPartyMatches?.length || 0) === 0) {
        setError('لم يتم العثور على فرص مقايضة مناسبة. جرب تغيير المعايير.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء البحث عن فرص المقايضة');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateChain = async (chainId: string) => {
    setValidatingChain(chainId);
    setValidationResult(null);

    try {
      const result = await validateBarterChain(chainId);
      setValidationResult(result);
    } catch (err: any) {
      setValidationResult({
        isValid: false,
        errors: [err.response?.data?.message || 'فشل التحقق من سلسلة المقايضة'],
        warnings: [],
      });
    }
  };

  const handleInitiateChain = async (chainId: string) => {
    try {
      const result = await initiateBarterChain(chainId);
      setSuccess('تم بدء عملية المقايضة بنجاح! رقم المعاملة: ' + result.transactionId);
      setValidatingChain(null);
      setValidationResult(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل بدء عملية المقايضة');
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(2)} مليون`;
    }
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'DIRECT': return 'مباشرة';
      case 'THREE_WAY': return 'ثلاثية';
      case 'FOUR_WAY': return 'رباعية';
      case 'MULTI_PARTY': return 'متعددة';
      default: return type;
    }
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'DIRECT': return 'bg-green-100 text-green-700';
      case 'THREE_WAY': return 'bg-blue-100 text-blue-700';
      case 'FOUR_WAY': return 'bg-purple-100 text-purple-700';
      case 'MULTI_PARTY': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderBarterChain = (match: BarterMatch, index: number) => {
    const chain = match.chain;

    return (
      <div key={chain.chainId} className="bg-white rounded-xl shadow-sm p-6 mb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchTypeColor(match.type)}`}>
              {getMatchTypeLabel(match.type)}
            </span>
            <span className="text-sm text-gray-500">
              {chain.participants.length} أطراف
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">نقاط العدالة:</span>
            <span className={`font-bold ${chain.fairnessScore >= 0.8 ? 'text-green-600' : chain.fairnessScore >= 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
              {Math.round(chain.fairnessScore * 100)}%
            </span>
          </div>
        </div>

        {/* Chain Visualization */}
        <div className="relative">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {chain.participants.map((participant, idx) => (
              <React.Fragment key={idx}>
                {/* Property Card */}
                <div className="flex-shrink-0 w-56 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">
                    {participant.userName || 'مالك ' + (idx + 1)}
                  </div>
                  <div className="font-bold text-gray-800 mb-2 truncate">
                    {participant.givesProperty.title}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>{PROPERTY_TYPE_AR[participant.givesProperty.propertyType as PropertyType] || participant.givesProperty.propertyType}</span>
                    <span>|</span>
                    <span>{participant.givesProperty.area} م&#178;</span>
                  </div>
                  <div className="text-emerald-600 font-bold">
                    {formatPrice(participant.givesProperty.price)} ج.م
                  </div>
                  {participant.cashFlow !== 0 && (
                    <div className={`mt-2 text-sm ${participant.cashFlow > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {participant.cashFlow > 0 ? '+' : ''}{formatPrice(participant.cashFlow)} ج.م
                    </div>
                  )}
                </div>

                {/* Arrow */}
                {idx < chain.participants.length - 1 && (
                  <div className="flex-shrink-0 text-2xl text-emerald-500">
                    &#8594;
                  </div>
                )}
              </React.Fragment>
            ))}

            {/* Closing Arrow (circular) */}
            {chain.participants.length > 2 && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-emerald-500">
                <svg width="100" height="30" viewBox="0 0 100 30">
                  <path
                    d="M 0 0 Q 50 30 100 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                  <polygon points="100,0 92,5 95,0" fill="currentColor" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-500">القيمة الإجمالية</div>
            <div className="font-bold text-gray-800">{formatPrice(chain.totalValue)} ج.م</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">النقدية المطلوبة</div>
            <div className="font-bold text-gray-800">{formatPrice(chain.cashRequired)} ج.م</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">تقييم الصفقة</div>
            <div className="font-bold text-emerald-600">{Math.round(chain.score * 100)}%</div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => handleValidateChain(chain.chainId)}
            className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            تحقق وابدأ المقايضة
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            &#x2665; حفظ
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-orange-200 text-sm mb-2">
                <Link href="/real-estate" className="hover:text-white">سوق العقارات</Link>
                <span>/</span>
                <span>المقايضة</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <span className="text-4xl">&#x1F504;</span>
                المقايضة العقارية
              </h1>
              <p className="text-orange-100 mt-2">
                بادل عقارك مع عقارات أخرى - مقايضة مباشرة أو متعددة الأطراف
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600">{success}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">إعدادات البحث</h2>

              {/* Property Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اختر عقارك للمقايضة
                </label>
                {loadingProperties ? (
                  <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
                ) : (
                  <select
                    value={selectedProperty}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">اختر عقاراً</option>
                    {userProperties.map((prop) => (
                      <option key={prop.id} value={prop.id}>
                        {prop.title} - {formatPrice(prop.price)} ج.م
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Max Cash Difference */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أقصى فرق نقدي
                </label>
                <input
                  type="number"
                  value={maxCashDifference}
                  onChange={(e) => setMaxCashDifference(e.target.value)}
                  placeholder="500000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  الحد الأقصى للفرق النقدي في المقايضة
                </p>
              </div>

              {/* Max Chain Length */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الأطراف
                </label>
                <select
                  value={maxChainLength}
                  onChange={(e) => setMaxChainLength(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="2">مباشرة (طرفين)</option>
                  <option value="3">حتى 3 أطراف</option>
                  <option value="4">حتى 4 أطراف</option>
                  <option value="5">حتى 5 أطراف</option>
                </select>
              </div>

              {/* Preferred Governorate */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحافظة المفضلة
                </label>
                <select
                  value={preferredGovernorate}
                  onChange={(e) => setPreferredGovernorate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">كل المحافظات</option>
                  {GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                onClick={handleFindMatches}
                disabled={loading || !selectedProperty}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">&#9696;</span>
                    جاري البحث...
                  </>
                ) : (
                  <>
                    <span>&#x1F50D;</span>
                    ابحث عن فرص المقايضة
                  </>
                )}
              </button>

              {/* Info Box */}
              <div className="mt-6 bg-orange-50 rounded-lg p-4">
                <h4 className="font-bold text-orange-800 mb-2">كيف تعمل المقايضة؟</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>&#x2022; اختر عقارك للمقايضة</li>
                  <li>&#x2022; نبحث عن فرص مناسبة</li>
                  <li>&#x2022; قد تكون مباشرة أو متعددة الأطراف</li>
                  <li>&#x2022; تحقق من العدالة قبل الموافقة</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                فرص المقايضة المتاحة
              </h2>
              <p className="text-gray-600">
                {directMatches.length + multiPartyMatches.length} فرصة
              </p>
            </div>

            {/* No Results */}
            {!loading && directMatches.length === 0 && multiPartyMatches.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <span className="text-6xl block mb-4">&#x1F504;</span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">ابدأ البحث عن فرص المقايضة</h3>
                <p className="text-gray-600 mb-6">
                  اختر عقارك وحدد المعايير للعثور على فرص مقايضة مناسبة
                </p>
              </div>
            )}

            {/* Direct Matches */}
            {directMatches.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-green-500">&#x2714;</span>
                  المقايضات المباشرة ({directMatches.length})
                </h3>
                {directMatches.map((match, idx) => renderBarterChain(match, idx))}
              </div>
            )}

            {/* Multi-Party Matches */}
            {multiPartyMatches.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-blue-500">&#x1F517;</span>
                  المقايضات متعددة الأطراف ({multiPartyMatches.length})
                </h3>
                {multiPartyMatches.map((match, idx) => renderBarterChain(match, idx))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Modal */}
      {validatingChain && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">التحقق من سلسلة المقايضة</h3>

            {!validationResult ? (
              <div className="text-center py-8">
                <div className="animate-spin text-4xl mb-4">&#9696;</div>
                <p className="text-gray-600">جاري التحقق...</p>
              </div>
            ) : (
              <div>
                {validationResult.isValid ? (
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                      <span>&#x2714;</span>
                      السلسلة صالحة للتنفيذ
                    </div>
                    {validationResult.warnings?.length > 0 && (
                      <ul className="text-sm text-yellow-700">
                        {validationResult.warnings.map((w: string, i: number) => (
                          <li key={i}>&#x26A0; {w}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 text-red-700 font-bold mb-2">
                      <span>&#x2718;</span>
                      السلسلة غير صالحة
                    </div>
                    <ul className="text-sm text-red-600">
                      {validationResult.errors?.map((e: string, i: number) => (
                        <li key={i}>&#x2022; {e}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3">
                  {validationResult.isValid && (
                    <button
                      onClick={() => handleInitiateChain(validatingChain)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      ابدأ المقايضة
                    </button>
                  )}
                  <button
                    onClick={() => { setValidatingChain(null); setValidationResult(null); }}
                    className="flex-1 border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
