'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMyItems } from '@/lib/api/items';
import { discoverChainOpportunities, createChainProposal, getChainProposals } from '@/lib/api/barter';

interface Item {
  id: string;
  title: string;
  estimatedValue?: number;
  images: Array<{ url: string; isPrimary: boolean }>;
}

interface ChainOpportunity {
  opportunityId: string;
  type: string;
  participantCount: number;
  participants: string[];
  participantNames: string[];
  exchangeSequence: Array<{
    from: string;
    fromName: string;
    to: string;
    toName: string;
    itemOffered: string;
    itemOfferedTitle: string;
    itemValue: number;
  }>;
  totalAggregateMatchScore: number;
  averageMatchScore: number;
  requiredCashDifferential: number;
  isOptimal: boolean;
}

interface ChainProposal {
  id: string;
  status: string;
  participants: Array<{
    userId: string;
    itemId: string;
    status: string;
    user: { fullName: string };
    item: { title: string };
  }>;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  ACCEPTED: { label: 'مقبول', color: 'bg-green-100 text-green-700', icon: '✅' },
  COMPLETED: { label: 'مكتمل', color: 'bg-blue-100 text-blue-700', icon: '🎉' },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: '❌' },
  CANCELLED: { label: 'ملغي', color: 'bg-gray-100 text-gray-500', icon: '🚫' },
};

