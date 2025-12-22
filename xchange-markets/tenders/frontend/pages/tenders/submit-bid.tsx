/**
 * صفحة تقديم العطاء
 * Bid Submission Page
 * سوق المناقصات - Xchange Egypt
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// ==================== Types ====================
interface Tender {
  id: string;
  title: string;
  referenceNumber: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  deadline: string;
  hasReverseAuction: boolean;
  reverseAuctionStartPrice?: number;
  evaluationCriteria: EvaluationCriterion[];
  requiredDocuments: RequiredDocument[];
  owner: {
    name: string;
    type: string;
    logo?: string;
  };
}

interface EvaluationCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
}

interface RequiredDocument {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  maxSize: number; // in MB
  allowedTypes: string[];
}

interface BidFormData {
  amount: number;
  executionDays: number;
  technicalProposal: string;
  financialBreakdown: FinancialItem[];
  teamMembers: TeamMember[];
  documents: UploadedDocument[];
  termsAccepted: boolean;
  warrantyMonths: number;
  paymentTerms: string;
}

interface FinancialItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  experience: string;
  qualifications: string;
}

interface UploadedDocument {
  id: string;
  documentId: string;
  file: File | null;
  fileName: string;
  uploadProgress: number;
  uploaded: boolean;
}

// ==================== Constants ====================
const PAYMENT_TERMS_OPTIONS = [
  { value: 'advance_25', label: '25% مقدم - 75% عند التسليم' },
  { value: 'advance_50', label: '50% مقدم - 50% عند التسليم' },
  { value: 'milestones', label: 'دفعات على مراحل' },
  { value: 'on_delivery', label: 'الدفع عند التسليم' },
  { value: 'net_30', label: 'صافي 30 يوم' },
  { value: 'net_60', label: 'صافي 60 يوم' },
];

// ==================== Component ====================
export default function SubmitBidPage() {
  const router = useRouter();
  const params = useParams();
  const tenderId = params?.id as string;

  // State
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<BidFormData>({
    amount: 0,
    executionDays: 30,
    technicalProposal: '',
    financialBreakdown: [{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }],
    teamMembers: [],
    documents: [],
    termsAccepted: false,
    warrantyMonths: 12,
    paymentTerms: 'milestones',
  });

  const totalSteps = 5;

  // Load tender data
  useEffect(() => {
    loadTenderData();
  }, [tenderId]);

  const loadTenderData = async () => {
    setLoading(true);
    // Simulated API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockTender: Tender = {
      id: tenderId,
      title: 'مناقصة توريد أجهزة حاسب آلي لوزارة التربية والتعليم',
      referenceNumber: 'TND-2024-00125',
      category: 'IT_EQUIPMENT',
      budgetMin: 500000,
      budgetMax: 750000,
      currency: 'EGP',
      deadline: '2024-02-15T23:59:59',
      hasReverseAuction: true,
      reverseAuctionStartPrice: 700000,
      evaluationCriteria: [
        { id: '1', name: 'السعر', weight: 40, description: 'القيمة المالية للعطاء' },
        { id: '2', name: 'الجودة التقنية', weight: 30, description: 'جودة المواصفات التقنية المقدمة' },
        { id: '3', name: 'الخبرة السابقة', weight: 20, description: 'المشاريع المماثلة السابقة' },
        { id: '4', name: 'مدة التنفيذ', weight: 10, description: 'الجدول الزمني المقترح' },
      ],
      requiredDocuments: [
        { id: '1', name: 'السجل التجاري', description: 'صورة سارية من السجل التجاري', isRequired: true, maxSize: 10, allowedTypes: ['pdf', 'jpg', 'png'] },
        { id: '2', name: 'البطاقة الضريبية', description: 'صورة سارية من البطاقة الضريبية', isRequired: true, maxSize: 10, allowedTypes: ['pdf', 'jpg', 'png'] },
        { id: '3', name: 'شهادة التأمينات', description: 'شهادة التأمينات الاجتماعية', isRequired: true, maxSize: 10, allowedTypes: ['pdf'] },
        { id: '4', name: 'كتالوج المنتجات', description: 'كتالوج المنتجات المعروضة', isRequired: false, maxSize: 50, allowedTypes: ['pdf'] },
        { id: '5', name: 'شهادات الجودة', description: 'شهادات ISO أو ما يعادلها', isRequired: false, maxSize: 20, allowedTypes: ['pdf', 'jpg', 'png'] },
      ],
      owner: {
        name: 'وزارة التربية والتعليم',
        type: 'GOVERNMENT',
        logo: '/logos/moe.png',
      },
    };

    setTender(mockTender);

    // Initialize documents state
    setFormData(prev => ({
      ...prev,
      documents: mockTender.requiredDocuments.map(doc => ({
        id: doc.id,
        documentId: doc.id,
        file: null,
        fileName: '',
        uploadProgress: 0,
        uploaded: false,
      })),
    }));

    setLoading(false);
  };

  // Calculate financial total
  const calculateFinancialTotal = () => {
    return formData.financialBreakdown.reduce((sum, item) => sum + item.total, 0);
  };

  // Update financial item
  const updateFinancialItem = (id: string, field: string, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      financialBreakdown: prev.financialBreakdown.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  // Add financial item
  const addFinancialItem = () => {
    setFormData(prev => ({
      ...prev,
      financialBreakdown: [
        ...prev.financialBreakdown,
        { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, total: 0 },
      ],
    }));
  };

  // Remove financial item
  const removeFinancialItem = (id: string) => {
    if (formData.financialBreakdown.length > 1) {
      setFormData(prev => ({
        ...prev,
        financialBreakdown: prev.financialBreakdown.filter(item => item.id !== id),
      }));
    }
  };

  // Add team member
  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        { id: Date.now().toString(), name: '', role: '', experience: '', qualifications: '' },
      ],
    }));
  };

  // Update team member
  const updateTeamMember = (id: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member =>
        member.id === id ? { ...member, [field]: value } : member
      ),
    }));
  };

  // Remove team member
  const removeTeamMember = (id: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(member => member.id !== id),
    }));
  };

  // Handle file upload
  const handleFileUpload = async (documentId: string, file: File) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.map(doc =>
        doc.documentId === documentId
          ? { ...doc, file, fileName: file.name, uploadProgress: 0 }
          : doc
      ),
    }));

    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setFormData(prev => ({
        ...prev,
        documents: prev.documents.map(doc =>
          doc.documentId === documentId
            ? { ...doc, uploadProgress: progress, uploaded: progress === 100 }
            : doc
        ),
      }));
    }
  };

  // Validate current step
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Financial
        if (formData.amount <= 0) {
          newErrors.amount = 'يجب إدخال قيمة العطاء';
        } else if (tender && formData.amount > tender.budgetMax) {
          newErrors.amount = `قيمة العطاء تتجاوز الحد الأقصى (${tender.budgetMax.toLocaleString()} ${tender.currency})`;
        }
        if (formData.financialBreakdown.some(item => !item.description)) {
          newErrors.financialBreakdown = 'يجب إدخال وصف لكل بند مالي';
        }
        break;

      case 2: // Technical
        if (!formData.technicalProposal || formData.technicalProposal.length < 100) {
          newErrors.technicalProposal = 'يجب إدخال العرض الفني (100 حرف على الأقل)';
        }
        if (formData.executionDays <= 0) {
          newErrors.executionDays = 'يجب إدخال مدة التنفيذ';
        }
        break;

      case 3: // Team
        // Team is optional, no validation needed
        break;

      case 4: // Documents
        if (tender) {
          const requiredDocs = tender.requiredDocuments.filter(d => d.isRequired);
          const uploadedDocs = formData.documents.filter(d => d.uploaded);
          const missingDocs = requiredDocs.filter(rd =>
            !uploadedDocs.find(ud => ud.documentId === rd.id)
          );
          if (missingDocs.length > 0) {
            newErrors.documents = `يجب رفع المستندات المطلوبة: ${missingDocs.map(d => d.name).join(', ')}`;
          }
        }
        break;

      case 5: // Review
        if (!formData.termsAccepted) {
          newErrors.termsAccepted = 'يجب الموافقة على الشروط والأحكام';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate steps
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit bid
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirect to success page
      router.push(`/tenders/${tenderId}/bid-submitted`);
    } catch (error) {
      setErrors({ submit: 'حدث خطأ أثناء تقديم العطاء. يرجى المحاولة مرة أخرى.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get time remaining
  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'انتهى الموعد';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days} يوم و ${hours} ساعة`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات المناقصة...</p>
        </div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg">لم يتم العثور على المناقصة</p>
          <Link href="/tenders" className="mt-4 text-emerald-600 hover:underline">
            العودة إلى قائمة المناقصات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={`/tenders/${tenderId}`} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">تقديم عطاء</h1>
                <p className="text-sm text-gray-500">{tender.referenceNumber}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-left">
                <p className="text-sm text-gray-500">الموعد النهائي</p>
                <p className="text-sm font-medium text-red-600">{getTimeRemaining(tender.deadline)}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'العرض المالي' },
              { num: 2, title: 'العرض الفني' },
              { num: 3, title: 'فريق العمل' },
              { num: 4, title: 'المستندات' },
              { num: 5, title: 'المراجعة والإرسال' },
            ].map((step, index) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep > step.num
                        ? 'bg-emerald-500 text-white'
                        : currentStep === step.num
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.num ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      step.num
                    )}
                  </div>
                  <span className={`mt-2 text-xs ${currentStep >= step.num ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                    {step.title}
                  </span>
                </div>
                {index < 4 && (
                  <div className={`flex-1 h-1 mx-2 ${currentStep > step.num ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Tender Summary Card */}
        <div className="bg-gradient-to-l from-emerald-50 to-teal-50 rounded-lg p-4 mb-6 border border-emerald-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">{tender.title}</h3>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span>الميزانية: {formatCurrency(tender.budgetMin)} - {formatCurrency(tender.budgetMax)}</span>
                <span>|</span>
                <span>{tender.owner.name}</span>
                {tender.hasReverseAuction && (
                  <>
                    <span>|</span>
                    <span className="text-orange-600">يتضمن مزاد عكسي</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {/* Step 1: Financial Proposal */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">العرض المالي</h2>

              {/* Total Bid Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إجمالي قيمة العطاء <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className={`w-full px-4 py-3 border rounded-lg text-lg font-bold ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    placeholder="0"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    {tender.currency}
                  </span>
                </div>
                {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
                <p className="mt-1 text-sm text-gray-500">
                  الميزانية المحددة: {formatCurrency(tender.budgetMin)} - {formatCurrency(tender.budgetMax)}
                </p>
              </div>

              {/* Financial Breakdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التفصيل المالي
                </label>
                <div className="space-y-3">
                  {formData.financialBreakdown.map((item, index) => (
                    <div key={item.id} className="flex gap-3 items-start p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-400 font-medium mt-2">{index + 1}.</span>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateFinancialItem(item.id, 'description', e.target.value)}
                          className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="وصف البند"
                        />
                        <input
                          type="number"
                          value={item.quantity || ''}
                          onChange={(e) => updateFinancialItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="الكمية"
                        />
                        <div className="relative">
                          <input
                            type="number"
                            value={item.unitPrice || ''}
                            onChange={(e) => updateFinancialItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="سعر الوحدة"
                          />
                        </div>
                      </div>
                      <div className="text-left min-w-[100px]">
                        <p className="font-bold text-emerald-600">{formatCurrency(item.total)}</p>
                      </div>
                      {formData.financialBreakdown.length > 1 && (
                        <button
                          onClick={() => removeFinancialItem(item.id)}
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
                    onClick={addFinancialItem}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إضافة بند
                  </button>
                </div>
                {errors.financialBreakdown && (
                  <p className="mt-1 text-sm text-red-500">{errors.financialBreakdown}</p>
                )}
              </div>

              {/* Financial Summary */}
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">إجمالي التفصيل المالي:</span>
                  <span className="text-xl font-bold text-emerald-600">
                    {formatCurrency(calculateFinancialTotal())}
                  </span>
                </div>
                {formData.amount > 0 && Math.abs(formData.amount - calculateFinancialTotal()) > 1 && (
                  <p className="mt-2 text-sm text-orange-600">
                    تنبيه: إجمالي التفصيل لا يطابق قيمة العطاء الإجمالية
                  </p>
                )}
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شروط الدفع المقترحة
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {PAYMENT_TERMS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Technical Proposal */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">العرض الفني</h2>

              {/* Technical Proposal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العرض الفني التفصيلي <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.technicalProposal}
                  onChange={(e) => setFormData(prev => ({ ...prev, technicalProposal: e.target.value }))}
                  rows={10}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    errors.technicalProposal ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-emerald-500`}
                  placeholder="اكتب العرض الفني التفصيلي هنا...

يجب أن يتضمن:
- المواصفات التقنية للمنتجات/الخدمات
- منهجية التنفيذ
- خطة العمل
- معايير الجودة
- الميزات الإضافية المقترحة"
                />
                {errors.technicalProposal && (
                  <p className="mt-1 text-sm text-red-500">{errors.technicalProposal}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {formData.technicalProposal.length} حرف (الحد الأدنى 100 حرف)
                </p>
              </div>

              {/* Execution Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مدة التنفيذ (بالأيام) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.executionDays || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, executionDays: parseInt(e.target.value) || 0 }))}
                    className={`w-full px-4 py-3 border rounded-lg ${
                      errors.executionDays ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-emerald-500`}
                    placeholder="30"
                    min="1"
                  />
                  {errors.executionDays && (
                    <p className="mt-1 text-sm text-red-500">{errors.executionDays}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    فترة الضمان (بالأشهر)
                  </label>
                  <input
                    type="number"
                    value={formData.warrantyMonths || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, warrantyMonths: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="12"
                    min="0"
                  />
                </div>
              </div>

              {/* Evaluation Criteria Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">معايير التقييم</h3>
                <div className="space-y-2">
                  {tender.evaluationCriteria.map(criterion => (
                    <div key={criterion.id} className="flex items-center justify-between">
                      <span className="text-gray-600">{criterion.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${criterion.weight}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{criterion.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Team */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">فريق العمل</h2>
              <p className="text-gray-600">
                أضف أعضاء الفريق الذين سيعملون على هذا المشروع (اختياري)
              </p>

              {formData.teamMembers.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-3 text-gray-500">لم تتم إضافة أعضاء فريق بعد</p>
                  <button
                    onClick={addTeamMember}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    إضافة عضو
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.teamMembers.map((member, index) => (
                    <div key={member.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-gray-900">عضو الفريق {index + 1}</h4>
                        <button
                          onClick={() => removeTeamMember(member.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateTeamMember(member.id, 'name', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="الاسم"
                        />
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="الدور / المنصب"
                        />
                        <input
                          type="text"
                          value={member.experience}
                          onChange={(e) => updateTeamMember(member.id, 'experience', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="سنوات الخبرة"
                        />
                        <input
                          type="text"
                          value={member.qualifications}
                          onChange={(e) => updateTeamMember(member.id, 'qualifications', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          placeholder="المؤهلات والشهادات"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addTeamMember}
                    className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    إضافة عضو آخر
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">المستندات المطلوبة</h2>

              <div className="space-y-4">
                {tender.requiredDocuments.map(doc => {
                  const uploadedDoc = formData.documents.find(d => d.documentId === doc.id);
                  return (
                    <div
                      key={doc.id}
                      className={`border rounded-lg p-4 ${
                        doc.isRequired ? 'border-orange-200 bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{doc.name}</h4>
                            {doc.isRequired && (
                              <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                                مطلوب
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            الحد الأقصى: {doc.maxSize} ميجا | الأنواع: {doc.allowedTypes.join(', ')}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {uploadedDoc?.uploaded ? (
                            <div className="flex items-center gap-2 text-emerald-600">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm">{uploadedDoc.fileName}</span>
                            </div>
                          ) : uploadedDoc && uploadedDoc.uploadProgress > 0 && uploadedDoc.uploadProgress < 100 ? (
                            <div className="w-32">
                              <div className="bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-emerald-500 h-2 rounded-full transition-all"
                                  style={{ width: `${uploadedDoc.uploadProgress}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1 text-center">
                                {uploadedDoc.uploadProgress}%
                              </p>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <input
                                type="file"
                                className="hidden"
                                accept={doc.allowedTypes.map(t => `.${t}`).join(',')}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(doc.id, file);
                                }}
                              />
                              <span className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                رفع
                              </span>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.documents && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {errors.documents}
                </div>
              )}
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">مراجعة العطاء</h2>

              {/* Financial Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">الملخص المالي</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">قيمة العطاء</p>
                    <p className="text-xl font-bold text-emerald-600">{formatCurrency(formData.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">شروط الدفع</p>
                    <p className="font-medium">{PAYMENT_TERMS_OPTIONS.find(o => o.value === formData.paymentTerms)?.label}</p>
                  </div>
                </div>
              </div>

              {/* Technical Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">الملخص الفني</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">مدة التنفيذ</p>
                    <p className="font-medium">{formData.executionDays} يوم</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">فترة الضمان</p>
                    <p className="font-medium">{formData.warrantyMonths} شهر</p>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-500">العرض الفني</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{formData.technicalProposal}</p>
                </div>
              </div>

              {/* Team Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">فريق العمل</h3>
                {formData.teamMembers.length > 0 ? (
                  <ul className="space-y-2">
                    {formData.teamMembers.map(member => (
                      <li key={member.id} className="text-sm">
                        <span className="font-medium">{member.name}</span> - {member.role}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">لم يتم إضافة فريق عمل</p>
                )}
              </div>

              {/* Documents Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">المستندات المرفقة</h3>
                <ul className="space-y-2">
                  {formData.documents.filter(d => d.uploaded).map(doc => (
                    <li key={doc.id} className="flex items-center gap-2 text-sm text-emerald-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {doc.fileName}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Terms and Conditions */}
              <div className="border rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => setFormData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                    className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-gray-900">
                      أوافق على <Link href="/terms" className="text-emerald-600 hover:underline">الشروط والأحكام</Link> وأقر بصحة جميع البيانات المقدمة
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      بتقديم هذا العطاء، أتعهد بالالتزام بجميع المواصفات والشروط المذكورة في كراسة الشروط
                    </p>
                  </div>
                </label>
                {errors.termsAccepted && (
                  <p className="mt-2 text-sm text-red-500">{errors.termsAccepted}</p>
                )}
              </div>

              {errors.submit && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {errors.submit}
                </div>
              )}

              {/* Reverse Auction Notice */}
              {tender.hasReverseAuction && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-orange-800">تنبيه: هذه المناقصة تتضمن مزاد عكسي</h4>
                      <p className="text-sm text-orange-700 mt-1">
                        بعد انتهاء فترة تقديم العطاءات، سيتم دعوة المتقدمين المؤهلين للمشاركة في مزاد عكسي مباشر.
                        سعر البدء: {formatCurrency(tender.reverseAuctionStartPrice || 0)}
                      </p>
                    </div>
                  </div>
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
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    تقديم العطاء
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
