'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface TenderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  specifications?: string;
}

interface Tender {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: string;
  status: string;
  budget: number;
  currency: string;
  submissionDeadline: string;
  openingDate: string;
  category: {
    id: string;
    nameAr: string;
  };
  procuringEntity: {
    id: string;
    name: string;
    governorate?: string;
  };
  items: TenderItem[];
}

interface BidItem {
  itemId: string;
  unitPrice: number;
  totalPrice: number;
  notes: string;
}

interface BidForm {
  bidAmount: string;
  technicalProposal: string;
  deliveryDays: string;
  warrantyMonths: string;
  paymentTerms: string;
  notes: string;
  items: BidItem[];
}

export default function SubmitBidPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [form, setForm] = useState<BidForm>({
    bidAmount: '',
    technicalProposal: '',
    deliveryDays: '',
    warrantyMonths: '12',
    paymentTerms: '',
    notes: '',
    items: [],
  });

  const tenderId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (tenderId) {
      loadTender();
    }
  }, [tenderId]);

  const loadTender = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tenders/${tenderId}`);
      const tenderData = response.data.data || response.data;
      setTender(tenderData);

      // Initialize bid items
      if (tenderData.items && tenderData.items.length > 0) {
        setForm(prev => ({
          ...prev,
          items: tenderData.items.map((item: TenderItem) => ({
            itemId: item.id,
            unitPrice: 0,
            totalPrice: 0,
            notes: '',
          })),
        }));
      }
    } catch (err: any) {
      console.error('Error loading tender:', err);
      setError(err.response?.data?.message || 'فشل في تحميل المناقصة');
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof BidForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const updateItemPrice = (index: number, unitPrice: number) => {
    if (!tender?.items[index]) return;

    const quantity = tender.items[index].quantity;
    const totalPrice = unitPrice * quantity;

    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, unitPrice, totalPrice } : item
      ),
    }));

    // Calculate total bid amount
    const newTotal = form.items.reduce((sum, item, i) => {
      if (i === index) return sum + totalPrice;
      return sum + item.totalPrice;
    }, 0);

    setForm(prev => ({ ...prev, bidAmount: String(newTotal) }));
  };

  const updateItemNotes = (index: number, notes: string) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, notes } : item
      ),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} bytes`;
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return form.items.every(item => item.unitPrice > 0) && parseFloat(form.bidAmount) > 0;
      case 2:
        return !!form.technicalProposal && !!form.deliveryDays;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setSubmitting(true);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('bidAmount', form.bidAmount);
      formData.append('technicalProposal', form.technicalProposal);
      formData.append('deliveryDays', form.deliveryDays);
      formData.append('warrantyMonths', form.warrantyMonths);
      formData.append('paymentTerms', form.paymentTerms);
      formData.append('notes', form.notes);
      formData.append('items', JSON.stringify(form.items));
      formData.append('status', isDraft ? 'DRAFT' : 'SUBMITTED');

      uploadedFiles.forEach((file) => {
        formData.append('documents', file);
      });

      await apiClient.post(`/tenders/${tenderId}/bids`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push(`/tenders/${tenderId}?success=bid`);
    } catch (err: any) {
      console.error('Error submitting bid:', err);
      setError(err.response?.data?.message || 'فشل في تقديم العطاء');
    } finally {
      setSubmitting(false);
    }
  };

  const isDeadlinePassed = (deadline: string) => new Date(deadline) < new Date();

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'المناقصة غير موجودة'}</p>
          <Link href="/tenders" className="mt-4 text-emerald-600 hover:text-emerald-700">
            العودة للمناقصات
          </Link>
        </div>
      </div>
    );
  }

  if (tender.status !== 'PUBLISHED' || isDeadlinePassed(tender.submissionDeadline)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg">انتهى موعد التقديم على هذه المناقصة</p>
          <Link href={`/tenders/${tenderId}`} className="mt-4 text-emerald-600 hover:text-emerald-700">
            عرض تفاصيل المناقصة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href={`/tenders/${tenderId}`}
            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            العودة لتفاصيل المناقصة
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tender Summary */}
        <div className="bg-gradient-to-l from-emerald-600 to-teal-700 text-white rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-200 text-sm mb-1">تقديم عطاء على</p>
              <h1 className="text-2xl font-bold mb-2">{tender.title}</h1>
              <p className="text-emerald-100">رقم المرجع: {tender.referenceNumber}</p>
            </div>
            <div className="text-left">
              <p className="text-emerald-200 text-sm">الميزانية</p>
              <p className="text-2xl font-bold">{tender.budget.toLocaleString()} {tender.currency === 'EGP' ? 'ج.م' : tender.currency}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-500/30 flex items-center gap-6 text-sm">
            <span className="flex items-center gap-1">
              <span>🏛️</span>
              {tender.procuringEntity.name}
            </span>
            <span className="flex items-center gap-1">
              <span>📍</span>
              {tender.procuringEntity.governorate || 'مصر'}
            </span>
            <span className="flex items-center gap-1">
              <span>📅</span>
              ينتهي: {new Date(tender.submissionDeadline).toLocaleDateString('ar-EG')}
            </span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'العرض المالي' },
            { num: 2, label: 'العرض الفني' },
            { num: 3, label: 'المستندات' },
          ].map((s, idx) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  step >= s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`mr-2 text-sm ${step >= s.num ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                {s.label}
              </span>
              {idx < 2 && (
                <div className={`w-20 h-1 mx-2 ${step > s.num ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Step 1: Financial Proposal */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">العرض المالي</h2>

              {tender.items && tender.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">#</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">البند</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الكمية</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الوحدة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">سعر الوحدة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {tender.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-gray-500">{item.description}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{item.unit}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={form.items[idx]?.unitPrice || ''}
                              onChange={(e) => updateItemPrice(idx, parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-28 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-emerald-600">
                            {(form.items[idx]?.totalPrice || 0).toLocaleString()} ج.م
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-emerald-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-left font-bold text-gray-900">
                          إجمالي العطاء
                        </td>
                        <td className="px-4 py-3 font-bold text-emerald-600 text-lg">
                          {parseFloat(form.bidAmount || '0').toLocaleString()} ج.م
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    قيمة العطاء الإجمالية <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      value={form.bidAmount}
                      onChange={(e) => updateForm('bidAmount', e.target.value)}
                      placeholder="0"
                      className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 text-lg"
                    />
                    <span className="px-4 py-3 bg-gray-100 rounded-lg text-gray-600">
                      {tender.currency === 'EGP' ? 'ج.م' : tender.currency}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    الميزانية التقديرية: {tender.budget.toLocaleString()} {tender.currency === 'EGP' ? 'ج.م' : tender.currency}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شروط الدفع المقترحة
                  </label>
                  <input
                    type="text"
                    value={form.paymentTerms}
                    onChange={(e) => updateForm('paymentTerms', e.target.value)}
                    placeholder="مثال: 50% مقدم، 50% عند التسليم"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Technical Proposal */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">العرض الفني</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العرض الفني التفصيلي <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.technicalProposal}
                  onChange={(e) => updateForm('technicalProposal', e.target.value)}
                  rows={8}
                  placeholder="اكتب العرض الفني التفصيلي الخاص بك، بما في ذلك:
- المواصفات الفنية للمنتجات/الخدمات
- خبرتك في مشاريع مماثلة
- فريق العمل المخصص
- خطة التنفيذ
- ضمانات الجودة"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مدة التسليم (بالأيام) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.deliveryDays}
                    onChange={(e) => updateForm('deliveryDays', e.target.value)}
                    placeholder="30"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    فترة الضمان (بالأشهر)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.warrantyMonths}
                    onChange={(e) => updateForm('warrantyMonths', e.target.value)}
                    placeholder="12"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات إضافية
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => updateForm('notes', e.target.value)}
                  rows={4}
                  placeholder="أي ملاحظات أو استثناءات أو شروط إضافية..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">المستندات المرفقة</h2>

              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 transition cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                />
                <div className="text-4xl mb-3">📎</div>
                <p className="font-medium text-gray-900 mb-1">اسحب الملفات هنا أو انقر للاختيار</p>
                <p className="text-sm text-gray-500">PDF, DOC, XLS, JPG, PNG - حتى 10MB لكل ملف</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-700">الملفات المرفقة ({uploadedFiles.length})</h3>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {file.type.includes('pdf') ? '📕' : file.type.includes('doc') ? '📘' : file.type.includes('xls') ? '📗' : '📄'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-red-600 hover:text-red-700 p-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-medium text-amber-800 mb-2">المستندات المطلوبة عادةً:</p>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• السجل التجاري</li>
                  <li>• البطاقة الضريبية</li>
                  <li>• شهادة التأمينات الاجتماعية</li>
                  <li>• كتالوج المنتجات أو نماذج الأعمال السابقة</li>
                  <li>• خطابات الخبرة من عملاء سابقين</li>
                </ul>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-4">ملخص العطاء</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">قيمة العطاء</span>
                    <span className="font-bold text-emerald-600">
                      {parseFloat(form.bidAmount || '0').toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">مدة التسليم</span>
                    <span className="font-medium">{form.deliveryDays || '-'} يوم</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">فترة الضمان</span>
                    <span className="font-medium">{form.warrantyMonths || '12'} شهر</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المستندات</span>
                    <span className="font-medium">{uploadedFiles.length} ملف</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              disabled={step === 1}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>

            <div className="flex gap-3">
              {step === 3 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={submitting}
                    className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50"
                  >
                    {submitting ? 'جاري الحفظ...' : 'حفظ كمسودة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit(false)}
                    disabled={submitting}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {submitting ? 'جاري التقديم...' : 'تقديم العطاء'}
                  </button>
                </>
              )}
              {step < 3 && (
                <button
                  type="button"
                  onClick={() => setStep(prev => prev + 1)}
                  disabled={!validateStep(step)}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-blue-800 mb-3">نصائح لتقديم عطاء ناجح</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li>✓ اقرأ كراسة الشروط بعناية قبل التقديم</li>
            <li>✓ قدم أسعاراً تنافسية ومنطقية</li>
            <li>✓ أرفق جميع المستندات المطلوبة</li>
            <li>✓ وضح خبراتك السابقة في مشاريع مماثلة</li>
            <li>✓ التزم بالمواعيد النهائية للتقديم</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
