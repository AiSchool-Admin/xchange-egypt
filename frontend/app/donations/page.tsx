'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

// Charity organizations data
const CHARITIES = [
  {
    id: 'charity-1',
    name: 'مصر الخير',
    description: 'مؤسسة خيرية مصرية تهدف لمساعدة الأسر الأكثر احتياجاً',
    fullDescription: 'مؤسسة مصر الخير هي واحدة من أكبر المؤسسات الخيرية في مصر، تعمل على تقديم المساعدات للأسر المحتاجة في مجالات التعليم والصحة والغذاء.',
    logo: '🤲',
    color: 'from-green-500 to-emerald-600',
    totalDonations: 2500000,
    donorsCount: 15420,
    acceptsInKind: true,
    inKindCategories: ['ملابس', 'أثاث', 'أجهزة منزلية', 'طعام'],
    projects: [
      { name: 'كسوة الشتاء', goal: 500000, raised: 380000 },
      { name: 'إفطار صائم', goal: 300000, raised: 275000 },
    ],
    rating: 4.9,
    verified: true,
  },
  {
    id: 'charity-2',
    name: 'بنك الطعام المصري',
    description: 'إطعام الجائعين ومحاربة هدر الطعام',
    fullDescription: 'بنك الطعام المصري يهدف إلى القضاء على الجوع من خلال جمع الطعام الفائض وتوزيعه على المحتاجين.',
    logo: '🍞',
    color: 'from-amber-500 to-orange-600',
    totalDonations: 1850000,
    donorsCount: 12300,
    acceptsInKind: true,
    inKindCategories: ['طعام', 'مواد غذائية'],
    projects: [
      { name: 'وجبة دافئة', goal: 200000, raised: 185000 },
      { name: 'سلة رمضان', goal: 400000, raised: 320000 },
    ],
    rating: 4.8,
    verified: true,
  },
  {
    id: 'charity-3',
    name: 'أهل مصر',
    description: 'علاج الحروق للأطفال والكبار',
    fullDescription: 'مؤسسة أهل مصر متخصصة في علاج حالات الحروق للأطفال والكبار وتوفير العلاج المجاني.',
    logo: '❤️‍🩹',
    color: 'from-red-500 to-pink-600',
    totalDonations: 980000,
    donorsCount: 8750,
    acceptsInKind: true,
    inKindCategories: ['أدوية', 'مستلزمات طبية', 'ملابس أطفال'],
    projects: [
      { name: 'عملية جراحية', goal: 150000, raised: 142000 },
      { name: 'تأهيل نفسي', goal: 80000, raised: 65000 },
    ],
    rating: 4.9,
    verified: true,
  },
  {
    id: 'charity-4',
    name: 'رسالة',
    description: 'تنمية المجتمع ومساعدة المحتاجين',
    fullDescription: 'جمعية رسالة للأعمال الخيرية تقدم خدمات متنوعة للمحتاجين من تعليم وصحة ومساعدات مادية.',
    logo: '💝',
    color: 'from-purple-500 to-violet-600',
    totalDonations: 1250000,
    donorsCount: 9800,
    acceptsInKind: true,
    inKindCategories: ['ملابس', 'أثاث', 'كتب', 'ألعاب أطفال', 'أجهزة إلكترونية'],
    projects: [
      { name: 'دعم التعليم', goal: 250000, raised: 210000 },
      { name: 'رعاية الأيتام', goal: 350000, raised: 290000 },
    ],
    rating: 4.7,
    verified: true,
  },
  {
    id: 'charity-5',
    name: 'صناع الحياة',
    description: 'التنمية المستدامة ومحاربة الفقر',
    fullDescription: 'مؤسسة صناع الحياة تعمل على مشاريع التنمية المستدامة وتمكين الشباب.',
    logo: '🌱',
    color: 'from-teal-500 to-cyan-600',
    totalDonations: 890000,
    donorsCount: 7200,
    acceptsInKind: true,
    inKindCategories: ['أدوات زراعية', 'معدات', 'كتب'],
    projects: [
      { name: 'مشروع زراعي', goal: 180000, raised: 145000 },
      { name: 'تدريب مهني', goal: 120000, raised: 98000 },
    ],
    rating: 4.6,
    verified: true,
  },
  {
    id: 'charity-6',
    name: 'مستشفى 57357',
    description: 'علاج سرطان الأطفال مجاناً',
    fullDescription: 'مستشفى 57357 لعلاج سرطان الأطفال يقدم العلاج المجاني للأطفال المصابين بالسرطان.',
    logo: '🏥',
    color: 'from-blue-500 to-indigo-600',
    totalDonations: 3200000,
    donorsCount: 25000,
    acceptsInKind: true,
    inKindCategories: ['أدوية', 'مستلزمات طبية', 'ألعاب أطفال'],
    projects: [
      { name: 'علاج طفل', goal: 500000, raised: 485000 },
      { name: 'أجهزة طبية', goal: 1000000, raised: 750000 },
    ],
    rating: 5.0,
    verified: true,
  },
];

