'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Review, voteReview, reportReview, ReportReason } from '@/lib/api/reviews';
import StarRating from './StarRating';
import { useAuth } from '@/lib/contexts/AuthContext';

interface ReviewCardProps {
  review: Review;
  onVoteUpdate?: (reviewId: string, helpfulCount: number, notHelpfulCount: number) => void;
  showResponseForm?: boolean;
}

export default function ReviewCard({ review, onVoteUpdate, showResponseForm = false }: ReviewCardProps) {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<boolean | null>(
    review.votes?.find(v => v.userId === user?.id)?.isHelpful ?? null
  );
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.notHelpfulCount);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('SPAM');
  const [reportDescription, setReportDescription] = useState('');
  const [reporting, setReporting] = useState(false);
  const [voting, setVoting] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleVote = async (isHelpful: boolean) => {
    if (!user || voting) return;

    setVoting(true);
    try {
      await voteReview(review.id, isHelpful);

      // Update local state
      if (userVote === isHelpful) {
        // Same vote - remove it (would need removeVote API)
        return;
      }

      if (userVote === null) {
        // New vote
        if (isHelpful) {
          setHelpfulCount(prev => prev + 1);
        } else {
          setNotHelpfulCount(prev => prev + 1);
        }
      } else {
        // Changed vote
        if (isHelpful) {
          setHelpfulCount(prev => prev + 1);
          setNotHelpfulCount(prev => Math.max(0, prev - 1));
        } else {
          setNotHelpfulCount(prev => prev + 1);
          setHelpfulCount(prev => Math.max(0, prev - 1));
        }
      }

      setUserVote(isHelpful);
      onVoteUpdate?.(review.id, helpfulCount, notHelpfulCount);
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleReport = async () => {
    if (!user || reporting) return;

    setReporting(true);
    try {
      await reportReview(review.id, reportReason, reportDescription);
      setShowReportModal(false);
      setReportDescription('');
    } catch (error) {
      console.error('Failed to report:', error);
    } finally {
      setReporting(false);
    }
  };

  const REPORT_REASONS: { value: ReportReason; label: string }[] = [
    { value: 'SPAM', label: 'بريد عشوائي' },
    { value: 'OFFENSIVE_LANGUAGE', label: 'لغة مسيئة' },
    { value: 'FAKE_REVIEW', label: 'تقييم مزيف' },
    { value: 'IRRELEVANT', label: 'غير ذي صلة' },
    { value: 'PERSONAL_INFORMATION', label: 'معلومات شخصية' },
    { value: 'OTHER', label: 'أخرى' },
  ];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/users/${review.reviewer?.id}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              {review.reviewer?.fullName?.charAt(0) || 'م'}
            </div>
          </Link>
          <div>
            <Link href={`/users/${review.reviewer?.id}`} className="font-semibold text-gray-900 hover:text-emerald-600">
              {review.reviewer?.fullName || 'مستخدم'}
            </Link>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatDate(review.createdAt)}</span>
              {review.isVerifiedPurchase && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  شراء موثق
                </span>
              )}
              {review.isEdited && (
                <span className="text-gray-400">(معدّل)</span>
              )}
            </div>
          </div>
        </div>
        <StarRating rating={review.overallRating} size="md" />
      </div>

      {/* Title */}
      {review.title && (
        <h3 className="font-bold text-gray-900 mb-2">{review.title}</h3>
      )}

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>
      )}

      {/* Images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`صورة التقييم ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
            />
          ))}
        </div>
      )}

      {/* Detailed Ratings */}
      {(review.itemAsDescribed || review.communication || review.shippingSpeed || review.packaging) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
          {review.itemAsDescribed && (
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">مطابقة الوصف</div>
              <div className="flex items-center justify-center gap-1">
                <span className="font-bold text-gray-900">{review.itemAsDescribed}</span>
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          )}
          {review.communication && (
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">التواصل</div>
              <div className="flex items-center justify-center gap-1">
                <span className="font-bold text-gray-900">{review.communication}</span>
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          )}
          {review.shippingSpeed && (
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">سرعة الشحن</div>
              <div className="flex items-center justify-center gap-1">
                <span className="font-bold text-gray-900">{review.shippingSpeed}</span>
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          )}
          {review.packaging && (
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">التغليف</div>
              <div className="flex items-center justify-center gap-1">
                <span className="font-bold text-gray-900">{review.packaging}</span>
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Response */}
      {review.response && (
        <div className="bg-emerald-50 rounded-lg p-4 mb-4 border-r-4 border-emerald-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-700 font-semibold">رد البائع</span>
            <span className="text-xs text-gray-500">{formatDate(review.response.createdAt)}</span>
          </div>
          <p className="text-gray-700">{review.response.message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">هل كان هذا التقييم مفيداً؟</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote(true)}
              disabled={voting || !user}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ${
                userVote === true
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>{helpfulCount}</span>
            </button>
            <button
              onClick={() => handleVote(false)}
              disabled={voting || !user}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition ${
                userVote === false
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>{notHelpfulCount}</span>
            </button>
          </div>
        </div>

        {user && (
          <button
            onClick={() => setShowReportModal(true)}
            className="text-sm text-gray-500 hover:text-red-500 transition"
          >
            الإبلاغ
          </button>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">الإبلاغ عن التقييم</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">سبب الإبلاغ</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as ReportReason)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {REPORT_REASONS.map(reason => (
                  <option key={reason.value} value={reason.value}>{reason.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">تفاصيل إضافية (اختياري)</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                placeholder="اشرح سبب الإبلاغ..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleReport}
                disabled={reporting}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition disabled:opacity-50"
              >
                {reporting ? 'جاري الإبلاغ...' : 'إبلاغ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
