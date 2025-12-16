/**
 * لوحة تحكم المستخدم
 * User Dashboard Page
 * سوق المناقصات - Xchange Egypt
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ==================== Types ====================
interface DashboardStats {
  activeTenders: number;
  pendingBids: number;
  wonContracts: number;
  totalEarnings: number;
  activeAuctions: number;
  pendingPayments: number;
}

interface Tender {
  id: string;
  title: string;
  referenceNumber: string;
  status: string;
  deadline: string;
  bidsCount: number;
  budgetMax: number;
}

interface Bid {
  id: string;
  tenderId: string;
  tenderTitle: string;
  amount: number;
  status: string;
  submittedAt: string;
  isLeading: boolean;
}

interface Contract {
  id: string;
  tenderTitle: string;
  amount: number;
  status: string;
  nextMilestone: string;
  progress: number;
}

interface Notification {
  id: string;
  type: 'bid' | 'tender' | 'contract' | 'auction' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// ==================== Component ====================
export default function DashboardPage() {
  const [userType, setUserType] = useState<'buyer' | 'vendor'>('vendor');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myTenders, setMyTenders] = useState<Tender[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [activeContracts, setActiveContracts] = useState<Contract[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, [userType]);

  const loadDashboardData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data
    const mockStats: DashboardStats = {
      activeTenders: userType === 'buyer' ? 5 : 0,
      pendingBids: userType === 'vendor' ? 8 : 25,
      wonContracts: 3,
      totalEarnings: 1250000,
      activeAuctions: 2,
      pendingPayments: userType === 'buyer' ? 150000 : 75000,
    };

    const mockTenders: Tender[] = [
      { id: '1', title: 'مناقصة توريد أجهزة حاسب آلي', referenceNumber: 'TND-2024-00125', status: 'OPEN', deadline: '2024-02-15', bidsCount: 12, budgetMax: 750000 },
      { id: '2', title: 'مناقصة صيانة المباني الإدارية', referenceNumber: 'TND-2024-00126', status: 'EVALUATING', deadline: '2024-02-10', bidsCount: 8, budgetMax: 500000 },
      { id: '3', title: 'مناقصة توريد أثاث مكتبي', referenceNumber: 'TND-2024-00127', status: 'DRAFT', deadline: '2024-02-20', bidsCount: 0, budgetMax: 300000 },
    ];

    const mockBids: Bid[] = [
      { id: '1', tenderId: 't1', tenderTitle: 'مناقصة توريد أجهزة طبية', amount: 450000, status: 'PENDING', submittedAt: '2024-01-28', isLeading: true },
      { id: '2', tenderId: 't2', tenderTitle: 'مناقصة خدمات التنظيف', amount: 120000, status: 'SHORTLISTED', submittedAt: '2024-01-25', isLeading: false },
      { id: '3', tenderId: 't3', tenderTitle: 'مناقصة توريد مستلزمات مكتبية', amount: 85000, status: 'REJECTED', submittedAt: '2024-01-20', isLeading: false },
      { id: '4', tenderId: 't4', tenderTitle: 'مناقصة صيانة أجهزة التكييف', amount: 200000, status: 'PENDING', submittedAt: '2024-01-29', isLeading: true },
    ];

    const mockContracts: Contract[] = [
      { id: '1', tenderTitle: 'توريد أثاث مكتبي لوزارة المالية', amount: 350000, status: 'IN_PROGRESS', nextMilestone: 'تسليم الدفعة الثانية', progress: 65 },
      { id: '2', tenderTitle: 'صيانة أجهزة الحاسب الآلي', amount: 180000, status: 'IN_PROGRESS', nextMilestone: 'تقرير الصيانة الشهري', progress: 40 },
      { id: '3', tenderTitle: 'توريد معدات أمنية', amount: 520000, status: 'PENDING_SIGNATURE', nextMilestone: 'توقيع العقد', progress: 0 },
    ];

    const mockNotifications: Notification[] = [
      { id: '1', type: 'auction', title: 'مزاد عكسي يبدأ خلال ساعة', message: 'مناقصة توريد أجهزة حاسب آلي', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), read: false, actionUrl: '/auctions/live/1' },
      { id: '2', type: 'bid', title: 'تم تجاوز عرضك', message: 'تم تقديم عرض أقل في مناقصة الأثاث المكتبي', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), read: false, actionUrl: '/tenders/2' },
      { id: '3', type: 'tender', title: 'مناقصة جديدة تناسب تخصصك', message: 'مناقصة توريد معدات تقنية - وزارة الصحة', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), read: true, actionUrl: '/tenders/5' },
      { id: '4', type: 'contract', title: 'موعد تسليم قريب', message: 'يجب تسليم الدفعة الثانية خلال 3 أيام', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), read: true, actionUrl: '/contracts/1' },
      { id: '5', type: 'payment', title: 'تم استلام دفعة', message: 'تم إيداع 75,000 ج.م في حسابك', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), read: true },
    ];

    setStats(mockStats);
    setMyTenders(mockTenders);
    setMyBids(mockBids);
    setActiveContracts(mockContracts);
    setNotifications(mockNotifications);
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
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'منذ قليل';
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return formatDate(timestamp);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      OPEN: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'مفتوحة' },
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'مسودة' },
      EVALUATING: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'قيد التقييم' },
      CLOSED: { bg: 'bg-red-100', text: 'text-red-700', label: 'مغلقة' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'قيد المراجعة' },
      SHORTLISTED: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'القائمة المختصرة' },
      ACCEPTED: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'مقبول' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'مرفوض' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'قيد التنفيذ' },
      PENDING_SIGNATURE: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'بانتظار التوقيع' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        );
      case 'auction':
        return (
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'contract':
        return (
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'payment':
        return (
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-emerald-600">Xchange</Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-lg font-medium text-gray-900">لوحة التحكم</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* User Type Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setUserType('vendor')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    userType === 'vendor' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  مورد
                </button>
                <button
                  onClick={() => setUserType('buyer')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    userType === 'buyer' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  مشتري
                </button>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Profile */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600 font-bold">م</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">مرحباً، محمد</h2>
          <p className="text-gray-500 mt-1">إليك ملخص نشاطك اليوم</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {userType === 'buyer' && (
            <div className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeTenders}</p>
                  <p className="text-sm text-gray-500">مناقصاتي</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.pendingBids}</p>
                <p className="text-sm text-gray-500">{userType === 'buyer' ? 'عطاءات مستلمة' : 'عطاءاتي'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.wonContracts}</p>
                <p className="text-sm text-gray-500">عقود نشطة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeAuctions}</p>
                <p className="text-sm text-gray-500">مزادات قادمة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats?.totalEarnings || 0)}</p>
                <p className="text-sm text-gray-500">{userType === 'buyer' ? 'إجمالي المصروفات' : 'إجمالي الأرباح'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <nav className="flex gap-8">
            {[
              { id: 'overview', label: 'نظرة عامة' },
              { id: 'tenders', label: userType === 'buyer' ? 'مناقصاتي' : 'المناقصات المتاحة' },
              { id: 'bids', label: userType === 'buyer' ? 'العطاءات المستلمة' : 'عطاءاتي' },
              { id: 'contracts', label: 'العقود' },
              { id: 'notifications', label: 'الإشعارات' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
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

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Quick Actions */}
                <div className="bg-white rounded-xl border p-6">
                  <h3 className="font-bold text-gray-900 mb-4">إجراءات سريعة</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {userType === 'buyer' ? (
                      <>
                        <Link href="/tenders/create" className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                          <svg className="w-8 h-8 text-emerald-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">إنشاء مناقصة</span>
                        </Link>
                        <Link href="/tenders/my-tenders" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">مناقصاتي</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/tenders" className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                          <svg className="w-8 h-8 text-emerald-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">البحث عن مناقصات</span>
                        </Link>
                        <Link href="/dashboard/my-bids" className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">عطاءاتي</span>
                        </Link>
                      </>
                    )}
                    <Link href="/contracts" className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                      <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">العقود</span>
                    </Link>
                    <Link href="/dashboard/payments" className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                      <svg className="w-8 h-8 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">المدفوعات</span>
                    </Link>
                  </div>
                </div>

                {/* Active Contracts */}
                <div className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">العقود النشطة</h3>
                    <Link href="/contracts" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                      عرض الكل
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {activeContracts.map(contract => (
                      <div key={contract.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{contract.tenderTitle}</h4>
                            <p className="text-sm text-gray-500">{formatCurrency(contract.amount)}</p>
                          </div>
                          {getStatusBadge(contract.status)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">التقدم</span>
                            <span className="font-medium">{contract.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${contract.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            المرحلة التالية: {contract.nextMilestone}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Bids Tab */}
            {activeTab === 'bids' && (
              <div className="bg-white rounded-xl border">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-gray-900">{userType === 'buyer' ? 'العطاءات المستلمة' : 'عطاءاتي'}</h3>
                </div>
                <div className="divide-y">
                  {myBids.map(bid => (
                    <Link key={bid.id} href={`/tenders/${bid.tenderId}`} className="block p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{bid.tenderTitle}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            قيمة العطاء: {formatCurrency(bid.amount)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            تم التقديم: {formatDate(bid.submittedAt)}
                          </p>
                        </div>
                        <div className="text-left">
                          {getStatusBadge(bid.status)}
                          {bid.isLeading && (
                            <span className="block mt-2 text-xs text-emerald-600 font-medium">
                              في المقدمة
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tenders Tab */}
            {activeTab === 'tenders' && userType === 'buyer' && (
              <div className="bg-white rounded-xl border">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">مناقصاتي</h3>
                  <Link href="/tenders/create" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                    إنشاء مناقصة جديدة
                  </Link>
                </div>
                <div className="divide-y">
                  {myTenders.map(tender => (
                    <Link key={tender.id} href={`/tenders/${tender.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{tender.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{tender.referenceNumber}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>الميزانية: {formatCurrency(tender.budgetMax)}</span>
                            <span>العطاءات: {tender.bidsCount}</span>
                            <span>الموعد: {formatDate(tender.deadline)}</span>
                          </div>
                        </div>
                        {getStatusBadge(tender.status)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Contracts Tab */}
            {activeTab === 'contracts' && (
              <div className="bg-white rounded-xl border">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-gray-900">العقود</h3>
                </div>
                <div className="divide-y">
                  {activeContracts.map(contract => (
                    <Link key={contract.id} href={`/contracts/${contract.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{contract.tenderTitle}</h4>
                          <p className="text-sm text-gray-500">{formatCurrency(contract.amount)}</p>
                        </div>
                        {getStatusBadge(contract.status)}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">التقدم</span>
                          <span className="font-medium">{contract.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full"
                            style={{ width: `${contract.progress}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl border">
                <div className="p-4 border-b flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">الإشعارات</h3>
                  <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                    تحديد الكل كمقروء
                  </button>
                </div>
                <div className="divide-y">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 ${!notification.read ? 'bg-emerald-50' : ''}`}
                    >
                      <div className="flex gap-4">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">{formatRelativeTime(notification.timestamp)}</p>
                        </div>
                        {notification.actionUrl && (
                          <Link href={notification.actionUrl} className="text-emerald-600 hover:text-emerald-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Auctions */}
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-bold text-gray-900 mb-4">مزادات قادمة</h3>
              <div className="space-y-3">
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">يبدأ خلال ساعة</span>
                  </div>
                  <p className="text-sm text-gray-700">مناقصة توريد أجهزة حاسب آلي</p>
                  <Link href="/auctions/live/1" className="mt-2 inline-block text-xs text-orange-600 hover:underline">
                    الانضمام للمزاد
                  </Link>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">غداً الساعة 10:00 ص</p>
                  <p className="text-sm text-gray-700">مناقصة صيانة المباني</p>
                </div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">آخر الإشعارات</h3>
                <button onClick={() => setActiveTab('notifications')} className="text-emerald-600 text-sm">
                  عرض الكل
                </button>
              </div>
              <div className="space-y-3">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className={`flex gap-3 ${!notification.read ? 'font-medium' : ''}`}>
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{notification.title}</p>
                      <p className="text-xs text-gray-400">{formatRelativeTime(notification.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Payments */}
            {stats && stats.pendingPayments > 0 && (
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
                <h3 className="font-bold mb-2">
                  {userType === 'buyer' ? 'مستحقات للدفع' : 'مستحقات لك'}
                </h3>
                <p className="text-3xl font-bold">{formatCurrency(stats.pendingPayments)}</p>
                <Link href="/dashboard/payments" className="mt-3 inline-block text-sm text-white/80 hover:text-white">
                  عرض التفاصيل
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
