'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRightIcon,
  HeartIcon,
  ShareIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  CalendarIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
  SparklesIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  ClockIcon,
  EyeIcon,
  TruckIcon,
  CogIcon,
  BoltIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
  TagIcon,
  UserCircleIcon,
  BuildingStorefrontIcon,
  CheckBadgeIcon,
  XMarkIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import {
  VEHICLE_MAKE_AR,
  VEHICLE_BODY_TYPE_AR,
  FUEL_TYPE_AR,
  TRANSMISSION_AR,
  VEHICLE_CONDITION_AR,
  GOVERNORATE_AR,
  SELLER_TYPE_AR,
  MOCK_VEHICLE_LISTINGS,
  type VehicleListing,
} from '@/lib/api/vehicle-marketplace';

// Extended mock data for detail page
const getVehicleDetail = (id: string): VehicleListing | null => {
  return MOCK_VEHICLE_LISTINGS.find(v => v.id === id) || MOCK_VEHICLE_LISTINGS[0];
};

const FEATURES = [
  'فتحة سقف',
  'مقاعد جلد',
  'نظام ملاحة',
  'بلوتوث',
  'كاميرا خلفية',
  'حساسات ركن',
  'مثبت سرعة',
  'تشغيل بدون مفتاح',
  'Apple CarPlay',
  'Android Auto',
  'كاميرا 360°',
  'شحن لاسلكي',
];

const INSPECTION_RESULTS = {
  overall: 'A',
  categories: [
    { name: 'المحرك ونظام الدفع', grade: 'A', score: 95 },
    { name: 'الهيكل الخارجي', grade: 'A', score: 92 },
    { name: 'الداخلية', grade: 'B', score: 88 },
    { name: 'الإطارات والفرامل', grade: 'A', score: 94 },
    { name: 'الأنظمة الكهربائية', grade: 'A', score: 96 },
  ],
};

