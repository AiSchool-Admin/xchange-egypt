'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getAllBadgesInfo,
  getMyBadges,
  checkMyBadges,
  submitVerificationRequest,
  BadgeInfo,
  UserBadge,
  getBadgeDisplay,
} from '@/lib/api/badges';

// ============================================
// Badges Page - صفحة الشارات
// ============================================

export default function BadgesPage() {
  const { user, isAuthenticated } = useAuth();
  const [allBadges, setAllBadges] = useState<BadgeInfo[]>([]);
  const [myBadges, setMyBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadBadges();
  }, [isAuthenticated]);

  const loadBadges = async () => {
    try {
      setLoading(true);
      setError('');

      // Load all available badges
      const allResponse = await getAllBadgesInfo();
      setAllBadges(allResponse.data.badges || []);

      // Load user's badges if authenticated
      if (isAuthenticated) {
        try {
          const myResponse = await getMyBadges();
          setMyBadges(myResponse.data.badges || []);
        } catch (err) {
          // User might not have any badges yet
          setMyBadges([]);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل الشارات');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBadges = async () => {
    if (!isAuthenticated) return;

    try {
      setChecking(true);
      setError('');
      setSuccessMessage('');

      const response = await checkMyBadges();

      if (response.data.awardedBadges && response.data.awardedBadges.length > 0) {
        setSuccessMessage(`🎉 تهانينا! حصلت على ${response.data.awardedBadges.length} شارة جديدة!`);
        // Reload badges
        const myResponse = await getMyBadges();
        setMyBadges(myResponse.data.badges || []);
      } else {
        setSuccessMessage('لم تحصل على شارات جديدة. استمر في النشاط لكسب المزيد!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في التحقق من الشارات');
    } finally {
      setChecking(false);
    }
  };

  const handleRequestVerification = async (badgeType: string) => {
    if (!isAuthenticated) return;

    try {
      setSubmitting(true);
      setError('');

      await submitVerificationRequest({ badgeType });
      setSuccessMessage('تم إرسال طلب التحقق بنجاح! سنراجعه قريباً.');
      setSelectedBadge(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إرسال طلب التحقق');
    } finally {
      setSubmitting(false);
    }
  };

  const hasBadge = (badgeType: string) => {
    return myBadges.some((b) => b.badgeType === badgeType);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Default badges if API doesn't return any
  const defaultBadges: BadgeInfo[] = [
    {
      type: 'PHONE_VERIFIED',
      nameAr: 'رقم الهاتف موثق',
      nameEn: 'Phone Verified',
      description: 'تم التحقق من رقم الهاتف',
      icon: '📱',
      color: 'emerald',
      requirements: ['تأكيد رقم الهاتف عبر رسالة SMS'],
    },
    {
      type: 'EMAIL_VERIFIED',
      nameAr: 'البريد الإلكتروني موثق',
      nameEn: 'Email Verified',
      description: 'تم التحقق من البريد الإلكتروني',
      icon: '📧',
      color: 'blue',
      requirements: ['تأكيد البريد الإلكتروني عبر رابط التفعيل'],
    },
    {
      type: 'ID_VERIFIED',
      nameAr: 'الهوية موثقة',
      nameEn: 'ID Verified',
      description: 'تم التحقق من الهوية الشخصية',
      icon: '🪪',
      color: 'purple',
      requirements: ['رفع صورة البطاقة الشخصية', 'مراجعة من فريق الدعم'],
    },
    {
      type: 'TRUSTED_SELLER',
      nameAr: 'بائع موثوق',
      nameEn: 'Trusted Seller',
      description: 'بائع له سمعة ممتازة',
      icon: '⭐',
      color: 'yellow',
      requirements: ['إتمام 10 معاملات ناجحة', 'تقييم 4.5 نجوم أو أعلى'],
    },
    {
      type: 'TOP_RATED',
      nameAr: 'الأعلى تقييماً',
      nameEn: 'Top Rated',
      description: 'من أفضل البائعين على المنصة',
      icon: '🏆',
      color: 'orange',
      requirements: ['إتمام 50 معاملة ناجحة', 'تقييم 4.8 نجوم أو أعلى', 'معدل رد سريع'],
    },
    {
      type: 'FAST_RESPONDER',
      nameAr: 'سريع الرد',
      nameEn: 'Fast Responder',
      description: 'يرد على الرسائل بسرعة',
      icon: '⚡',
      color: 'teal',
      requirements: ['معدل رد أقل من ساعة واحدة', 'الرد على 90% من الرسائل'],
    },
    {
      type: 'PREMIUM_MEMBER',
      nameAr: 'عضو مميز',
      nameEn: 'Premium Member',
      description: 'عضوية مميزة مع مزايا إضافية',
      icon: '👑',
      color: 'violet',
      requirements: ['الاشتراك في العضوية المميزة'],
    },
    {
      type: 'BUSINESS_VERIFIED',
      nameAr: 'حساب تجاري موثق',
      nameEn: 'Business Verified',
      description: 'حساب تجاري رسمي موثق',
      icon: '🏢',
      color: 'indigo',
      requirements: ['رفع السجل التجاري', 'التحقق من بيانات الشركة'],
    },
  ];

  const displayBadges = allBadges.length > 0 ? allBadges : defaultBadges;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الشارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">🏅 الشارات والتحقق</h1>
              <p className="text-purple-100 mt-1">
                اكسب شارات لزيادة مصداقيتك وثقة المشترين
              </p>
            </div>
            {isAuthenticated && (
              <button
                onClick={handleCheckBadges}
                disabled={checking}
                className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition flex items-center gap-2 disabled:opacity-50"
              >
                {checking ? '⏳ جاري التحقق...' : '🔍 تحقق من الشارات الجديدة'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            {successMessage}
          </div>
        )}

        {/* My Badges Section */}
        {isAuthenticated && myBadges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">شاراتي ({myBadges.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {myBadges.map((badge) => {
                const display = getBadgeDisplay(badge.badgeType);
                const info = displayBadges.find((b) => b.type === badge.badgeType);
                return (
                  <div
                    key={badge.id}
                    className={`${display.bgColor} ${display.textColor} p-4 rounded-xl text-center`}
                  >
                    <div className="text-4xl mb-2">{display.icon}</div>
                    <p className="font-bold text-sm">{info?.nameAr || badge.badgeType}</p>
                    <p className="text-xs mt-1 opacity-75">
                      {formatDate(badge.earnedAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Login prompt */}
        {!isAuthenticated && (
          <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
            <p className="text-yellow-800 mb-4">
              قم بتسجيل الدخول لعرض شاراتك وكسب المزيد
            </p>
            <Link
              href="/login?redirect=/badges"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-xl font-medium hover:bg-yellow-600 transition"
            >
              تسجيل الدخول
            </Link>
          </div>
        )}

        {/* All Available Badges */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">جميع الشارات المتاحة</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBadges.map((badge) => {
            const earned = hasBadge(badge.type);
            const display = getBadgeDisplay(badge.type);

            return (
              <div
                key={badge.type}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition ${
                  earned ? 'border-green-400' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`p-6 ${earned ? 'bg-green-50' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                        earned ? 'bg-green-100' : display.bgColor
                      }`}
                    >
                      {earned ? '✅' : badge.icon || display.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{badge.nameAr}</h3>
                        {earned && (
                          <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                            محققة
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{badge.description}</p>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700 mb-2">المتطلبات:</p>
                    <ul className="space-y-1">
                      {badge.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className={earned ? 'text-green-500' : 'text-gray-400'}>
                            {earned ? '✓' : '○'}
                          </span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action */}
                  {!earned && isAuthenticated && (
                    <div className="mt-4">
                      {badge.type === 'ID_VERIFIED' || badge.type === 'BUSINESS_VERIFIED' ? (
                        <button
                          onClick={() => setSelectedBadge(badge)}
                          className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition"
                        >
                          طلب التحقق
                        </button>
                      ) : (
                        <p className="text-center text-sm text-gray-500">
                          حقق المتطلبات للحصول على الشارة تلقائياً
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="mt-12 p-6 bg-gradient-to-l from-purple-100 to-indigo-100 rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🎁 فوائد الشارات</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl">
              <div className="text-2xl mb-2">🔒</div>
              <h4 className="font-bold text-gray-900">زيادة الثقة</h4>
              <p className="text-sm text-gray-600">المشترون يفضلون البائعين الموثقين</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-bold text-gray-900">ظهور أفضل</h4>
              <p className="text-sm text-gray-600">منتجاتك تظهر في مراتب أعلى</p>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <div className="text-2xl mb-2">💰</div>
              <h4 className="font-bold text-gray-900">مبيعات أكثر</h4>
              <p className="text-sm text-gray-600">زيادة نسبة إتمام الصفقات</p>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Request Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              طلب شارة {selectedBadge.nameAr}
            </h3>
            <p className="text-gray-600 mb-4">
              سيتم مراجعة طلبك من قبل فريق الدعم. قد يُطلب منك تقديم مستندات إضافية.
            </p>
            <div className="bg-yellow-50 p-4 rounded-xl mb-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ تأكد من أن جميع بياناتك محدثة قبل إرسال الطلب
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedBadge(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleRequestVerification(selectedBadge.type)}
                disabled={submitting}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50"
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
