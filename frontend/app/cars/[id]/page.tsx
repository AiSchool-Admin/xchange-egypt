'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/api/client';

// Types
interface CarListing {
  id: string;
  sellerId: string;
  sellerType: string;
  showroomName?: string;
  dealerLicense?: string;
  title: string;
  description?: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  engineSize?: number;
  horsepower?: number;
  cylinders?: number;
  drivetrain?: string;
  mileage: number;
  condition: string;
  accidentHistory: string;
  serviceHistory?: boolean;
  warrantyRemaining?: string;
  exteriorColor: string;
  interiorColor?: string;
  features: string[];
  images: string[];
  videoUrl?: string;
  vin?: string;
  plateNumber?: string;
  verificationLevel: string;
  askingPrice: number;
  marketPrice?: number;
  priceNegotiable: boolean;
  installmentAvailable: boolean;
  allowBarter: boolean;
  barterWithCars: boolean;
  barterWithProperty: boolean;
  barterDescription?: string;
  barterPreferredMakes: string[];
  maxCashDifference?: number;
  governorate: string;
  city: string;
  latitude?: number;
  longitude?: number;
  status: string;
  views: number;
  inquiries: number;
  isFeatured: boolean;
  createdAt: string;
  seller: {
    id: string;
    fullName: string;
    avatar?: string;
    rating: number;
    totalReviews: number;
    governorate?: string;
    city?: string;
    phone?: string;
    createdAt: string;
  };
  buyerPays: number;
  buyerCommission: number;
  marketPriceRange?: { min: number; max: number };
  priceVsMarket?: number;
  inspection?: {
    id: string;
    overallScore?: number;
    exteriorScore?: number;
    interiorScore?: number;
    mechanicalScore?: number;
    electricalScore?: number;
    recommendation?: string;
    estimatedRepairCost?: number;
    reportUrl?: string;
    completedAt?: string;
  };
}

// Constants
const BODY_TYPE_LABELS: Record<string, string> = {
  SEDAN: 'سيدان',
  HATCHBACK: 'هاتشباك',
  SUV: 'SUV',
  CROSSOVER: 'كروس أوفر',
  COUPE: 'كوبيه',
  CONVERTIBLE: 'مكشوفة',
  PICKUP: 'بيك أب',
  VAN: 'فان',
  MINIVAN: 'ميني فان',
  WAGON: 'ستيشن',
  TRUCK: 'شاحنة',
  BUS: 'أتوبيس',
};

const TRANSMISSION_LABELS: Record<string, string> = {
  AUTOMATIC: 'أوتوماتيك',
  MANUAL: 'مانيوال',
  CVT: 'CVT',
  DCT: 'DCT',
};

const FUEL_TYPE_LABELS: Record<string, string> = {
  PETROL: 'بنزين',
  DIESEL: 'ديزل',
  ELECTRIC: 'كهربائي',
  HYBRID: 'هايبرد',
  NATURAL_GAS: 'غاز طبيعي',
  LPG: 'غاز',
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'جديدة - زيرو',
  LIKE_NEW: 'كالجديدة',
  EXCELLENT: 'ممتازة',
  GOOD: 'جيدة',
  FAIR: 'مقبولة',
  NEEDS_WORK: 'تحتاج صيانة',
};

const ACCIDENT_LABELS: Record<string, { label: string; color: string }> = {
  NONE: { label: 'بدون حوادث', color: 'text-green-600' },
  MINOR: { label: 'حادث بسيط', color: 'text-yellow-600' },
  MODERATE: { label: 'حادث متوسط', color: 'text-orange-600' },
  MAJOR: { label: 'حادث كبير', color: 'text-red-600' },
  UNKNOWN: { label: 'غير معروف', color: 'text-gray-500' },
};

const SELLER_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  OWNER: { label: 'مالك أول', icon: '👤', color: 'bg-blue-100 text-blue-700' },
  DEALER: { label: 'تاجر', icon: '🏪', color: 'bg-purple-100 text-purple-700' },
  SHOWROOM: { label: 'معرض', icon: '🏢', color: 'bg-amber-100 text-amber-700' },
};

