// ═══════════════════════════════════════════════════════════════════════════════
// TENDER DETAILS PAGE - صفحة تفاصيل المناقصة
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  MapPin,
  Briefcase,
  FileText,
  Download,
  Eye,
  Users,
  Star,
  Bell,
  Share2,
  MessageSquare,
  Shield,
  CheckCircle,
  AlertCircle,
  Gavel,
  Calendar,
  DollarSign,
  Building2,
  ChevronLeft,
  Heart,
  Send
} from 'lucide-react';

// Types
interface TenderDetails {
  id: string;
  referenceNumber: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  tenderType: string;
  category: string;
  businessType: string;
  budgetType: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetFixed?: number;
  currency: string;
  timeline: {
    publishDate: string;
    submissionDeadline: string;
    questionDeadline?: string;
    awardDate?: string;
    projectStartDate?: string;
    projectEndDate?: string;
  };
  location: {
    governorate: string;
    city: string;
    district?: string;
    fullAddress?: string;
    isRemote: boolean;
  };
  requirements?: string;
  qualifications: string[];
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    downloadCount: number;
  }>;
  evaluationMethod: string;
  evaluationCriteria: Array<{
    name: string;
    weight: number;
    maxScore: number;
  }>;
  settings: {
    visibility: string;
    isNegotiable: boolean;
    allowPartialBids: boolean;
    requireDeposit: boolean;
    depositPercentage?: number;
  };
  status: string;
  owner: {
    id: string;
    fullName: string;
    userType: string;
    trustLevel: string;
    avatar?: string;
    verified: boolean;
    responseTime: string;
    totalTenders: number;
  };
  statistics: {
    viewCount: number;
    bidCount: number;
    watchlistCount: number;
    questionCount: number;
  };
  hasReverseAuction: boolean;
  reverseAuction?: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    startingPrice: number;
    currentPrice?: number;
    minimumDecrement: number;
    totalBids: number;
  };
  isFeatured: boolean;
  myBid?: {
    id: string;
    status: string;
    totalPrice: number;
    submittedAt: string;
  };
  isWatching: boolean;
}