// Donation impact data
const IMPACT_STATS = [
  { amount: 10, impact: 'وجبة واحدة لطفل', icon: '🍽️' },
  { amount: 25, impact: 'كتب مدرسية', icon: '📚' },
  { amount: 50, impact: 'ملابس شتوية لطفل', icon: '🧥' },
  { amount: 100, impact: 'سلة غذائية لأسرة', icon: '🧺' },
  { amount: 250, impact: 'علاج طبي لمريض', icon: '💊' },
  { amount: 500, impact: 'دعم تعليم طالب لشهر', icon: '🎓' },
];

export default function DonationsPage() {
  const { user } = useAuth();
  const [selectedCharity, setSelectedCharity] = useState<typeof CHARITIES[0] | null>(null);
  const [donationType, setDonationType] = useState<'money' | 'inkind'>('money');
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [inKindDescription, setInKindDescription] = useState('');
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'verified' | 'inkind'>('all');

  const filteredCharities = CHARITIES.filter(charity => {
    if (filter === 'verified') return charity.verified;
    if (filter === 'inkind') return charity.acceptsInKind;
    return true;
  });

  const totalDonations = CHARITIES.reduce((sum, c) => sum + c.totalDonations, 0);
  const totalDonors = CHARITIES.reduce((sum, c) => sum + c.donorsCount, 0);

  const openDonationModal = (charity: typeof CHARITIES[0]) => {
    setSelectedCharity(charity);
    setShowDonationModal(true);
    setDonationType('money');
    setDonationAmount(null);
    setInKindDescription('');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-6xl mb-6 block">🤲</span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">تبرع لمن يحتاج</h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8">
              ساهم مع XChange في دعم الجمعيات الخيرية الموثوقة في مصر. كل تبرع يصنع فرقاً.
            </p>

            {/* Impact Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{(totalDonations / 1000000).toFixed(1)}M+</div>
                <div className="text-emerald-100 text-sm">إجمالي التبرعات</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{(totalDonors / 1000).toFixed(0)}K+</div>
                <div className="text-emerald-100 text-sm">متبرع</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">{CHARITIES.length}</div>
                <div className="text-emerald-100 text-sm">جمعية خيرية</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-3xl font-bold">100%</div>
                <div className="text-emerald-100 text-sm">يصل للمحتاجين</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Impact Section */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">تأثير تبرعك</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {IMPACT_STATS.map((stat, i) => (
              <div key={i} className="flex-shrink-0 bg-gray-50 rounded-xl p-4 min-w-[150px] text-center">
                <span className="text-3xl block mb-2">{stat.icon}</span>
                <div className="font-bold text-primary-600 text-lg">{stat.amount} ج.م</div>
                <div className="text-gray-500 text-sm">{stat.impact}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">الجمعيات الخيرية</h2>
          <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'verified' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              ✅ موثقة
            </button>
            <button
              onClick={() => setFilter('inkind')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'inkind' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📦 تقبل عيني
            </button>
          </div>
        </div>

        {/* Charities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharities.map((charity) => (
            <div
              key={charity.id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-gray-100"
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${charity.color} p-5 text-white`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{charity.logo}</span>
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {charity.name}
                        {charity.verified && <span className="text-sm">✅</span>}
                      </h3>
                      <p className="text-white/80 text-sm">{charity.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Stats */}
                <div className="flex justify-between text-sm mb-4">
                  <div>
                    <div className="text-gray-500 text-xs">إجمالي التبرعات</div>
                    <div className="font-bold text-gray-900">{charity.totalDonations.toLocaleString()} ج.م</div>
                  </div>
                  <div className="text-left">
                    <div className="text-gray-500 text-xs">عدد المتبرعين</div>
                    <div className="font-bold text-gray-900">{charity.donorsCount.toLocaleString()}</div>
                  </div>
                  <div className="text-left">
                    <div className="text-gray-500 text-xs">التقييم</div>
                    <div className="font-bold text-amber-500">⭐ {charity.rating}</div>
                  </div>
                </div>

                {/* Projects Progress */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">المشاريع الجارية</h4>
                  {charity.projects.slice(0, 2).map((project, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{project.name}</span>
                        <span className="text-emerald-600 font-medium">
                          {Math.round((project.raised / project.goal) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${charity.color} rounded-full`}
                          style={{ width: `${Math.min((project.raised / project.goal) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* In-Kind Categories */}
                {charity.acceptsInKind && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-2">تقبل تبرعات عينية:</div>
                    <div className="flex flex-wrap gap-1">
                      {charity.inKindCategories.slice(0, 3).map((cat, i) => (
                        <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                          {cat}
                        </span>
                      ))}
                      {charity.inKindCategories.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                          +{charity.inKindCategories.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => openDonationModal(charity)}
                    className="py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span>💝</span>
                    تبرع الآن
                  </button>
                  <Link
                    href={`/donations/${charity.id}`}
                    className="py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors text-center"
                  >
                    التفاصيل
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Donate Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">لماذا التبرع عبر XChange؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <span className="text-4xl block mb-4">🔒</span>
              <h3 className="font-bold text-gray-900 mb-2">آمن 100%</h3>
              <p className="text-gray-500 text-sm">جميع المعاملات مشفرة ومحمية</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <span className="text-4xl block mb-4">✅</span>
              <h3 className="font-bold text-gray-900 mb-2">جمعيات موثقة</h3>
              <p className="text-gray-500 text-sm">نتعاون فقط مع الجمعيات المعتمدة</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <span className="text-4xl block mb-4">📊</span>
              <h3 className="font-bold text-gray-900 mb-2">شفافية كاملة</h3>
              <p className="text-gray-500 text-sm">تتبع تبرعك ومعرفة أثره</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-2xl">
              <span className="text-4xl block mb-4">🪙</span>
              <h3 className="font-bold text-gray-900 mb-2">اكسب XCoins</h3>
              <p className="text-gray-500 text-sm">احصل على نقاط مكافآت مع كل تبرع</p>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Modal */}
      {showDonationModal && selectedCharity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDonationModal(false)}>
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${selectedCharity.color} p-6 text-white sticky top-0`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCharity.logo}</span>
                  <div>
                    <h3 className="font-bold text-xl">{selectedCharity.name}</h3>
                    <p className="text-white/80 text-sm">{selectedCharity.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDonationModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Donation Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">نوع التبرع</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDonationType('money')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-all ${
                      donationType === 'money'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-2xl">💵</span>
                    <div className="text-right">
                      <div className="font-bold">تبرع مالي</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setDonationType('inkind')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-all ${
                      donationType === 'inkind'
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-2xl">📦</span>
                    <div className="text-right">
                      <div className="font-bold">تبرع عيني</div>
                    </div>
                  </button>
                </div>
              </div>

              {donationType === 'money' ? (
                <>
                  <h4 className="font-bold text-gray-900 mb-4">اختر مبلغ التبرع</h4>
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[10, 25, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDonationAmount(amount)}
                        className={`py-3 rounded-xl font-bold transition-all ${
                          donationAmount === amount
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  <div className="mb-6">
                    <input
                      type="number"
                      placeholder="أو أدخل مبلغ آخر"
                      value={donationAmount || ''}
                      onChange={(e) => setDonationAmount(Number(e.target.value) || null)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <button
                    disabled={!donationAmount || donationAmount <= 0}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white rounded-xl font-bold text-lg"
                  >
                    💝 تبرع بـ {donationAmount || 0} ج.م
                  </button>
                </>
              ) : (
                <>
                  <h4 className="font-bold text-gray-900 mb-4">تبرع بأغراضك</h4>
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">الفئات المقبولة:</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharity.inKindCategories?.map((cat) => (
                        <span key={cat} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                  <textarea
                    placeholder="صف ما تريد التبرع به..."
                    value={inKindDescription}
                    onChange={(e) => setInKindDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none mb-4"
                  />
                  <button
                    disabled={!inKindDescription.trim()}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-xl font-bold text-lg"
                  >
                    📦 تأكيد التبرع العيني
                  </button>
                </>
              )}

              <p className="text-center text-xs text-gray-500 mt-4">
                🔒 جميع التبرعات آمنة • يتم تحويل 100% للجمعية
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
