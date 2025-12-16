// ═══════════════════════════════════════════════════════════════════════════════
// XCHANGE TENDER MARKETPLACE - FRONTEND PAGES
// الصفحة الرئيسية لسوق المناقصات
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  Briefcase,
  TrendingUp,
  Users,
  FileText,
  ArrowLeft,
  ChevronDown,
  Star,
  Bell,
  Building2,
  Hammer,
  Cpu,
  Truck,
  Wrench,
  Home,
  Gavel
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Tender {
  id: string;
  referenceNumber: string;
  title: string;
  titleAr: string;
  category: string;
  businessType: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetFixed?: number;
  submissionDeadline: string;
  governorate: string;
  city: string;
  status: string;
  bidCount: number;
  viewCount: number;
  hasReverseAuction: boolean;
  isFeatured: boolean;
  owner: {
    fullName: string;
    userType: string;
    trustLevel: string;
  };
  createdAt: string;
}

interface Category {
  id: string;
  nameAr: string;
  icon: React.ReactNode;
  count: number;
}

interface Stats {
  totalActiveTenders: number;
  totalContractValue: number;
  registeredVendors: number;
  successfulContracts: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOMEPAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [featuredTenders, setFeaturedTenders] = useState<Tender[]>([]);
  const [latestTenders, setLatestTenders] = useState<Tender[]>([]);
  const [closingSoonTenders, setClosingSoonTenders] = useState<Tender[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalActiveTenders: 234,
    totalContractValue: 150000000,
    registeredVendors: 12500,
    successfulContracts: 8750
  });
  const [loading, setLoading] = useState(true);

  const categories: Category[] = [
    { id: 'CONSTRUCTION', nameAr: 'بناء وتشييد', icon: <Building2 />, count: 89 },
    { id: 'IT_HARDWARE', nameAr: 'تكنولوجيا المعلومات', icon: <Cpu />, count: 45 },
    { id: 'TRANSPORT', nameAr: 'نقل ولوجستيات', icon: <Truck />, count: 34 },
    { id: 'MAINTENANCE', nameAr: 'صيانة', icon: <Wrench />, count: 28 },
    { id: 'HOME_SERVICES', nameAr: 'خدمات منزلية', icon: <Home />, count: 56 },
    { id: 'CONSULTING', nameAr: 'استشارات', icon: <Briefcase />, count: 23 }
  ];

  useEffect(() => {
    // Fetch data
    fetchFeaturedTenders();
    fetchLatestTenders();
    fetchClosingSoonTenders();
    fetchStats();
  }, []);

  const fetchFeaturedTenders = async () => {
    // API call - mock data for now
    setFeaturedTenders([
      {
        id: '1',
        referenceNumber: 'TND-2025-001234',
        title: 'مناقصة توريد أجهزة حاسب آلي لوزارة الاتصالات',
        titleAr: 'مناقصة توريد أجهزة حاسب آلي لوزارة الاتصالات',
        category: 'IT_HARDWARE',
        businessType: 'G2B',
        budgetMin: 2000000,
        budgetMax: 2500000,
        submissionDeadline: '2025-02-15T23:59:59Z',
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        status: 'ACTIVE',
        bidCount: 12,
        viewCount: 234,
        hasReverseAuction: true,
        isFeatured: true,
        owner: { fullName: 'وزارة الاتصالات', userType: 'GOVERNMENT', trustLevel: 'ELITE' },
        createdAt: '2025-01-15T10:00:00Z'
      },
      {
        id: '2',
        referenceNumber: 'TND-2025-001235',
        title: 'مناقصة تشطيب مبنى إداري بالعاصمة الإدارية',
        titleAr: 'مناقصة تشطيب مبنى إداري بالعاصمة الإدارية',
        category: 'CONSTRUCTION',
        businessType: 'B2B',
        budgetMin: 15000000,
        budgetMax: 20000000,
        submissionDeadline: '2025-02-20T23:59:59Z',
        governorate: 'القاهرة',
        city: 'العاصمة الإدارية',
        status: 'ACTIVE',
        bidCount: 8,
        viewCount: 189,
        hasReverseAuction: false,
        isFeatured: true,
        owner: { fullName: 'شركة المقاولون العرب', userType: 'COMPANY', trustLevel: 'PROFESSIONAL' },
        createdAt: '2025-01-16T10:00:00Z'
      }
    ]);
    setLoading(false);
  };

  const fetchLatestTenders = async () => {
    setLatestTenders([
      {
        id: '3',
        referenceNumber: 'TND-2025-001240',
        title: 'توريد مستلزمات طبية لمستشفى الدمرداش',
        titleAr: 'توريد مستلزمات طبية لمستشفى الدمرداش',
        category: 'MEDICAL_SUPPLIES',
        businessType: 'G2B',
        budgetFixed: 500000,
        submissionDeadline: '2025-02-10T23:59:59Z',
        governorate: 'القاهرة',
        city: 'العباسية',
        status: 'ACTIVE',
        bidCount: 5,
        viewCount: 87,
        hasReverseAuction: false,
        isFeatured: false,
        owner: { fullName: 'وزارة الصحة', userType: 'GOVERNMENT', trustLevel: 'ELITE' },
        createdAt: '2025-01-17T10:00:00Z'
      }
    ]);
  };

  const fetchClosingSoonTenders = async () => {
    setClosingSoonTenders([
      {
        id: '4',
        referenceNumber: 'TND-2025-001200',
        title: 'خدمات تنظيف وصيانة مبنى شركة',
        titleAr: 'خدمات تنظيف وصيانة مبنى شركة',
        category: 'CLEANING',
        businessType: 'B2B',
        budgetMin: 50000,
        budgetMax: 80000,
        submissionDeadline: '2025-01-18T23:59:59Z',
        governorate: 'الجيزة',
        city: '6 أكتوبر',
        status: 'ACTIVE',
        bidCount: 15,
        viewCount: 156,
        hasReverseAuction: true,
        isFeatured: false,
        owner: { fullName: 'شركة XYZ', userType: 'COMPANY', trustLevel: 'TRUSTED' },
        createdAt: '2025-01-10T10:00:00Z'
      }
    ]);
  };

  const fetchStats = async () => {
    // API call
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/tenders?search=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num);
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'انتهى';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} يوم و ${hours} ساعة`;
    return `${hours} ساعة`;
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'CONSTRUCTION': 'بناء وتشييد',
      'IT_HARDWARE': 'أجهزة IT',
      'IT_SOFTWARE': 'برمجيات',
      'MEDICAL_SUPPLIES': 'مستلزمات طبية',
      'CLEANING': 'تنظيف',
      'TRANSPORT': 'نقل',
      'CONSULTING': 'استشارات'
    };
    return names[category] || category;
  };

  const getBusinessTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'G2B': { label: 'حكومي', color: 'bg-blue-100 text-blue-800' },
      'B2B': { label: 'شركات', color: 'bg-green-100 text-green-800' },
      'C2C': { label: 'أفراد', color: 'bg-purple-100 text-purple-800' },
      'C2B': { label: 'خدمات', color: 'bg-orange-100 text-orange-800' }
    };
    return badges[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-l from-emerald-600 to-teal-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              سوق المناقصات
            </h1>
            <p className="text-xl text-emerald-100 mb-2">
              أفضل منصة للمناقصات في مصر
            </p>
            <p className="text-lg text-emerald-200">
              G2B • B2B • B2C • C2C • C2B
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 bg-white rounded-xl p-2 shadow-xl">
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث عن مناقصات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-4 rounded-lg text-gray-900 bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">جميع التصنيفات</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                ))}
              </select>
              <button
                type="submit"
                className="px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
              >
                بحث
              </button>
            </div>
          </form>

          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/tenders?hasReverseAuction=true" className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <Gavel className="w-4 h-4" />
              <span>مزادات عكسية</span>
            </Link>
            <Link href="/tenders?closingSoon=true" className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <Clock className="w-4 h-4" />
              <span>تغلق قريباً</span>
            </Link>
            <Link href="/service-requests" className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
              <Home className="w-4 h-4" />
              <span>خدمات منزلية</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{formatNumber(stats.totalActiveTenders)}</p>
              <p className="text-gray-600">مناقصة نشطة</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{formatCurrency(stats.totalContractValue)}</p>
              <p className="text-gray-600">قيمة العقود</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{formatNumber(stats.registeredVendors)}</p>
              <p className="text-gray-600">مورد مسجل</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{formatNumber(stats.successfulContracts)}</p>
              <p className="text-gray-600">عقد ناجح</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">تصفح حسب التصنيف</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map(category => (
              <Link
                key={category.id}
                href={`/tenders?category=${category.id}`}
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-3">
                  {category.icon}
                </div>
                <span className="font-medium text-gray-900 text-center">{category.nameAr}</span>
                <span className="text-sm text-gray-500">{category.count} مناقصة</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tenders */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">مناقصات مميزة</h2>
            <Link href="/tenders?featured=true" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTenders.map(tender => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        </div>
      </section>

      {/* Closing Soon */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-red-500" />
              تغلق قريباً
            </h2>
            <Link href="/tenders?closingSoon=true" className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {closingSoonTenders.map(tender => (
              <TenderCard key={tender.id} tender={tender} urgent />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-emerald-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">كيف تعمل المنصة؟</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Buyers */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-emerald-700">للمشترين</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold">أنشئ مناقصة</h4>
                    <p className="text-gray-600">أضف تفاصيل المناقصة والمتطلبات والميزانية</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold">استقبل العروض</h4>
                    <p className="text-gray-600">يتقدم الموردون المؤهلون بعروضهم</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold">قارن واختر</h4>
                    <p className="text-gray-600">قيّم العروض واختر الأفضل</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold">تعاقد بأمان</h4>
                    <p className="text-gray-600">نظام ضمان يحمي حقوقك</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Vendors */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-emerald-700">للموردين</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                  <div>
                    <h4 className="font-semibold">سجّل كمورد</h4>
                    <p className="text-gray-600">أنشئ ملف تعريفي وحدد تخصصاتك</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                  <div>
                    <h4 className="font-semibold">اكتشف الفرص</h4>
                    <p className="text-gray-600">ابحث عن المناقصات المناسبة لتخصصك</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                  <div>
                    <h4 className="font-semibold">قدّم عرضك</h4>
                    <p className="text-gray-600">أرسل عرضك التنافسي</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold shrink-0">4</div>
                  <div>
                    <h4 className="font-semibold">افز واكسب</h4>
                    <p className="text-gray-600">احصل على عقود وابنِ سمعتك</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/register"
              className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              ابدأ الآن مجاناً
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-l from-emerald-600 to-teal-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">هل أنت جهة حكومية أو شركة كبيرة؟</h2>
          <p className="text-xl text-emerald-100 mb-8">
            احصل على حساب مؤسسي مع مميزات خاصة ودعم مخصص
          </p>
          <Link
            href="/enterprise"
            className="inline-block px-8 py-4 bg-white text-emerald-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            تواصل معنا
          </Link>
        </div>
      </section>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TENDER CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface TenderCardProps {
  tender: Tender;
  urgent?: boolean;
}

function TenderCard({ tender, urgent }: TenderCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'انتهى';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} يوم`;
    return `${hours} ساعة`;
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      'CONSTRUCTION': 'بناء',
      'IT_HARDWARE': 'أجهزة IT',
      'IT_SOFTWARE': 'برمجيات',
      'MEDICAL_SUPPLIES': 'مستلزمات طبية',
      'CLEANING': 'تنظيف',
      'TRANSPORT': 'نقل'
    };
    return names[category] || category;
  };

  const getBusinessTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'G2B': { label: 'حكومي', color: 'bg-blue-100 text-blue-800' },
      'B2B': { label: 'شركات', color: 'bg-green-100 text-green-800' },
      'C2C': { label: 'أفراد', color: 'bg-purple-100 text-purple-800' }
    };
    return badges[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
  };

  const badge = getBusinessTypeBadge(tender.businessType);

  return (
    <Link href={`/tenders/${tender.id}`} className="block">
      <div className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border ${urgent ? 'border-red-200' : 'border-gray-100'} overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
              {badge.label}
            </span>
            <div className="flex gap-2">
              {tender.hasReverseAuction && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  مزاد عكسي
                </span>
              )}
              {tender.isFeatured && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 inline" /> مميز
                </span>
              )}
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
            {tender.titleAr}
          </h3>
          <p className="text-sm text-gray-500">{tender.referenceNumber}</p>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{tender.governorate} - {tender.city}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="w-4 h-4" />
            <span>{getCategoryName(tender.category)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-emerald-600 font-semibold">
              {tender.budgetFixed
                ? formatCurrency(tender.budgetFixed)
                : `${formatCurrency(tender.budgetMin!)} - ${formatCurrency(tender.budgetMax!)}`
              }
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 ${urgent ? 'bg-red-50' : 'bg-gray-50'} flex items-center justify-between`}>
          <div className={`flex items-center gap-1 text-sm ${urgent ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="w-4 h-4" />
            <span>{getTimeRemaining(tender.submissionDeadline)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {tender.bidCount}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {tender.viewCount}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