export default function TenderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tenderId = params?.id as string;

  const [tender, setTender] = useState<TenderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'questions' | 'bids'>('details');
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    if (tenderId) {
      fetchTenderDetails();
    }
  }, [tenderId]);

  const fetchTenderDetails = async () => {
    // Mock data
    setTender({
      id: tenderId,
      referenceNumber: 'TND-2025-001234',
      title: 'Tender for Computer Equipment Supply',
      titleAr: 'مناقصة توريد أجهزة حاسب آلي لوزارة الاتصالات وتكنولوجيا المعلومات',
      description: 'Supply of 500 desktop computers for the Ministry of Communications...',
      descriptionAr: `مطلوب توريد عدد 500 جهاز حاسب آلي مكتبي لوزارة الاتصالات وتكنولوجيا المعلومات.

المواصفات المطلوبة:
- معالج Intel Core i7 من الجيل الثاني عشر أو ما يعادله
- ذاكرة عشوائية 16 جيجابايت DDR4
- قرص صلب SSD بسعة 512 جيجابايت
- شاشة 24 بوصة Full HD
- لوحة مفاتيح وفأرة
- ضمان 3 سنوات شامل

يجب أن تكون جميع الأجهزة جديدة وأصلية من الشركة المصنعة.`,
      tenderType: 'OPEN',
      category: 'IT_HARDWARE',
      businessType: 'G2B',
      budgetType: 'RANGE',
      budgetMin: 2000000,
      budgetMax: 2500000,
      currency: 'EGP',
      timeline: {
        publishDate: '2025-01-15T12:00:00Z',
        submissionDeadline: '2025-02-15T23:59:59Z',
        questionDeadline: '2025-02-01T23:59:59Z',
        awardDate: '2025-02-28T00:00:00Z',
        projectStartDate: '2025-03-15T00:00:00Z',
        projectEndDate: '2025-04-15T00:00:00Z'
      },
      location: {
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        district: 'الحي الثامن',
        fullAddress: 'شارع مصطفى النحاس - مبنى الوزارة',
        isRemote: false
      },
      requirements: `المتطلبات الأساسية:
- أن يكون المتقدم شركة مسجلة في السجل التجاري
- خبرة لا تقل عن 5 سنوات في مجال التوريدات الحكومية
- سابقة أعمال لا تقل عن 3 مشاريع مماثلة
- شهادة ISO 9001 أو ما يعادلها
- ضمان بنكي بنسبة 5% من قيمة العقد`,
      qualifications: ['ISO 9001', 'سجل تجاري ساري', 'بطاقة ضريبية', 'خبرة 5 سنوات'],
      documents: [
        { id: '1', name: 'كراسة الشروط والمواصفات', type: 'SPECIFICATIONS', url: '#', size: 2456789, downloadCount: 45 },
        { id: '2', name: 'جدول الكميات', type: 'BOQ', url: '#', size: 123456, downloadCount: 38 },
        { id: '3', name: 'نموذج العقد', type: 'SAMPLE_CONTRACT', url: '#', size: 345678, downloadCount: 22 }
      ],
      evaluationMethod: 'BEST_VALUE',
      evaluationCriteria: [
        { name: 'السعر', weight: 40, maxScore: 100 },
        { name: 'الجودة الفنية', weight: 30, maxScore: 100 },
        { name: 'سابقة الأعمال', weight: 20, maxScore: 100 },
        { name: 'فترة الضمان', weight: 10, maxScore: 100 }
      ],
      settings: {
        visibility: 'PUBLIC',
        isNegotiable: false,
        allowPartialBids: false,
        requireDeposit: true,
        depositPercentage: 5
      },
      status: 'ACTIVE',
      owner: {
        id: 'owner_1',
        fullName: 'وزارة الاتصالات وتكنولوجيا المعلومات',
        userType: 'GOVERNMENT',
        trustLevel: 'ELITE',
        avatar: undefined,
        verified: true,
        responseTime: '2 ساعات',
        totalTenders: 45
      },
      statistics: {
        viewCount: 234,
        bidCount: 12,
        watchlistCount: 45,
        questionCount: 8
      },
      hasReverseAuction: true,
      reverseAuction: {
        id: 'auction_1',
        startTime: '2025-02-16T10:00:00Z',
        endTime: '2025-02-16T14:00:00Z',
        status: 'SCHEDULED',
        startingPrice: 2500000,
        minimumDecrement: 10000,
        totalBids: 0
      },
      isFeatured: true,
      isWatching: false
    });
    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return { text: 'انتهى', urgent: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 7) return { text: `${days} يوم`, urgent: false };
    if (days > 0) return { text: `${days} يوم و ${hours} ساعة`, urgent: days <= 3 };
    if (hours > 0) return { text: `${hours} ساعة و ${minutes} دقيقة`, urgent: true };
    return { text: `${minutes} دقيقة`, urgent: true };
  };

  const handleWatchlist = async () => {
    setIsWatching(!isWatching);
    // API call
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">المناقصة غير موجودة</h2>
          <Link href="/tenders" className="text-emerald-600 hover:text-emerald-700">
            العودة للمناقصات
          </Link>
        </div>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining(tender.timeline.submissionDeadline);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">الرئيسية</Link>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <Link href="/tenders" className="text-gray-500 hover:text-gray-700">المناقصات</Link>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{tender.referenceNumber}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  حكومي
                </span>
                {tender.hasReverseAuction && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 flex items-center gap-1">
                    <Gavel className="w-4 h-4" />
                    مزاد عكسي
                  </span>
                )}
                {tender.isFeatured && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    مميز
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  نشطة
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {tender.titleAr}
              </h1>
              <p className="text-gray-500 mb-4">{tender.referenceNumber}</p>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tender.location.governorate} - {tender.location.city}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  أجهزة IT
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {tender.statistics.viewCount} مشاهدة
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {tender.statistics.bidCount} عرض
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                href={`/tenders/${tender.id}/bid`}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors text-center"
              >
                تقديم عرض
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={handleWatchlist}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                    isWatching
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWatching ? 'fill-current' : ''}`} />
                  {isWatching ? 'متابَع' : 'متابعة'}
                </button>
                <button className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b">
                <nav className="flex">
                  {[
                    { id: 'details', label: 'التفاصيل', icon: FileText },
                    { id: 'documents', label: 'المستندات', icon: Download },
                    { id: 'questions', label: 'الأسئلة', icon: MessageSquare, count: tender.statistics.questionCount },
                    { id: 'bids', label: 'العروض', icon: Users, count: tender.statistics.bidCount }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 px-4 py-4 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-emerald-600 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">وصف المناقصة</h3>
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                        {tender.descriptionAr}
                      </div>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">المتطلبات والشروط</h3>
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                        {tender.requirements}
                      </div>
                    </div>

                    {/* Qualifications */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">المؤهلات المطلوبة</h3>
                      <div className="flex flex-wrap gap-2">
                        {tender.qualifications.map((qual, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                          >
                            {qual}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Evaluation Criteria */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">معايير التقييم</h3>
                      <div className="space-y-3">
                        {tender.evaluationCriteria.map((criteria, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <span className="flex-1 text-gray-700">{criteria.name}</span>
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${criteria.weight}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-12 text-left">
                              {criteria.weight}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-4">
                    {tender.documents.map(doc => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(doc.size)} • {doc.downloadCount} تحميل
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          تحميل
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'questions' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-600">
                        {tender.statistics.questionCount} سؤال
                      </p>
                      <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors flex items-center gap-1">
                        <Send className="w-4 h-4" />
                        طرح سؤال
                      </button>
                    </div>

                    <div className="text-center py-8 text-gray-500">
                      لا توجد أسئلة حالياً
                    </div>
                  </div>
                )}

                {activeTab === 'bids' && (
                  <div className="text-center py-8 text-gray-500">
                    العروض مخفية حتى انتهاء فترة التقديم
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Budget Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">الميزانية</h3>
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {tender.budgetFixed
                  ? formatCurrency(tender.budgetFixed)
                  : `${formatCurrency(tender.budgetMin!)} - ${formatCurrency(tender.budgetMax!)}`
                }
              </div>
              <p className="text-sm text-gray-500">جنيه مصري</p>

              {tender.settings.requireDeposit && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <Shield className="w-4 h-4 inline ml-1" />
                    يتطلب وديعة {tender.settings.depositPercentage}%
                  </p>
                </div>
              )}
            </div>

            {/* Deadline Card */}
            <div className={`rounded-xl shadow-sm p-6 ${timeRemaining.urgent ? 'bg-red-50' : 'bg-white'}`}>
              <h3 className="text-lg font-semibold mb-4">موعد الإغلاق</h3>
              <div className={`text-2xl font-bold mb-2 ${timeRemaining.urgent ? 'text-red-600' : 'text-gray-900'}`}>
                <Clock className="w-6 h-6 inline ml-2" />
                {timeRemaining.text}
              </div>
              <p className="text-sm text-gray-500">
                {formatDate(tender.timeline.submissionDeadline)}
              </p>
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">الجدول الزمني</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">تاريخ النشر</p>
                    <p className="font-medium">{formatDate(tender.timeline.publishDate)}</p>
                  </div>
                </div>

                {tender.timeline.questionDeadline && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">آخر موعد للأسئلة</p>
                      <p className="font-medium">{formatDate(tender.timeline.questionDeadline)}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className={`w-8 h-8 ${timeRemaining.urgent ? 'bg-red-100' : 'bg-yellow-100'} rounded-full flex items-center justify-center shrink-0`}>
                    <Clock className={`w-4 h-4 ${timeRemaining.urgent ? 'text-red-600' : 'text-yellow-600'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">موعد الإغلاق</p>
                    <p className="font-medium">{formatDate(tender.timeline.submissionDeadline)}</p>
                  </div>
                </div>

                {tender.timeline.awardDate && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">موعد الترسية المتوقع</p>
                      <p className="font-medium">{formatDate(tender.timeline.awardDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reverse Auction Card */}
            {tender.hasReverseAuction && tender.reverseAuction && (
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Gavel className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">مزاد عكسي</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-orange-200 text-sm">سعر البداية</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(tender.reverseAuction.startingPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-orange-200 text-sm">موعد المزاد</p>
                    <p className="font-medium">
                      {formatDate(tender.reverseAuction.startTime)}
                    </p>
                  </div>
                  <Link
                    href={`/tenders/${tender.id}/auction`}
                    className="block w-full py-3 bg-white text-orange-600 rounded-lg font-semibold text-center hover:bg-orange-50 transition-colors mt-4"
                  >
                    تفاصيل المزاد
                  </Link>
                </div>
              </div>
            )}

            {/* Owner Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">صاحب المناقصة</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{tender.owner.fullName}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    {tender.owner.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                    <span>جهة حكومية</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">مستوى الثقة</span>
                  <span className="text-emerald-600 font-medium">{tender.owner.trustLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">متوسط الرد</span>
                  <span>{tender.owner.responseTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">إجمالي المناقصات</span>
                  <span>{tender.owner.totalTenders}</span>
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
                تواصل مع صاحب المناقصة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
