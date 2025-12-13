'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  searchProperties,
  PROPERTY_TYPE_AR,
  LISTING_TYPE_AR,
  TITLE_TYPE_AR,
  VERIFICATION_LEVEL_AR,
  Property,
  PropertyFilters as PropertyFiltersType,
  PropertyType,
  ListingType,
} from '@/lib/api/properties';
import { PropertyCard, PropertyCardSkeleton } from '@/components/properties/PropertyCard';
import { PropertyFilters, PropertyFiltersState } from '@/components/properties/PropertyFilters';
import {
  Building2,
  Home,
  Plus,
  MapPin,
  TrendingUp,
  Shield,
  ArrowLeftRight,
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// Egyptian governorates
const GOVERNORATES = [
  { name: 'Cairo', nameAr: 'القاهرة' },
  { name: 'Giza', nameAr: 'الجيزة' },
  { name: 'Alexandria', nameAr: 'الإسكندرية' },
  { name: 'Qalyubia', nameAr: 'القليوبية' },
  { name: 'Sharqia', nameAr: 'الشرقية' },
  { name: 'Gharbia', nameAr: 'الغربية' },
  { name: 'Dakahlia', nameAr: 'الدقهلية' },
  { name: 'Beheira', nameAr: 'البحيرة' },
  { name: 'Monufia', nameAr: 'المنوفية' },
  { name: 'Kafr El Sheikh', nameAr: 'كفر الشيخ' },
  { name: 'Damietta', nameAr: 'دمياط' },
  { name: 'Port Said', nameAr: 'بور سعيد' },
  { name: 'Ismailia', nameAr: 'الإسماعيلية' },
  { name: 'Suez', nameAr: 'السويس' },
  { name: 'Fayoum', nameAr: 'الفيوم' },
  { name: 'Beni Suef', nameAr: 'بني سويف' },
  { name: 'Minya', nameAr: 'المنيا' },
  { name: 'Assiut', nameAr: 'أسيوط' },
  { name: 'Sohag', nameAr: 'سوهاج' },
  { name: 'Qena', nameAr: 'قنا' },
  { name: 'Luxor', nameAr: 'الأقصر' },
  { name: 'Aswan', nameAr: 'أسوان' },
  { name: 'Red Sea', nameAr: 'البحر الأحمر' },
  { name: 'Matrouh', nameAr: 'مطروح' },
  { name: 'North Sinai', nameAr: 'شمال سيناء' },
  { name: 'South Sinai', nameAr: 'جنوب سيناء' },
  { name: 'New Valley', nameAr: 'الوادي الجديد' },
];

// Property type icons
const PROPERTY_TYPE_ICONS: Record<PropertyType, string> = {
  APARTMENT: '🏢',
  VILLA: '🏡',
  DUPLEX: '🏠',
  PENTHOUSE: '🌇',
  STUDIO: '🛋️',
  CHALET: '🏖️',
  TOWNHOUSE: '🏘️',
  TWIN_HOUSE: '🏠',
  LAND: '🌍',
  COMMERCIAL: '🏪',
  OFFICE: '🏢',
  RETAIL: '🏬',
  WAREHOUSE: '🏭',
  BUILDING: '🏗️',
};

// Stats interface
interface MarketStats {
  totalProperties: number;
  forSale: number;
  forRent: number;
  verifiedProperties: number;
  barterEnabled: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [filters, setFilters] = useState<PropertyFiltersState>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProperties();
  }, [filters, pagination.page]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const result = await searchProperties({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      // Handle API response with proper null checks
      const properties = result?.properties || [];
      const paginationData = result?.pagination || { total: 0, totalPages: 0 };

      setProperties(properties);
      setPagination((prev) => ({
        ...prev,
        total: paginationData.total || 0,
        totalPages: paginationData.totalPages || 0,
      }));

      // Calculate basic stats from first load
      if (pagination.page === 1 && !stats && properties.length > 0) {
        setStats({
          totalProperties: paginationData.total || properties.length,
          forSale: properties.filter((p) => p.listingType === 'SALE').length,
          forRent: properties.filter((p) => p.listingType === 'RENT').length,
          verifiedProperties: properties.filter(
            (p) => p.verificationLevel !== 'UNVERIFIED'
          ).length,
          barterEnabled: properties.filter((p) => p.openToBarter).length,
        });
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      // Set empty state on error
      setProperties([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
        totalPages: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: PropertyFiltersState) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                <Building2 className="w-10 h-10" />
                سوق العقارات
              </h1>
              <p className="text-xl opacity-90 mb-4">
                أول منصة عقارية في مصر تدعم المقايضة والضمان الآمن
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                  <Shield className="w-4 h-4" />
                  <span>نظام Escrow للحماية</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>مقايضة عقار بعقار</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>تقييم AI للعقارات</span>
                </div>
              </div>
            </div>
            <Link
              href="/properties/create"
              className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              أضف عقارك
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(stats.totalProperties)}
                </div>
                <div className="text-sm text-gray-500">عقار متاح</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(stats.forSale)}
                </div>
                <div className="text-sm text-gray-500">للبيع</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(stats.forRent)}
                </div>
                <div className="text-sm text-gray-500">للإيجار</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(stats.verifiedProperties)}
                </div>
                <div className="text-sm text-gray-500">موثق</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(stats.barterEnabled)}
                </div>
                <div className="text-sm text-gray-500">يقبل المبادلة</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6">
          <PropertyFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
            governorates={GOVERNORATES}
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-600">
            {loading ? (
              <span>جاري البحث...</span>
            ) : (
              <span>
                عرض <strong>{formatNumber(properties.length)}</strong> من{' '}
                <strong>{formatNumber(pagination.total)}</strong> عقار
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {Array.from({ length: 8 }).map((_, idx) => (
              <PropertyCardSkeleton key={idx} />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              لا توجد عقارات مطابقة
            </h3>
            <p className="text-gray-500 mb-6">
              جرب تغيير معايير البحث أو إزالة بعض الفلاتر
            </p>
            <button
              onClick={() => handleFiltersChange({})}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {properties.map((property: any) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <PropertyCard
                  property={{
                    id: property.id,
                    title: property.title,
                    titleAr: property.titleAr,
                    propertyType: property.propertyType,
                    listingType: property.listingType,
                    titleType: property.titleType,
                    verificationLevel: property.verificationLevel,
                    salePrice: property.salePrice,
                    rentPrice: property.rentPrice,
                    pricePerSqm: property.pricePerSqm,
                    areaSqm: property.areaSqm,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    finishingLevel: property.finishingLevel,
                    governorate: property.governorate,
                    city: property.city,
                    district: property.district,
                    compoundName: property.compoundName,
                    images: property.images || [],
                    isFavorite: property.isFavorite,
                    openForBarter: property.openForBarter,
                    hasEscrow: property.hasEscrow,
                    viewsCount: property.viewsCount,
                    virtualTourUrl: property.virtualTourUrl,
                    owner: property.owner,
                  }}
                  showOwner={true}
                />
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, idx) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = idx + 1;
              } else if (pagination.page <= 3) {
                pageNum = idx + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + idx;
              } else {
                pageNum = pagination.page - 2 + idx;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    pagination.page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Quick Categories */}
      <div className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            تصفح حسب النوع
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {(Object.entries(PROPERTY_TYPE_AR) as [PropertyType, string][])
              .slice(0, 7)
              .map(([type, label]) => (
                <button
                  key={type}
                  onClick={() =>
                    handleFiltersChange({ ...filters, propertyTypes: [type] })
                  }
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-200 transition-colors"
                >
                  <span className="text-3xl">{PROPERTY_TYPE_ICONS[type]}</span>
                  <span className="font-medium text-gray-700">{label}</span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            لماذا XChange للعقارات؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">نظام Escrow الآمن</h3>
              <p className="text-gray-400">
                أموالك محمية حتى إتمام الصفقة بنجاح. أول نظام ضمان عقاري في مصر.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowLeftRight className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">مقايضة العقارات</h3>
              <p className="text-gray-400">
                بادل عقارك بعقار آخر أو بسيارة أو ذهب. نظام مقايضة ذكي ومتطور.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">تقييم AI دقيق</h3>
              <p className="text-gray-400">
                احصل على تقييم دقيق لعقارك باستخدام الذكاء الاصطناعي وبيانات السوق.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
