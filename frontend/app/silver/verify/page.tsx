'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api';

export default function SilverVerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    idType: 'NATIONAL_ID',
    idNumber: '',
    fullName: '',
    dateOfBirth: '',
    address: '',
    idFrontUrl: '',
    idBackUrl: '',
    selfieUrl: '',
  });

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login?redirect=/silver/verify');
        return;
      }

      const res = await apiClient.get('/silver/kyc/status');
      setKycStatus(res.data.data);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiClient.post('/silver/kyc/submit', formData);
      await fetchKYCStatus();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (field: string, file: File) => {
    // In production, upload to cloud storage
    // For now, simulate with base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, [field]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  // Already verified
  if (kycStatus?.status === 'APPROVED') {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">تم التحقق من هويتك</h1>
            <p className="text-gray-600 mb-4">حسابك موثق حتى {new Date(kycStatus.validUntil).toLocaleDateString('ar-EG')}</p>
            <div className="flex gap-4 justify-center">
              <Link href="/silver" className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                العودة للسوق
              </Link>
              <Link href="/silver/sell" className="px-6 py-2 border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50">
                بيع قطعة
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending verification
  if (kycStatus?.status === 'PENDING') {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">طلبك قيد المراجعة</h1>
            <p className="text-gray-600 mb-4">سيتم مراجعة طلبك خلال 24-48 ساعة</p>
            <p className="text-sm text-gray-500">تاريخ التقديم: {new Date(kycStatus.submittedAt).toLocaleDateString('ar-EG')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Rejected - can resubmit
  if (kycStatus?.status === 'REJECTED') {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">تم رفض الطلب</h1>
              <p className="text-gray-600 mb-2">السبب: {kycStatus.rejectionReason}</p>
            </div>
            <button
              onClick={() => setKycStatus({ ...kycStatus, status: 'NOT_SUBMITTED' })}
              className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              إعادة التقديم
            </button>
          </div>
        </div>
      </div>
    );
  }

  // New submission form
  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">التحقق من الهوية</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-gray-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">المعلومات الشخصية</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع الهوية</label>
                <select
                  value={formData.idType}
                  onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="NATIONAL_ID">بطاقة الرقم القومي</option>
                  <option value="PASSPORT">جواز السفر</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهوية</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  placeholder="أدخل رقم الهوية"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل (كما في الهوية)</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-3 border rounded-lg"
                  placeholder="أدخل عنوانك"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!formData.idNumber || !formData.fullName}
                className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300"
              >
                التالي
              </button>
            </div>
          )}

          {/* Step 2: Document Upload */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">رفع المستندات</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة الهوية (الوجه الأمامي)</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {formData.idFrontUrl ? (
                    <div className="relative">
                      <img src={formData.idFrontUrl} alt="Front" className="max-h-40 mx-auto" />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, idFrontUrl: '' }))}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <span className="text-gray-500">اضغط لرفع الصورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('idFrontUrl', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>

              {formData.idType === 'NATIONAL_ID' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">صورة الهوية (الوجه الخلفي)</label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {formData.idBackUrl ? (
                      <div className="relative">
                        <img src={formData.idBackUrl} alt="Back" className="max-h-40 mx-auto" />
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, idBackUrl: '' }))}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                        >
                          X
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <span className="text-gray-500">اضغط لرفع الصورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload('idBackUrl', e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-lg">
                  السابق
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.idFrontUrl}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Selfie */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">صورة شخصية للتحقق</h2>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  التقط صورة واضحة لوجهك مع الهوية بجانبه للتأكد من تطابق الهوية
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">صورة شخصية مع الهوية</label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  {formData.selfieUrl ? (
                    <div className="relative">
                      <img src={formData.selfieUrl} alt="Selfie" className="max-h-60 mx-auto" />
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, selfieUrl: '' }))}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <span className="text-gray-500">اضغط لرفع الصورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('selfieUrl', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border border-gray-300 rounded-lg">
                  السابق
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.selfieUrl || submitting}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300"
                >
                  {submitting ? 'جاري الإرسال...' : 'تقديم الطلب'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
