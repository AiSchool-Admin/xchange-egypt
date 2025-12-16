'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';

interface TenderDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface TenderBid {
  id: string;
  bidAmount: number;
  technicalScore?: number;
  financialScore?: number;
  totalScore?: number;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'AWARDED' | 'REJECTED';
  submittedAt: string;
  vendor: {
    id: string;
    name: string;
    logo?: string;
    trustScore?: number;
    completedContracts?: number;
    governorate?: string;
  };
}

interface TenderMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED';
}

interface Tender {
  id: string;
  referenceNumber: string;
  title: string;
  description: string;
  type: 'OPEN' | 'RESTRICTED' | 'NEGOTIATED' | 'FRAMEWORK';
  status: 'DRAFT' | 'PUBLISHED' | 'EVALUATION' | 'AWARDED' | 'CANCELLED' | 'CLOSED';
  budget: number;
  currency: string;
  submissionDeadline: string;
  openingDate: string;
  evaluationCriteria?: string;
  technicalWeight?: number;
  financialWeight?: number;
  eligibilityRequirements?: string[];
  deliveryLocation?: string;
  deliveryDeadline?: string;
  warrantyPeriod?: number;
  paymentTerms?: string;
  category: {
    id: string;
    nameAr: string;
    nameEn: string;
  };
  procuringEntity: {
    id: string;
    name: string;
    logo?: string;
    type: string;
    governorate?: string;
    email?: string;
    phone?: string;
    website?: string;
  };
  documents: TenderDocument[];
  bids: TenderBid[];
  milestones: TenderMilestone[];
  items?: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unit: string;
    specifications?: string;
  }>;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const TENDER_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'مسودة', color: 'bg-gray-100 text-gray-800' },
  PUBLISHED: { label: 'منشورة', color: 'bg-green-100 text-green-800' },
  EVALUATION: { label: 'قيد التقييم', color: 'bg-yellow-100 text-yellow-800' },
  AWARDED: { label: 'تمت الترسية', color: 'bg-purple-100 text-purple-800' },
  CANCELLED: { label: 'ملغية', color: 'bg-red-100 text-red-800' },
  CLOSED: { label: 'مغلقة', color: 'bg-gray-100 text-gray-800' },
};

const BID_STATUS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'مسودة', color: 'bg-gray-100 text-gray-800' },
  SUBMITTED: { label: 'مقدم', color: 'bg-blue-100 text-blue-800' },
  UNDER_REVIEW: { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-800' },
  SHORTLISTED: { label: 'في القائمة القصيرة', color: 'bg-purple-100 text-purple-800' },
  AWARDED: { label: 'فائز', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'مرفوض', color: 'bg-red-100 text-red-800' },
};

const TENDER_TYPES: Record<string, string> = {
  OPEN: 'مناقصة عامة',
  RESTRICTED: 'مناقصة محدودة',
  NEGOTIATED: 'مناقصة بالتفاوض',
  FRAMEWORK: 'اتفاقية إطارية',
};

