'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMyVerification, getLevelRequirements, submitVerification, LevelRequirements, VerificationLevel } from '@/lib/api/verification';

const LEVEL_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  UNVERIFIED: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', icon: '❓' },
  BASIC: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', icon: '👤' },
  VERIFIED: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200', icon: '✅' },
  BUSINESS: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', icon: '💼' },
  PREMIUM: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', icon: '⭐' },
  TRUSTED: { bg: 'bg-gradient-to-br from-amber-100 to-yellow-100', text: 'text-amber-700', border: 'border-amber-300', icon: '🏆' },
};

function LevelCard({
  level,
  isCurrent,
  isNext,
  onSelect,
}: {
  level: LevelRequirements;
  isCurrent: boolean;
  isNext: boolean;
  onSelect: () => void;
}) {
  const colors = LEVEL_COLORS[level.level] || LEVEL_COLORS.UNVERIFIED;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${
        isCurrent ? 'ring-2 ring-emerald-400' : isNext ? 'hover:border-emerald-300 cursor-pointer' : 'opacity-60'
      } ${colors.border}`}
      onClick={isNext ? onSelect : undefined}
    >
      {/* Header */}
      <div className={`p-4 ${colors.bg}`}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{colors.icon}</span>
          <div>
            <h3 className={`text-lg font-bold ${colors.text}`}>{level.nameAr}</h3>
            {isCurrent && (
              <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                مستواك الحالي
              </span>
            )}
            {isNext && (
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                المستوى التالي
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="p-4 border-b border-gray-100">
        <div className="text-sm font-medium text-gray-700 mb-2">المتطلبات:</div>
        <ul className="space-y-1">
          {level.requirementsAr.map((req, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">&#10003;</span>
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Benefits */}
      <div className="p-4">
        <div className="text-sm font-medium text-gray-700 mb-2">المزايا:</div>
        <ul className="space-y-1">
          {level.benefitsAr.map((benefit, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-amber-500">&#11088;</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-sm text-emerald-600 font-medium">
            +{level.trustBonus}% نقاط ثقة
          </span>
        </div>
      </div>

      {/* Action */}
      {isNext && (
        <div className="p-4 bg-emerald-50">
          <button className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors">
            ترقية لهذا المستوى
          </button>
        </div>
      )}
    </div>
  );
}

function VerificationForm({
  targetLevel,
  onSubmit,
  onCancel,
}: {
  targetLevel: VerificationLevel;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [idType, setIdType] = useState<'NATIONAL_ID' | 'PASSPORT'>('NATIONAL_ID');
  const [idNumber, setIdNumber] = useState('');
  const [idFrontUrl, setIdFrontUrl] = useState('');
  const [idBackUrl, setIdBackUrl] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [commercialRegNo, setCommercialRegNo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      requestedLevel: targetLevel,
      idType,
      idNumber,
      idFrontUrl: idFrontUrl || undefined,
      idBackUrl: idBackUrl || undefined,
      selfieUrl: selfieUrl || undefined,
      businessName: businessName || undefined,
      commercialRegNo: commercialRegNo || undefined,
    });
  };

  const needsId = ['VERIFIED', 'BUSINESS', 'PREMIUM', 'TRUSTED'].includes(targetLevel);
  const needsBusiness = ['BUSINESS', 'PREMIUM', 'TRUSTED'].includes(targetLevel);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6" dir="rtl">
      <h2 className="text-xl font-bold mb-6">طلب توثيق الحساب</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {needsId && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع الهوية</label>
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value as 'NATIONAL_ID' | 'PASSPORT')}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="NATIONAL_ID">بطاقة الرقم القومي</option>
                <option value="PASSPORT">جواز السفر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية</label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="أدخل رقم الهوية"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة الهوية (أمام)</label>
                <input
                  type="url"
                  value={idFrontUrl}
                  onChange={(e) => setIdFrontUrl(e.target.value)}
                  placeholder="رابط الصورة"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة الهوية (خلف)</label>
                <input
                  type="url"
                  value={idBackUrl}
                  onChange={(e) => setIdBackUrl(e.target.value)}
                  placeholder="رابط الصورة"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">صورة سيلفي مع الهوية</label>
              <input
                type="url"
                value={selfieUrl}
                onChange={(e) => setSelfieUrl(e.target.value)}
                placeholder="رابط الصورة"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        {needsBusiness && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم النشاط التجاري</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="اسم الشركة أو المتجر"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم السجل التجاري</label>
              <input
                type="text"
                value={commercialRegNo}
                onChange={(e) => setCommercialRegNo(e.target.value)}
                placeholder="رقم السجل"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </>
        )}

        <div className="bg-amber-50 rounded-xl p-4 text-sm text-amber-800">
          <strong>ملاحظة:</strong> سيتم مراجعة طلبك خلال 1-3 أيام عمل. سنتواصل معك في حال الحاجة لأي معلومات إضافية.
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
          >
            إرسال الطلب
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  const { user } = useAuth();
  const [currentLevel, setCurrentLevel] = useState<VerificationLevel>('UNVERIFIED');
  const [levels, setLevels] = useState<LevelRequirements[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<VerificationLevel | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [verificationRes, levelsRes] = await Promise.all([
        user ? getMyVerification().catch(() => ({ success: false, data: null })) : Promise.resolve({ success: false, data: null }),
        getLevelRequirements().catch(() => ({ success: false, data: { levels: [] } })),
      ]);

      if (verificationRes.success && verificationRes.data) {
        setCurrentLevel(verificationRes.data.level);
      }
      if (levelsRes.success) {
        setLevels(levelsRes.data.levels);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLevel = (level: VerificationLevel) => {
    setSelectedLevel(level);
    setShowForm(true);
  };

  const handleSubmitVerification = async (data: any) => {
    try {
      const result = await submitVerification(data);
      if (result.success) {
        alert('تم إرسال طلب التوثيق بنجاح! سنراجعه ونتواصل معك قريباً.');
        setShowForm(false);
        fetchData();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const levelOrder: VerificationLevel[] = ['UNVERIFIED', 'BASIC', 'VERIFIED', 'BUSINESS', 'PREMIUM', 'TRUSTED'];
  const currentIndex = levelOrder.indexOf(currentLevel);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <span className="text-6xl mb-4 block">&#9989;</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">سجّل دخول لتوثيق حسابك</h2>
          <Link href="/login?redirect=/verify" className="text-emerald-600 hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-blue-600 via-indigo-500 to-purple-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-5xl">&#9989;</span> توثيق الحساب
          </h1>
          <p className="text-xl text-white/90">وثّق حسابك واحصل على ثقة أكبر من المشترين</p>
        </div>
      </section>

      {/* Current Status */}
      <section className="max-w-4xl mx-auto px-4 -mt-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${LEVEL_COLORS[currentLevel].bg}`}>
                <span>{LEVEL_COLORS[currentLevel].icon}</span>
              </div>
              <div>
                <div className="text-sm text-gray-500">مستواك الحالي</div>
                <div className={`text-2xl font-bold ${LEVEL_COLORS[currentLevel].text}`}>
                  {levels.find(l => l.level === currentLevel)?.nameAr || currentLevel}
                </div>
              </div>
            </div>
            {currentLevel !== 'TRUSTED' && (
              <div className="text-left">
                <div className="text-sm text-gray-500">المستوى التالي</div>
                <div className="text-lg font-bold text-emerald-600">
                  {levels.find(l => l.level === levelOrder[currentIndex + 1])?.nameAr || ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 pb-10">
        {showForm && selectedLevel ? (
          <VerificationForm
            targetLevel={selectedLevel}
            onSubmit={handleSubmitVerification}
            onCancel={() => setShowForm(false)}
          />
        ) : loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-20 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {levels.map((level) => {
              const levelIndex = levelOrder.indexOf(level.level);
              const isCurrent = level.level === currentLevel;
              const isNext = levelIndex === currentIndex + 1;
              return (
                <LevelCard
                  key={level.level}
                  level={level}
                  isCurrent={isCurrent}
                  isNext={isNext}
                  onSelect={() => handleSelectLevel(level.level)}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Benefits */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">لماذا توثّق حسابك؟</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#128176;
              </div>
              <h3 className="font-bold mb-2 text-lg">مبيعات أكثر</h3>
              <p className="text-gray-500">المشترون يثقون بالبائعين الموثقين أكثر</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#128270;
              </div>
              <h3 className="font-bold mb-2 text-lg">ظهور أفضل</h3>
              <p className="text-gray-500">إعلاناتك تظهر في مراتب أعلى في البحث</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#127942;
              </div>
              <h3 className="font-bold mb-2 text-lg">شارات مميزة</h3>
              <p className="text-gray-500">احصل على شارات تميّزك عن الآخرين</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
