'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getOpenPools,
  getMyPools,
  joinPool,
  leavePool,
  startMatching,
  cancelPool,
  BarterPool,
} from '@/lib/api/barter-pools';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  OPEN: { label: 'مفتوح للانضمام', color: 'bg-green-100 text-green-700', icon: '🟢' },
  MATCHING: { label: 'جاري المطابقة', color: 'bg-blue-100 text-blue-700', icon: '🔄' },
  MATCHED: { label: 'تم المطابقة', color: 'bg-purple-100 text-purple-700', icon: '🎯' },
  NEGOTIATING: { label: 'جاري التفاوض', color: 'bg-yellow-100 text-yellow-700', icon: '🤝' },
  EXECUTING: { label: 'جاري التنفيذ', color: 'bg-indigo-100 text-indigo-700', icon: '⚡' },
  COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-700', icon: '✅' },
  FAILED: { label: 'فشل', color: 'bg-red-100 text-red-700', icon: '❌' },
  CANCELLED: { label: 'ملغي', color: 'bg-gray-100 text-gray-500', icon: '🚫' },
};

function PoolCard({
  pool,
  userId,
  onAction,
}: {
  pool: BarterPool;
  userId?: string;
  onAction: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [contribution, setContribution] = useState({ cashAmount: 0 });

  const isCreator = pool.creatorId === userId;
  const isParticipant = pool.participants?.some(p => p.userId === userId);
  const statusInfo = STATUS_LABELS[pool.status] || STATUS_LABELS.OPEN;
  const progress = (pool.currentValue / pool.targetMinValue) * 100;
  const daysLeft = Math.ceil((new Date(pool.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      switch (action) {
        case 'join':
          if (contribution.cashAmount > 0) {
            await joinPool(pool.id, { cashAmount: contribution.cashAmount });
            alert('تم الانضمام للصندوق بنجاح! في انتظار موافقة المنشئ.');
            setShowJoinModal(false);
          }
          break;
        case 'leave':
          if (confirm('هل أنت متأكد من مغادرة الصندوق؟')) {
            await leavePool(pool.id);
            alert('تم مغادرة الصندوق');
          }
          break;
        case 'start':
          await startMatching(pool.id);
          alert('تم بدء عملية المطابقة!');
          break;
        case 'cancel':
          if (confirm('هل أنت متأكد من إلغاء الصندوق؟')) {
            await cancelPool(pool.id);
            alert('تم إلغاء الصندوق');
          }
          break;
      }
      onAction();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
        <div className={`px-4 py-3 flex items-center justify-between ${statusInfo.color}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{statusInfo.icon}</span>
            <span className="font-bold">{statusInfo.label}</span>
          </div>
          {daysLeft > 0 && (
            <span className="text-sm opacity-75">
              ⏰ {daysLeft} يوم متبقي
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg text-gray-800 mb-2">{pool.title}</h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">{pool.description}</p>

          {/* Target */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-gray-600 mb-1">الهدف: {pool.targetDescription}</p>
            <div className="flex justify-between text-sm">
              <span>القيمة المطلوبة: {pool.targetMinValue.toLocaleString('ar-EG')} - {pool.targetMaxValue.toLocaleString('ar-EG')} ج.م</span>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>القيمة الحالية: {pool.currentValue.toLocaleString('ar-EG')} ج.م</span>
              <span>{pool.participantCount}/{pool.maxParticipants} مشارك</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-green-500 to-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">{Math.round(progress)}% من الحد الأدنى</p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {userId && !isParticipant && pool.status === 'OPEN' && (
              <button
                onClick={() => setShowJoinModal(true)}
                disabled={loading}
                className="flex-1 bg-gradient-to-l from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
              >
                🤝 انضم للصندوق
              </button>
            )}
            {isParticipant && !isCreator && pool.status === 'OPEN' && (
              <button
                onClick={() => handleAction('leave')}
                disabled={loading}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 disabled:opacity-50"
              >
                🚪 مغادرة
              </button>
            )}
            {isCreator && pool.status === 'OPEN' && pool.participantCount >= 2 && (
              <button
                onClick={() => handleAction('start')}
                disabled={loading}
                className="flex-1 bg-gradient-to-l from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-bold hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50"
              >
                🚀 بدء المطابقة
              </button>
            )}
            {isCreator && pool.status === 'OPEN' && (
              <button
                onClick={() => handleAction('cancel')}
                disabled={loading}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 disabled:opacity-50"
              >
                ❌ إلغاء
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">الانضمام للصندوق</h3>
            <p className="text-gray-600 mb-4">أدخل قيمة مساهمتك في الصندوق:</p>
            <input
              type="number"
              value={contribution.cashAmount}
              onChange={(e) => setContribution({ cashAmount: Number(e.target.value) })}
              placeholder="المبلغ بالجنيه"
              className="w-full border rounded-lg px-4 py-3 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleAction('join')}
                disabled={loading || contribution.cashAmount <= 0}
                className="flex-1 bg-green-500 text-white py-3 rounded-lg font-bold disabled:opacity-50"
              >
                {loading ? 'جاري...' : 'تأكيد الانضمام'}
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="px-6 py-3 bg-gray-200 rounded-lg font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PoolsPage() {
  const { user } = useAuth();
  const [openPools, setOpenPools] = useState<BarterPool[]>([]);
  const [myPools, setMyPools] = useState<BarterPool[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'open' | 'my'>('open');

  useEffect(() => {
    fetchPools();
  }, [user]);

  const fetchPools = async () => {
    try {
      setLoading(true);
      const openResult = await getOpenPools();
      setOpenPools(openResult.data?.pools || []);

      if (user) {
        const myResult = await getMyPools();
        setMyPools(myResult.data?.pools || []);
      }
    } catch (error) {
      console.error('Error fetching pools:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-emerald-600 via-green-500 to-teal-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">🤝</span>
            صناديق المقايضة الجماعية
          </h1>
          <p className="text-xl text-white/90">اجمع قيمة منتجاتك مع آخرين للحصول على منتج أكبر!</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm w-fit">
          <button
            onClick={() => setTab('open')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              tab === 'open'
                ? 'bg-gradient-to-l from-green-500 to-emerald-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🌍 الصناديق المتاحة
          </button>
          {user && (
            <button
              onClick={() => setTab('my')}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                tab === 'my'
                  ? 'bg-gradient-to-l from-green-500 to-emerald-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 صناديقي
            </button>
          )}
        </div>
      </div>

      {/* Pools */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'open' && (
              openPools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {openPools.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} userId={user?.id} onAction={fetchPools} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <span className="text-6xl mb-4 block">📭</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد صناديق متاحة حالياً</h3>
                  <p className="text-gray-500">كن أول من ينشئ صندوق مقايضة جماعية!</p>
                </div>
              )
            )}
            {tab === 'my' && (
              myPools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myPools.map((pool) => (
                    <PoolCard key={pool.id} pool={pool} userId={user?.id} onAction={fetchPools} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <span className="text-6xl mb-4 block">📭</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">لم تنضم لأي صندوق بعد</h3>
                  <p className="text-gray-500">تصفح الصناديق المتاحة وانضم لأحدها</p>
                </div>
              )
            )}
          </>
        )}
      </section>

      {/* How it Works */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">كيف تعمل صناديق المقايضة الجماعية؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '📦', title: 'أنشئ أو انضم', desc: 'أنشئ صندوق جديد أو انضم لصندوق موجود' },
              { icon: '🤝', title: 'اجمع القيمة', desc: 'كل مشارك يساهم بمنتج أو مبلغ' },
              { icon: '🎯', title: 'المطابقة', desc: 'النظام يبحث عن منتج يناسب القيمة' },
              { icon: '🎉', title: 'التوزيع', desc: 'توزيع المنتج حسب نسب المساهمة' },
            ].map((step, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  {step.icon}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
