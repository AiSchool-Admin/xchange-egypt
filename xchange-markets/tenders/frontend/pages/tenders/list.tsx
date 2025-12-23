// ═══════════════════════════════════════════════════════════════════════════════
// TENDERS LIST PAGE - صفحة قائمة المناقصات
// ═══════════════════════════════════════════════════════════════════════════════

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  Grid,
  List,
  Clock,
  MapPin,
  Briefcase,
  FileText,
  Users,
  Star,
  Gavel,
  ChevronDown,
  X,
  SlidersHorizontal
} from 'lucide-react';

// Tender Card Component (reused from index)
import { TenderCard } from '../components/TenderCard';

interface FilterState {
  search: string;
  categories: string[];
  businessTypes: string[];
  governorates: string[];
  budgetMin: number | null;
  budgetMax: number | null;
  hasReverseAuction: boolean | null;
  closingSoon: boolean;
  featured: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const CATEGORIES = [
  { id: 'CONSTRUCTION', nameAr: 'بناء وتشييد' },
  { id: 'IT_HARDWARE', nameAr: 'أجهزة IT' },
  { id: 'IT_SOFTWARE', nameAr: 'برمجيات' },
  { id: 'IT_SERVICES', nameAr: 'خدمات IT' },
  { id: 'CONSULTING', nameAr: 'استشارات' },
  { id: 'MEDICAL_SUPPLIES', nameAr: 'مستلزمات طبية' },
  { id: 'OFFICE_SUPPLIES', nameAr: 'مستلزمات مكتبية' },
  { id: 'FURNITURE', nameAr: 'أثاث' },
  { id: 'VEHICLES', nameAr: 'مركبات' },
  { id: 'TRANSPORT', nameAr: 'نقل ولوجستيات' },
  { id: 'CLEANING', nameAr: 'تنظيف' },
  { id: 'SECURITY_SERVICES', nameAr: 'خدمات أمنية' },
  { id: 'MAINTENANCE', nameAr: 'صيانة' },
  { id: 'HOME_SERVICES', nameAr: 'خدمات منزلية' },
  { id: 'TRAINING', nameAr: 'تدريب' }
];

const BUSINESS_TYPES = [
  { id: 'G2B', nameAr: 'حكومي', color: 'blue' },
  { id: 'B2B', nameAr: 'شركات', color: 'green' },
  { id: 'B2C', nameAr: 'شركة لفرد', color: 'purple' },
  { id: 'C2B', nameAr: 'فرد لشركة', color: 'orange' },
  { id: 'C2C', nameAr: 'أفراد', color: 'pink' }
];

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
  'المنوفية', 'القليوبية', 'البحيرة', 'الغربية', 'كفر الشيخ',
  'بورسعيد', 'السويس', 'الإسماعيلية', 'دمياط', 'الفيوم',
  'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا',
  'الأقصر', 'أسوان', 'البحر الأحمر', 'مطروح', 'الوادي الجديد',
  'شمال سيناء', 'جنوب سيناء'
];

