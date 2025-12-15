"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Share2,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Eye,
  Car,
  Settings,
  Droplets,
  Tag,
  User,
  Store,
  BadgeCheck,
  X,
} from "lucide-react";
import {
  VEHICLE_MAKE_AR,
  BODY_TYPE_AR,
  FUEL_TYPE_AR,
  TRANSMISSION_AR,
  CONDITION_AR,
  GOVERNORATE_AR,
  SELLER_TYPE_AR,
  MOCK_VEHICLE_LISTINGS,
  type VehicleListing,
  formatVehiclePrice,
  formatMileage,
} from "@/lib/api/vehicle-marketplace";

const getVehicleDetail = (id: string): VehicleListing | null => {
  return MOCK_VEHICLE_LISTINGS.find((v) => v.id === id) || MOCK_VEHICLE_LISTINGS[0];
};

const FEATURES = [
  "فتحة سقف",
  "مقاعد جلد",
  "نظام ملاحة",
  "بلوتوث",
  "كاميرا خلفية",
  "حساسات ركن",
  "مثبت سرعة",
  "تشغيل بدون مفتاح",
  "Apple CarPlay",
  "Android Auto",
  "كاميرا 360°",
  "شحن لاسلكي",
];

const INSPECTION_RESULTS = {
  overall: "A" as const,
  categories: [
    { name: "المحرك ونظام الدفع", grade: "A", score: 95 },
    { name: "الهيكل الخارجي", grade: "A", score: 92 },
    { name: "الداخلية", grade: "B", score: 88 },
    { name: "الإطارات والفرامل", grade: "A", score: 94 },
    { name: "الأنظمة الكهربائية", grade: "A", score: 96 },
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

  const allImages =
    vehicle.images.length > 0
      ? vehicle.images.map((img) => img.url)
      : [
          "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800",
          "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800",
          "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800",
        ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const similarVehicles = MOCK_VEHICLE_LISTINGS.filter((v) => v.id !== vehicle.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/vehicles/listings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowRight className="w-5 h-5" />
              <span>العودة للقائمة</span>
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowShareModal(true)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button onClick={() => setIsFavorite(!isFavorite)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative aspect-video">
                <img src={allImages[currentImageIndex]} alt={vehicle.model} className="w-full h-full object-cover" />
                <button
                  onClick={prevImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {vehicle.featured && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-lg flex items-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      مميز
                    </span>
                  )}
                  {vehicle.inspection && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-lg flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      فحص {vehicle.inspection.overallGrade}
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 text-white text-sm rounded-lg">
                  {currentImageIndex + 1} / {allImages.length}
                </div>
              </div>
              <div className="p-4 flex gap-2 overflow-x-auto">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      currentImageIndex === index ? "border-primary-500" : "border-transparent"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Title */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {VEHICLE_MAKE_AR[vehicle.make]} {vehicle.model} {vehicle.year}
                  </h1>
                  <div className="flex items-center gap-3 text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {GOVERNORATE_AR[vehicle.governorate]}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {vehicle.views} مشاهدة
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-3xl font-bold text-primary-600">
                    {formatVehiclePrice(vehicle.askingPrice)}
                    <span className="text-lg font-normal text-gray-500 mr-1">جنيه</span>
                  </div>
                  {vehicle.priceNegotiable && <span className="text-sm text-green-600">قابل للتفاوض</span>}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Car className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-500">الكيلومترات</div>
                  <div className="font-bold text-gray-900">{formatMileage(vehicle.mileage)}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-500">ناقل الحركة</div>
                  <div className="font-bold text-gray-900">{TRANSMISSION_AR[vehicle.transmission]}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Droplets className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-500">نوع الوقود</div>
                  <div className="font-bold text-gray-900">{FUEL_TYPE_AR[vehicle.fuelType]}</div>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Tag className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-gray-500">نوع الهيكل</div>
                  <div className="font-bold text-gray-900">{BODY_TYPE_AR[vehicle.bodyType].label}</div>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    vehicle.condition === "NEW"
                      ? "bg-green-100 text-green-700"
                      : vehicle.condition === "EXCELLENT" || vehicle.condition === "LIKE_NEW"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {CONDITION_AR[vehicle.condition].label}
                </span>
                {vehicle.allowBarter && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" />
                    يقبل المقايضة
                  </span>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">المواصفات التفصيلية</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "الشركة المصنعة", value: VEHICLE_MAKE_AR[vehicle.make] },
                  { label: "الموديل", value: vehicle.model },
                  { label: "سنة الصنع", value: vehicle.year },
                  { label: "نوع الهيكل", value: BODY_TYPE_AR[vehicle.bodyType].label },
                  { label: "عداد الكيلومترات", value: formatMileage(vehicle.mileage) },
                  { label: "نوع الوقود", value: FUEL_TYPE_AR[vehicle.fuelType] },
                  { label: "ناقل الحركة", value: TRANSMISSION_AR[vehicle.transmission] },
                  { label: "الحالة", value: CONDITION_AR[vehicle.condition].label },
                  { label: "اللون الخارجي", value: vehicle.exteriorColorAr || "غير محدد" },
                  { label: "سعة المحرك", value: vehicle.engineSize ? `${vehicle.engineSize} سي سي` : "غير محدد" },
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
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">الوصف</h2>
              <p className="text-gray-700 leading-relaxed">
                {vehicle.descriptionAr ||
                  `سيارة ${VEHICLE_MAKE_AR[vehicle.make]} ${vehicle.model} موديل ${vehicle.year} بحالة ${CONDITION_AR[vehicle.condition].label}.
                السيارة صيانة وكالة بالكامل ولم تتعرض لأي حوادث. جميع الكماليات متوفرة.`}
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-primary-600 mb-1">{formatVehiclePrice(vehicle.askingPrice)} جنيه</div>
                {vehicle.priceNegotiable && <span className="text-sm text-green-600">قابل للتفاوض</span>}
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  {showPhone ? vehicle.seller.phone || "01012345678" : "إظهار رقم الهاتف"}
                </button>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full py-3 border border-primary-600 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  إرسال رسالة
                </button>
                {vehicle.allowBarter && (
                  <Link
                    href="/vehicles/barter"
                    className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    عرض مقايضة
                  </Link>
                )}
              </div>

              {/* Seller Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 mb-3">
                  {vehicle.sellerType === "OWNER" ? (
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-500" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{vehicle.seller.fullNameAr || vehicle.seller.fullName}</span>
                      {vehicle.seller.verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="text-sm text-gray-500">{SELLER_TYPE_AR[vehicle.sellerType].label}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium">{vehicle.seller.rating}</span>
                    <span className="text-gray-400">({vehicle.seller.totalReviews} تقييم)</span>
                  </div>
                  <span className="text-gray-500">
                    <Clock className="w-4 h-4 inline ml-1" />
                    عضو منذ {vehicle.seller.memberSince}
                  </span>
                </div>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
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
                <Sparkles className="w-5 h-5 text-primary-600" />
                <span className="font-bold text-gray-900">تقييم AI للسعر</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">
                السعر المقدر:{" "}
                <span className="font-bold text-primary-600">
                  {formatVehiclePrice(vehicle.askingPrice * 0.95)} - {formatVehiclePrice(vehicle.askingPrice * 1.05)} جنيه
                </span>
              </div>
              <div className="text-xs text-gray-500">
                السعر المعروض <span className="text-green-600 font-medium">ضمن النطاق المعقول</span>
              </div>
            </div>
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
              <Link key={v.id} href={`/vehicles/${v.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40">
                  <img
                    src={v.images[0]?.url || "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400"}
                    alt={v.model}
                    className="w-full h-full object-cover"
                  />
                  {v.allowBarter && (
                    <span className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg">مقايضة</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {VEHICLE_MAKE_AR[v.make]} {v.model}
                  </h3>
                  <div className="text-sm text-gray-500 mb-2">
                    {v.year} • {formatMileage(v.mileage)}
                  </div>
                  <div className="text-lg font-bold text-primary-600">{formatVehiclePrice(v.askingPrice)} جنيه</div>
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
              <button onClick={() => setShowContactModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
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
              <button onClick={() => setShowContactModal(false)} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                إلغاء
              </button>
              <button onClick={() => setShowContactModal(false)} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700">
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
              <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {["WhatsApp", "Facebook", "Twitter", "نسخ"].map((platform) => (
                <button
                  key={platform}
                  onClick={() => setShowShareModal(false)}
                  className="flex flex-col items-center gap-2 p-3 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Share2 className="w-6 h-6 text-gray-600" />
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
