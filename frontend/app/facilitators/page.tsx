'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getAvailableFacilitators,
  getTopFacilitators,
  getMyFacilitatorProfile,
  getMyAssignments,
  applyForFacilitator,
  toggleAvailability,
  startAssignment,
  completeAssignment,
  submitReview,
  Facilitator,
  FacilitatorAssignment,
} from '@/lib/api/facilitators';

const LEVEL_INFO: Record<string, { label: string; color: string; icon: string }> = {
  BRONZE: { label: 'برونزي', color: 'bg-orange-100 text-orange-700', icon: '🥉' },
  SILVER: { label: 'فضي', color: 'bg-gray-100 text-gray-700', icon: '🥈' },
  GOLD: { label: 'ذهبي', color: 'bg-yellow-100 text-yellow-700', icon: '🥇' },
  PLATINUM: { label: 'بلاتيني', color: 'bg-purple-100 text-purple-700', icon: '💎' },
};

const STATUS_INFO: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700' },
  ACTIVE: { label: 'نشط', color: 'bg-green-100 text-green-700' },
  SUSPENDED: { label: 'موقوف', color: 'bg-red-100 text-red-700' },
  REVOKED: { label: 'ملغي', color: 'bg-gray-100 text-gray-500' },
};

const ASSIGNMENT_STATUS: Record<string, { label: string; color: string }> = {
  ASSIGNED: { label: 'تم التعيين', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'جاري التنفيذ', color: 'bg-yellow-100 text-yellow-700' },
  COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'ملغي', color: 'bg-gray-100 text-gray-500' },
};