export default function TenderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'bids' | 'timeline'>('overview');

  const tenderId = params.id as string;

  useEffect(() => {
    loadTender();
  }, [tenderId]);

  const loadTender = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tenders/${tenderId}`);
      setTender(response.data.data || response.data);
    } catch (err: any) {
      console.error('Error loading tender:', err);
      setError(err.response?.data?.message || 'فشل في تحميل المناقصة');
    } finally {
      setLoading(false);
    }
  };

  const formatBudget = (budget: number, currency: string = 'EGP') => {
    return `${budget.toLocaleString()} ${currency === 'EGP' ? 'ج.م' : currency}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${bytes} bytes`;
  };

  const getRemainingTime = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'انتهى';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} يوم و ${hours} ساعة`;
    if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة`;
    return `${minutes} دقيقة`;
  };

  const isDeadlinePassed = (deadline: string) => new Date(deadline) < new Date();
  const isProcuringEntity = user?.id === tender?.procuringEntity?.id;
  const canSubmitBid = tender?.status === 'PUBLISHED' && !isDeadlinePassed(tender?.submissionDeadline || '') && !isProcuringEntity && user;
  const userBid = tender?.bids?.find(b => b.vendor.id === user?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المناقصة...</p>
        </div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'المناقصة غير موجودة'}</p>
          <button
            onClick={() => router.push('/tenders')}
            className="mt-4 text-emerald-600 hover:text-emerald-700"
          >
            العودة للمناقصات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${TENDER_STATUS[tender.status]?.color}`}>
                      {TENDER_STATUS[tender.status]?.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {TENDER_TYPES[tender.type]}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{tender.title}</h1>
                  <p className="text-gray-500">رقم المرجع: {tender.referenceNumber}</p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y">
                <div>
                  <p className="text-sm text-gray-500">الميزانية</p>
                  <p className="font-bold text-emerald-600">{formatBudget(tender.budget, tender.currency)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">الموعد النهائي</p>
                  <p className={`font-bold ${isDeadlinePassed(tender.submissionDeadline) ? 'text-red-600' : 'text-gray-900'}`}>
                    {isDeadlinePassed(tender.submissionDeadline) ? 'انتهى' : getRemainingTime(tender.submissionDeadline)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">العطاءات</p>
                  <p className="font-bold text-gray-900">{tender.bids?.length || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">المشاهدات</p>
                  <p className="font-bold text-gray-900">{tender.views}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-4 border-b">
                {['overview', 'documents', 'bids', 'timeline'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-2 font-medium transition border-b-2 -mb-px ${
                      activeTab === tab
                        ? 'text-emerald-600 border-emerald-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    {tab === 'overview' && 'نظرة عامة'}
                    {tab === 'documents' && `المستندات (${tender.documents?.length || 0})`}
                    {tab === 'bids' && `العطاءات (${tender.bids?.length || 0})`}
                    {tab === 'timeline' && 'الجدول الزمني'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">وصف المناقصة</h2>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{tender.description}</p>
                </div>

                {/* Items/Scope */}
                {tender.items && tender.items.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">بنود المناقصة</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">#</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">البند</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الكمية</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">الوحدة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {tender.items.map((item, idx) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                              <td className="px-4 py-3">
                                <p className="font-medium text-gray-900">{item.name}</p>
                                {item.description && (
                                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-gray-500">{item.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Eligibility Requirements */}
                {tender.eligibilityRequirements && tender.eligibilityRequirements.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">شروط الأهلية</h2>
                    <ul className="space-y-2">
                      {tender.eligibilityRequirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 mt-1">✓</span>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Evaluation Criteria */}
                {tender.evaluationCriteria && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">معايير التقييم</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{tender.evaluationCriteria}</p>
                    {(tender.technicalWeight || tender.financialWeight) && (
                      <div className="mt-4 flex gap-4">
                        {tender.technicalWeight && (
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            <span className="text-sm">الفني: {tender.technicalWeight}%</span>
                          </div>
                        )}
                        {tender.financialWeight && (
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                            <span className="text-sm">المالي: {tender.financialWeight}%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Delivery & Payment */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">التسليم والدفع</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {tender.deliveryLocation && (
                      <div>
                        <p className="text-sm text-gray-500">موقع التسليم</p>
                        <p className="font-medium">{tender.deliveryLocation}</p>
                      </div>
                    )}
                    {tender.deliveryDeadline && (
                      <div>
                        <p className="text-sm text-gray-500">موعد التسليم</p>
                        <p className="font-medium">{new Date(tender.deliveryDeadline).toLocaleDateString('ar-EG')}</p>
                      </div>
                    )}
                    {tender.warrantyPeriod && (
                      <div>
                        <p className="text-sm text-gray-500">فترة الضمان</p>
                        <p className="font-medium">{tender.warrantyPeriod} شهر</p>
                      </div>
                    )}
                    {tender.paymentTerms && (
                      <div>
                        <p className="text-sm text-gray-500">شروط الدفع</p>
                        <p className="font-medium">{tender.paymentTerms}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">المستندات</h2>
                {tender.documents?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">📄</p>
                    <p>لا توجد مستندات</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tender.documents?.map((doc) => (
                      <a
                        key={doc.id}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                            {doc.type === 'pdf' ? '📕' : doc.type === 'doc' ? '📘' : '📄'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bids' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">العطاءات المقدمة</h2>
                {!isProcuringEntity && tender.status === 'PUBLISHED' ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">🔒</p>
                    <p>العطاءات سرية حتى انتهاء موعد التقديم</p>
                  </div>
                ) : tender.bids?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">📭</p>
                    <p>لا توجد عطاءات بعد</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tender.bids?.map((bid, idx) => (
                      <div
                        key={bid.id}
                        className={`p-4 rounded-lg border-2 ${
                          bid.status === 'AWARDED' ? 'border-green-300 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              {bid.vendor.logo ? (
                                <img src={bid.vendor.logo} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-xl">🏢</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{bid.vendor.name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{bid.vendor.governorate || 'مصر'}</span>
                                {bid.vendor.trustScore && (
                                  <span className="flex items-center gap-1">
                                    <span className="text-yellow-500">⭐</span>
                                    {bid.vendor.trustScore.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-2xl font-bold text-emerald-600">
                              {bid.bidAmount.toLocaleString()} ج.م
                            </p>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${BID_STATUS[bid.status]?.color}`}>
                              {BID_STATUS[bid.status]?.label}
                            </span>
                          </div>
                        </div>
                        {(bid.technicalScore || bid.financialScore) && (
                          <div className="mt-3 pt-3 border-t flex gap-6 text-sm">
                            {bid.technicalScore && (
                              <span>الدرجة الفنية: <strong>{bid.technicalScore}</strong></span>
                            )}
                            {bid.financialScore && (
                              <span>الدرجة المالية: <strong>{bid.financialScore}</strong></span>
                            )}
                            {bid.totalScore && (
                              <span className="text-emerald-600 font-bold">المجموع: {bid.totalScore}</span>
                            )}
                          </div>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          تم التقديم: {new Date(bid.submittedAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">الجدول الزمني</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">نشر المناقصة</p>
                      <p className="text-sm text-gray-500">{new Date(tender.createdAt).toLocaleDateString('ar-EG')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isDeadlinePassed(tender.submissionDeadline) ? 'bg-gray-400' : 'bg-yellow-500'}`}></div>
                    <div className="flex-1">
                      <p className="font-medium">الموعد النهائي للتقديم</p>
                      <p className="text-sm text-gray-500">{new Date(tender.submissionDeadline).toLocaleDateString('ar-EG')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${isDeadlinePassed(tender.openingDate) ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <p className="font-medium">فتح المظاريف</p>
                      <p className="text-sm text-gray-500">{new Date(tender.openingDate).toLocaleDateString('ar-EG')}</p>
                    </div>
                  </div>
                  {tender.milestones?.map((milestone) => (
                    <div key={milestone.id} className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${milestone.status === 'COMPLETED' ? 'bg-emerald-600' : 'bg-gray-300'}`}></div>
                      <div className="flex-1">
                        <p className="font-medium">{milestone.title}</p>
                        <p className="text-sm text-gray-500">{new Date(milestone.dueDate).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4 space-y-6">
              {/* Procuring Entity */}
              <div>
                <p className="text-sm text-gray-500 mb-3">الجهة المشترية</p>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                    {tender.procuringEntity?.logo ? (
                      <img src={tender.procuringEntity.logo} alt="" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <span className="text-2xl">🏛️</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{tender.procuringEntity?.name}</p>
                    <p className="text-sm text-gray-500">{tender.procuringEntity?.governorate || 'مصر'}</p>
                  </div>
                </div>
                {tender.procuringEntity?.email && (
                  <p className="mt-3 text-sm">
                    <span className="text-gray-500">البريد: </span>
                    <a href={`mailto:${tender.procuringEntity.email}`} className="text-emerald-600 hover:underline">
                      {tender.procuringEntity.email}
                    </a>
                  </p>
                )}
                {tender.procuringEntity?.phone && (
                  <p className="text-sm">
                    <span className="text-gray-500">الهاتف: </span>
                    <a href={`tel:${tender.procuringEntity.phone}`} className="text-emerald-600">
                      {tender.procuringEntity.phone}
                    </a>
                  </p>
                )}
              </div>

              {/* Key Dates */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-3">التواريخ المهمة</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الموعد النهائي</span>
                    <span className={`font-medium ${isDeadlinePassed(tender.submissionDeadline) ? 'text-red-600' : 'text-gray-900'}`}>
                      {new Date(tender.submissionDeadline).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">فتح المظاريف</span>
                    <span className="font-medium">{new Date(tender.openingDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t space-y-3">
                {canSubmitBid && !userBid && (
                  <Link
                    href={`/tenders/${tender.id}/bid`}
                    className="block w-full py-3 bg-emerald-600 text-white text-center rounded-lg hover:bg-emerald-700 transition font-semibold"
                  >
                    تقديم عطاء
                  </Link>
                )}

                {userBid && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <p className="font-medium text-emerald-800">لقد تقدمت بعطاء</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {userBid.bidAmount.toLocaleString()} ج.م
                    </p>
                    <span className={`mt-2 inline-block px-2 py-0.5 rounded text-xs font-medium ${BID_STATUS[userBid.status]?.color}`}>
                      {BID_STATUS[userBid.status]?.label}
                    </span>
                  </div>
                )}

                {isProcuringEntity && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-medium text-blue-800">هذه مناقصتك</p>
                    <p className="text-sm text-blue-600 mt-1">
                      يمكنك إدارة العطاءات والتقييم من لوحة التحكم
                    </p>
                    <Link
                      href={`/dashboard/tenders/${tender.id}`}
                      className="mt-3 inline-block text-blue-700 hover:text-blue-800 font-medium text-sm"
                    >
                      إدارة المناقصة ←
                    </Link>
                  </div>
                )}

                {!user && tender.status === 'PUBLISHED' && !isDeadlinePassed(tender.submissionDeadline) && (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">سجل دخول لتقديم عطاء</p>
                    <Link
                      href="/login"
                      className="inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                    >
                      تسجيل الدخول
                    </Link>
                  </div>
                )}

                {isDeadlinePassed(tender.submissionDeadline) && tender.status === 'PUBLISHED' && (
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-gray-700 font-medium">انتهى موعد التقديم</p>
                  </div>
                )}
              </div>

              {/* Share */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500 mb-3">مشاركة المناقصة</p>
                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm">
                    نسخ الرابط
                  </button>
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </button>
                  <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
