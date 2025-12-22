/**
 * صفحة طلبات الخدمات
 * Service Requests Page
 * سوق المناقصات - Xchange Egypt
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ==================== Types ====================
interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  budgetMin: number;
  budgetMax: number;
  location: string;
  requester: {
    name: string;
    type: string;
    rating: number;
  };
  offersCount: number;
  createdAt: string;
  deadline: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// ==================== Component ====================
export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockCategories: ServiceCategory[] = [
      { id: 'cleaning', name: 'التنظيف', icon: '🧹', count: 24 },
      { id: 'maintenance', name: 'الصيانة', icon: '🔧', count: 18 },
      { id: 'security', name: 'الأمن والحراسة', icon: '🛡️', count: 12 },
      { id: 'transport', name: 'النقل والشحن', icon: '🚚', count: 15 },
      { id: 'catering', name: 'التموين', icon: '🍽️', count: 8 },
      { id: 'it_support', name: 'الدعم الفني', icon: '💻', count: 22 },
      { id: 'consulting', name: 'الاستشارات', icon: '📊', count: 10 },
      { id: 'training', name: 'التدريب', icon: '📚', count: 14 },
    ];

    const mockRequests: ServiceRequest[] = [
      {
        id: '1',
        title: 'خدمات تنظيف يومية لمبنى إداري',
        description: 'نحتاج فريق تنظيف محترف للعمل بشكل يومي في مبنى إداري من 10 طوابق. يشمل العمل تنظيف المكاتب والممرات ودورات المياه.',
        category: 'cleaning',
        urgency: 'MEDIUM',
        status: 'OPEN',
        budgetMin: 15000,
        budgetMax: 25000,
        location: 'القاهرة - المعادي',
        requester: { name: 'شركة النيل للاستثمار', type: 'COMPANY', rating: 4.5 },
        offersCount: 7,
        createdAt: '2024-01-28',
        deadline: '2024-02-05',
      },
      {
        id: '2',
        title: 'صيانة أجهزة تكييف مركزي',
        description: 'صيانة دورية شهرية لنظام تكييف مركزي يخدم 50 وحدة. يشمل الفحص والتنظيف واستبدال الفلاتر.',
        category: 'maintenance',
        urgency: 'HIGH',
        status: 'OPEN',
        budgetMin: 8000,
        budgetMax: 12000,
        location: 'الجيزة - الشيخ زايد',
        requester: { name: 'مستشفى الشفاء', type: 'COMPANY', rating: 4.8 },
        offersCount: 4,
        createdAt: '2024-01-29',
        deadline: '2024-02-03',
      },
      {
        id: '3',
        title: 'خدمات أمن وحراسة 24 ساعة',
        description: 'نحتاج شركة أمن موثوقة لتوفير حراسة على مدار الساعة لمصنع. 4 أفراد في كل وردية.',
        category: 'security',
        urgency: 'URGENT',
        status: 'OPEN',
        budgetMin: 35000,
        budgetMax: 50000,
        location: 'العاشر من رمضان',
        requester: { name: 'مصنع الأمل للبلاستيك', type: 'FACTORY', rating: 4.2 },
        offersCount: 2,
        createdAt: '2024-01-30',
        deadline: '2024-02-01',
      },
      {
        id: '4',
        title: 'نقل معدات مكتبية',
        description: 'نقل محتويات مكتب كامل (أثاث وأجهزة) من مقر إلى آخر داخل القاهرة. يشمل الفك والتركيب.',
        category: 'transport',
        urgency: 'LOW',
        status: 'IN_PROGRESS',
        budgetMin: 5000,
        budgetMax: 8000,
        location: 'القاهرة',
        requester: { name: 'أحمد محمود', type: 'INDIVIDUAL', rating: 4.0 },
        offersCount: 6,
        createdAt: '2024-01-25',
        deadline: '2024-02-10',
      },
      {
        id: '5',
        title: 'تقديم وجبات غداء يومية',
        description: 'توفير وجبات غداء يومية لـ 100 موظف. يجب أن تكون الوجبات صحية ومتنوعة.',
        category: 'catering',
        urgency: 'MEDIUM',
        status: 'OPEN',
        budgetMin: 20000,
        budgetMax: 30000,
        location: 'القاهرة - وسط البلد',
        requester: { name: 'شركة التأمين المصرية', type: 'COMPANY', rating: 4.6 },
        offersCount: 5,
        createdAt: '2024-01-27',
        deadline: '2024-02-07',
      },
      {
        id: '6',
        title: 'دعم فني للشبكات والأنظمة',
        description: 'نبحث عن مهندس شبكات للعمل بنظام الساعات لحل مشاكل الشبكة الداخلية والخوادم.',
        category: 'it_support',
        urgency: 'HIGH',
        status: 'OPEN',
        budgetMin: 3000,
        budgetMax: 5000,
        location: 'القاهرة - مدينة نصر',
        requester: { name: 'مركز التدريب المهني', type: 'GOVERNMENT', rating: 4.3 },
        offersCount: 8,
        createdAt: '2024-01-29',
        deadline: '2024-02-02',
      },
    ];

    setCategories(mockCategories);
    setRequests(mockRequests);
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
      month: 'short',
      day: 'numeric',
    });
  };

  const getUrgencyBadge = (urgency: string) => {
    const config = {
      LOW: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'عادي' },
      MEDIUM: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'متوسط' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'عاجل' },
      URGENT: { bg: 'bg-red-100', text: 'text-red-700', label: 'طارئ' },
    };
    const { bg, text, label } = config[urgency as keyof typeof config] || config.LOW;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>{label}</span>;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      OPEN: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'مفتوح' },
      IN_PROGRESS: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'قيد التنفيذ' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'مكتمل' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700', label: 'ملغي' },
    };
    const { bg, text, label } = config[status as keyof typeof config] || config.OPEN;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>{label}</span>;
  };

  const filteredRequests = requests.filter(req => {
    if (selectedCategory && req.category !== selectedCategory) return false;
    if (selectedUrgency && req.urgency !== selectedUrgency) return false;
    if (searchQuery && !req.title.includes(searchQuery) && !req.description.includes(searchQuery)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
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
              <Link href="/" className="text-2xl font-bold text-emerald-600">Xchange</Link>
              <span className="text-gray-400">|</span>
              <h1 className="text-lg font-medium text-gray-900">طلبات الخدمات</h1>
            </div>
            <Link
              href="/services/create"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
            >
              + طلب خدمة جديد
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-l from-emerald-500 to-teal-600 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">ابحث عن مقدم الخدمة المناسب</h2>
          <p className="text-emerald-100 mb-6">آلاف مقدمي الخدمات المعتمدين جاهزون لتلبية احتياجاتك</p>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن خدمة..."
                className="w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-medium hover:bg-gray-100">
              بحث
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">التصنيفات</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                className={`p-4 rounded-xl text-center transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-100 border-2 border-emerald-500'
                    : 'bg-white border-2 border-transparent hover:border-gray-200'
                }`}
              >
                <span className="text-2xl block mb-2">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                <span className="block text-xs text-gray-400 mt-1">{cat.count} طلب</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">جميع الأولويات</option>
            <option value="URGENT">طارئ</option>
            <option value="HIGH">عاجل</option>
            <option value="MEDIUM">متوسط</option>
            <option value="LOW">عادي</option>
          </select>

          <div className="flex-1"></div>

          <span className="text-gray-500">{filteredRequests.length} طلب</span>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Requests Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map(request => (
              <Link
                key={request.id}
                href={`/services/${request.id}`}
                className="bg-white rounded-xl border hover:border-emerald-300 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex gap-2">
                      {getUrgencyBadge(request.urgency)}
                      {getStatusBadge(request.status)}
                    </div>
                    <span className="text-2xl">
                      {categories.find(c => c.id === request.category)?.icon}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{request.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{request.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {request.location}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-xs text-gray-400">الميزانية</p>
                      <p className="font-bold text-emerald-600">
                        {formatCurrency(request.budgetMin)} - {formatCurrency(request.budgetMax)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-gray-400">{request.offersCount} عروض</p>
                      <p className="text-sm text-gray-500">حتى {formatDate(request.deadline)}</p>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-gray-50 border-t flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 text-sm font-bold">{request.requester.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{request.requester.name}</p>
                    <div className="flex items-center gap-1">
                      <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-500">{request.requester.rating}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border divide-y">
            {filteredRequests.map(request => (
              <Link
                key={request.id}
                href={`/services/${request.id}`}
                className="block p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                    {categories.find(c => c.id === request.category)?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900">{request.title}</h3>
                      {getUrgencyBadge(request.urgency)}
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-500 mb-2 line-clamp-1">{request.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {request.location}
                      </span>
                      <span>•</span>
                      <span>{request.requester.name}</span>
                      <span>•</span>
                      <span>{request.offersCount} عروض</span>
                    </div>
                  </div>
                  <div className="text-left flex-shrink-0">
                    <p className="font-bold text-emerald-600">
                      {formatCurrency(request.budgetMin)} - {formatCurrency(request.budgetMax)}
                    </p>
                    <p className="text-sm text-gray-500">حتى {formatDate(request.deadline)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