function FacilitatorCard({ facilitator }: { facilitator: Facilitator }) {
  const levelInfo = LEVEL_INFO[facilitator.level] || LEVEL_INFO.BRONZE;
  const successRate = facilitator.totalDeals > 0
    ? Math.round((facilitator.successfulDeals / facilitator.totalDeals) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
      <div className={`px-4 py-3 flex items-center justify-between ${levelInfo.color}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{levelInfo.icon}</span>
          <span className="font-bold">{levelInfo.label}</span>
        </div>
        {facilitator.isAvailable ? (
          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">متاح الآن</span>
        ) : (
          <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded-full">غير متاح</span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {facilitator.displayName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">{facilitator.displayName}</h3>
            <p className="text-sm text-gray-500">{facilitator.user?.governorate || 'مصر'}</p>
          </div>
        </div>

        {facilitator.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{facilitator.bio}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-emerald-600">⭐ {facilitator.avgRating.toFixed(1)}</p>
            <p className="text-xs text-gray-500">التقييم</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-blue-600">{facilitator.totalDeals}</p>
            <p className="text-xs text-gray-500">الصفقات</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-lg font-bold text-purple-600">{successRate}%</p>
            <p className="text-xs text-gray-500">النجاح</p>
          </div>
        </div>

        {/* Specializations */}
        {facilitator.specializations?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {facilitator.specializations.slice(0, 3).map((spec, i) => (
              <span key={i} className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full">
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* Commission */}
        <div className="flex justify-between items-center text-sm border-t pt-3">
          <span className="text-gray-500">العمولة:</span>
          <span className="font-bold text-emerald-600">{facilitator.commissionRate}%</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-500">الحد الأدنى:</span>
          <span className="font-bold">{facilitator.minCommission.toLocaleString('ar-EG')} ج.م</span>
        </div>
      </div>
    </div>
  );
}

function AssignmentCard({
  assignment,
  onStart,
  onComplete,
  onReview,
}: {
  assignment: FacilitatorAssignment;
  onStart: () => void;
  onComplete: () => void;
  onReview: () => void;
}) {
  const statusInfo = ASSIGNMENT_STATUS[assignment.status] || ASSIGNMENT_STATUS.ASSIGNED;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className={`px-4 py-3 flex items-center justify-between ${statusInfo.color}`}>
        <span className="font-bold">{statusInfo.label}</span>
        <span className="text-sm opacity-75">
          {assignment.assignmentType === 'ESCROW' ? '🔒 ضمان' :
           assignment.assignmentType === 'BARTER_CHAIN' ? '🔗 سلسلة' : '🔍 فحص'}
        </span>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-gray-500">العمولة:</span>
          <span className="font-bold text-emerald-600">
            {assignment.commissionAmount.toLocaleString('ar-EG')} ج.م
          </span>
        </div>

        <div className="text-sm text-gray-500 mb-4">
          تاريخ التعيين: {new Date(assignment.createdAt).toLocaleDateString('ar-EG')}
        </div>

        <div className="flex gap-2">
          {assignment.status === 'ASSIGNED' && (
            <button
              onClick={onStart}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600"
            >
              🚀 بدء العمل
            </button>
          )}
          {assignment.status === 'IN_PROGRESS' && (
            <button
              onClick={onComplete}
              className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600"
            >
              ✅ إتمام المهمة
            </button>
          )}
          {assignment.status === 'COMPLETED' && !assignment.completedAt && (
            <button
              onClick={onReview}
              className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600"
            >
              ⭐ تقييم
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FacilitatorsPage() {
  const { user } = useAuth();
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [topFacilitators, setTopFacilitators] = useState<Facilitator[]>([]);
  const [myProfile, setMyProfile] = useState<Facilitator | null>(null);
  const [myAssignments, setMyAssignments] = useState<FacilitatorAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'browse' | 'top' | 'my' | 'apply'>('browse');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({
    displayName: '',
    bio: '',
    specializations: [] as string[],
    serviceAreas: [] as string[],
    idDocument: '',
  });
  const [filter, setFilter] = useState({ governorate: '', specialization: '' });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [availableResult, topResult] = await Promise.all([
        getAvailableFacilitators(filter.governorate || filter.specialization ? filter : undefined),
        getTopFacilitators({ limit: 6 }),
      ]);
      setFacilitators(availableResult.data?.facilitators || []);
      setTopFacilitators(topResult.data?.facilitators || []);

      if (user) {
        try {
          const profileResult = await getMyFacilitatorProfile();
          setMyProfile(profileResult.data?.facilitator || null);

          const assignmentsResult = await getMyAssignments();
          setMyAssignments(assignmentsResult.data?.assignments || []);
        } catch {
          // User is not a facilitator
          setMyProfile(null);
        }
      }
    } catch (error) {
      console.error('Error fetching facilitators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!applyData.displayName || !applyData.idDocument) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }
    try {
      await applyForFacilitator(applyData);
      alert('تم إرسال طلبك بنجاح! سيتم مراجعته قريباً.');
      setShowApplyModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleToggleAvailability = async () => {
    if (!myProfile) return;
    try {
      await toggleAvailability(myProfile.id);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleStartAssignment = async (assignmentId: string) => {
    try {
      await startAssignment(assignmentId);
      alert('تم بدء المهمة');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleCompleteAssignment = async (assignmentId: string) => {
    const notes = prompt('أدخل ملاحظات الإتمام (اختياري):');
    try {
      await completeAssignment(assignmentId, notes || undefined);
      alert('تم إتمام المهمة بنجاح!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleReview = async (assignmentId: string) => {
    const rating = prompt('أدخل التقييم (1-5):');
    if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      alert('الرجاء إدخال تقييم صحيح');
      return;
    }
    try {
      await submitReview(assignmentId, {
        rating: Number(rating),
        professionalismRating: Number(rating),
        communicationRating: Number(rating),
        speedRating: Number(rating),
      });
      alert('تم إرسال التقييم');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const SPECIALIZATIONS = ['إلكترونيات', 'سيارات', 'عقارات', 'أثاث', 'ملابس', 'أجهزة منزلية'];
  const GOVERNORATES = ['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'طنطا', 'أسيوط'];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-indigo-600 via-purple-500 to-pink-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">👔</span>
            شبكة الوسطاء المعتمدين
          </h1>
          <p className="text-xl text-white/90">وسطاء محترفون لضمان صفقات آمنة وناجحة</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex flex-wrap gap-2 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setTab('browse')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              tab === 'browse'
                ? 'bg-gradient-to-l from-indigo-500 to-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔍 تصفح الوسطاء
          </button>
          <button
            onClick={() => setTab('top')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              tab === 'top'
                ? 'bg-gradient-to-l from-indigo-500 to-purple-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏆 الأفضل تقييماً
          </button>
          {user && myProfile && (
            <button
              onClick={() => setTab('my')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                tab === 'my'
                  ? 'bg-gradient-to-l from-indigo-500 to-purple-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 مهامي
            </button>
          )}
          {user && !myProfile && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-4 py-2 rounded-lg font-bold bg-gradient-to-l from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
            >
              ✨ كن وسيطاً معتمداً
            </button>
          )}
        </div>
      </div>

      {/* My Profile Banner */}
      {user && myProfile && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-gradient-to-l from-indigo-500 to-purple-500 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{LEVEL_INFO[myProfile.level]?.icon || '👔'}</span>
                <div>
                  <h3 className="font-bold">{myProfile.displayName}</h3>
                  <p className="text-sm opacity-90">
                    {STATUS_INFO[myProfile.status]?.label} • {myProfile.totalDeals} صفقة
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleAvailability}
                className={`px-4 py-2 rounded-lg font-bold ${
                  myProfile.isAvailable
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {myProfile.isAvailable ? '⏸️ إيقاف الاستقبال' : '▶️ استقبال المهام'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'browse' && (
              <>
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <select
                    value={filter.governorate}
                    onChange={(e) => setFilter({ ...filter, governorate: e.target.value })}
                    className="border rounded-lg px-4 py-2"
                  >
                    <option value="">كل المحافظات</option>
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                  <select
                    value={filter.specialization}
                    onChange={(e) => setFilter({ ...filter, specialization: e.target.value })}
                    className="border rounded-lg px-4 py-2"
                  >
                    <option value="">كل التخصصات</option>
                    {SPECIALIZATIONS.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  <button
                    onClick={fetchData}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-600"
                  >
                    🔍 بحث
                  </button>
                </div>

                {facilitators.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilitators.map((facilitator) => (
                      <FacilitatorCard key={facilitator.id} facilitator={facilitator} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl">
                    <span className="text-6xl mb-4 block">👔</span>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">لا يوجد وسطاء متاحين</h3>
                    <p className="text-gray-500">جرب تغيير معايير البحث</p>
                  </div>
                )}
              </>
            )}

            {tab === 'top' && (
              topFacilitators.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topFacilitators.map((facilitator, index) => (
                    <div key={facilitator.id} className="relative">
                      {index < 3 && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold z-10 shadow-lg">
                          {index + 1}
                        </div>
                      )}
                      <FacilitatorCard facilitator={facilitator} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <span className="text-6xl mb-4 block">🏆</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">لا يوجد وسطاء حالياً</h3>
                  <p className="text-gray-500">كن أول وسيط معتمد!</p>
                </div>
              )
            )}

            {tab === 'my' && myProfile && (
              myAssignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onStart={() => handleStartAssignment(assignment.id)}
                      onComplete={() => handleCompleteAssignment(assignment.id)}
                      onReview={() => handleReview(assignment.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl">
                  <span className="text-6xl mb-4 block">📋</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد مهام حالياً</h3>
                  <p className="text-gray-500">ستظهر مهامك هنا عند تعيينك لصفقة</p>
                </div>
              )
            )}
          </>
        )}
      </section>

      {/* How it Works */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">كيف تعمل شبكة الوسطاء؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '📝', title: 'سجل كوسيط', desc: 'قدم طلبك مع المستندات المطلوبة' },
              { icon: '✅', title: 'الموافقة', desc: 'يتم مراجعة طلبك والموافقة عليه' },
              { icon: '🤝', title: 'استلم المهام', desc: 'يتم تعيينك للإشراف على الصفقات' },
              { icon: '💰', title: 'اكسب العمولة', desc: 'احصل على عمولتك عند إتمام الصفقة' },
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

      {/* Levels Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">مستويات الوسطاء</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {Object.entries(LEVEL_INFO).map(([key, info]) => (
              <div key={key} className={`rounded-xl p-6 text-center ${info.color}`}>
                <span className="text-4xl block mb-3">{info.icon}</span>
                <h3 className="font-bold text-lg mb-2">{info.label}</h3>
                <p className="text-sm opacity-75">
                  {key === 'BRONZE' && '0-10 صفقات'}
                  {key === 'SILVER' && '11-50 صفقة'}
                  {key === 'GOLD' && '51-100 صفقة'}
                  {key === 'PLATINUM' && '+100 صفقة'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">✨ التقديم كوسيط معتمد</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">الاسم المعروض *</label>
                <input
                  type="text"
                  value={applyData.displayName}
                  onChange={(e) => setApplyData({ ...applyData, displayName: e.target.value })}
                  placeholder="الاسم الذي سيظهر للعملاء"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">نبذة عنك</label>
                <textarea
                  value={applyData.bio}
                  onChange={(e) => setApplyData({ ...applyData, bio: e.target.value })}
                  placeholder="اكتب نبذة مختصرة عن خبراتك"
                  className="w-full border rounded-lg px-4 py-3 h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">التخصصات</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => {
                        const specs = applyData.specializations.includes(spec)
                          ? applyData.specializations.filter(s => s !== spec)
                          : [...applyData.specializations, spec];
                        setApplyData({ ...applyData, specializations: specs });
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        applyData.specializations.includes(spec)
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">مناطق الخدمة</label>
                <div className="flex flex-wrap gap-2">
                  {GOVERNORATES.map((gov) => (
                    <button
                      key={gov}
                      onClick={() => {
                        const areas = applyData.serviceAreas.includes(gov)
                          ? applyData.serviceAreas.filter(a => a !== gov)
                          : [...applyData.serviceAreas, gov];
                        setApplyData({ ...applyData, serviceAreas: areas });
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        applyData.serviceAreas.includes(gov)
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {gov}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">رقم البطاقة الشخصية *</label>
                <input
                  type="text"
                  value={applyData.idDocument}
                  onChange={(e) => setApplyData({ ...applyData, idDocument: e.target.value })}
                  placeholder="الرقم القومي"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleApply}
                className="flex-1 bg-gradient-to-l from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-bold hover:from-indigo-600 hover:to-purple-600"
              >
                إرسال الطلب
              </button>
              <button
                onClick={() => setShowApplyModal(false)}
                className="px-6 py-3 bg-gray-200 rounded-lg font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
