'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createCollectionRequest,
  getMaterialPrices,
  getUserCollections,
  MATERIAL_CATEGORIES,
  COLLECTION_STATUS_AR,
  CollectionMaterial,
  CollectionRequest,
  CollectionRequestStatus,
  MaterialPrice,
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
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'أسوان',
  'الأقصر',
  'البحر الأحمر',
  'مطروح',
  'الوادي الجديد',
  'شمال سيناء',
  'جنوب سيناء',
];

const TIME_SLOTS = [
  { value: 'morning', label: 'صباحاً (9 ص - 12 م)' },
  { value: 'afternoon', label: 'ظهراً (12 م - 3 م)' },
  { value: 'evening', label: 'مساءً (3 م - 6 م)' },
];

export default function CollectionRequestPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'new' | 'history'>('new');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [prices, setPrices] = useState<MaterialPrice[]>([]);
  const [collections, setCollections] = useState<CollectionRequest[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);

  const [formData, setFormData] = useState({
    materials: [] as CollectionMaterial[],
    address: '',
    governorate: '',
    city: '',
    preferredDate: '',
    preferredTimeSlot: '',
    notes: '',
  });

  useEffect(() => {
    loadPrices();
    loadCollections();
  }, []);

  const loadPrices = async () => {
    try {
      const data = await getMaterialPrices();
      setPrices(data || []);
    } catch (error) {
      console.error('Error loading prices:', error);
    }
  };

  const loadCollections = async () => {
    try {
      setLoadingCollections(true);
      const data = await getUserCollections();
      setCollections(data || []);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoadingCollections(false);
    }
  };

  const addMaterial = (materialType: string) => {
    if (formData.materials.find((m) => m.materialType === materialType)) return;
    setFormData({
      ...formData,
      materials: [...formData.materials, { materialType, estimatedWeightKg: 0 }],
    });
  };

  const updateMaterialWeight = (materialType: string, weight: number) => {
    setFormData({
      ...formData,
      materials: formData.materials.map((m) =>
        m.materialType === materialType ? { ...m, estimatedWeightKg: weight } : m
      ),
    });
  };

  const removeMaterial = (materialType: string) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter((m) => m.materialType !== materialType),
    });
  };

  const getMaterialName = (materialType: string): string => {
    for (const category of Object.values(MATERIAL_CATEGORIES)) {
      const found = category.types.find((t) => t.type === materialType);
      if (found) return found.nameAr;
    }
    return materialType;
  };

  const getEstimatedValue = (): number => {
    return formData.materials.reduce((total, m) => {
      const price = prices.find((p) => p.materialType === m.materialType);
      return total + (price?.pricePerKg || 0) * m.estimatedWeightKg;
    }, 0);
  };

  const handleSubmit = async () => {
    if (formData.materials.length === 0 || !formData.address || !formData.governorate || !formData.preferredDate) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createCollectionRequest({
        materials: formData.materials,
        address: formData.address,
        governorate: formData.governorate,
        city: formData.city,
        preferredDate: formData.preferredDate,
        preferredTimeSlot: formData.preferredTimeSlot,
        notes: formData.notes,
      });
      setSuccess(true);
      loadCollections();
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في إنشاء الطلب');
    } finally {
      setLoading(false);
    }
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">تم إنشاء طلب الجمع بنجاح!</h2>
          <p className="text-gray-600 mb-6">
            سيتواصل معك أحد الجامعين قريباً لتأكيد الموعد
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSuccess(false);
                setTab('history');
                setFormData({
                  materials: [],
                  address: '',
                  governorate: '',
                  city: '',
                  preferredDate: '',
                  preferredTimeSlot: '',
                  notes: '',
                });
                setStep(1);
              }}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
            >
              عرض طلباتي
            </button>
            <Link
              href="/scrap"
              className="block w-full border-2 border-gray-300 py-3 rounded-lg font-bold hover:bg-gray-50"
            >
              العودة للسوق
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-600 to-cyan-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/scrap" className="text-white/80 hover:text-white mb-4 inline-block">
            &rarr; العودة لسوق التوالف
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-5xl">🚛</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">جمع من باب البيت</h1>
              <p className="text-xl opacity-90">
                اطلب جامع يأتي إليك - خدمة مجانية
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setTab('new')}
              className={`py-4 px-6 font-medium border-b-2 transition ${
                tab === 'new'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              طلب جديد
            </button>
            <button
              onClick={() => setTab('history')}
              className={`py-4 px-6 font-medium border-b-2 transition ${
                tab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              طلباتي ({collections.length})
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {tab === 'new' ? (
          <div className="max-w-3xl mx-auto">
            {/* Progress */}
            <div className="flex justify-center gap-4 mb-8">
              {[
                { num: 1, label: 'اختر المواد' },
                { num: 2, label: 'العنوان والموعد' },
                { num: 3, label: 'التأكيد' },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`flex items-center gap-2 ${
                    step >= s.num ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {s.num}
                  </div>
                  <span className="hidden sm:inline font-medium">{s.label}</span>
                </div>
              ))}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Step 1: Materials */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">ما هي المواد التي تريد بيعها؟</h2>

                {/* Category Selection */}
                <div className="space-y-6">
                  {Object.entries(MATERIAL_CATEGORIES).map(([key, category]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <span className="text-xl">{category.icon}</span>
                        {category.nameAr}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {category.types.map((material) => {
                          const isAdded = formData.materials.some(
                            (m) => m.materialType === material.type
                          );
                          return (
                            <button
                              key={material.type}
                              onClick={() =>
                                isAdded
                                  ? removeMaterial(material.type)
                                  : addMaterial(material.type)
                              }
                              className={`p-2 rounded-lg border text-sm transition ${
                                isAdded
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-blue-300'
                              }`}
                            >
                              {isAdded && '✓ '}
                              {material.nameAr}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Materials */}
                {formData.materials.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-bold mb-3">المواد المختارة ({formData.materials.length})</h3>
                    <div className="space-y-3">
                      {formData.materials.map((m) => (
                        <div key={m.materialType} className="flex items-center gap-3">
                          <span className="flex-1">{getMaterialName(m.materialType)}</span>
                          <input
                            type="number"
                            value={m.estimatedWeightKg || ''}
                            onChange={(e) =>
                              updateMaterialWeight(m.materialType, parseFloat(e.target.value) || 0)
                            }
                            placeholder="الوزن التقريبي"
                            className="w-28 border rounded px-2 py-1 text-center"
                            min="0"
                          />
                          <span className="text-gray-500 text-sm">كجم</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="font-bold">القيمة التقديرية:</span>
                        <span className="text-xl font-bold text-green-600">
                          {getEstimatedValue().toLocaleString()} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={formData.materials.length === 0}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Address & Schedule */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">العنوان وموعد الجمع</h2>

                <div className="space-y-6">
                  {/* Address */}
                  <div>
                    <label className="block font-medium mb-2">العنوان بالتفصيل *</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="مثال: شارع التحرير، عمارة 5، الدور 3، شقة 12"
                      rows={3}
                      className="w-full border rounded-lg px-4 py-3"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Governorate */}
                    <div>
                      <label className="block font-medium mb-2">المحافظة *</label>
                      <select
                        value={formData.governorate}
                        onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                        className="w-full border rounded-lg px-4 py-3"
                        required
                      >
                        <option value="">اختر المحافظة</option>
                        {GOVERNORATES.map((gov) => (
                          <option key={gov} value={gov}>
                            {gov}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block font-medium mb-2">المدينة / الحي</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="مثال: مدينة نصر"
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block font-medium mb-2">التاريخ المفضل *</label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border rounded-lg px-4 py-3"
                      required
                    />
                  </div>

                  {/* Time Slot */}
                  <div>
                    <label className="block font-medium mb-2">الوقت المفضل</label>
                    <div className="grid grid-cols-3 gap-3">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot.value}
                          onClick={() => setFormData({ ...formData, preferredTimeSlot: slot.value })}
                          className={`p-3 rounded-lg border-2 text-sm transition ${
                            formData.preferredTimeSlot === slot.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block font-medium mb-2">ملاحظات إضافية</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="أي تعليمات للجامع..."
                      rows={2}
                      className="w-full border rounded-lg px-4 py-3"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="text-gray-600 px-6 py-3 hover:text-gray-800"
                  >
                    السابق
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.address || !formData.governorate || !formData.preferredDate}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">تأكيد الطلب</h2>

                {/* Summary */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold mb-3">المواد</h3>
                    {formData.materials.map((m) => (
                      <div key={m.materialType} className="flex justify-between py-1">
                        <span>{getMaterialName(m.materialType)}</span>
                        <span className="text-gray-600">~{m.estimatedWeightKg} كجم</span>
                      </div>
                    ))}
                    <div className="mt-3 pt-3 border-t flex justify-between font-bold">
                      <span>القيمة التقديرية</span>
                      <span className="text-green-600">{getEstimatedValue().toLocaleString()} ج.م</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold mb-3">العنوان</h3>
                    <p>{formData.address}</p>
                    <p className="text-gray-600">
                      {formData.city && `${formData.city}، `}{formData.governorate}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold mb-3">الموعد</h3>
                    <p>{new Date(formData.preferredDate).toLocaleDateString('ar-EG', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</p>
                    {formData.preferredTimeSlot && (
                      <p className="text-gray-600">
                        {TIME_SLOTS.find((s) => s.value === formData.preferredTimeSlot)?.label}
                      </p>
                    )}
                  </div>

                  {formData.notes && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-bold mb-3">ملاحظات</h3>
                      <p className="text-gray-600">{formData.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">ℹ️</span>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">معلومات مهمة:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>السعر النهائي يحدد بعد الوزن الفعلي</li>
                        <li>خدمة الجمع مجانية</li>
                        <li>الدفع نقداً عند الاستلام</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setStep(2)}
                    className="text-gray-600 px-6 py-3 hover:text-gray-800"
                  >
                    السابق
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loading ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* History Tab */
          <div className="max-w-4xl mx-auto">
            {loadingCollections ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : collections.length > 0 ? (
              <div className="space-y-4">
                {collections.map((collection) => (
                  <div key={collection.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(collection.status)}`}>
                          {COLLECTION_STATUS_AR[collection.status]}
                        </span>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(collection.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      {collection.estimatedTotalValue && (
                        <div className="text-left">
                          <div className="text-sm text-gray-500">القيمة التقديرية</div>
                          <div className="text-xl font-bold text-green-600">
                            {collection.estimatedTotalValue.toLocaleString()} ج.م
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">المواد</div>
                        <div className="flex flex-wrap gap-2">
                          {collection.materials.map((m, i) => (
                            <span
                              key={i}
                              className="bg-gray-100 px-2 py-1 rounded text-sm"
                            >
                              {getMaterialName(m.materialType)} ({m.estimatedWeightKg} كجم)
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">العنوان</div>
                        <p className="text-sm">{collection.address}</p>
                        <p className="text-sm text-gray-600">{collection.governorate}</p>
                      </div>
                    </div>

                    {collection.collector && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xl">🚛</span>
                          </div>
                          <div>
                            <div className="font-medium">{collection.collector.displayName}</div>
                            <div className="text-sm text-gray-500">
                              التقييم: ⭐ {collection.collector.rating.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {collection.actualTotalValue && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">القيمة الفعلية</span>
                          <span className="text-xl font-bold text-green-600">
                            {collection.actualTotalValue.toLocaleString()} ج.م
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد طلبات</h3>
                <p className="text-gray-500 mb-4">لم تقم بإنشاء أي طلبات جمع بعد</p>
                <button
                  onClick={() => setTab('new')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
                >
                  إنشاء طلب جديد
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
