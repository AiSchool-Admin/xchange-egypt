/**
 * صفحة إنشاء مناقصة جديدة
 * Create New Tender Page
 * سوق المناقصات - Xchange Egypt
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ==================== Types ====================
interface TenderFormData {
  // Basic Info
  title: string;
  description: string;
  category: string;
  subcategory: string;
  type: 'GOODS' | 'SERVICES' | 'WORKS' | 'MIXED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITED';

  // Budget & Timeline
  budgetMin: number;
  budgetMax: number;
  currency: string;
  deadline: string;
  executionStartDate: string;
  executionEndDate: string;

  // Location
  governorate: string;
  city: string;
  deliveryAddress: string;
  isRemoteAllowed: boolean;

  // Requirements
  technicalRequirements: string;
  qualificationRequirements: string[];
  requiredDocuments: RequiredDocument[];

  // Evaluation
  evaluationMethod: 'LOWEST_PRICE' | 'BEST_VALUE' | 'QUALITY_BASED';
  evaluationCriteria: EvaluationCriterion[];

  // Reverse Auction
  enableReverseAuction: boolean;
  auctionStartPrice: number;
  auctionMinDecrement: number;
  auctionDuration: number;

  // Additional Options
  requireBidBond: boolean;
  bidBondPercentage: number;
  allowPartialBids: boolean;
  allowJointVentures: boolean;
  preferLocalVendors: boolean;

  // Documents
  attachments: File[];
}

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
}

interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
}

// ==================== Constants ====================
const CATEGORIES = [
  { value: 'IT_EQUIPMENT', label: 'معدات تقنية المعلومات' },
  { value: 'CONSTRUCTION', label: 'البناء والتشييد' },
  { value: 'MEDICAL', label: 'المستلزمات الطبية' },
  { value: 'FURNITURE', label: 'الأثاث والتجهيزات' },
  { value: 'VEHICLES', label: 'المركبات ووسائل النقل' },
  { value: 'SECURITY', label: 'الأمن والحراسة' },
  { value: 'CLEANING', label: 'النظافة والصيانة' },
  { value: 'CONSULTING', label: 'الاستشارات' },
  { value: 'TRAINING', label: 'التدريب والتطوير' },
  { value: 'MARKETING', label: 'التسويق والإعلان' },
  { value: 'FOOD', label: 'التموين والغذاء' },
  { value: 'OTHER', label: 'أخرى' },
];

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
  'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان',
  'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
  'شمال سيناء', 'سوهاج',
];

const DEFAULT_REQUIRED_DOCUMENTS: RequiredDocument[] = [
  { id: '1', name: 'السجل التجاري', description: 'صورة سارية', isRequired: true },
  { id: '2', name: 'البطاقة الضريبية', description: 'صورة سارية', isRequired: true },
  { id: '3', name: 'شهادة التأمينات الاجتماعية', description: 'صورة سارية', isRequired: true },
  { id: '4', name: 'شهادات الخبرة', description: 'مشاريع مماثلة سابقة', isRequired: false },
  { id: '5', name: 'شهادات الجودة', description: 'ISO أو ما يعادلها', isRequired: false },
];

const DEFAULT_CRITERIA: EvaluationCriterion[] = [
  { id: '1', name: 'السعر', weight: 40, description: 'القيمة المالية للعطاء' },
  { id: '2', name: 'الجودة التقنية', weight: 30, description: 'جودة المواصفات المقدمة' },
  { id: '3', name: 'الخبرة السابقة', weight: 20, description: 'المشاريع المماثلة' },
  { id: '4', name: 'مدة التنفيذ', weight: 10, description: 'الجدول الزمني المقترح' },
];

// ==================== Component ====================
export default function CreateTenderPage() {
  const router = useRouter();

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<TenderFormData>({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    type: 'GOODS',
    visibility: 'PUBLIC',
    budgetMin: 0,
    budgetMax: 0,
    currency: 'EGP',
    deadline: '',
    executionStartDate: '',
    executionEndDate: '',
    governorate: '',
    city: '',
    deliveryAddress: '',
    isRemoteAllowed: false,
    technicalRequirements: '',
    qualificationRequirements: [],
    requiredDocuments: DEFAULT_REQUIRED_DOCUMENTS,
    evaluationMethod: 'BEST_VALUE',
    evaluationCriteria: DEFAULT_CRITERIA,
    enableReverseAuction: false,
    auctionStartPrice: 0,
    auctionMinDecrement: 5000,
    auctionDuration: 60,
    requireBidBond: false,
    bidBondPercentage: 5,
    allowPartialBids: false,
    allowJointVentures: true,
    preferLocalVendors: false,
    attachments: [],
  });

  const totalSteps = 6;

  // Update form field
  const updateField = (field: keyof TenderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Update evaluation criterion
  const updateCriterion = (id: string, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  // Add evaluation criterion
  const addCriterion = () => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: [
        ...prev.evaluationCriteria,
        { id: Date.now().toString(), name: '', weight: 0, description: '' },
      ],
    }));
  };

  // Remove evaluation criterion
  const removeCriterion = (id: string) => {
    setFormData(prev => ({
      ...prev,
      evaluationCriteria: prev.evaluationCriteria.filter(c => c.id !== id),
    }));
  };

  // Toggle required document
  const toggleDocumentRequired = (id: string) => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.map(d =>
        d.id === id ? { ...d, isRequired: !d.isRequired } : d
      ),
    }));
  };

  // Add required document
  const addRequiredDocument = () => {
    setFormData(prev => ({
      ...prev,
      requiredDocuments: [
        ...prev.requiredDocuments,
        { id: Date.now().toString(), name: '', description: '', isRequired: false },
      ],
    }));
  };

  // Calculate total weight
  const getTotalWeight = () => {
    return formData.evaluationCriteria.reduce((sum, c) => sum + c.weight, 0);
  };

  // Validate step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Basic Info
        if (!formData.title.trim()) newErrors.title = 'يجب إدخال عنوان المناقصة';
        if (formData.title.length < 10) newErrors.title = 'العنوان قصير جداً (10 أحرف على الأقل)';
        if (!formData.description.trim()) newErrors.description = 'يجب إدخال وصف المناقصة';
        if (formData.description.length < 50) newErrors.description = 'الوصف قصير جداً (50 حرف على الأقل)';
        if (!formData.category) newErrors.category = 'يجب اختيار التصنيف';
        break;

      case 2: // Budget & Timeline
        if (formData.budgetMin <= 0) newErrors.budgetMin = 'يجب إدخال الحد الأدنى للميزانية';
        if (formData.budgetMax <= 0) newErrors.budgetMax = 'يجب إدخال الحد الأقصى للميزانية';
        if (formData.budgetMax < formData.budgetMin) newErrors.budgetMax = 'الحد الأقصى يجب أن يكون أكبر من الحد الأدنى';
        if (!formData.deadline) newErrors.deadline = 'يجب تحديد موعد إغلاق المناقصة';
        const deadlineDate = new Date(formData.deadline);
        if (deadlineDate <= new Date()) newErrors.deadline = 'يجب أن يكون الموعد في المستقبل';
        break;

      case 3: // Location
        if (!formData.governorate) newErrors.governorate = 'يجب اختيار المحافظة';
        break;

      case 4: // Requirements
        if (!formData.technicalRequirements.trim()) {
          newErrors.technicalRequirements = 'يجب إدخال المتطلبات الفنية';
        }
        break;

      case 5: // Evaluation
        if (getTotalWeight() !== 100) {
          newErrors.evaluationCriteria = 'مجموع أوزان المعايير يجب أن يساوي 100%';
        }
        break;

      case 6: // Review
        // All validations from previous steps
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate steps
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Submit tender
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to success page
      router.push('/tenders/create-success');
    } catch (error) {
      setErrors({ submit: 'حدث خطأ أثناء إنشاء المناقصة. يرجى المحاولة مرة أخرى.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    // Save draft logic
    console.log('Saving draft...', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">إنشاء مناقصة جديدة</h1>
                <p className="text-sm text-gray-500">الخطوة {currentStep} من {totalSteps}</p>
              </div>
            </div>

            <button
              onClick={handleSaveDraft}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              حفظ كمسودة
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[
              'المعلومات الأساسية',
              'الميزانية والمواعيد',
              'الموقع',
              'المتطلبات',
              'التقييم',
              'المراجعة',
            ].map((label, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep > index + 1
                      ? 'bg-emerald-500 text-white'
                      : currentStep === index + 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > index + 1 ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${
                  currentStep >= index + 1 ? 'text-emerald-600' : 'text-gray-400'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">المعلومات الأساسية</h2>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان المناقصة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="مثال: مناقصة توريد أجهزة حاسب آلي"
                />
                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف المناقصة <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={5}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="اكتب وصفاً تفصيلياً للمناقصة..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
                <p className="mt-1 text-sm text-gray-500">{formData.description.length} حرف</p>
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التصنيف <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  >
                    <option value="">اختر التصنيف</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع المناقصة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="GOODS">توريد سلع</option>
                    <option value="SERVICES">تقديم خدمات</option>
                    <option value="WORKS">أعمال مقاولات</option>
                    <option value="MIXED">مختلط</option>
                  </select>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نطاق الإعلان
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'PUBLIC', label: 'عامة', desc: 'متاحة لجميع الموردين' },
                    { value: 'PRIVATE', label: 'خاصة', desc: 'مخفية من البحث العام' },
                    { value: 'INVITED', label: 'دعوات فقط', desc: 'للموردين المدعوين فقط' },
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.visibility === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={option.value}
                        checked={formData.visibility === option.value}
                        onChange={(e) => updateField('visibility', e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-medium text-gray-900">{option.label}</span>
                      <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Budget & Timeline */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">الميزانية والمواعيد</h2>

              {/* Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نطاق الميزانية <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">الحد الأدنى</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.budgetMin || ''}
                        onChange={(e) => updateField('budgetMin', parseFloat(e.target.value) || 0)}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.budgetMin ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        placeholder="0"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">ج.م</span>
                    </div>
                    {errors.budgetMin && <p className="mt-1 text-sm text-red-500">{errors.budgetMin}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">الحد الأقصى</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.budgetMax || ''}
                        onChange={(e) => updateField('budgetMax', parseFloat(e.target.value) || 0)}
                        className={`w-full px-4 py-3 border rounded-lg ${
                          errors.budgetMax ? 'border-red-500' : 'border-gray-300'
                        } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                        placeholder="0"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">ج.م</span>
                    </div>
                    {errors.budgetMax && <p className="mt-1 text-sm text-red-500">{errors.budgetMax}</p>}
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  موعد إغلاق المناقصة <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.deadline}
                  onChange={(e) => updateField('deadline', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.deadline ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                />
                {errors.deadline && <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>}
              </div>

              {/* Execution Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  فترة التنفيذ المتوقعة
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">تاريخ البدء</label>
                    <input
                      type="date"
                      value={formData.executionStartDate}
                      onChange={(e) => updateField('executionStartDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">تاريخ الانتهاء</label>
                    <input
                      type="date"
                      value={formData.executionEndDate}
                      onChange={(e) => updateField('executionEndDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Reverse Auction Option */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableReverseAuction}
                    onChange={(e) => updateField('enableReverseAuction', e.target.checked)}
                    className="mt-1 w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">تفعيل المزاد العكسي</span>
                    <p className="text-sm text-gray-500 mt-1">
                      بعد انتهاء فترة تقديم العطاءات، سيتم دعوة المتقدمين المؤهلين للمشاركة في مزاد عكسي مباشر
                    </p>
                  </div>
                </label>

                {formData.enableReverseAuction && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">سعر البدء</label>
                      <input
                        type="number"
                        value={formData.auctionStartPrice || ''}
                        onChange={(e) => updateField('auctionStartPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">الحد الأدنى للتخفيض</label>
                      <input
                        type="number"
                        value={formData.auctionMinDecrement || ''}
                        onChange={(e) => updateField('auctionMinDecrement', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">مدة المزاد (دقيقة)</label>
                      <input
                        type="number"
                        value={formData.auctionDuration || ''}
                        onChange={(e) => updateField('auctionDuration', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="60"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">الموقع والتسليم</h2>

              {/* Governorate & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المحافظة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => updateField('governorate', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      errors.governorate ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                  {errors.governorate && <p className="mt-1 text-sm text-red-500">{errors.governorate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="اسم المدينة"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان التسليم
                </label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => updateField('deliveryAddress', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="العنوان التفصيلي لمكان التسليم..."
                />
              </div>

              {/* Remote Option */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isRemoteAllowed}
                    onChange={(e) => updateField('isRemoteAllowed', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">يمكن التنفيذ عن بُعد</span>
                    <p className="text-sm text-gray-500">لا يتطلب حضوراً فعلياً في موقع العمل</p>
                  </div>
                </label>
              </div>

              {/* Local Vendor Preference */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferLocalVendors}
                    onChange={(e) => updateField('preferLocalVendors', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">أفضلية للموردين المحليين</span>
                    <p className="text-sm text-gray-500">إعطاء نقاط إضافية للموردين من نفس المحافظة</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Requirements */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">المتطلبات والمواصفات</h2>

              {/* Technical Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المواصفات والمتطلبات الفنية <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.technicalRequirements}
                  onChange={(e) => updateField('technicalRequirements', e.target.value)}
                  rows={8}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.technicalRequirements ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                  placeholder="اكتب المواصفات الفنية التفصيلية هنا...

مثال:
- المواصفات التقنية للمنتجات
- معايير الجودة المطلوبة
- الكميات والأحجام
- طريقة التغليف والتسليم"
                />
                {errors.technicalRequirements && (
                  <p className="mt-1 text-sm text-red-500">{errors.technicalRequirements}</p>
                )}
              </div>

              {/* Required Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المستندات المطلوبة من المتقدمين
                </label>
                <div className="space-y-3">
                  {formData.requiredDocuments.map((doc, index) => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        checked={doc.isRequired}
                        onChange={() => toggleDocumentRequired(doc.id)}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={doc.name}
                          onChange={(e) => {
                            const newDocs = [...formData.requiredDocuments];
                            newDocs[index].name = e.target.value;
                            updateField('requiredDocuments', newDocs);
                          }}
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                          placeholder="اسم المستند"
                        />
                      </div>
                      {doc.isRequired && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                          إلزامي
                        </span>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addRequiredDocument}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إضافة مستند آخر
                  </button>
                </div>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">خيارات إضافية</h3>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requireBidBond}
                    onChange={(e) => updateField('requireBidBond', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">تتطلب خطاب ضمان ابتدائي</span>
                </label>

                {formData.requireBidBond && (
                  <div className="mr-8">
                    <label className="block text-sm text-gray-500 mb-1">نسبة الضمان (%)</label>
                    <input
                      type="number"
                      value={formData.bidBondPercentage}
                      onChange={(e) => updateField('bidBondPercentage', parseFloat(e.target.value) || 0)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                      min="1"
                      max="20"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowPartialBids}
                    onChange={(e) => updateField('allowPartialBids', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">السماح بالعطاءات الجزئية</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowJointVentures}
                    onChange={(e) => updateField('allowJointVentures', e.target.checked)}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">السماح بالتحالفات والمشاركة</span>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Evaluation */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">معايير التقييم</h2>

              {/* Evaluation Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  طريقة التقييم
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: 'LOWEST_PRICE', label: 'أقل سعر', desc: 'الفائز هو صاحب أقل عرض مالي' },
                    { value: 'BEST_VALUE', label: 'أفضل قيمة', desc: 'التوازن بين السعر والجودة' },
                    { value: 'QUALITY_BASED', label: 'الجودة أولاً', desc: 'الأولوية للجودة التقنية' },
                  ].map(method => (
                    <label
                      key={method.value}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        formData.evaluationMethod === method.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="evaluationMethod"
                        value={method.value}
                        checked={formData.evaluationMethod === method.value}
                        onChange={(e) => updateField('evaluationMethod', e.target.value)}
                        className="sr-only"
                      />
                      <span className="font-medium text-gray-900">{method.label}</span>
                      <p className="text-sm text-gray-500 mt-1">{method.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Evaluation Criteria */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    معايير التقييم التفصيلية
                  </label>
                  <span className={`text-sm ${getTotalWeight() === 100 ? 'text-emerald-600' : 'text-red-500'}`}>
                    المجموع: {getTotalWeight()}%
                  </span>
                </div>

                <div className="space-y-3">
                  {formData.evaluationCriteria.map((criterion, index) => (
                    <div key={criterion.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-400 font-medium mt-2">{index + 1}.</span>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="اسم المعيار"
                        />
                        <input
                          type="text"
                          value={criterion.description}
                          onChange={(e) => updateCriterion(criterion.id, 'description', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="الوصف"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={criterion.weight || ''}
                            onChange={(e) => updateCriterion(criterion.id, 'weight', parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="0"
                            min="0"
                            max="100"
                          />
                          <span className="text-gray-500">%</span>
                        </div>
                      </div>
                      {formData.evaluationCriteria.length > 1 && (
                        <button
                          onClick={() => removeCriterion(criterion.id)}
                          className="text-red-500 hover:text-red-700 mt-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={addCriterion}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إضافة معيار
                  </button>
                </div>

                {errors.evaluationCriteria && (
                  <p className="mt-2 text-sm text-red-500">{errors.evaluationCriteria}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">مراجعة المناقصة</h2>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">المعلومات الأساسية</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">العنوان:</dt>
                      <dd className="text-gray-900 font-medium">{formData.title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">التصنيف:</dt>
                      <dd className="text-gray-900">{CATEGORIES.find(c => c.value === formData.category)?.label}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">النوع:</dt>
                      <dd className="text-gray-900">
                        {formData.type === 'GOODS' ? 'توريد سلع' :
                         formData.type === 'SERVICES' ? 'خدمات' :
                         formData.type === 'WORKS' ? 'مقاولات' : 'مختلط'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">النطاق:</dt>
                      <dd className="text-gray-900">
                        {formData.visibility === 'PUBLIC' ? 'عامة' :
                         formData.visibility === 'PRIVATE' ? 'خاصة' : 'دعوات فقط'}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Budget & Timeline */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">الميزانية والمواعيد</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">الميزانية:</dt>
                      <dd className="text-emerald-600 font-bold">
                        {formatCurrency(formData.budgetMin)} - {formatCurrency(formData.budgetMax)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-500">موعد الإغلاق:</dt>
                      <dd className="text-gray-900">
                        {new Date(formData.deadline).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </dd>
                    </div>
                    {formData.enableReverseAuction && (
                      <div className="flex justify-between">
                        <dt className="text-orange-600">المزاد العكسي:</dt>
                        <dd className="text-orange-600">مفعّل</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">الموقع</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">المحافظة:</dt>
                      <dd className="text-gray-900">{formData.governorate}</dd>
                    </div>
                    {formData.city && (
                      <div className="flex justify-between">
                        <dt className="text-gray-500">المدينة:</dt>
                        <dd className="text-gray-900">{formData.city}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-gray-500">التنفيذ عن بُعد:</dt>
                      <dd className="text-gray-900">{formData.isRemoteAllowed ? 'متاح' : 'غير متاح'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Evaluation */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">التقييم</h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-500">طريقة التقييم:</dt>
                      <dd className="text-gray-900">
                        {formData.evaluationMethod === 'LOWEST_PRICE' ? 'أقل سعر' :
                         formData.evaluationMethod === 'BEST_VALUE' ? 'أفضل قيمة' : 'الجودة أولاً'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500 mb-1">المعايير:</dt>
                      <dd>
                        {formData.evaluationCriteria.map(c => (
                          <div key={c.id} className="flex justify-between text-gray-700">
                            <span>{c.name}</span>
                            <span>{c.weight}%</span>
                          </div>
                        ))}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Description Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">الوصف</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{formData.description}</p>
              </div>

              {/* Technical Requirements Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">المتطلبات الفنية</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{formData.technicalRequirements}</p>
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {errors.submit}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              السابق
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    نشر المناقصة
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
