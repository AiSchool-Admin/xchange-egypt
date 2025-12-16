'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { getDisputeDetails, respondToDispute, AuctionDispute, DisputeStatus } from '@/lib/api/auctions';
import { useAuth } from '@/lib/contexts/AuthContext';

const statusLabels: Record<DisputeStatus, { label: string; color: string }> = {
  OPEN: { label: 'مفتوح', color: 'bg-yellow-100 text-yellow-800' },
  IN_REVIEW: { label: 'قيد المراجعة', color: 'bg-blue-100 text-blue-800' },
  RESOLVED: { label: 'تم الحل', color: 'bg-green-100 text-green-800' },
  ESCALATED: { label: 'مُصعّد', color: 'bg-red-100 text-red-800' },
  CLOSED: { label: 'مغلق', color: 'bg-gray-100 text-gray-800' },
};

const disputeTypeLabels: Record<string, string> = {
  NON_PAYMENT: 'عدم الدفع',
  ITEM_NOT_AS_DESCRIBED: 'المنتج مختلف عن الوصف',
  ITEM_NOT_RECEIVED: 'لم يصل المنتج',
  UNAUTHORIZED_BID: 'مزايدة غير مصرح بها',
  SHILL_BIDDING: 'مزايدة وهمية',
  OTHER: 'أخرى',
};

export default function DisputeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [dispute, setDispute] = useState<AuctionDispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const disputeId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && disputeId) {
      loadDispute();
    }
  }, [user, disputeId]);

  const loadDispute = async () => {
    try {
      setLoading(true);
      const response = await getDisputeDetails(disputeId);
      setDispute(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل تفاصيل النزاع');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await respondToDispute(disputeId, message);
      setMessage('');
      await loadDispute();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600">{error || 'النزاع غير موجود'}</p>
          <Link href="/auctions/disputes" className="mt-4 text-purple-600 hover:text-purple-700 block">
            العودة للنزاعات
          </Link>
        </div>
      </div>
    );
  }

  const isInitiator = dispute.initiatorId === user?.id;
  const canRespond = dispute.status === 'OPEN' || dispute.status === 'IN_REVIEW';

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/auctions/disputes" className="text-purple-600 hover:text-purple-700 flex items-center gap-2">
            العودة للنزاعات
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Dispute Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {disputeTypeLabels[dispute.disputeType] || dispute.disputeType}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[dispute.status]?.color}`}>
                  {statusLabels[dispute.status]?.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">#{dispute.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">البادئ</p>
              <p className="font-medium">{dispute.initiator?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">المستجيب</p>
              <p className="font-medium">{dispute.respondent?.fullName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">تاريخ الإنشاء</p>
              <p className="font-medium">{new Date(dispute.createdAt).toLocaleString('ar-EG')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">المزاد</p>
              <Link href={`/auctions/${dispute.auctionId}`} className="text-purple-600 hover:text-purple-700 font-medium">
                عرض المزاد
              </Link>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">السبب</h3>
            <p className="text-gray-700">{dispute.reason}</p>
          </div>

          {dispute.description && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">التفاصيل</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{dispute.description}</p>
            </div>
          )}

          {dispute.resolution && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">القرار</h3>
              <p className="text-green-700">{dispute.resolution}</p>
              {dispute.resolvedAt && (
                <p className="text-sm text-green-600 mt-2">
                  تم الحل في: {new Date(dispute.resolvedAt).toLocaleString('ar-EG')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">المحادثة</h2>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {dispute.messages && dispute.messages.length > 0 ? (
              dispute.messages.map((msg) => {
                const isMine = msg.senderId === user?.id;
                const isAdmin = msg.isAdmin;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isAdmin
                          ? 'bg-purple-100 text-purple-800'
                          : isMine
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-xs font-medium mb-1">
                        {isAdmin ? 'المسؤول' : isMine ? 'أنت' : dispute.respondent?.fullName || dispute.initiator?.fullName}
                      </p>
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleString('ar-EG')}
                      </p>

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.attachments.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs underline"
                            >
                              مرفق {i + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">لا توجد رسائل بعد</p>
            )}
          </div>

          {/* Message Form */}
          {canRespond ? (
            <form onSubmit={handleSendMessage} className="border-t pt-4">
              <div className="flex gap-3">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب ردك..."
                  rows={3}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed self-end"
                >
                  {sending ? 'جاري الإرسال...' : 'إرسال'}
                </button>
              </div>
            </form>
          ) : (
            <div className="border-t pt-4">
              <p className="text-center text-gray-500">
                تم إغلاق النزاع ولا يمكن إضافة ردود جديدة
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