export default function VehicleDetailPage() {
  const params = useParams();
  const [vehicle, setVehicle] = useState<VehicleListing | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const data = getVehicleDetail(params.id as string);
    setVehicle(data);
  }, [params.id]);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const allImages = vehicle.images.length > 0 ? vehicle.images : [
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
    'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800',
    'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=800',
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Similar vehicles
  const similarVehicles = MOCK_VEHICLE_LISTINGS.filter(v => v.id !== vehicle.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/vehicles/listings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowRightIcon className="w-5 h-5" />
              <span>العودة للقائمة</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShareIcon className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                {isFavorite ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={allImages[currentImageIndex]}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                <button
                  onClick={prevImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <ChevronLeftIcon className="w-6 h-6" />
                </button>

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {vehicle.featured && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-lg flex items-center gap-1">
                      <SparklesIcon className="w-4 h-4" />
                      مميز
                    </span>
                  )}
                  {vehicle.inspectionGrade && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-lg flex items-center gap-1">
                      <ShieldCheckIcon className="w-4 h-4" />
                      فحص {vehicle.inspectionGrade}
                    </span>
                  )}
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-lg">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="p-4 flex gap-2 overflow-x-auto">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      currentImageIndex === index ? 'border-primary-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Title & Basic Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {VEHICLE_MAKE_AR[vehicle.make]} {vehicle.model} {vehicle.year}
                  </h1>
                  <div className="flex items-center gap-3 text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      {GOVERNORATE_AR[vehicle.location.governorate]}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-4 h-4" />
                      {vehicle.createdAt}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <EyeIcon className="w-4 h-4" />
                      {formatPrice(vehicle.views || 1250)} مشاهدة
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-3xl font-bold text-primary-600">
                    {formatPrice(vehicle.price)}
                    <span className="text-lg font-normal text-gray-500 mr-1">جنيه</span>
                  </div>
                  {vehicle.negotiable && (
                    <span className="text-sm text-green-600">قابل للتفاوض</span>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <TruckIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-500">الكيلومترات</div>
                  <div className="font-bold text-gray-900">{formatPrice(vehicle.mileage)} كم</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CogIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-500">ناقل الحركة</div>
                  <div className="font-bold text-gray-900">{TRANSMISSION_AR[vehicle.transmission]}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <BeakerIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-500">نوع الوقود</div>
                  <div className="font-bold text-gray-900">{FUEL_TYPE_AR[vehicle.fuelType]}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <TagIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-500">نوع الهيكل</div>
                  <div className="font-bold text-gray-900">{VEHICLE_BODY_TYPE_AR[vehicle.bodyType]}</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  vehicle.condition === 'NEW' ? 'bg-green-100 text-green-700' :
                  vehicle.condition === 'EXCELLENT' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {VEHICLE_CONDITION_AR[vehicle.condition]}
                </span>
                {vehicle.acceptsBarter && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <ArrowPathIcon className="w-4 h-4" />
                    يقبل المقايضة
                  </span>
                )}
                {vehicle.inspectionGrade && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <ShieldCheckIcon className="w-4 h-4" />
                    فحص معتمد
                  </span>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">المواصفات التفصيلية</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'الشركة المصنعة', value: VEHICLE_MAKE_AR[vehicle.make] },
                  { label: 'الموديل', value: vehicle.model },
                  { label: 'سنة الصنع', value: vehicle.year },
                  { label: 'نوع الهيكل', value: VEHICLE_BODY_TYPE_AR[vehicle.bodyType] },
                  { label: 'عداد الكيلومترات', value: `${formatPrice(vehicle.mileage)} كم` },
                  { label: 'نوع الوقود', value: FUEL_TYPE_AR[vehicle.fuelType] },
                  { label: 'ناقل الحركة', value: TRANSMISSION_AR[vehicle.transmission] },
                  { label: 'الحالة', value: VEHICLE_CONDITION_AR[vehicle.condition] },
                  { label: 'اللون الخارجي', value: vehicle.color || 'أبيض' },
                  { label: 'سعة المحرك', value: '2.5 لتر' },
                  { label: 'عدد الأبواب', value: '4 أبواب' },
                  { label: 'عدد المقاعد', value: '5 مقاعد' },
                ].map((spec, index) => (
                  <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">{spec.label}</span>
                    <span className="font-medium text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">المميزات والإضافات</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-700">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspection Report */}
            {vehicle.inspectionGrade && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">تقرير الفحص المعتمد</h2>
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                    INSPECTION_RESULTS.overall === 'A' ? 'bg-green-100 text-green-600' :
                    INSPECTION_RESULTS.overall === 'B' ? 'bg-blue-100 text-blue-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {INSPECTION_RESULTS.overall}
                  </div>
                </div>

                <div className="space-y-3">
                  {INSPECTION_RESULTS.categories.map((category, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{category.name}</span>
                          <span className={`text-sm font-bold ${
                            category.grade === 'A' ? 'text-green-600' :
                            category.grade === 'B' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>{category.grade}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              category.score >= 90 ? 'bg-green-500' :
                              category.score >= 80 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${category.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-xl transition-colors">
                  عرض التقرير الكامل (150 نقطة فحص)
                </button>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">الوصف</h2>
              <p className="text-gray-700 leading-relaxed">
                {vehicle.description || `سيارة ${VEHICLE_MAKE_AR[vehicle.make]} ${vehicle.model} موديل ${vehicle.year} بحالة ${VEHICLE_CONDITION_AR[vehicle.condition]}.
                السيارة صيانة وكالة بالكامل ولم تتعرض لأي حوادث. جميع الكماليات متوفرة.
                السيارة نظيفة جداً من الداخل والخارج. الطلاء أصلي 100%.
                سجل صيانة موثق من الوكالة. البطارية والإطارات جديدة.`}
              </p>
            </div>
          </div>

          {/* Right Column - Seller & Actions */}
          <div className="space-y-6">
            {/* Contact Card - Sticky */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  {formatPrice(vehicle.price)} جنيه
                </div>
                {vehicle.negotiable && (
                  <span className="text-sm text-green-600">قابل للتفاوض</span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <PhoneIcon className="w-5 h-5" />
                  {showPhone ? '01012345678' : 'إظهار رقم الهاتف'}
                </button>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full py-3 border border-primary-600 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  إرسال رسالة
                </button>
                {vehicle.acceptsBarter && (
                  <Link
                    href="/vehicles/barter"
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                    عرض مقايضة
                  </Link>
                )}
              </div>

              {/* Seller Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  {vehicle.seller.type === 'OWNER' ? (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="w-8 h-8 text-gray-500" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <BuildingStorefrontIcon className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{vehicle.seller.name}</span>
                      {vehicle.seller.verified && (
                        <CheckBadgeIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{SELLER_TYPE_AR[vehicle.seller.type]}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    <StarSolidIcon className="w-4 h-4" />
                    <span className="font-medium">{vehicle.seller.rating}</span>
                    <span className="text-gray-400">({vehicle.seller.totalSales} تقييم)</span>
                  </div>
                  <span className="text-gray-500">
                    <ClockIcon className="w-4 h-4 inline ml-1" />
                    عضو منذ 2022
                  </span>
                </div>

                <Link
                  href="#"
                  className="text-primary-600 text-sm font-medium hover:underline"
                >
                  عرض جميع إعلانات البائع
                </Link>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-amber-800 mb-2">نصائح الأمان</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• قابل البائع في مكان عام</li>
                    <li>• افحص السيارة قبل الشراء</li>
                    <li>• تأكد من الأوراق الرسمية</li>
                    <li>• استخدم نظام الضمان</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Price Estimate */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-4 border border-primary-200">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-primary-600" />
                <span className="font-bold text-gray-900">تقييم AI للسعر</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                السعر المقدر: <span className="font-bold text-primary-600">{formatPrice(vehicle.price * 0.98)} - {formatPrice(vehicle.price * 1.05)} جنيه</span>
              </div>
              <div className="text-xs text-gray-500">
                السعر المعروض{' '}
                <span className="text-green-600 font-medium">ضمن النطاق المعقول</span>
              </div>
            </div>

            {/* Report */}
            <button className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 hover:underline">
              الإبلاغ عن هذا الإعلان
            </button>
          </div>
        </div>

        {/* Similar Vehicles */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">سيارات مشابهة</h2>
            <Link href="/vehicles/listings" className="text-primary-600 font-medium hover:underline">
              عرض المزيد
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarVehicles.map((v) => (
              <Link
                key={v.id}
                href={`/vehicles/${v.id}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-40">
                  <img
                    src={v.images[0]}
                    alt={v.model}
                    className="w-full h-full object-cover"
                  />
                  {v.acceptsBarter && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg">
                      مقايضة
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {VEHICLE_MAKE_AR[v.make]} {v.model}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">
                    {v.year} • {formatPrice(v.mileage)} كم
                  </div>
                  <div className="text-lg font-bold text-primary-600">
                    {formatPrice(v.price)} جنيه
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">إرسال رسالة</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">رسالتك</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 h-32"
                placeholder="مرحباً، أنا مهتم بسيارتك..."
                defaultValue={`مرحباً، أنا مهتم بـ ${VEHICLE_MAKE_AR[vehicle.make]} ${vehicle.model} ${vehicle.year}. هل السيارة لا تزال متاحة؟`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">مشاركة</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {['WhatsApp', 'Facebook', 'Twitter', 'نسخ'].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <ShareIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-600">{platform}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
