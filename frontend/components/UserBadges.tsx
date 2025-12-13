'use client';

import React, { useState, useEffect } from 'react';
import {
  getMyBadges,
  getUserBadges,
  checkMyBadges,
  getAllBadgesInfo,
  submitVerificationRequest,
  getBadgeDisplay,
  UserBadge,
  BadgeInfo,
} from '@/lib/api/badges';
import { useAuth } from '@/lib/contexts/AuthContext';

// ============================================
// User Badges Display Component
// مكون عرض شارات المستخدم
// ============================================

interface UserBadgesProps {
  userId?: string; // If not provided, shows current user's badges
  showAll?: boolean; // Show all available badges with progress
  compact?: boolean; // Compact display mode
}

export default function UserBadges({ userId, showAll = false, compact = false }: UserBadgesProps) {
  const { user, isAuthenticated } = useAuth();
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [newBadges, setNewBadges] = useState<UserBadge[]>([]);

  const isOwnProfile = !userId || userId === user?.id;

  useEffect(() => {
    loadBadges();
    if (showAll) {
      loadAllBadges();
    }
  }, [userId]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const response = isOwnProfile && isAuthenticated
        ? await getMyBadges()
        : userId
          ? await getUserBadges(userId)
          : { data: { badges: [] } };
      setBadges(response.data.badges);
    } catch (err) {
      // Silently fail - badges are optional
    } finally {
      setLoading(false);
    }
  };

  const loadAllBadges = async () => {
    try {
      const response = await getAllBadgesInfo();
      setAllBadges(response.data.badges);
    } catch (err) {
      // Silently fail
    }
  };

  const handleCheckBadges = async () => {
    if (!isAuthenticated) return;

    try {
      setChecking(true);
      const response = await checkMyBadges();
      if (response.data.awardedBadges.length > 0) {
        setNewBadges(response.data.awardedBadges);
        loadBadges();
      }
    } catch (err) {
      // Silently fail
    } finally {
      setChecking(false);
    }
  };

  const earnedBadgeTypes = badges.map((b) => b.badgeType);

  if (loading) {
    return (
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        ))}
      </div>
    );
  }

  // Compact mode - just show badge icons
  if (compact) {
    if (badges.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1">
        {badges.slice(0, 5).map((badge) => {
          const display = getBadgeDisplay(badge.badgeType);
          return (
            <span
              key={badge.id}
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm ${display.bgColor}`}
              title={badge.info?.nameAr || badge.badgeType}
            >
              {display.icon}
            </span>
          );
        })}
        {badges.length > 5 && (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs">
            +{badges.length - 5}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          🏅 الشارات
          {badges.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({badges.length})
            </span>
          )}
        </h3>
        {isOwnProfile && isAuthenticated && (
          <button
            onClick={handleCheckBadges}
            disabled={checking}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50"
          >
            {checking ? '⏳ جاري التحقق...' : '🔄 تحقق من الشارات'}
          </button>
        )}
      </div>

      {/* New Badges Alert */}
      {newBadges.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
          <p className="font-medium text-green-800 mb-2">🎉 تهانينا! حصلت على شارات جديدة:</p>
          <div className="flex flex-wrap gap-2">
            {newBadges.map((badge) => {
              const display = getBadgeDisplay(badge.badgeType);
              return (
                <span
                  key={badge.id}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${display.bgColor} ${display.textColor}`}
                >
                  {display.icon} {badge.info?.nameAr}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Earned Badges */}
      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => {
            const display = getBadgeDisplay(badge.badgeType);
            return (
              <div
                key={badge.id}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${display.bgColor}`}
                title={badge.info?.description}
              >
                <span className="text-xl">{display.icon}</span>
                <div>
                  <p className={`font-medium text-sm ${display.textColor}`}>
                    {badge.info?.nameAr}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(badge.earnedAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">لا توجد شارات بعد</p>
      )}

      {/* All Available Badges (Progress) */}
      {showAll && allBadges.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-700 mb-4">جميع الشارات المتاحة</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allBadges.map((badgeInfo) => {
              const isEarned = earnedBadgeTypes.includes(badgeInfo.type);
              const display = getBadgeDisplay(badgeInfo.type);

              return (
                <div
                  key={badgeInfo.type}
                  className={`p-4 rounded-xl border-2 ${
                    isEarned
                      ? `${display.bgColor} border-transparent`
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-3xl ${isEarned ? '' : 'opacity-40 grayscale'}`}>
                      {display.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${isEarned ? display.textColor : 'text-gray-500'}`}>
                          {badgeInfo.nameAr}
                        </p>
                        {isEarned && (
                          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            ✓ مُكتسب
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{badgeInfo.description}</p>
                      {!isEarned && badgeInfo.requirements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-400 mb-1">المتطلبات:</p>
                          <ul className="text-xs text-gray-500 space-y-0.5">
                            {badgeInfo.requirements.map((req, i) => (
                              <li key={i}>• {req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// Badge Verification Request Component
// مكون طلب التحقق للحصول على شارة
// ============================================

interface BadgeVerificationProps {
  badgeType: 'ID_VERIFIED' | 'ADDRESS_VERIFIED' | 'BUSINESS_VERIFIED';
  onSuccess?: () => void;
}

export function BadgeVerificationRequest({ badgeType, onSuccess }: BadgeVerificationProps) {
  const [documents, setDocuments] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const badgeNames = {
    ID_VERIFIED: 'توثيق الهوية',
    ADDRESS_VERIFIED: 'توثيق العنوان',
    BUSINESS_VERIFIED: 'توثيق النشاط التجاري',
  };

  const badgeRequirements = {
    ID_VERIFIED: ['صورة البطاقة الشخصية (الوجهين)'],
    ADDRESS_VERIFIED: ['فاتورة مرافق حديثة (كهرباء/غاز/مياه)'],
    BUSINESS_VERIFIED: ['صورة السجل التجاري', 'صورة البطاقة الضريبية'],
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      await submitVerificationRequest({
        badgeType,
        documents,
      });

      setSuccess(true);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-50 rounded-xl text-center">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-700 font-medium">تم إرسال طلبك بنجاح!</p>
        <p className="text-green-600 text-sm">سيتم مراجعته خلال 24-48 ساعة</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl border border-gray-200">
      <h4 className="font-medium text-gray-900 mb-3">
        طلب {badgeNames[badgeType]}
      </h4>

      {error && (
        <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">المستندات المطلوبة:</p>
        <ul className="text-sm text-gray-500 space-y-1">
          {badgeRequirements[badgeType].map((req, i) => (
            <li key={i}>• {req}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-700 mb-2">
          روابط المستندات (من منصة رفع ملفات)
        </label>
        <input
          type="text"
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          onChange={(e) => setDocuments([e.target.value])}
        />
        <p className="text-xs text-gray-400 mt-1">
          يمكنك استخدام Google Drive أو Dropbox لرفع المستندات
        </p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || documents.length === 0}
        className="w-full py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition disabled:opacity-50"
      >
        {submitting ? '⏳ جاري الإرسال...' : '📤 إرسال الطلب'}
      </button>
    </div>
  );
}
