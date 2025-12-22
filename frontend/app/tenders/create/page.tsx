'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface TenderItem {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  specifications: string;
}

interface TenderForm {
  title: string;
  description: string;
  type: 'OPEN' | 'RESTRICTED' | 'NEGOTIATED' | 'FRAMEWORK';
  categoryId: string;
  budget: string;
  currency: string;
  submissionDeadline: string;
  openingDate: string;
  evaluationCriteria: string;
  technicalWeight: string;
  financialWeight: string;
  eligibilityRequirements: string[];
  deliveryLocation: string;
  deliveryDeadline: string;
  warrantyPeriod: string;
  paymentTerms: string;
  items: TenderItem[];
}

const TENDER_TYPES = [
  { value: 'OPEN', label: 'مناقصة عامة', description: 'متاحة لجميع الموردين المؤهلين' },
  { value: 'RESTRICTED', label: 'مناقصة محدودة', description: 'لموردين محددين فقط' },
  { value: 'NEGOTIATED', label: 'مناقصة بالتفاوض', description: 'تفاوض مباشر مع موردين مختارين' },
  { value: 'FRAMEWORK', label: 'اتفاقية إطارية', description: 'عقد طويل المدى مع أسعار محددة' },
];

const UNITS = ['قطعة', 'كيلو', 'طن', 'متر', 'متر مربع', 'متر مكعب', 'لتر', 'علبة', 'كرتونة', 'شحنة'];

const CURRENCIES = [
  { value: 'EGP', label: 'جنيه مصري (ج.م)' },
  { value: 'USD', label: 'دولار أمريكي ($)' },
  { value: 'EUR', label: 'يورو (€)' },
];

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
  'المنوفية', 'القليوبية', 'البحيرة', 'الغربية', 'كفر الشيخ',
  'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء',
  'جنوب سيناء', 'البحر الأحمر', 'الفيوم', 'بني سويف', 'المنيا',
  'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'مطروح', 'الوادي الجديد',
];

