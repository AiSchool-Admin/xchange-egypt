'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getMyChains,
  getPendingProposals,
  respondToProposal,
  cancelChain,
  executeChain,
  getChainStats,
  BarterChain,
  ChainStats,
} from '@/lib/api/barter-chains';

const STATUS_INFO: Record<string, { label: string; color: string; icon: string }> = {
  PROPOSED: { label: 'مقترح', color: 'bg-blue-100 text-blue-700', icon: '💡' },
  PENDING: { label: 'في انتظار الموافقة', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  ACCEPTED: { label: 'تمت الموافقة', color: 'bg-green-100 text-green-700', icon: '✅' },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-700', icon: '❌' },
  EXECUTING: { label: 'جاري التنفيذ', color: 'bg-indigo-100 text-indigo-700', icon: '⚡' },
  COMPLETED: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700', icon: '🎉' },
  CANCELLED: { label: 'ملغي', color: 'bg-gray-100 text-gray-500', icon: '🚫' },
  EXPIRED: { label: 'منتهي', color: 'bg-gray-100 text-gray-500', icon: '⏰' },
};

const CHAIN_TYPE_INFO: Record<string, { label: string; icon: string; desc: string }> = {
  CYCLE: { label: 'سلسلة دائرية', icon: '🔄', desc: 'كل مشارك يعطي ويأخذ في دورة مغلقة' },
  LINEAR: { label: 'سلسلة خطية', icon: '➡️', desc: 'سلسلة مباشرة من مقايضات متتالية' },
};

function ChainCard({
  chain,
  userId,
  onAction,
}: {
  chain: BarterChain;
  userId?: string;
  onAction: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const statusInfo = STATUS_INFO[chain.status] || STATUS_INFO.PROPOSED;
  const typeInfo = CHAIN_TYPE_INFO[chain.chainType] || CHAIN_TYPE_INFO.CYCLE;

  const myParticipation = chain.participants?.find(p => p.userId === userId);
  const isCreator = chain.participants?.[0]?.userId === userId;
  const hoursLeft = Math.max(0, Math.ceil((new Date(chain.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)));
  const allAccepted = chain.participants?.every(p => p.status === 'ACCEPTED');

  const handleRespond = async (accept: boolean) => {
    setLoading(true);
    try {
      const message = accept ? undefined : prompt('سبب الرفض (اختياري):');
      await respondToProposal(chain.id, { accept, message: message || undefined });
      alert(accept ? 'تم قبول السلسلة!' : 'تم رفض السلسلة');
      onAction();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('هل أنت متأكد من إلغاء السلسلة؟')) return;
    setLoading(true);
    try {
      await cancelChain(chain.id);
      alert('تم إلغاء السلسلة');
      onAction();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!confirm('هل أنت متأكد من بدء تنفيذ السلسلة؟')) return;
    setLoading(true);
    try {
      await executeChain(chain.id);
      alert('تم بدء تنفيذ السلسلة!');
      onAction();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${statusInfo.color}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{statusInfo.icon}</span>
          <span className="font-bold">{statusInfo.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeInfo.icon}</span>
          <span className="text-sm font-medium">{typeInfo.label}</span>
        </div>
      </div>

      <div className="p-4">
        {/* Chain Info */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-emerald-600">{chain.participantCount}</p>
            <p className="text-xs text-gray-500">مشاركين</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-blue-600">
              {chain.totalValue.toLocaleString('ar-EG')}
            </p>
            <p className="text-xs text-gray-500">القيمة ج.م</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-orange-600">{hoursLeft}</p>
            <p className="text-xs text-gray-500">ساعة متبقية</p>
          </div>
        </div>

        {/* Participants */}
        <div className="border rounded-lg p-3 mb-4">
          <h4 className="font-bold text-sm text-gray-700 mb-2">🔗 المشاركون في السلسلة:</h4>
          <div className="space-y-2">
            {chain.participants?.map((participant, index) => (
              <div
                key={participant.id}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  participant.userId === userId ? 'bg-emerald-50 border border-emerald-200' : 'bg-gray-50'
                }`}
              >
                <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {participant.user?.fullName || 'مستخدم'}
                    {participant.userId === userId && ' (أنت)'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    يعطي: {participant.givingItem?.title || 'منتج'}
                    {participant.cashBalance > 0 && ` + ${participant.cashBalance.toLocaleString('ar-EG')} ج.م`}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  participant.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                  participant.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  participant.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {participant.status === 'ACCEPTED' ? 'قبل' :
                   participant.status === 'REJECTED' ? 'رفض' :
                   participant.status === 'COMPLETED' ? 'اكتمل' : 'في انتظار'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* My Participation */}
        {myParticipation && (
          <div className="bg-emerald-50 rounded-lg p-3 mb-4 border border-emerald-200">
            <h4 className="font-bold text-sm text-emerald-700 mb-2">📦 دورك في السلسلة:</h4>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500">تعطي</p>
                <p className="font-bold text-red-600 text-sm truncate">
                  {myParticipation.givingItem?.title || 'منتج'}
                </p>
              </div>
              <span className="text-2xl">➡️</span>
              <div className="flex-1 text-center">
                <p className="text-xs text-gray-500">تستلم</p>
                <p className="font-bold text-green-600 text-sm truncate">
                  {myParticipation.receivingItem?.title || 'منتج'}
                </p>
              </div>
            </div>
            {myParticipation.cashBalance !== 0 && (
              <p className="text-center text-sm mt-2">
                {myParticipation.cashBalance > 0 ? (
                  <span className="text-green-600">+ تستلم {myParticipation.cashBalance.toLocaleString('ar-EG')} ج.م</span>
                ) : (
                  <span className="text-red-600">- تدفع {Math.abs(myParticipation.cashBalance).toLocaleString('ar-EG')} ج.م</span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {myParticipation?.status === 'PENDING' && chain.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleRespond(true)}
                disabled={loading}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 disabled:opacity-50"
              >
                ✅ قبول
              </button>
              <button
                onClick={() => handleRespond(false)}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 disabled:opacity-50"
              >
                ❌ رفض
              </button>
            </>
          )}
          {isCreator && chain.status === 'ACCEPTED' && allAccepted && (
            <button
              onClick={handleExecute}
              disabled={loading}
              className="flex-1 bg-gradient-to-l from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
            >
              🚀 بدء التنفيذ
            </button>
          )}
          {isCreator && ['PROPOSED', 'PENDING'].includes(chain.status) && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 disabled:opacity-50"
            >
              🚫 إلغاء
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ stats }: { stats: ChainStats }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <h3 className="font-bold text-lg mb-4 text-gray-800">📊 إحصائياتي</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-sm text-gray-500">إجمالي السلاسل</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">في الانتظار</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">مكتملة</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600">{stats.successRate}</p>
          <p className="text-sm text-gray-500">نسبة النجاح</p>
        </div>
      </div>
    </div>
  );
}

export default function BarterChainsPage() {
  const { user } = useAuth();
  const [myChains, setMyChains] = useState<BarterChain[]>([]);
  const [pendingProposals, setPendingProposals] = useState<BarterChain[]>([]);
  const [stats, setStats] = useState<ChainStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'my' | 'completed'>('pending');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [chainsResult, pendingResult, statsResult] = await Promise.all([
        getMyChains({ status: statusFilter || undefined }),
        getPendingProposals(),
        getChainStats(),
      ]);
      setMyChains(chainsResult.data?.chains || []);
      setPendingProposals(pendingResult.data?.chains || []);
      setStats(statsResult.data?.stats || null);
    } catch (error) {
      console.error('Error fetching chains:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeChains = myChains.filter(c => ['PROPOSED', 'PENDING', 'ACCEPTED', 'EXECUTING'].includes(c.status));
  const completedChains = myChains.filter(c => ['COMPLETED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(c.status));

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <span className="text-6xl mb-4 block">🔗</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">سلاسل المقايضة</h2>
          <p className="text-gray-600 mb-4">سجل دخول لعرض سلاسل المقايضة الخاصة بك</p>
          <a
            href="/auth/login"
            className="inline-block bg-gradient-to-l from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-violet-600 via-indigo-500 to-blue-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">🔗</span>
            سلاسل المقايضة الذكية
          </h1>
          <p className="text-xl text-white/90">بادل منتجاتك مع عدة أطراف في سلسلة واحدة!</p>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 -mt-6">
          <StatsCard stats={stats} />
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-2">
        <div className="flex flex-wrap gap-2 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-lg font-bold transition-all relative ${
              tab === 'pending'
                ? 'bg-gradient-to-l from-indigo-500 to-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⏳ عروض واردة
            {pendingProposals.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingProposals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab('my')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              tab === 'my'
                ? 'bg-gradient-to-l from-indigo-500 to-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔄 سلاسلي النشطة
          </button>
          <button
            onClick={() => setTab('completed')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              tab === 'completed'
                ? 'bg-gradient-to-l from-indigo-500 to-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ✅ المكتملة
          </button>
        </div>
      </div>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'pending' && (
              pendingProposals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingProposals.map((chain) => (
                    <ChainCard key={chain.id} chain={chain} userId={user.id} onAction={fetchData} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <span className="text-6xl mb-4 block">📭</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد عروض واردة</h3>
                  <p className="text-gray-500">ستظهر هنا عروض سلاسل المقايضة الجديدة</p>
                </div>
              )
            )}

            {tab === 'my' && (
              activeChains.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeChains.map((chain) => (
                    <ChainCard key={chain.id} chain={chain} userId={user.id} onAction={fetchData} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <span className="text-6xl mb-4 block">🔗</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد سلاسل نشطة</h3>
                  <p className="text-gray-500">يمكنك اكتشاف فرص مقايضة من صفحة منتجاتك</p>
                </div>
              )
            )}

            {tab === 'completed' && (
              completedChains.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedChains.map((chain) => (
                    <ChainCard key={chain.id} chain={chain} userId={user.id} onAction={fetchData} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <span className="text-6xl mb-4 block">📋</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد سلاسل مكتملة</h3>
                  <p className="text-gray-500">ستظهر هنا سلاسلك المكتملة والمرفوضة</p>
                </div>
              )
            )}
          </>
        )}
      </section>

      {/* How it Works */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">كيف تعمل سلاسل المقايضة؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🔍', title: 'اكتشف الفرص', desc: 'النظام يبحث عن مقايضات متعددة الأطراف' },
              { icon: '📨', title: 'أرسل عرضاً', desc: 'اقترح سلسلة مقايضة للآخرين' },
              { icon: '✅', title: 'الموافقات', desc: 'كل المشاركين يوافقون على السلسلة' },
              { icon: '🎉', title: 'التنفيذ', desc: 'تبادل المنتجات في وقت واحد' },
            ].map((step, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  {step.icon}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Chain Types */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">أنواع السلاسل</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">🔄</span>
                <h3 className="font-bold text-xl">سلسلة دائرية (Cycle)</h3>
              </div>
              <p className="text-gray-600 mb-4">
                كل مشارك يعطي منتجه للمشارك التالي ويستلم من السابق، في دورة مغلقة.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">أحمد</span>
                <span>→</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">محمد</span>
                <span>→</span>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">علي</span>
                <span>→</span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">أحمد</span>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">➡️</span>
                <h3 className="font-bold text-xl">سلسلة خطية (Linear)</h3>
              </div>
              <p className="text-gray-600 mb-4">
                سلسلة مقايضات متتالية تنتهي عند آخر مشارك، مع تعويضات نقدية للفروقات.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">أحمد</span>
                <span>→</span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">محمد</span>
                <span>→</span>
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">علي</span>
                <span>→</span>
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">سارة</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
