'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getCollectorStats,
  getAvailableCollections,
  acceptCollection,
  updateCollectionStatus,
  registerCollector,
  updateCollectorLocation,
  CollectorStats,
  CollectionRequest,
  CollectionRequestStatus,
  COLLECTION_STATUS_AR,
  MATERIAL_CATEGORIES,
  ScrapType,
} from '@/lib/api/scrap-marketplace';

const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'القليوبية',
  'كفر الشيخ',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'الإسماعيلية',
  'السويس',
  'بورسعيد',
  'دمياط',
];

const VEHICLE_TYPES = [
  { value: 'motorcycle', label: 'موتوسيكل' },
  { value: 'tricycle', label: 'تروسيكل' },
  { value: 'pickup', label: 'بيك أب' },
  { value: 'truck', label: 'نقل' },
];

export default function CollectorDashboardPage() {
  const [stats, setStats] = useState<CollectorStats | null>(null);
  const [availableRequests, setAvailableRequests] = useState<CollectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollector, setIsCollector] = useState<boolean | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    displayName: '',
    phoneNumber: '',
    vehicleType: '',
    vehiclePlateNumber: '',
    serviceAreas: [] as string[],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const statsData = await getCollectorStats();
      setStats(statsData);
      setIsCollector(true);
      setIsOnline(statsData.profile.isOnline);

      // Load available requests
      const requests = await getAvailableCollections();
      setAvailableRequests(requests || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setIsCollector(false);
      }
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.displayName || !registerForm.phoneNumber || registerForm.serviceAreas.length === 0) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setRegistering(true);
      await registerCollector({
        displayName: registerForm.displayName,
        phoneNumber: registerForm.phoneNumber,
        vehicleType: registerForm.vehicleType,
        vehiclePlateNumber: registerForm.vehiclePlateNumber,
        serviceAreas: registerForm.serviceAreas,
      });
      setShowRegister(false);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'حدث خطأ في التسجيل');
    } finally {
      setRegistering(false);
    }
  };

  const toggleOnline = async () => {
    try {
      // Get current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            await updateCollectorLocation(
              position.coords.latitude,
              position.coords.longitude,
              !isOnline
            );
            setIsOnline(!isOnline);
          },
          () => {
            alert('يرجى تفعيل خدمة الموقع');
          }
        );
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await acceptCollection(requestId);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'حدث خطأ');
    }
  };

  const handleStatusUpdate = async (requestId: string, status: CollectionRequestStatus) => {
    try {
      await updateCollectionStatus(requestId, status);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'حدث خطأ');
    }
  };

  const getMaterialName = (materialType: string): string => {
    for (const category of Object.values(MATERIAL_CATEGORIES)) {
      const found = category.types.find((t) => t.type === materialType);
      if (found) return found.nameAr;
    }
    return materialType;
  };

  const getStatusColor = (status: CollectionRequestStatus) => {
    const colors: Record<CollectionRequestStatus, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACCEPTED: 'bg-blue-100 text-blue-800',
      SCHEDULED: 'bg-indigo-100 text-indigo-800',
      IN_TRANSIT: 'bg-purple-100 text-purple-800',
      ARRIVED: 'bg-cyan-100 text-cyan-800',
      WEIGHING: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      DISPUTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Registration form for non-collectors
  if (isCollector === false || showRegister) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white py-12">
          <div className="container mx-auto px-4">
            <Link href="/scrap" className="text-white/80 hover:text-white mb-4 inline-block">
              &rarr; العودة لسوق التوالف
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-5xl">🚛</div>
              <div>
                <h1 className="text-4xl font-bold mb-2">انضم كجامع خردة</h1>
                <p className="text-xl opacity-90">اربح من جمع الخردة وساعد في حماية البيئة</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-xl mx-auto">
            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">مميزات العمل كجامع</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <span>اربح عمولة على كل عملية جمع</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <span>اختر ساعات عملك بحرية</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📍</span>
                  <span>اعمل في منطقتك</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌍</span>
                  <span>ساهم في حماية البيئة</span>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">بيانات التسجيل</h2>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">الاسم الظاهر *</label>
                  <input
                    type="text"
                    value={registerForm.displayName}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, displayName: e.target.value })
                    }
                    placeholder="الاسم الذي سيظهر للعملاء"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">رقم الهاتف *</label>
                  <input
                    type="tel"
                    value={registerForm.phoneNumber}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, phoneNumber: e.target.value })
                    }
                    placeholder="01XXXXXXXXX"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">نوع المركبة</label>
                  <select
                    value={registerForm.vehicleType}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, vehicleType: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-3"
                  >
                    <option value="">اختر نوع المركبة</option>
                    {VEHICLE_TYPES.map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2">رقم لوحة المركبة</label>
                  <input
                    type="text"
                    value={registerForm.vehiclePlateNumber}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, vehiclePlateNumber: e.target.value })
                    }
                    placeholder="مثال: أ ب ج 123"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">مناطق الخدمة *</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {GOVERNORATES.map((gov) => (
                      <label key={gov} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={registerForm.serviceAreas.includes(gov)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setRegisterForm({
                                ...registerForm,
                                serviceAreas: [...registerForm.serviceAreas, gov],
                              });
                            } else {
                              setRegisterForm({
                                ...registerForm,
                                serviceAreas: registerForm.serviceAreas.filter((a) => a !== gov),
                              });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{gov}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {registering ? 'جاري التسجيل...' : 'تسجيل كجامع'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Collector Dashboard
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold mb-1">مرحباً، {stats?.profile.displayName}</h1>
              <p className="opacity-80">لوحة تحكم الجامع</p>
            </div>
            <button
              onClick={toggleOnline}
              className={`px-6 py-3 rounded-full font-bold transition ${
                isOnline
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              {isOnline ? '🟢 متصل' : '⚫ غير متصل'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {stats?.todayCollections || 0}
            </div>
            <div className="text-sm text-gray-500">اليوم</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {stats?.weekCollections || 0}
            </div>
            <div className="text-sm text-gray-500">هذا الأسبوع</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {stats?.earningsBreakdown.today.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-500">أرباح اليوم (ج.م)</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-3xl font-bold text-amber-600">
              ⭐ {stats?.profile.rating.toFixed(1) || '0.0'}
            </div>
            <div className="text-sm text-gray-500">التقييم</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Request */}
          <div className="lg:col-span-2 space-y-6">
            {stats?.activeRequest && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-2xl">🚛</span>
                  الطلب الحالي
                </h2>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(stats.activeRequest.status)}`}>
                        {COLLECTION_STATUS_AR[stats.activeRequest.status]}
                      </span>
                    </div>
                    {stats.activeRequest.estimatedTotalValue && (
                      <div className="text-xl font-bold text-green-600">
                        ~{stats.activeRequest.estimatedTotalValue.toLocaleString()} ج.م
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">المواد</div>
                      <div className="flex flex-wrap gap-2">
                        {stats.activeRequest.materials.map((m, i) => (
                          <span key={i} className="bg-white px-2 py-1 rounded text-sm">
                            {getMaterialName(m.materialType)} ({m.estimatedWeightKg} كجم)
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">العنوان</div>
                      <p>{stats.activeRequest.address}</p>
                      <p className="text-gray-600">{stats.activeRequest.governorate}</p>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                    {stats.activeRequest.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleStatusUpdate(stats.activeRequest!.id, 'IN_TRANSIT')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        بدأت الذهاب
                      </button>
                    )}
                    {stats.activeRequest.status === 'IN_TRANSIT' && (
                      <button
                        onClick={() => handleStatusUpdate(stats.activeRequest!.id, 'ARRIVED')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        وصلت
                      </button>
                    )}
                    {stats.activeRequest.status === 'ARRIVED' && (
                      <button
                        onClick={() => handleStatusUpdate(stats.activeRequest!.id, 'WEIGHING')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        بدأ الوزن
                      </button>
                    )}
                    {stats.activeRequest.status === 'WEIGHING' && (
                      <button
                        onClick={() => handleStatusUpdate(stats.activeRequest!.id, 'COMPLETED')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
                      >
                        إنهاء الطلب
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Available Requests */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                الطلبات المتاحة ({availableRequests.length})
              </h2>

              {availableRequests.length > 0 ? (
                <div className="space-y-4">
                  {availableRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{request.governorate}</div>
                          <div className="text-sm text-gray-500">{request.city}</div>
                        </div>
                        {request.estimatedTotalValue && (
                          <div className="text-lg font-bold text-green-600">
                            ~{request.estimatedTotalValue.toLocaleString()} ج.م
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {request.materials.map((m, i) => (
                          <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {getMaterialName(m.materialType)} ({m.estimatedWeightKg} كجم)
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {new Date(request.preferredDate).toLocaleDateString('ar-EG')}
                        </div>
                        <button
                          onClick={() => handleAccept(request.id)}
                          disabled={!!stats?.activeRequest}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
                        >
                          قبول الطلب
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">📭</div>
                  <p>لا توجد طلبات متاحة حالياً</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-4xl">🚛</span>
                </div>
                <h3 className="font-bold text-lg">{stats?.profile.displayName}</h3>
                <p className="text-gray-500 text-sm">
                  {stats?.profile.vehicleType && (
                    <span>
                      {VEHICLE_TYPES.find((v) => v.value === stats.profile.vehicleType)?.label}
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">إجمالي الجمعات</span>
                  <span className="font-medium">{stats?.profile.totalCollections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">إجمالي الوزن</span>
                  <span className="font-medium">{stats?.profile.totalWeightCollected} كجم</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">إجمالي الأرباح</span>
                  <span className="font-medium text-green-600">
                    {stats?.profile.totalEarnings.toLocaleString()} ج.م
                  </span>
                </div>
              </div>

              {stats?.profile.isVerified && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-center text-green-700 text-sm">
                  ✅ حساب موثق
                </div>
              )}
            </div>

            {/* Earnings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4">الأرباح</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>اليوم</span>
                  <span className="font-bold text-green-600">
                    {stats?.earningsBreakdown.today.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>هذا الأسبوع</span>
                  <span className="font-bold text-green-600">
                    {stats?.earningsBreakdown.week.toLocaleString()} ج.م
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span>هذا الشهر</span>
                  <span className="font-bold text-green-600">
                    {stats?.earningsBreakdown.month.toLocaleString()} ج.م
                  </span>
                </div>
              </div>
            </div>

            {/* Service Areas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4">مناطق الخدمة</h3>
              <div className="flex flex-wrap gap-2">
                {stats?.profile.serviceAreas.map((area) => (
                  <span key={area} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
