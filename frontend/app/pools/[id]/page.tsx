'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getPoolById,
  joinPool,
  leavePool,
  startMatching,
  cancelPool,
  approveParticipant,
  rejectParticipant,
  BarterPool,
} from '@/lib/api/barter-pools';

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string; bg: string }> = {
  OPEN: { label: 'مفتوح للانضمام', color: 'text-green-700', icon: '🟢', bg: 'bg-green-100' },
  MATCHING: { label: 'جاري المطابقة', color: 'text-blue-700', icon: '🔄', bg: 'bg-blue-100' },
  MATCHED: { label: 'تم المطابقة', color: 'text-purple-700', icon: '🎯', bg: 'bg-purple-100' },
  NEGOTIATING: { label: 'جاري التفاوض', color: 'text-yellow-700', icon: '🤝', bg: 'bg-yellow-100' },
  EXECUTING: { label: 'جاري التنفيذ', color: 'text-indigo-700', icon: '⚡', bg: 'bg-indigo-100' },
  COMPLETED: { label: 'مكتمل', color: 'text-green-700', icon: '✅', bg: 'bg-green-100' },
  FAILED: { label: 'فشل', color: 'text-red-700', icon: '❌', bg: 'bg-red-100' },
  CANCELLED: { label: 'ملغي', color: 'text-gray-500', icon: '🚫', bg: 'bg-gray-100' },
};

