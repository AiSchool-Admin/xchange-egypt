/**
 * صفحة تفاصيل العقد
 * Contract Details Page
 * سوق المناقصات - Xchange Egypt
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// ==================== Types ====================
interface Contract {
  id: string;
  referenceNumber: string;
  tenderTitle: string;
  tenderId: string;
  status: 'PENDING_SIGNATURE' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'TERMINATED';
  totalValue: number;
  currency: string;
  signedDate?: string;
  startDate: string;
  endDate: string;
  progress: number;

  buyer: {
    id: string;
    name: string;
    type: string;
    contact: string;
  };

  vendor: {
    id: string;
    name: string;
    rating: number;
    contact: string;
  };

  milestones: Milestone[];
  payments: Payment[];
  documents: Document[];
  activities: Activity[];
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completedDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  deliverables: string[];
  paymentPercentage: number;
}

interface Payment {
  id: string;
  milestoneId?: string;
  amount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  dueDate: string;
  paidDate?: string;
  method?: string;
  transactionId?: string;
}

interface Document {
  id: string;
  name: string;
  type: 'CONTRACT' | 'AMENDMENT' | 'DELIVERABLE' | 'INVOICE' | 'RECEIPT' | 'OTHER';
  uploadedAt: string;
  uploadedBy: string;
  size: string;
  url: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: string;
}

// ==================== Component ====================
export default function ContractDetailsPage() {
  const params = useParams();
  const contractId = params?.id as string;

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadContractData();
  }, [contractId]);

  const loadContractData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockContract: Contract = {
      id: contractId,
      referenceNumber: 'CNT-2024-00042',
      tenderTitle: 'توريد أجهزة حاسب آلي لوزارة التربية والتعليم',
      tenderId: 'tender-1',
      status: 'IN_PROGRESS',
      totalValue: 650000,
      currency: 'EGP',
      signedDate: '2024-01-15',
      startDate: '2024-01-20',
      endDate: '2024-04-20',
      progress: 45,

      buyer: {
        id: 'buyer-1',
        name: 'وزارة التربية والتعليم',
        type: 'GOVERNMENT',
        contact: 'procurement@moe.gov.eg',
      },

      vendor: {
        id: 'vendor-1',
        name: 'شركة النور للتقنية',
        rating: 4.8,
        contact: 'contracts@alnoor-tech.com',
      },

      milestones: [
        {
          id: 'm1',
          title: 'الدفعة المقدمة والتحضير',
          description: 'استلام الدفعة المقدمة وبدء إجراءات الشراء والتوريد',
          dueDate: '2024-01-25',
          completedDate: '2024-01-24',
          status: 'COMPLETED',
          deliverables: ['إيصال استلام الدفعة', 'خطة التنفيذ المعتمدة'],
          paymentPercentage: 25,
        },
        {
          id: 'm2',
          title: 'الدفعة الأولى - 200 جهاز',
          description: 'توريد وتركيب 200 جهاز حاسب آلي في المدارس المحددة',
          dueDate: '2024-02-20',
          completedDate: '2024-02-18',
          status: 'COMPLETED',
          deliverables: ['محضر التسليم', 'شهادات الضمان', 'تقرير التركيب'],
          paymentPercentage: 25,
        },
        {
          id: 'm3',
          title: 'الدفعة الثانية - 200 جهاز',
          description: 'توريد وتركيب 200 جهاز إضافي',
          dueDate: '2024-03-15',
          status: 'IN_PROGRESS',
          deliverables: ['محضر التسليم', 'شهادات الضمان', 'تقرير التركيب'],
          paymentPercentage: 25,
        },
        {
          id: 'm4',
          title: 'الدفعة النهائية والتسليم',
          description: 'توريد الـ 100 جهاز المتبقية والتسليم النهائي',
          dueDate: '2024-04-15',
          status: 'PENDING',
          deliverables: ['محضر التسليم النهائي', 'تقرير الصيانة الأول', 'شهادة إتمام المشروع'],
          paymentPercentage: 25,
        },
      ],

      payments: [
        { id: 'p1', milestoneId: 'm1', amount: 162500, status: 'COMPLETED', dueDate: '2024-01-25', paidDate: '2024-01-25', method: 'تحويل بنكي', transactionId: 'TXN-001-2024' },
        { id: 'p2', milestoneId: 'm2', amount: 162500, status: 'COMPLETED', dueDate: '2024-02-25', paidDate: '2024-02-22', method: 'تحويل بنكي', transactionId: 'TXN-045-2024' },
        { id: 'p3', milestoneId: 'm3', amount: 162500, status: 'PENDING', dueDate: '2024-03-20' },
        { id: 'p4', milestoneId: 'm4', amount: 162500, status: 'PENDING', dueDate: '2024-04-20' },
      ],

      documents: [
        { id: 'd1', name: 'عقد التوريد الموقع', type: 'CONTRACT', uploadedAt: '2024-01-15', uploadedBy: 'النظام', size: '2.5 MB', url: '#' },
        { id: 'd2', name: 'محضر تسليم الدفعة الأولى', type: 'DELIVERABLE', uploadedAt: '2024-02-18', uploadedBy: 'شركة النور', size: '1.2 MB', url: '#' },
        { id: 'd3', name: 'فاتورة الدفعة الثانية', type: 'INVOICE', uploadedAt: '2024-02-19', uploadedBy: 'شركة النور', size: '0.8 MB', url: '#' },
        { id: 'd4', name: 'شهادات ضمان الأجهزة', type: 'OTHER', uploadedAt: '2024-02-18', uploadedBy: 'شركة النور', size: '5.1 MB', url: '#' },
      ],

      activities: [
        { id: 'a1', type: 'payment', description: 'تم صرف الدفعة الثانية بقيمة 162,500 ج.م', timestamp: '2024-02-22T10:30:00', user: 'النظام' },
        { id: 'a2', type: 'milestone', description: 'تم اعتماد تسليم الدفعة الأولى من الأجهزة', timestamp: '2024-02-18T14:00:00', user: 'م. أحمد محمود' },
        { id: 'a3', type: 'document', description: 'تم رفع محضر تسليم الدفعة الأولى', timestamp: '2024-02-18T11:00:00', user: 'شركة النور' },
        { id: 'a4', type: 'milestone', description: 'بدء العمل على المرحلة الثالثة', timestamp: '2024-02-25T09:00:00', user: 'شركة النور' },
        { id: 'a5', type: 'payment', description: 'تم صرف الدفعة المقدمة بقيمة 162,500 ج.م', timestamp: '2024-01-25T12:00:00', user: 'النظام' },
      ],
    };

    setContract(mockContract);
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      PENDING_SIGNATURE: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'بانتظار التوقيع' },
      ACTIVE: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'نشط' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'قيد التنفيذ' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'مكتمل' },
      DISPUTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'متنازع عليه' },
      TERMINATED: { bg: 'bg-red-100', text: 'text-red-700', label: 'منتهي' },
      PENDING: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'قادم' },
      OVERDUE: { bg: 'bg-red-100', text: 'text-red-700', label: 'متأخر' },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'قيد المعالجة' },
      FAILED: { bg: 'bg-red-100', text: 'text-red-700', label: 'فشل' },
    };
    return config[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'IN_PROGRESS':
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          </div>
        );
      case 'OVERDUE':
        return (
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات العقد...</p>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg">لم يتم العثور على العقد</p>
          <Link href="/contracts" className="mt-4 text-emerald-600 hover:underline">
            العودة إلى قائمة العقود
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(contract.status);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/contracts" className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">تفاصيل العقد</h1>
                <p className="text-sm text-gray-500">{contract.referenceNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
              </span>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contract Summary */}
        <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{contract.tenderTitle}</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500">قيمة العقد</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(contract.totalValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">التقدم</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full"
                    style={{ width: `${contract.progress}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-gray-900">{contract.progress}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">تاريخ البدء</p>
              <p className="text-lg font-medium text-gray-900">{formatDate(contract.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">تاريخ الانتهاء</p>
              <p className="text-lg font-medium text-gray-900">{formatDate(contract.endDate)}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">المشتري</p>
              <p className="font-medium text-gray-900">{contract.buyer.name}</p>
              <p className="text-sm text-gray-500">{contract.buyer.contact}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">المورد</p>
              <p className="font-medium text-gray-900">{contract.vendor.name}</p>
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm text-gray-500">{contract.vendor.rating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="border-b px-4">
            <nav className="flex gap-6">
              {[
                { id: 'overview', label: 'نظرة عامة' },
                { id: 'milestones', label: 'المراحل' },
                { id: 'payments', label: 'المدفوعات' },
                { id: 'documents', label: 'المستندات' },
                { id: 'activity', label: 'سجل النشاط' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Milestones Timeline */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">الجدول الزمني</h3>
                  <div className="space-y-4">
                    {contract.milestones.map((milestone, index) => (
                      <div key={milestone.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          {getMilestoneIcon(milestone.status)}
                          {index < contract.milestones.length - 1 && (
                            <div className={`w-0.5 flex-1 mt-2 ${
                              milestone.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-gray-200'
                            }`}></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs ${getStatusConfig(milestone.status).bg} ${getStatusConfig(milestone.status).text}`}>
                              {getStatusConfig(milestone.status).label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {milestone.completedDate
                              ? `تم في ${formatDate(milestone.completedDate)}`
                              : `موعد التسليم: ${formatDate(milestone.dueDate)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">ملخص المدفوعات</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">المدفوع</p>
                        <p className="text-xl font-bold text-emerald-600">
                          {formatCurrency(
                            contract.payments
                              .filter(p => p.status === 'COMPLETED')
                              .reduce((sum, p) => sum + p.amount, 0)
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">المتبقي</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(
                            contract.payments
                              .filter(p => p.status !== 'COMPLETED')
                              .reduce((sum, p) => sum + p.amount, 0)
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {contract.payments.slice(0, 3).map(payment => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-gray-500">
                            {payment.paidDate ? `تم الدفع ${formatDate(payment.paidDate)}` : `مستحق ${formatDate(payment.dueDate)}`}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${getStatusConfig(payment.status).bg} ${getStatusConfig(payment.status).text}`}>
                          {getStatusConfig(payment.status).label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
              <div className="space-y-4">
                {contract.milestones.map(milestone => (
                  <div key={milestone.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getMilestoneIcon(milestone.status)}
                        <div>
                          <h4 className="font-bold text-gray-900">{milestone.title}</h4>
                          <p className="text-sm text-gray-500">{milestone.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusConfig(milestone.status).bg} ${getStatusConfig(milestone.status).text}`}>
                        {getStatusConfig(milestone.status).label}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-500">موعد التسليم</p>
                        <p className="font-medium">{formatDate(milestone.dueDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">نسبة الدفعة</p>
                        <p className="font-medium">{milestone.paymentPercentage}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">المخرجات المطلوبة</p>
                        <p className="font-medium">{milestone.deliverables.length} مستند</p>
                      </div>
                    </div>

                    {milestone.deliverables.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-2">المخرجات:</p>
                        <div className="flex flex-wrap gap-2">
                          {milestone.deliverables.map((del, idx) => (
                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                              {del}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                {contract.payments.map(payment => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {payment.paidDate
                            ? `تم الدفع في ${formatDate(payment.paidDate)}`
                            : `مستحق في ${formatDate(payment.dueDate)}`}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusConfig(payment.status).bg} ${getStatusConfig(payment.status).text}`}>
                        {getStatusConfig(payment.status).label}
                      </span>
                    </div>

                    {payment.status === 'COMPLETED' && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">طريقة الدفع</p>
                          <p className="font-medium">{payment.method}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">رقم العملية</p>
                          <p className="font-medium font-mono">{payment.transactionId}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                {contract.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-4 p-4 border rounded-lg hover:border-emerald-300 transition-colors">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{doc.name}</h4>
                      <p className="text-sm text-gray-500">
                        {doc.size} • تم الرفع بواسطة {doc.uploadedBy} • {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                    <button className="px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                      تحميل
                    </button>
                  </div>
                ))}

                <button className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                  + رفع مستند جديد
                </button>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-4">
                {contract.activities.map(activity => (
                  <div key={activity.id} className="flex gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'payment' ? 'bg-emerald-100' :
                      activity.type === 'milestone' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.type === 'payment' && (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {activity.type === 'milestone' && (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      {activity.type === 'document' && (
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {activity.user} • {formatDateTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
