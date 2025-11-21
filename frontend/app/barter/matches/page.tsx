'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { getMultiPartyMatches, getSuggestedPartners, MultiPartyMatch, SuggestedPartner } from '@/lib/api/barter';

export default function BarterMatchesPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [matches, setMatches] = useState<MultiPartyMatch[]>([]);
  const [partners, setPartners] = useState<SuggestedPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'partners'>('matches');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesRes, partnersRes] = await Promise.all([
        getMultiPartyMatches(5),
        getSuggestedPartners(),
      ]);
      setMatches(matchesRes.data.matches || []);
      setPartners(partnersRes.data.partners || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view barter matches</p>
          <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('مطابقات المقايضة الذكية', 'Smart Barter Matches')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('اكتشف فرص المقايضة متعددة الأطراف', 'Discover multi-party barter opportunities')}
              </p>
            </div>
            <Link
              href="/barter"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {t('العودة للمقايضة', 'Back to Barter')}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'matches'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('سلاسل المقايضة', 'Barter Chains')} ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'partners'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t('شركاء مقترحون', 'Suggested Partners')} ({partners.length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">{t('جاري البحث عن مطابقات...', 'Finding matches...')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button onClick={loadData} className="mt-4 text-purple-600 hover:text-purple-700">
              {t('حاول مرة أخرى', 'Try Again')}
            </button>
          </div>
        ) : activeTab === 'matches' ? (
          /* Multi-Party Matches */
          <div className="space-y-6">
            {matches.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">{t('لا توجد مطابقات حاليا', 'No matches found')}</p>
                <p className="text-gray-500 mt-2">
                  {t('أضف عناصر للمقايضة لاكتشاف فرص جديدة', 'Add items for barter to discover opportunities')}
                </p>
                <Link
                  href="/items/new"
                  className="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {t('أضف عنصر', 'Add Item')}
                </Link>
              </div>
            ) : (
              matches.map((match, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                  {/* Match Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        match.type === 'two-party' ? 'bg-blue-100 text-blue-700' :
                        match.type === 'three-party' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {match.type === 'two-party' ? t('ثنائي', '2-Party') :
                         match.type === 'three-party' ? t('ثلاثي', '3-Party') :
                         t('متعدد', 'Multi-Party')}
                      </span>
                      <span className="text-sm text-gray-500">
                        {match.chain.length} {t('مشاركين', 'participants')}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{t('درجة التطابق', 'Match Score')}</div>
                      <div className="text-lg font-bold text-green-600">{Math.round(match.matchScore)}%</div>
                    </div>
                  </div>

                  {/* Chain Visualization */}
                  <div className="relative">
                    <div className="flex items-center overflow-x-auto pb-4">
                      {match.chain.map((node, nodeIndex) => (
                        <React.Fragment key={node.userId}>
                          {/* Node */}
                          <div className="flex-shrink-0 w-48 bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                {node.userName.charAt(0)}
                              </div>
                              <span className="font-medium text-sm truncate">{node.userName}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-2">
                              {t('يعرض', 'Offers')}:
                            </div>
                            {node.offeredItems.slice(0, 2).map((item) => (
                              <div key={item.id} className="text-xs bg-white p-2 rounded mb-1 border">
                                <div className="truncate font-medium">{item.title}</div>
                                <div className="text-green-600">{item.value.toLocaleString()} EGP</div>
                              </div>
                            ))}
                            {node.offeredItems.length > 2 && (
                              <div className="text-xs text-gray-400">
                                +{node.offeredItems.length - 2} {t('عناصر أخرى', 'more items')}
                              </div>
                            )}
                          </div>

                          {/* Arrow */}
                          {nodeIndex < match.chain.length - 1 && (
                            <div className="flex-shrink-0 px-2">
                              <svg className="w-8 h-8 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                              </svg>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                      {/* Return arrow to first node */}
                      <div className="flex-shrink-0 px-2">
                        <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Match Stats */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {t('القيمة الإجمالية', 'Total Value')}: <span className="font-semibold">{match.totalValue.toLocaleString()} EGP</span>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm">
                      {t('بدء المقايضة', 'Start Trade')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Suggested Partners */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">{t('لا توجد اقتراحات حاليا', 'No suggestions found')}</p>
                <p className="text-gray-500 mt-2">
                  {t('أضف عناصر للمقايضة لاكتشاف شركاء', 'Add items for barter to find partners')}
                </p>
              </div>
            ) : (
              partners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                      {partner.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{partner.fullName}</div>
                      <div className="text-sm text-green-600">{Math.round(partner.matchScore)}% {t('تطابق', 'match')}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 font-medium">
                      {t('عناصر متطابقة', 'Matching Items')}:
                    </div>
                    {partner.matchingItems.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        {item.images?.[0] && (
                          <img src={item.images[0].url} alt={item.title} className="w-10 h-10 object-cover rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {language === 'ar' ? item.titleAr || item.title : item.titleEn || item.title}
                          </div>
                          <div className="text-xs text-green-600">{item.estimatedValue?.toLocaleString()} EGP</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm">
                    {t('عرض المقايضة', 'Make Offer')}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