export default function TendersListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenders, setTenders] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams?.get('search') || '',
    categories: searchParams?.get('category') ? [searchParams.get('category')!] : [],
    businessTypes: [],
    governorates: [],
    budgetMin: null,
    budgetMax: null,
    hasReverseAuction: searchParams?.get('hasReverseAuction') === 'true' ? true : null,
    closingSoon: searchParams?.get('closingSoon') === 'true',
    featured: searchParams?.get('featured') === 'true',
    sortBy: 'deadline',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchTenders();
  }, [filters, currentPage]);

  const fetchTenders = async () => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      setTenders([
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
        },
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
        },
        {
          id: '4',
          referenceNumber: 'TND-2025-001250',
          title: 'خدمات تنظيف وصيانة مبنى شركة',
          titleAr: 'خدمات تنظيف وصيانة مبنى شركة',
          category: 'CLEANING',
          businessType: 'B2B',
          budgetMin: 50000,
          budgetMax: 80000,
          submissionDeadline: '2025-01-25T23:59:59Z',
          governorate: 'الجيزة',
          city: '6 أكتوبر',
          status: 'ACTIVE',
          bidCount: 15,
          viewCount: 156,
          hasReverseAuction: true,
          isFeatured: false,
          owner: { fullName: 'شركة XYZ', userType: 'COMPANY', trustLevel: 'TRUSTED' },
          createdAt: '2025-01-10T10:00:00Z'
        },
        {
          id: '5',
          referenceNumber: 'TND-2025-001260',
          title: 'استشارات تطوير نظام ERP',
          titleAr: 'استشارات تطوير نظام ERP',
          category: 'IT_SERVICES',
          businessType: 'B2B',
          budgetMin: 300000,
          budgetMax: 500000,
          submissionDeadline: '2025-02-28T23:59:59Z',
          governorate: 'القاهرة',
          city: 'المعادي',
          status: 'ACTIVE',
          bidCount: 7,
          viewCount: 123,
          hasReverseAuction: false,
          isFeatured: false,
          owner: { fullName: 'شركة ABC للتجارة', userType: 'COMPANY', trustLevel: 'PROFESSIONAL' },
          createdAt: '2025-01-18T10:00:00Z'
        }
      ]);
      setTotalCount(156);
      setLoading(false);
    }, 500);
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const toggleArrayFilter = (key: 'categories' | 'businessTypes' | 'governorates', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categories: [],
      businessTypes: [],
      governorates: [],
      budgetMin: null,
      budgetMax: null,
      hasReverseAuction: null,
      closingSoon: false,
      featured: false,
      sortBy: 'deadline',
      sortOrder: 'asc'
    });
    setCurrentPage(1);
  };

  const activeFiltersCount =
    filters.categories.length +
    filters.businessTypes.length +
    filters.governorates.length +
    (filters.budgetMin ? 1 : 0) +
    (filters.budgetMax ? 1 : 0) +
    (filters.hasReverseAuction !== null ? 1 : 0) +
    (filters.closingSoon ? 1 : 0) +
    (filters.featured ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search Bar */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن مناقصات..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-lg border flex items-center gap-2 transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">فلاتر</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('closingSoon', !filters.closingSoon)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                filters.closingSoon
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              تغلق قريباً
            </button>
            <button
              onClick={() => handleFilterChange('hasReverseAuction', filters.hasReverseAuction === true ? null : true)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                filters.hasReverseAuction === true
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Gavel className="w-4 h-4" />
              مزاد عكسي
            </button>
            <button
              onClick={() => handleFilterChange('featured', !filters.featured)}
              className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 transition-colors ${
                filters.featured
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Star className="w-4 h-4" />
              مميزة
            </button>

            {/* Business Type Quick Filters */}
            {BUSINESS_TYPES.map(type => (
              <button
                key={type.id}
                onClick={() => toggleArrayFilter('businessTypes', type.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  filters.businessTypes.includes(type.id)
                    ? `bg-${type.color}-100 text-${type.color}-700`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type.nameAr}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="border-t bg-gray-50 py-6">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التصنيف
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {CATEGORIES.map(cat => (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(cat.id)}
                          onChange={() => toggleArrayFilter('categories', cat.id)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{cat.nameAr}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Governorates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المحافظة
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {GOVERNORATES.slice(0, 10).map(gov => (
                      <label key={gov} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.governorates.includes(gov)}
                          onChange={() => toggleArrayFilter('governorates', gov)}
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">{gov}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الميزانية
                  </label>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="من"
                      value={filters.budgetMin || ''}
                      onChange={(e) => handleFilterChange('budgetMin', e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />
                    <input
                      type="number"
                      placeholder="إلى"
                      value={filters.budgetMax || ''}
                      onChange={(e) => handleFilterChange('budgetMax', e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الترتيب
                  </label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder as 'asc' | 'desc');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  >
                    <option value="deadline-asc">موعد الإغلاق (الأقرب)</option>
                    <option value="deadline-desc">موعد الإغلاق (الأبعد)</option>
                    <option value="createdAt-desc">الأحدث</option>
                    <option value="budget-desc">الميزانية (الأعلى)</option>
                    <option value="budget-asc">الميزانية (الأقل)</option>
                    <option value="bids-desc">عدد العروض (الأكثر)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  مسح الفلاتر
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">المناقصات</h1>
            <p className="text-gray-600">{totalCount} مناقصة</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.categories.map(cat => (
              <span key={cat} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-1">
                {CATEGORIES.find(c => c.id === cat)?.nameAr}
                <button onClick={() => toggleArrayFilter('categories', cat)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.governorates.map(gov => (
              <span key={gov} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                {gov}
                <button onClick={() => toggleArrayFilter('governorates', gov)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : tenders.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد مناقصات</h3>
            <p className="text-gray-600 mb-4">لم نجد مناقصات مطابقة للفلاتر المحددة</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <>
            <div className={`grid ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-6`}>
              {tenders.map(tender => (
                <TenderCardItem key={tender.id} tender={tender} viewMode={viewMode} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  السابق
                </button>
                {[...Array(Math.min(5, Math.ceil(totalCount / 20)))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === i + 1
                        ? 'bg-emerald-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage >= Math.ceil(totalCount / 20)}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  التالي
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Tender Card for List View
function TenderCardItem({ tender, viewMode }: { tender: any; viewMode: 'grid' | 'list' }) {
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
    if (diff <= 0) return { text: 'انتهى', urgent: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return { text: `${days} يوم`, urgent: days <= 3 };
    return { text: `${hours} ساعة`, urgent: true };
  };

  const timeRemaining = getTimeRemaining(tender.submissionDeadline);

  if (viewMode === 'list') {
    return (
      <Link href={`/tenders/${tender.id}`} className="block">
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tender.businessType === 'G2B' ? 'حكومي' : 'شركات'}
                  </span>
                  {tender.hasReverseAuction && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      مزاد عكسي
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{tender.referenceNumber}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{tender.titleAr}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tender.governorate}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {tender.bidCount} عرض
                </span>
                <span className={`flex items-center gap-1 ${timeRemaining.urgent ? 'text-red-600' : ''}`}>
                  <Clock className="w-4 h-4" />
                  {timeRemaining.text}
                </span>
              </div>
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-emerald-600">
                {tender.budgetFixed
                  ? formatCurrency(tender.budgetFixed)
                  : `${formatCurrency(tender.budgetMin)} - ${formatCurrency(tender.budgetMax)}`
                }
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid view (same as TenderCard from index)
  return (
    <Link href={`/tenders/${tender.id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {tender.businessType === 'G2B' ? 'حكومي' : 'شركات'}
            </span>
            <div className="flex gap-2">
              {tender.hasReverseAuction && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <Gavel className="w-3 h-3 inline" /> مزاد
                </span>
              )}
              {tender.isFeatured && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Star className="w-3 h-3 inline fill-current" />
                </span>
              )}
            </div>
          </div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{tender.titleAr}</h3>
          <p className="text-sm text-gray-500">{tender.referenceNumber}</p>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{tender.governorate} - {tender.city}</span>
          </div>
          <div className="text-emerald-600 font-semibold">
            {tender.budgetFixed
              ? formatCurrency(tender.budgetFixed)
              : `${formatCurrency(tender.budgetMin)} - ${formatCurrency(tender.budgetMax)}`
            }
          </div>
        </div>
        <div className={`px-4 py-3 ${timeRemaining.urgent ? 'bg-red-50' : 'bg-gray-50'} flex items-center justify-between`}>
          <div className={`flex items-center gap-1 text-sm ${timeRemaining.urgent ? 'text-red-600' : 'text-gray-600'}`}>
            <Clock className="w-4 h-4" />
            <span>{timeRemaining.text}</span>
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