export default function PoolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poolId = params.id as string;
  const { user } = useAuth();

  const [pool, setPool] = useState<BarterPool | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [contribution, setContribution] = useState({ cashAmount: 0 });

  useEffect(() => {
    loadPool();
  }, [poolId]);

  const loadPool = async () => {
    try {
      setLoading(true);
      const response = await getPoolById(poolId);
      setPool(response.data?.pool || response.data);
    } catch (err: any) {
      console.error('Error loading pool:', err);
      setError(err.response?.data?.message || 'فشل في تحميل الصندوق');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, participantId?: string) => {
    setActionLoading(action + (participantId || ''));
    try {
      switch (action) {
        case 'join':
          if (contribution.cashAmount > 0) {
            await joinPool(poolId, { cashAmount: contribution.cashAmount });
            alert('تم إرسال طلب الانضمام بنجاح! في انتظار موافقة المنشئ.');
            setShowJoinModal(false);
          }
          break;
        case 'leave':
          if (confirm('هل أنت متأكد من مغادرة الصندوق؟')) {
            await leavePool(poolId);
            alert('تم مغادرة الصندوق');
          }
          break;
        case 'start':
          if (confirm('هل أنت متأكد من بدء عملية المطابقة؟')) {
            await startMatching(poolId);
            alert('تم بدء عملية المطابقة!');
          }
          break;
        case 'cancel':
          if (confirm('هل أنت متأكد من إلغاء الصندوق؟ لا يمكن التراجع عن هذا الإجراء.')) {
            await cancelPool(poolId);
            alert('تم إلغاء الصندوق');
          }
          break;
        case 'approve':
          if (participantId) {
            await approveParticipant(poolId, participantId);
            alert('تم قبول المشارك');
          }
          break;
        case 'reject':
          if (participantId) {
            await rejectParticipant(poolId, participantId);
            alert('تم رفض المشارك');
          }
          break;
      }
      await loadPool();
    } catch (err: any) {
      alert(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">جاري تحميل الصندوق...</p>
        </div>
      </div>
    );
  }

  if (error || !pool) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-red-600 mb-6">{error || 'الصندوق غير موجود'}</p>
          <Link
            href="/pools"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
          >
            <span>←</span>
            العودة للصناديق
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = pool.creatorId === user?.id;
  const isParticipant = pool.participants?.some(p => p.userId === user?.id);
  const statusInfo = STATUS_LABELS[pool.status] || STATUS_LABELS.OPEN;
  const progress = (pool.currentValue / pool.targetMinValue) * 100;
  const daysLeft = Math.ceil((new Date(pool.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const approvedParticipants = pool.participants?.filter(p => p.status === 'APPROVED') || [];
  const pendingParticipants = pool.participants?.filter(p => p.status === 'PENDING') || [];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-600 via-green-600 to-teal-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-8">
          <Link
            href="/pools"
            className="text-emerald-200 hover:text-white flex items-center gap-2 mb-4 w-fit transition"
          >
            → العودة للصناديق
          </Link>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl shadow-xl">
                🤝
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{pool.title}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-4 py-2 rounded-full font-bold ${statusInfo.bg} ${statusInfo.color}`}>
                    {statusInfo.icon} {statusInfo.label}
                  </span>
                  {daysLeft > 0 && pool.status === 'OPEN' && (
                    <span className="px-4 py-2 bg-white/20 rounded-full">
                      ⏰ {daysLeft} يوم متبقي
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">📋</span>
                وصف الصندوق
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{pool.description}</p>
            </div>

            {/* Target */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">🎯</span>
                الهدف المطلوب
              </h2>
              <div className="bg-purple-50 rounded-xl p-4 mb-4">
                <p className="text-purple-900 font-medium">{pool.targetDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">الحد الأدنى</p>
                  <p className="text-xl font-bold text-gray-900">{pool.targetMinValue.toLocaleString('ar-EG')} ج.م</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">الحد الأقصى</p>
                  <p className="text-xl font-bold text-gray-900">{pool.targetMaxValue.toLocaleString('ar-EG')} ج.م</p>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">📊</span>
                التقدم
              </h2>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">القيمة الحالية: {pool.currentValue.toLocaleString('ar-EG')} ج.م</span>
                  <span className="font-bold text-emerald-600">{Math.round(progress)}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-emerald-600 mb-1">المشاركون</p>
                  <p className="text-2xl font-bold text-emerald-700">{pool.participantCount}/{pool.maxParticipants}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-600 mb-1">الحد الأدنى للمشاركين</p>
                  <p className="text-2xl font-bold text-blue-700">{pool.minParticipants}</p>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">👥</span>
                المشاركون ({approvedParticipants.length})
              </h2>
              {approvedParticipants.length > 0 ? (
                <div className="space-y-3">
                  {approvedParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                          {participant.user?.fullName?.charAt(0) || '👤'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {participant.user?.fullName || 'مستخدم'}
                            {participant.userId === pool.creatorId && (
                              <span className="mr-2 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">المنشئ</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            مساهمة: {participant.contribution?.cashAmount?.toLocaleString('ar-EG') || 0} ج.م
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        معتمد
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <span className="text-4xl block mb-2">👥</span>
                  <p className="text-gray-500">لا يوجد مشاركون معتمدون بعد</p>
                </div>
              )}
            </div>

            {/* Pending Participants (for creator) */}
            {isCreator && pendingParticipants.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-orange-200">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">⏳</span>
                  طلبات الانضمام ({pendingParticipants.length})
                </h2>
                <div className="space-y-3">
                  {pendingParticipants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                          {participant.user?.fullName?.charAt(0) || '👤'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{participant.user?.fullName || 'مستخدم'}</p>
                          <p className="text-sm text-gray-500">
                            يريد المساهمة بـ: {participant.contribution?.cashAmount?.toLocaleString('ar-EG') || 0} ج.م
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction('approve', participant.id)}
                          disabled={actionLoading === 'approve' + participant.id}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 disabled:opacity-50"
                        >
                          {actionLoading === 'approve' + participant.id ? '...' : '✓ قبول'}
                        </button>
                        <button
                          onClick={() => handleAction('reject', participant.id)}
                          disabled={actionLoading === 'reject' + participant.id}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:opacity-50"
                        >
                          {actionLoading === 'reject' + participant.id ? '...' : '✕ رفض'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4">الإجراءات</h3>
              <div className="space-y-3">
                {/* Join Button */}
                {user && !isParticipant && pool.status === 'OPEN' && (
                  <button
                    onClick={() => setShowJoinModal(true)}
                    className="w-full py-4 bg-gradient-to-l from-emerald-500 to-green-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-600 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <span className="text-xl">🤝</span>
                    انضم للصندوق
                  </button>
                )}

                {/* Leave Button */}
                {isParticipant && !isCreator && pool.status === 'OPEN' && (
                  <button
                    onClick={() => handleAction('leave')}
                    disabled={actionLoading === 'leave'}
                    className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'leave' ? (
                      <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-gray-600 border-t-transparent"></span>
                    ) : (
                      <>
                        <span>🚪</span>
                        مغادرة الصندوق
                      </>
                    )}
                  </button>
                )}

                {/* Start Matching Button */}
                {isCreator && pool.status === 'OPEN' && pool.participantCount >= pool.minParticipants && (
                  <button
                    onClick={() => handleAction('start')}
                    disabled={actionLoading === 'start'}
                    className="w-full py-4 bg-gradient-to-l from-blue-500 to-indigo-500 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    {actionLoading === 'start' ? (
                      <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                    ) : (
                      <>
                        <span className="text-xl">🚀</span>
                        بدء المطابقة
                      </>
                    )}
                  </button>
                )}

                {/* Cancel Button */}
                {isCreator && pool.status === 'OPEN' && (
                  <button
                    onClick={() => handleAction('cancel')}
                    disabled={actionLoading === 'cancel'}
                    className="w-full py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {actionLoading === 'cancel' ? (
                      <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent"></span>
                    ) : (
                      <>
                        <span>❌</span>
                        إلغاء الصندوق
                      </>
                    )}
                  </button>
                )}

                {/* Login Prompt */}
                {!user && (
                  <Link
                    href="/login"
                    className="block w-full text-center py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                  >
                    سجل دخولك للانضمام
                  </Link>
                )}

                {/* Status Messages */}
                {pool.status === 'COMPLETED' && (
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <span className="text-3xl block mb-2">✅</span>
                    <p className="text-green-700 font-bold">تم إكمال هذا الصندوق بنجاح!</p>
                  </div>
                )}

                {pool.status === 'CANCELLED' && (
                  <div className="p-4 bg-gray-100 rounded-xl text-center">
                    <span className="text-3xl block mb-2">🚫</span>
                    <p className="text-gray-600 font-bold">تم إلغاء هذا الصندوق</p>
                  </div>
                )}

                {pool.status === 'MATCHING' && (
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <span className="text-3xl block mb-2 animate-spin">🔄</span>
                    <p className="text-blue-700 font-bold">جاري البحث عن منتج مناسب...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
              <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                <span>💡</span>
                كيف يعمل؟
              </h3>
              <ul className="space-y-3 text-sm text-emerald-800">
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                  انضم للصندوق بمساهمتك
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                  عند اكتمال القيمة، يبدأ البحث عن منتج
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                  يتم توزيع المنتج حسب نسب المساهمة
                </li>
              </ul>
            </div>

            {/* Deadline */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-3">معلومات إضافية</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">تاريخ الإنشاء</span>
                  <span className="font-medium">
                    {new Date(pool.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الموعد النهائي</span>
                  <span className="font-medium">
                    {new Date(pool.deadline).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {pool.creator && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">المنشئ</span>
                    <span className="font-medium">{pool.creator.fullName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-l from-emerald-500 to-green-500 text-white p-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span>🤝</span>
                الانضمام للصندوق
              </h3>
              <p className="text-emerald-100 mt-1">{pool.title}</p>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block font-bold text-gray-700 mb-2">قيمة مساهمتك (ج.م)</label>
                <input
                  type="number"
                  value={contribution.cashAmount}
                  onChange={(e) => setContribution({ cashAmount: Number(e.target.value) })}
                  placeholder="أدخل المبلغ"
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-sm text-gray-500 mt-2">
                  القيمة المطلوبة: {pool.targetMinValue.toLocaleString('ar-EG')} - {pool.targetMaxValue.toLocaleString('ar-EG')} ج.م
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction('join')}
                  disabled={actionLoading === 'join' || contribution.cashAmount <= 0}
                  className="flex-1 py-3 bg-gradient-to-l from-emerald-500 to-green-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 transition"
                >
                  {actionLoading === 'join' ? 'جاري الإرسال...' : 'تأكيد الانضمام'}
                </button>
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
