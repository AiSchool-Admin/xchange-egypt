'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

const VALUATION_ICONS = {
  weight_check: '⚖️',
  visual_inspection: '👁️',
  photo_report: '📷',
  acid_test: '🧪',
  detailed_report: '📋',
  xrf_analysis: '🔬',
  craftsmanship_eval: '🎨',
  market_comparison: '📊',
  certificate: '📜',
  '360_imaging': '🔄',
  blockchain_cert: '🔗',
  priority_support: '⚡',
};

export default function SilverValuationPage() {
  const router = useRouter();
  const [levels, setLevels] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myValuations, setMyValuations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    deliveryMethod: 'DROP_OFF',
    appointmentDate: '',
    appointmentTime: '',
    address: '',
    notes: '',
    itemId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [levelsRes, valuationsRes] = await Promise.all([
        apiClient.get('/silver/valuations/levels'),
        apiClient.get('/silver/valuations/my').catch(() => ({ data: { data: [] } })),
      ]);
      setLevels(levelsRes.data.data);
      setMyValuations(valuationsRes.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLevel) return;

    setSubmitting(true);
    try {
      await apiClient.post('/silver/valuations/request', {
        level: selectedLevel,
        ...formData,
      });
      await fetchData();
      setStep(4); // Success step
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">خدمة التقييم الاحترافي</h1>
          <p className="text-gray-600">احصل على تقييم دقيق لقطع الفضة من خبراء معتمدين</p>
        </div>

        {/* My Valuations */}
        {myValuations.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">طلباتي السابقة</h2>
            <div className="space-y-4">
              {myValuations.slice(0, 3).map((v: any) => (
                <div key={v.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-semibold">{v.levelDetails?.nameAr || v.valuationType}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(v.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    v.valuationStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    v.valuationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {v.valuationStatus === 'COMPLETED' ? 'مكتمل' :
                     v.valuationStatus === 'PENDING' ? 'قيد المراجعة' : v.valuationStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Choose Level */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-6">اختر مستوى التقييم</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {levels.map((level) => (
                <div
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all ${
                    selectedLevel === level.id ? 'ring-2 ring-gray-600 scale-105' : 'hover:shadow-lg'
                  }`}
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900">{level.nameAr}</h3>
                    <p className="text-3xl font-bold text-gray-600 mt-2">{level.price} ج.م</p>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{level.descriptionAr}</p>

                  <div className="space-y-2 mb-4">
                    {level.features.map((f: string) => (
                      <div key={f} className="flex items-center gap-2 text-sm">
                        <span>{VALUATION_ICONS[f as keyof typeof VALUATION_ICONS] || '✓'}</span>
                        <span className="text-gray-700">{f.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-sm text-gray-500">
                    المدة: {level.turnaroundAr}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedLevel}
                className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Delivery Method */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold mb-6">اختر طريقة التسليم</h2>

              <div className="space-y-4 mb-6">
                {[
                  { id: 'DROP_OFF', name: 'تسليم في مكتبنا', desc: 'قم بتسليم القطعة في أقرب فرع', icon: '🏢' },
                  { id: 'HOME_PICKUP', name: 'استلام من المنزل', desc: 'سنرسل مندوب لاستلام القطعة', icon: '🏠' },
                  { id: 'PARTNER_LOCATION', name: 'تسليم لدى صائغ شريك', desc: 'سلم القطعة في أقرب صائغ شريك', icon: '💎' },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
                      formData.deliveryMethod === method.id ? 'border-gray-600 bg-gray-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={method.id}
                      checked={formData.deliveryMethod === method.id}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryMethod: e.target.value }))}
                      className="w-5 h-5"
                    />
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <p className="font-semibold">{method.name}</p>
                      <p className="text-sm text-gray-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {formData.deliveryMethod === 'HOME_PICKUP' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    rows={3}
                    placeholder="أدخل العنوان التفصيلي"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ المفضل</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوقت المفضل</label>
                  <select
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">اختر الوقت</option>
                    <option value="09:00">9:00 صباحاً</option>
                    <option value="10:00">10:00 صباحاً</option>
                    <option value="11:00">11:00 صباحاً</option>
                    <option value="12:00">12:00 ظهراً</option>
                    <option value="14:00">2:00 مساءً</option>
                    <option value="15:00">3:00 مساءً</option>
                    <option value="16:00">4:00 مساءً</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  placeholder="أي ملاحظات أو تفاصيل إضافية..."
                />
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-lg">
                  السابق
                </button>
                <button onClick={() => setStep(3)} className="flex-1 py-3 bg-gray-600 text-white rounded-lg">
                  التالي
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold mb-6">تأكيد الطلب</h2>

              {selectedLevel && (
                <div className="border rounded-lg p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">
                      {levels.find(l => l.id === selectedLevel)?.nameAr}
                    </h3>
                    <span className="text-2xl font-bold text-gray-600">
                      {levels.find(l => l.id === selectedLevel)?.price} ج.م
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <p>طريقة التسليم: {
                      formData.deliveryMethod === 'DROP_OFF' ? 'تسليم في المكتب' :
                      formData.deliveryMethod === 'HOME_PICKUP' ? 'استلام من المنزل' :
                      'تسليم لدى صائغ شريك'
                    }</p>
                    {formData.appointmentDate && (
                      <p>الموعد: {formData.appointmentDate} - {formData.appointmentTime}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-yellow-800">
                  سيتم التواصل معك لتأكيد الموعد وتفاصيل التسليم
                </p>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-300 rounded-lg">
                  السابق
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300"
                >
                  {submitting ? 'جاري الإرسال...' : 'تأكيد الطلب'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تم تقديم الطلب بنجاح!</h2>
              <p className="text-gray-600 mb-6">سيتم التواصل معك قريباً لتأكيد الموعد</p>
              <div className="flex gap-4 justify-center">
                <Link href="/silver" className="px-6 py-2 bg-gray-600 text-white rounded-lg">
                  العودة للسوق
                </Link>
                <button
                  onClick={() => { setStep(1); setSelectedLevel(null); }}
                  className="px-6 py-2 border border-gray-600 text-gray-600 rounded-lg"
                >
                  طلب جديد
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