export default function ChainsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [opportunities, setOpportunities] = useState<ChainOpportunity[]>([]);
  const [proposals, setProposals] = useState<ChainProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'proposals'>('discover');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      const itemsResponse = await getMyItems();
      const items = itemsResponse?.data?.items || [];
      setMyItems(items.filter((item: any) => item.status === 'ACTIVE'));

      try {
        const proposalsResponse = await getChainProposals();
        const proposalsData = proposalsResponse?.data?.chains ||
                             proposalsResponse?.data?.proposals ||
                             proposalsResponse?.data ||
                             [];
        setProposals(Array.isArray(proposalsData) ? proposalsData : []);
      } catch (proposalErr) {
        console.log('Chain proposals not available yet');
        setProposals([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    if (!selectedItem) {
      setError('يرجى اختيار منتج أولاً');
      return;
    }

    try {
      setDiscovering(true);
      setError('');
      setOpportunities([]);
      const response = await discoverChainOpportunities(selectedItem);
      const opportunitiesData = response?.data?.opportunities ||
                               response?.data?.cycles ||
                               response?.data ||
                               [];
      let opps = Array.isArray(opportunitiesData) ? opportunitiesData : [];

      opps = opps
        .filter(opp => (opp.averageMatchScore || 0) >= 0.50)
        .filter(opp => {
          if (!opp.exchangeSequence || opp.exchangeSequence.length === 0) return false;
          const avgValue = opp.exchangeSequence.reduce((sum: number, e: any) => sum + e.itemValue, 0) / opp.exchangeSequence.length;
          return opp.requiredCashDifferential < (avgValue * 0.3);
        })
        .sort((a, b) => (b.averageMatchScore || 0) - (a.averageMatchScore || 0))
        .slice(0, 5);

      setOpportunities(opps);
      if (opps.length === 0) {
        setError('لم يتم العثور على فرص مطابقة عالية الجودة. جرب تحديد تفضيلات المقايضة عند إضافة منتجاتك.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في اكتشاف الفرص');
    } finally {
      setDiscovering(false);
    }
  };

  const handleCreateProposal = async (opportunity: ChainOpportunity) => {
    try {
      setCreating(true);
      setError('');
      await createChainProposal({
        participantItemIds: opportunity.exchangeSequence?.map(e => e.itemOffered) || [],
      });
      setSuccess('تم إنشاء الاقتراح بنجاح! تم إشعار جميع المشاركين.');
      setOpportunities([]);
      loadData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إنشاء الاقتراح');
    } finally {
      setCreating(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-l from-purple-600 via-indigo-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <Link
            href="/barter"
            className="text-purple-200 hover:text-white flex items-center gap-2 mb-6 transition w-fit"
          >
            → العودة لسوق المقايضة
          </Link>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl shadow-xl">
              🔗
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">سلاسل المقايضة الذكية</h1>
              <p className="text-purple-200 text-lg max-w-2xl">
                اكتشف فرص المقايضة المتعددة الأطراف حيث يمكن لـ A→B→C→A التبادل في دورة مغلقة!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">1. اختر منتجك</span>
            <span className="text-gray-400">→</span>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">2. اكتشف الفرص</span>
            <span className="text-gray-400">→</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">3. أنشئ اقتراح</span>
            <span className="text-gray-400">→</span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium whitespace-nowrap">4. تم التبادل!</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-600 font-medium flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <p className="text-green-600 font-medium">{success}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
              activeTab === 'discover'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">🔍</span>
            اكتشف الفرص
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 ${
              activeTab === 'proposals'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">📋</span>
            اقتراحاتي
            {proposals.length > 0 && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{proposals.length}</span>
            )}
          </button>
        </div>

        {activeTab === 'discover' && (
          <div className="space-y-6">
            {/* Discover Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                اكتشف فرص السلاسل
              </h2>

              <div className="mb-6">
                <label className="block text-lg font-bold text-gray-800 mb-3">
                  اختر أحد منتجاتك للبحث عن سلاسل مطابقة
                </label>

                {myItems.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-2xl">
                    <span className="text-5xl block mb-4">📦</span>
                    <h3 className="font-bold text-gray-800 mb-2">لا توجد منتجات</h3>
                    <p className="text-gray-600 mb-4">أضف منتجاتك أولاً لاكتشاف فرص السلاسل</p>
                    <Link
                      href="/listing/new"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
                    >
                      <span>➕</span>
                      أضف منتج جديد
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {myItems.map((item) => {
                      const primaryImage = item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url;
                      const isSelected = selectedItem === item.id;

                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(item.id)}
                          className={`p-4 rounded-2xl border-2 transition-all text-right ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow'
                          }`}
                        >
                          <div className="flex gap-4">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                              {primaryImage ? (
                                <img src={primaryImage} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">📦</div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">✓</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">{item.title}</h4>
                              <p className="text-purple-600 font-medium">
                                ~{(item.estimatedValue || 0).toLocaleString('ar-EG')} ج.م
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={handleDiscover}
                  disabled={!selectedItem || discovering}
                  className="w-full bg-gradient-to-l from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {discovering ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      جاري البحث عن الفرص...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🔍</span>
                      اكتشف فرص السلاسل
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Opportunities */}
            {opportunities.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  تم العثور على {opportunities.length} فرصة
                </h2>

                <div className="space-y-4">
                  {opportunities.map((opp, index) => (
                    <div key={opp.opportunityId || index} className="border-2 border-purple-100 rounded-2xl p-5 hover:border-purple-300 transition">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-xl font-bold">
                            {opp.participantCount}
                          </span>
                          <div>
                            <h3 className="font-bold text-gray-900">
                              سلسلة {opp.participantCount} أطراف
                            </h3>
                            <p className="text-sm text-gray-500">تبادل دائري مغلق</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                            تطابق {Math.round((opp.averageMatchScore || 0) * 100)}%
                          </span>
                          {opp.isOptimal && (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">⭐ مثالي</span>
                          )}
                        </div>
                      </div>

                      <div className="mb-4 p-4 bg-gradient-to-l from-purple-50 to-indigo-50 rounded-xl">
                        <div className="flex flex-wrap items-center gap-3 justify-center">
                          {(opp.exchangeSequence || []).map((exchange, i) => (
                            <React.Fragment key={exchange.itemOffered || i}>
                              <div className="bg-white px-4 py-3 rounded-xl shadow-sm text-center min-w-[120px]">
                                <p className="font-bold text-gray-800 text-sm truncate">{exchange.fromName || 'مستخدم'}</p>
                                <p className="text-xs text-gray-500 truncate">{exchange.itemOfferedTitle || 'منتج'}</p>
                                <p className="text-purple-600 font-bold text-sm mt-1">
                                  {(exchange.itemValue || 0).toLocaleString('ar-EG')} ج.م
                                </p>
                              </div>
                              {i < (opp.exchangeSequence?.length || 0) - 1 && (
                                <span className="text-2xl text-purple-600">←</span>
                              )}
                            </React.Fragment>
                          ))}
                          <span className="text-2xl text-purple-600">←</span>
                          <span className="text-sm text-purple-600 bg-white px-3 py-2 rounded-lg">↩️ العودة للأول</span>
                        </div>
                      </div>

                      {opp.requiredCashDifferential > 0 && (
                        <div className="mb-4 p-3 bg-amber-50 rounded-xl flex items-center gap-2">
                          <span className="text-xl">💰</span>
                          <p className="text-amber-700 font-medium">
                            فرق نقدي مطلوب: {opp.requiredCashDifferential.toLocaleString('ar-EG')} ج.م
                          </p>
                        </div>
                      )}

                      <button
                        onClick={() => handleCreateProposal(opp)}
                        disabled={creating}
                        className="w-full bg-gradient-to-l from-green-500 to-emerald-500 text-white px-4 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {creating ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            جاري الإنشاء...
                          </>
                        ) : (
                          <>
                            <span>🚀</span>
                            إنشاء اقتراح وإشعار المشاركين
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'proposals' && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              اقتراحات السلاسل الخاصة بي
            </h2>

            {proposals.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl block mb-4">🔗</span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد اقتراحات بعد</h3>
                <p className="text-gray-600 mb-6">اكتشف فرص السلاسل وأنشئ اقتراحك الأول!</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
                >
                  اكتشف الفرص
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {proposals.map((proposal) => {
                  const statusInfo = STATUS_LABELS[proposal.status] || STATUS_LABELS.PENDING;

                  return (
                    <div key={proposal.id} className="border-2 border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="text-xl">🔗</span>
                            سلسلة {proposal.participants?.length || 0} أطراف
                          </h3>
                          <p className="text-sm text-gray-500">
                            تم الإنشاء: {new Date(proposal.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="space-y-2 p-4 bg-gray-50 rounded-xl">
                        {(proposal.participants || []).map((p, i) => (
                          <div key={p.userId} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                                {i + 1}
                              </span>
                              <div>
                                <span className="font-medium text-gray-800">{p.user?.fullName || 'مستخدم'}</span>
                                <span className="text-gray-400 mx-2">←</span>
                                <span className="text-gray-600">{p.item?.title || 'منتج'}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                              p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {p.status === 'ACCEPTED' ? 'قبل' : p.status === 'PENDING' ? 'في الانتظار' : p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-l from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <span className="text-xl">💡</span>
            كيف تعمل سلاسل المقايضة؟
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-purple-800">
            <div className="flex gap-3">
              <span className="text-2xl">1️⃣</span>
              <p>عندما لا يمكنك إيجاد مقايضة مباشرة، يبحث النظام عن سلاسل متعددة الأطراف.</p>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">2️⃣</span>
              <p>مثال: أنت تريد هاتف، صاحب الهاتف يريد لابتوب، صاحب اللابتوب يريد منتجك!</p>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">3️⃣</span>
              <p>يتم إشعار جميع المشاركين ويتم التبادل عند موافقة الجميع.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