export default function CreateTenderPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string; nameAr: string }[]>([]);
  const [form, setForm] = useState<TenderForm>({
    title: '',
    description: '',
    type: 'OPEN',
    categoryId: '',
    budget: '',
    currency: 'EGP',
    submissionDeadline: '',
    openingDate: '',
    evaluationCriteria: '',
    technicalWeight: '60',
    financialWeight: '40',
    eligibilityRequirements: [''],
    deliveryLocation: '',
    deliveryDeadline: '',
    warrantyPeriod: '12',
    paymentTerms: '',
    items: [{ name: '', description: '', quantity: 1, unit: 'قطعة', specifications: '' }],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/categories?type=TENDER');
      setCategories(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const updateForm = (field: keyof TenderForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { name: '', description: '', quantity: 1, unit: 'قطعة', specifications: '' }],
    }));
  };

  const updateItem = (index: number, field: keyof TenderItem, value: any) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }));
  };

  const removeItem = (index: number) => {
    if (form.items.length > 1) {
      setForm(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      }));
    }
  };

  const addRequirement = () => {
    setForm(prev => ({
      ...prev,
      eligibilityRequirements: [...prev.eligibilityRequirements, ''],
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      eligibilityRequirements: prev.eligibilityRequirements.map((req, i) => i === index ? value : req),
    }));
  };

  const removeRequirement = (index: number) => {
    if (form.eligibilityRequirements.length > 1) {
      setForm(prev => ({
        ...prev,
        eligibilityRequirements: prev.eligibilityRequirements.filter((_, i) => i !== index),
      }));
    }
  };

  const validateStep = (stepNum: number): boolean => {
    switch (stepNum) {
      case 1:
        return !!form.title && !!form.description && !!form.type && !!form.categoryId;
      case 2:
        return form.items.every(item => !!item.name && item.quantity > 0);
      case 3:
        return !!form.budget && !!form.submissionDeadline && !!form.openingDate;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        budget: parseFloat(form.budget),
        technicalWeight: parseInt(form.technicalWeight),
        financialWeight: parseInt(form.financialWeight),
        warrantyPeriod: parseInt(form.warrantyPeriod),
        eligibilityRequirements: form.eligibilityRequirements.filter(r => r.trim()),
        items: form.items.filter(item => item.name.trim()),
        status,
      };

      const response = await apiClient.post('/tenders', payload);
      const tenderId = response.data.data?.id || response.data.id;

      router.push(`/tenders/${tenderId}`);
    } catch (err: any) {
      console.error('Error creating tender:', err);
      setError(err.response?.data?.message || 'فشل في إنشاء المناقصة');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/tenders"
            className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            العودة لقائمة المناقصات
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">إنشاء مناقصة جديدة</h1>
        <p className="text-gray-600 mb-8">أنشئ مناقصة واستقبل عطاءات من أفضل الموردين</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'المعلومات الأساسية' },
            { num: 2, label: 'بنود المناقصة' },
            { num: 3, label: 'التواريخ والميزانية' },
            { num: 4, label: 'الشروط والمتطلبات' },
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
              {idx < 3 && (
                <div className={`w-12 h-1 mx-2 ${step > s.num ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان المناقصة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  placeholder="مثال: توريد أجهزة حاسب آلي"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف المناقصة <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={5}
                  placeholder="اكتب وصفاً تفصيلياً للمناقصة..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع المناقصة <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {TENDER_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        form.type === type.value
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.value}
                        checked={form.type === type.value}
                        onChange={(e) => updateForm('type', e.target.value)}
                        className="sr-only"
                      />
                      <p className="font-medium text-gray-900">{type.label}</p>
                      <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التصنيف <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => updateForm('categoryId', e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">اختر التصنيف</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Items */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">بنود المناقصة</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1"
                >
                  <span>+</span> إضافة بند
                </button>
              </div>

              {form.items.map((item, idx) => (
                <div key={idx} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">البند {idx + 1}</span>
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        حذف
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">اسم البند *</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        placeholder="مثال: جهاز حاسب آلي"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">الكمية *</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">الوحدة</label>
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          {UNITS.map((unit) => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">الوصف</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                      placeholder="وصف مختصر للبند..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">المواصفات الفنية</label>
                    <textarea
                      value={item.specifications}
                      onChange={(e) => updateItem(idx, 'specifications', e.target.value)}
                      rows={2}
                      placeholder="المواصفات التفصيلية..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Budget & Dates */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الميزانية التقديرية <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={form.budget}
                      onChange={(e) => updateForm('budget', e.target.value)}
                      placeholder="0"
                      className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    <select
                      value={form.currency}
                      onChange={(e) => updateForm('currency', e.target.value)}
                      className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.value} value={curr.value}>{curr.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموعد النهائي للتقديم <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.submissionDeadline}
                    onChange={(e) => updateForm('submissionDeadline', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    موعد فتح المظاريف <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.openingDate}
                    onChange={(e) => updateForm('openingDate', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    موقع التسليم
                  </label>
                  <select
                    value={form.deliveryLocation}
                    onChange={(e) => updateForm('deliveryLocation', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    موعد التسليم المتوقع
                  </label>
                  <input
                    type="date"
                    value={form.deliveryDeadline}
                    onChange={(e) => updateForm('deliveryDeadline', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Requirements */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  معايير التقييم
                </label>
                <textarea
                  value={form.evaluationCriteria}
                  onChange={(e) => updateForm('evaluationCriteria', e.target.value)}
                  rows={4}
                  placeholder="اكتب معايير تقييم العطاءات..."
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وزن التقييم الفني (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.technicalWeight}
                    onChange={(e) => {
                      updateForm('technicalWeight', e.target.value);
                      updateForm('financialWeight', String(100 - parseInt(e.target.value)));
                    }}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وزن التقييم المالي (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.financialWeight}
                    onChange={(e) => {
                      updateForm('financialWeight', e.target.value);
                      updateForm('technicalWeight', String(100 - parseInt(e.target.value)));
                    }}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">شروط الأهلية</label>
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="text-emerald-600 hover:text-emerald-700 text-sm"
                  >
                    + إضافة شرط
                  </button>
                </div>
                {form.eligibilityRequirements.map((req, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateRequirement(idx, e.target.value)}
                      placeholder={`الشرط ${idx + 1}`}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    {form.eligibilityRequirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(idx)}
                        className="text-red-600 hover:text-red-700 px-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    فترة الضمان (بالأشهر)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.warrantyPeriod}
                    onChange={(e) => updateForm('warrantyPeriod', e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شروط الدفع
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
              {step === 4 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSubmit('DRAFT')}
                    disabled={loading}
                    className="px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ كمسودة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSubmit('PUBLISHED')}
                    disabled={loading}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {loading ? 'جاري النشر...' : 'نشر المناقصة'}
                  </button>
                </>
              )}
              {step < 4 && (
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
      </div>
    </div>
  );
}