const VERIFICATION_LABELS: Record<string, { label: string; description: string; color: string }> = {
  BASIC: { label: 'أساسي', description: 'معلومات أساسية فقط', color: 'bg-gray-100 text-gray-600' },
  VERIFIED: { label: 'موثق', description: 'تم التحقق من بيانات البائع', color: 'bg-blue-100 text-blue-700' },
  INSPECTED: { label: 'مفحوصة', description: 'تم فحص السيارة من مركز معتمد', color: 'bg-green-100 text-green-700' },
  CERTIFIED: { label: 'معتمدة', description: 'سيارة معتمدة بضمان المنصة', color: 'bg-emerald-100 text-emerald-700' },
};

export default function CarDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [listing, setListing] = useState<CarListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);
  const [showBarterModal, setShowBarterModal] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await apiClient.get(`/cars/listings/${params.id}`);
        if (response.data.success) {
          setListing(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching car listing:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-700">جاري تحميل تفاصيل السيارة...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">لم يتم العثور على السيارة</h2>
          <p className="text-gray-500 mb-4">قد تكون السيارة قد بيعت أو تم حذف الإعلان</p>
          <Link href="/cars" className="text-blue-600 font-bold hover:underline">
            العودة لسوق السيارات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">الرئيسية</Link>
            <span>/</span>
            <Link href="/cars" className="hover:text-blue-600">سوق السيارات</Link>
            <span>/</span>
            <span className="text-gray-800">{listing.make} {listing.model}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-gray-100">
                {listing.images?.[currentImageIndex] ? (
                  <img
                    src={listing.images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-8xl">🚗</div>
                )}

                {/* Navigation Arrows */}
                {listing.images?.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : listing.images.length - 1))}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev < listing.images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/70"
                    >
                      →
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${SELLER_TYPE_LABELS[listing.sellerType]?.color}`}>
                    {SELLER_TYPE_LABELS[listing.sellerType]?.icon} {SELLER_TYPE_LABELS[listing.sellerType]?.label}
                  </span>
                  {listing.verificationLevel !== 'BASIC' && (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${VERIFICATION_LABELS[listing.verificationLevel]?.color}`}>
                      {VERIFICATION_LABELS[listing.verificationLevel]?.label}
                    </span>
                  )}
                </div>

                {listing.allowBarter && (
                  <div className="absolute bottom-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    🔄 قابلة للمقايضة
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {listing.images?.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                        idx === currentImageIndex ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Basic Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <span>👁️</span> {listing.views} مشاهدة
                </span>
                <span>•</span>
                <span>{formatDate(listing.createdAt)}</span>
                <span>•</span>
                <span>{listing.governorate}، {listing.city}</span>
              </div>

              {listing.description && (
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{listing.description}</p>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">المواصفات</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-sm">الماركة</div>
                  <div className="font-bold">{listing.make}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-sm">الموديل</div>
                  <div className="font-bold">{listing.model}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-sm">سنة الصنع</div>
                  <div className="font-bold">{listing.year}</div>
                </div>
                {listing.trim && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-sm">الفئة</div>
                    <div className="font-bold">{listing.trim}</div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-sm">نوع الهيكل</div>
                  <div className="font-bold">{BODY_TYPE_LABELS[listing.bodyType]}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-sm">ناقل الحركة</div>
                  <div className="font-bold">{TRANSMISSION_LABELS[listing.transmission]}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-sm">نوع الوقود</div>
                  <div className="font-bold">{FUEL_TYPE_LABELS[listing.fuelType]}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-sm">الكيلومترات</div>
                  <div className="font-bold">{formatPrice(listing.mileage)} كم</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-sm">الحالة</div>
                  <div className="font-bold">{CONDITION_LABELS[listing.condition]}</div>
                </div>
                {listing.engineSize && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-sm">سعة المحرك</div>
                    <div className="font-bold">{listing.engineSize} لتر</div>
                  </div>
                )}
                {listing.horsepower && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-sm">قوة المحرك</div>
                    <div className="font-bold">{listing.horsepower} حصان</div>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-gray-500 text-sm">اللون الخارجي</div>
                  <div className="font-bold">{listing.exteriorColor}</div>
                </div>
                {listing.interiorColor && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-500 text-sm">اللون الداخلي</div>
                    <div className="font-bold">{listing.interiorColor}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Accident & Service History */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">تاريخ السيارة</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg border">
                  <span className="text-2xl">🔧</span>
                  <div>
                    <div className="text-gray-500 text-sm">تاريخ الحوادث</div>
                    <div className={`font-bold ${ACCIDENT_LABELS[listing.accidentHistory]?.color}`}>
                      {ACCIDENT_LABELS[listing.accidentHistory]?.label}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg border">
                  <span className="text-2xl">📋</span>
                  <div>
                    <div className="text-gray-500 text-sm">سجل الصيانة</div>
                    <div className={`font-bold ${listing.serviceHistory ? 'text-green-600' : 'text-gray-500'}`}>
                      {listing.serviceHistory ? 'متوفر' : 'غير متوفر'}
                    </div>
                  </div>
                </div>
                {listing.warrantyRemaining && (
                  <div className="flex items-center gap-3 p-4 rounded-lg border col-span-2">
                    <span className="text-2xl">✅</span>
                    <div>
                      <div className="text-gray-500 text-sm">ضمان متبقي</div>
                      <div className="font-bold text-green-600">{listing.warrantyRemaining}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            {listing.features?.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">المميزات والتجهيزات</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.features.map((feature, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      ✓ {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Barter Info */}
            {listing.allowBarter && (
              <div className="bg-purple-50 rounded-xl p-6 shadow-sm border border-purple-200">
                <h2 className="text-xl font-bold mb-4 text-purple-800">🔄 خيارات المقايضة</h2>
                <div className="space-y-3">
                  {listing.barterWithCars && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>قابلة للمقايضة بسيارة أخرى</span>
                    </div>
                  )}
                  {listing.barterWithProperty && (
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      <span>قابلة للمقايضة بعقار</span>
                    </div>
                  )}
                  {listing.barterPreferredMakes?.length > 0 && (
                    <div>
                      <span className="text-gray-600">الماركات المفضلة للمقايضة: </span>
                      <span className="font-bold">{listing.barterPreferredMakes.join('، ')}</span>
                    </div>
                  )}
                  {listing.maxCashDifference && (
                    <div>
                      <span className="text-gray-600">أقصى فرق نقدي: </span>
                      <span className="font-bold text-purple-700">{formatPrice(listing.maxCashDifference)} ج.م</span>
                    </div>
                  )}
                  {listing.barterDescription && (
                    <p className="text-gray-600 mt-2">{listing.barterDescription}</p>
                  )}
                </div>
              </div>
            )}

            {/* Inspection Report */}
            {listing.inspection && listing.inspection.overallScore && (
              <div className="bg-green-50 rounded-xl p-6 shadow-sm border border-green-200">
                <h2 className="text-xl font-bold mb-4 text-green-800">🔍 تقرير الفحص</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{listing.inspection.overallScore}%</div>
                    <div className="text-sm text-gray-500">التقييم العام</div>
                  </div>
                  {listing.inspection.exteriorScore && (
                    <div className="text-center">
                      <div className="text-xl font-bold">{listing.inspection.exteriorScore}%</div>
                      <div className="text-sm text-gray-500">الخارجية</div>
                    </div>
                  )}
                  {listing.inspection.interiorScore && (
                    <div className="text-center">
                      <div className="text-xl font-bold">{listing.inspection.interiorScore}%</div>
                      <div className="text-sm text-gray-500">الداخلية</div>
                    </div>
                  )}
                  {listing.inspection.mechanicalScore && (
                    <div className="text-center">
                      <div className="text-xl font-bold">{listing.inspection.mechanicalScore}%</div>
                      <div className="text-sm text-gray-500">الميكانيكا</div>
                    </div>
                  )}
                  {listing.inspection.electricalScore && (
                    <div className="text-center">
                      <div className="text-xl font-bold">{listing.inspection.electricalScore}%</div>
                      <div className="text-sm text-gray-500">الكهرباء</div>
                    </div>
                  )}
                </div>
                {listing.inspection.reportUrl && (
                  <a
                    href={listing.inspection.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700"
                  >
                    📄 عرض التقرير الكامل
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {formatPrice(listing.askingPrice)} ج.م
                </div>
                {listing.priceNegotiable && (
                  <span className="text-sm text-gray-500">قابل للتفاوض</span>
                )}
              </div>

              {listing.marketPrice && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
                  <div className="text-sm text-gray-500">سعر السوق المرجعي</div>
                  <div className="font-bold">{formatPrice(listing.marketPrice)} ج.م</div>
                  {listing.priceVsMarket !== null && listing.priceVsMarket !== undefined && (
                    <div className={`text-sm ${listing.priceVsMarket > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {listing.priceVsMarket > 0 ? '+' : ''}{listing.priceVsMarket}% من سعر السوق
                    </div>
                  )}
                </div>
              )}

              {/* Commission Info */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-gray-600 mb-1">السعر الإجمالي للمشتري</div>
                <div className="text-xl font-bold text-blue-700">{formatPrice(listing.buyerPays)} ج.م</div>
                <div className="text-xs text-gray-500">شامل عمولة المنصة 1.5%</div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  {showPhone ? (listing.seller.phone || '📞 التواصل عبر المنصة') : '📞 إظهار رقم الهاتف'}
                </button>

                <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors">
                  💬 إرسال رسالة
                </button>

                {listing.allowBarter && (
                  <button
                    onClick={() => setShowBarterModal(true)}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                  >
                    🔄 تقديم عرض مقايضة
                  </button>
                )}

                <button className="w-full border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                  🛒 شراء عبر Escrow
                </button>
              </div>

              {listing.installmentAvailable && (
                <div className="mt-4 text-center text-sm text-green-600 font-bold">
                  💳 تقسيط متاح
                </div>
              )}
            </div>

            {/* Seller Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-4">معلومات البائع</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {listing.seller.avatar ? (
                    <img src={listing.seller.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div>
                  <div className="font-bold">{listing.seller.fullName}</div>
                  <div className={`text-sm ${SELLER_TYPE_LABELS[listing.sellerType]?.color} px-2 py-0.5 rounded-full inline-block`}>
                    {SELLER_TYPE_LABELS[listing.sellerType]?.icon} {SELLER_TYPE_LABELS[listing.sellerType]?.label}
                  </div>
                </div>
              </div>

              {listing.showroomName && (
                <div className="bg-amber-50 rounded-lg p-3 mb-3">
                  <div className="text-sm text-gray-500">اسم المعرض</div>
                  <div className="font-bold text-amber-700">{listing.showroomName}</div>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  ⭐ {listing.seller.rating.toFixed(1)} ({listing.seller.totalReviews} تقييم)
                </div>
                <div>📍 {listing.governorate}</div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link
                  href={`/profile/${listing.seller.id}`}
                  className="text-blue-600 font-bold text-sm hover:underline"
                >
                  عرض صفحة البائع ←
                </Link>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-2">🛡️ نصائح للأمان</h3>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• تواصل عبر المنصة فقط</li>
                <li>• اطلب فحص السيارة قبل الشراء</li>
                <li>• استخدم نظام Escrow للدفع الآمن</li>
                <li>• تحقق من أوراق الملكية</li>
                <li>• لا تدفع مقدماً خارج المنصة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
