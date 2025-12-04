'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getMyEscrows,
  fundEscrow,
  markDelivered,
  confirmReceipt,
  cancelEscrow,
  openDispute,
  Escrow,
} from '@/lib/api/escrow';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  CREATED: { label: 'تم الإنشاء', color: 'bg-gray-100 text-gray-700', icon: '📝' },
  FUNDED: { label: 'تم التمويل', color: 'bg-blue-100 text-blue-700', icon: '💰' },
  PENDING_DELIVERY: { label: 'في انتظار التسليم', color: 'bg-yellow-100 text-yellow-700', icon: '📦' },
  DELIVERED: { label: 'تم التسليم', color: 'bg-purple-100 text-purple-700', icon: '🚚' },
  INSPECTION: { label: 'فترة الفحص', color: 'bg-indigo-100 text-indigo-700', icon: '🔍' },
  RELEASED: { label: 'تم التحرير', color: 'bg-green-100 text-green-700', icon: '✅' },
  REFUNDED: { label: 'تم الاسترداد', color: 'bg-orange-100 text-orange-700', icon: '↩️' },
  DISPUTED: { label: 'نزاع مفتوح', color: 'bg-red-100 text-red-700', icon: '⚠️' },
  CANCELLED: { label: 'ملغي', color: 'bg-gray-100 text-gray-500', icon: '❌' },
  EXPIRED: { label: 'منتهي الصلاحية', color: 'bg-gray-100 text-gray-500', icon: '⏰' },
};

function EscrowCard({
  escrow,
  userId,
  onAction,
}: {
  escrow: Escrow;
  userId: string;
  onAction: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isBuyer = escrow.buyerId === userId;
  const isSeller = escrow.sellerId === userId;
  const statusInfo = STATUS_LABELS[escrow.status] || STATUS_LABELS.CREATED;

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      switch (action) {
        case 'fund':
          await fundEscrow(escrow.id);
          alert('تم تمويل الضمان بنجاح!');
          break;
        case 'deliver':
          await markDelivered(escrow.id);
          alert('تم تحديد الصنف كمسلّم!');
          break;
        case 'confirm':
          await confirmReceipt(escrow.id);
          alert('تم تأكيد الاستلام وتحرير الأموال!');
          break;
        case 'cancel':
          if (confirm('هل أنت متأكد من إلغاء الضمان؟')) {
            await cancelEscrow(escrow.id);
            alert('تم إلغاء الضمان');
          }
          break;
        case 'dispute':
          const reason = prompt('سبب النزاع:');
          if (reason) {
            await openDispute(escrow.id, { reason: 'OTHER', description: reason });
            alert('تم فتح النزاع');
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className={`px-4 py-3 flex items-center justify-between ${statusInfo.color}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{statusInfo.icon}</span>
          <span className="font-bold">{statusInfo.label}</span>
        </div>
        <span className="text-sm opacity-75">
          {isBuyer ? '🛒 مشتري' : '🏪 بائع'}
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {escrow.amount.toLocaleString('ar-EG')} {escrow.currency}
            </p>
            {escrow.xcoinAmount && (
              <p className="text-sm text-yellow-600">+ {escrow.xcoinAmount} XCoin</p>
            )}
          </div>
          <div className="text-left text-sm text-gray-500">
            <p>تنتهي: {new Date(escrow.expiresAt).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {escrow.milestones?.slice(0, 4).map((m, i) => (
            <div key={i} className="flex items-center">
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs whitespace-nowrap">
                {m.description}
              </div>
              {i < (escrow.milestones?.length || 0) - 1 && (
                <span className="mx-1 text-gray-300">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {/* Buyer Actions */}
          {isBuyer && escrow.status === 'CREATED' && (
            <button
              onClick={() => handleAction('fund')}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50"
            >
              💰 تمويل الضمان
            </button>
          )}
          {isBuyer && (escrow.status === 'DELIVERED' || escrow.status === 'INSPECTION') && (
            <button
              onClick={() => handleAction('confirm')}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 disabled:opacity-50"
            >
              ✅ تأكيد الاستلام
            </button>
          )}
          {isBuyer && ['FUNDED', 'DELIVERED', 'INSPECTION'].includes(escrow.status) && (
            <button
              onClick={() => handleAction('dispute')}
              disabled={loading}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 disabled:opacity-50"
            >
              ⚠️ فتح نزاع
            </button>
          )}

          {/* Seller Actions */}
          {isSeller && escrow.status === 'FUNDED' && (
            <button
              onClick={() => handleAction('deliver')}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-600 disabled:opacity-50"
            >
              🚚 تأكيد التسليم
            </button>
          )}

          {/* Common Actions */}
          {escrow.status === 'CREATED' && (
            <button
              onClick={() => handleAction('cancel')}
              disabled={loading}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 disabled:opacity-50"
            >
              ❌ إلغاء
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EscrowPage() {
  const { user } = useAuth();
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'BUYER' | 'SELLER'>('ALL');

  useEffect(() => {
    if (user) fetchEscrows();
  }, [user, filter]);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      const result = await getMyEscrows({ role: filter });
      setEscrows(result.data?.escrows || []);
    } catch (error) {
      console.error('Error fetching escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🔒</span>
          <h2 className="text-xl font-bold mb-2">يرجى تسجيل الدخول</h2>
          <a href="/login" className="text-blue-500 hover:underline">تسجيل الدخول</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-blue-600 via-indigo-500 to-purple-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">🔒</span>
            نظام الضمان الذكي
          </h1>
          <p className="text-xl text-white/90">حماية كاملة لمعاملاتك - أموالك في أمان حتى استلام المنتج</p>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm w-fit">
          {(['ALL', 'BUYER', 'SELLER'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg font-bold transition-all ${
                filter === f
                  ? 'bg-gradient-to-l from-blue-500 to-indigo-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'ALL' ? '📋 الكل' : f === 'BUYER' ? '🛒 كمشتري' : '🏪 كبائع'}
            </button>
          ))}
        </div>
      </div>

      {/* Escrows List */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : escrows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {escrows.map((escrow) => (
              <EscrowCard
                key={escrow.id}
                escrow={escrow}
                userId={user.id}
                onAction={fetchEscrows}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد معاملات ضمان</h3>
            <p className="text-gray-500">ستظهر هنا معاملاتك المحمية بالضمان</p>
          </div>
        )}
      </section>

      {/* How it Works */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">كيف يعمل نظام الضمان؟</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { icon: '📝', title: 'إنشاء الضمان', desc: 'يتم إنشاء ضمان للمعاملة' },
              { icon: '💰', title: 'تمويل الضمان', desc: 'المشتري يودع المبلغ' },
              { icon: '🚚', title: 'التسليم', desc: 'البائع يسلم المنتج' },
              { icon: '🔍', title: 'الفحص', desc: 'المشتري يفحص المنتج' },
              { icon: '✅', title: 'التحرير', desc: 'تحرير المبلغ للبائع' },
            ].map((step, i) => (
              <div key={i} className="text-center p-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-3xl">
                  {step.icon}
                </div>
                <h3 className="font-bold mb-1">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
