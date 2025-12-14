"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  ArrowRight,
  CheckCircle,
  Shield,
  Battery,
  HardDrive,
  MapPin,
  Calendar,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  ArrowLeftRight,
  ShoppingCart,
  Star,
  AlertTriangle,
  Box,
  Headphones,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  User,
} from "lucide-react";
import {
  MobileBrand,
  MobileConditionGrade,
  MobileScreenCondition,
  MobileBodyCondition,
  MOBILE_BRAND_AR,
  CONDITION_GRADE_AR,
  SCREEN_CONDITION_AR,
  BODY_CONDITION_AR,
  IMEI_STATUS_AR,
  formatMobilePrice,
  getConditionGradeColor,
  getBatteryHealthColor,
} from "@/lib/api/mobile-marketplace";

// Mock listing data
const MOCK_LISTING = {
  id: "1",
  title: "iPhone 15 Pro Max 256GB - Natural Titanium",
  titleAr: "آيفون 15 برو ماكس 256 جيجا - تيتانيوم طبيعي",
  description: "جهاز بحالة ممتازة، استخدام خفيف لمدة 3 أشهر فقط. يأتي مع العلبة الأصلية والشاحن والسماعات. البطارية بصحة 98%. الشاشة نظيفة تماماً بدون أي خدوش. تم شراؤه من iStyle مصر.",
  brand: "APPLE" as MobileBrand,
  model: "iPhone 15 Pro Max",
  storageGb: 256,
  ramGb: 8,
  color: "Natural Titanium",
  colorAr: "تيتانيوم طبيعي",
  imei: "35XXXXXXXXXX123",
  imeiVerified: true,
  imeiStatus: "CLEAN" as const,
  ntraRegistered: true,
  conditionGrade: "A" as MobileConditionGrade,
  batteryHealth: 98,
  screenCondition: "PERFECT" as MobileScreenCondition,
  bodyCondition: "LIKE_NEW" as MobileBodyCondition,
  originalParts: true,
  hasBox: true,
  hasAccessories: true,
  accessoriesDetails: "الشاحن الأصلي + كابل USB-C + سماعات EarPods",
  priceEgp: 65000,
  originalPrice: 72000,
  negotiable: true,
  acceptsBarter: true,
  barterPreferences: {
    preferredBrands: ["SAMSUNG", "APPLE"] as MobileBrand[],
    minValue: 50000,
    maxCashDifference: 15000,
  },
  images: [
    "/images/phones/iphone15promax-1.jpg",
    "/images/phones/iphone15promax-2.jpg",
    "/images/phones/iphone15promax-3.jpg",
    "/images/phones/iphone15promax-4.jpg",
  ],
  verificationImageUrl: "/images/phones/verification.jpg",
  governorate: "القاهرة",
  city: "مدينة نصر",
  district: "الحي السابع",
  featured: true,
  viewsCount: 342,
  favoritesCount: 28,
  inquiriesCount: 15,
  warrantyMonths: 9,
  warrantyProvider: "iStyle Egypt",
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  seller: {
    id: "seller-1",
    name: "أحمد محمد",
    avatar: "/images/avatars/user1.jpg",
    rating: 4.8,
    reviewsCount: 45,
    verified: true,
    trustLevel: "trusted" as const,
    responseRate: 95,
    responseTime: "خلال ساعة",
    memberSince: new Date("2022-06-15"),
    soldCount: 32,
  },
};

export default function MobileListingDetailsPage({ params }: { params: { id: string } }) {
  const listing = MOCK_LISTING;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showBarterModal, setShowBarterModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const discount = listing.originalPrice
    ? Math.round(((listing.originalPrice - listing.priceEgp) / listing.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile/listings" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowRight className="w-5 h-5" />
              <span>العودة للإعلانات</span>
            </Link>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full ${isFavorite ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
              </button>
              <button className="p-2 rounded-full bg-gray-100 text-gray-600">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-96 bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Smartphone className="w-24 h-24 text-gray-300" />
                </div>

                {/* Image Navigation */}
                <button
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(Math.min(listing.images.length - 1, currentImageIndex + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {listing.featured && (
                    <span className="px-3 py-1 bg-amber-500 text-white text-sm rounded-full font-medium">
                      مميز
                    </span>
                  )}
                  {listing.imeiVerified && (
                    <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      IMEI موثق
                    </span>
                  )}
                </div>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                  {currentImageIndex + 1} / {listing.images.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 p-4 overflow-x-auto">
                {listing.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center border-2 ${
                      currentImageIndex === idx ? "border-blue-500" : "border-transparent"
                    }`}
                  >
                    <Smartphone className="w-8 h-8 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Price */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-2">
                    {MOBILE_BRAND_AR[listing.brand]} • {listing.model}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {listing.viewsCount} مشاهدة
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {listing.favoritesCount} إعجاب
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      منذ 3 أيام
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatMobilePrice(listing.priceEgp)}
                  </div>
                  {listing.originalPrice && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        {formatMobilePrice(listing.originalPrice)}
                      </span>
                      <span className="text-green-600 text-sm font-medium">-{discount}%</span>
                    </div>
                  )}
                  {listing.negotiable && (
                    <span className="text-sm text-gray-500">قابل للتفاوض</span>
                  )}
                </div>
              </div>
            </div>

            {/* IMEI Verification */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                التحقق من IMEI
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">الجهاز نظيف</span>
                  </div>
                  <p className="text-sm text-green-700">تم التحقق من أن الجهاز غير مسروق وغير محظور</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">مسجل في NTRA</span>
                  </div>
                  <p className="text-sm text-blue-700">الجهاز مسجل رسمياً في جهاز تنظيم الاتصالات</p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <span className="font-medium">IMEI:</span> {listing.imei}
              </div>
            </div>

            {/* Device Specifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">مواصفات الجهاز</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">السعة التخزينية</div>
                    <div className="font-medium">{listing.storageGb} GB</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Battery className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">صحة البطارية</div>
                    <div className={`font-medium ${getBatteryHealthColor(listing.batteryHealth)}`}>
                      {listing.batteryHealth}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">حالة الشاشة</div>
                    <div className="font-medium">{SCREEN_CONDITION_AR[listing.screenCondition]}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Box className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">حالة الجسم</div>
                    <div className="font-medium">{BODY_CONDITION_AR[listing.bodyCondition]}</div>
                  </div>
                </div>
              </div>

              {/* Condition Grade */}
              <div className="mt-6 p-4 border rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">تصنيف الحالة</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-lg font-bold ${getConditionGradeColor(listing.conditionGrade)}`}>
                        {listing.conditionGrade}
                      </span>
                      <span className="font-medium">{CONDITION_GRADE_AR[listing.conditionGrade].label}</span>
                    </div>
                  </div>
                  <div className="text-left text-sm text-gray-500">
                    {CONDITION_GRADE_AR[listing.conditionGrade].desc}
                  </div>
                </div>
              </div>

              {/* Accessories */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className={`p-3 rounded-xl text-center ${listing.hasBox ? "bg-green-50" : "bg-gray-50"}`}>
                  <Box className={`w-6 h-6 mx-auto mb-1 ${listing.hasBox ? "text-green-600" : "text-gray-400"}`} />
                  <div className={`text-sm ${listing.hasBox ? "text-green-700" : "text-gray-500"}`}>
                    {listing.hasBox ? "يوجد علبة" : "بدون علبة"}
                  </div>
                </div>
                <div className={`p-3 rounded-xl text-center ${listing.hasAccessories ? "bg-green-50" : "bg-gray-50"}`}>
                  <Headphones className={`w-6 h-6 mx-auto mb-1 ${listing.hasAccessories ? "text-green-600" : "text-gray-400"}`} />
                  <div className={`text-sm ${listing.hasAccessories ? "text-green-700" : "text-gray-500"}`}>
                    {listing.hasAccessories ? "يوجد إكسسوارات" : "بدون إكسسوارات"}
                  </div>
                </div>
                <div className={`p-3 rounded-xl text-center ${listing.originalParts ? "bg-green-50" : "bg-gray-50"}`}>
                  <CheckCircle className={`w-6 h-6 mx-auto mb-1 ${listing.originalParts ? "text-green-600" : "text-gray-400"}`} />
                  <div className={`text-sm ${listing.originalParts ? "text-green-700" : "text-gray-500"}`}>
                    {listing.originalParts ? "قطع أصلية" : "قطع غير أصلية"}
                  </div>
                </div>
              </div>

              {listing.accessoriesDetails && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <span className="font-medium">المرفقات:</span> {listing.accessoriesDetails}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">الوصف</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Barter Preferences */}
            {listing.acceptsBarter && (
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
                <h2 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5" />
                  يقبل المقايضة
                </h2>
                <div className="space-y-3 text-sm text-purple-700">
                  {listing.barterPreferences?.preferredBrands && (
                    <p>
                      <span className="font-medium">الماركات المفضلة:</span>{" "}
                      {listing.barterPreferences.preferredBrands.map(b => MOBILE_BRAND_AR[b]).join("، ")}
                    </p>
                  )}
                  {listing.barterPreferences?.minValue && (
                    <p>
                      <span className="font-medium">أقل قيمة للمقايضة:</span>{" "}
                      {formatMobilePrice(listing.barterPreferences.minValue)}
                    </p>
                  )}
                  {listing.barterPreferences?.maxCashDifference && (
                    <p>
                      <span className="font-medium">أقصى فرق نقدي:</span>{" "}
                      {formatMobilePrice(listing.barterPreferences.maxCashDifference)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowBarterModal(true)}
                  className="mt-4 w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition flex items-center justify-center gap-2"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                  اقتراح مقايضة
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{listing.seller.name}</h3>
                    {listing.seller.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span>{listing.seller.rating}</span>
                    <span>({listing.seller.reviewsCount} تقييم)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="font-bold text-gray-800">{listing.seller.soldCount}</div>
                  <div className="text-gray-500">منتج مباع</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="font-bold text-gray-800">{listing.seller.responseRate}%</div>
                  <div className="text-gray-500">معدل الرد</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Clock className="w-4 h-4" />
                <span>يرد عادة {listing.seller.responseTime}</span>
              </div>

              <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5" />
                تواصل مع البائع
              </button>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                الموقع
              </h3>
              <p className="text-gray-600">
                {listing.district}، {listing.city}، {listing.governorate}
              </p>
            </div>

            {/* Warranty */}
            {listing.warrantyMonths && (
              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  ضمان متبقي
                </h3>
                <p className="text-green-700">
                  {listing.warrantyMonths} شهر من {listing.warrantyProvider}
                </p>
              </div>
            )}

            {/* Buy Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <div className="text-2xl font-bold text-blue-600 mb-4">
                {formatMobilePrice(listing.priceEgp)}
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  اشتري الآن
                </button>

                {listing.acceptsBarter && (
                  <button
                    onClick={() => setShowBarterModal(true)}
                    className="w-full py-4 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition flex items-center justify-center gap-2"
                  >
                    <ArrowLeftRight className="w-5 h-5" />
                    اقترح مقايضة
                  </button>
                )}
              </div>

              {/* Platform Guarantee */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  ضمان المنصة
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 5 أيام فحص بعد الاستلام</li>
                  <li>• استرداد كامل المبلغ</li>
                  <li>• وساطة مجانية في النزاعات</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">تأكيد الشراء</h3>
              <button onClick={() => setShowBuyModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">{MOBILE_BRAND_AR[listing.brand]}</div>
                <div className="font-bold">{listing.title}</div>
                <div className="text-xl font-bold text-blue-600 mt-2">
                  {formatMobilePrice(listing.priceEgp)}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                <p className="font-medium mb-2">ماذا سيحدث بعد الشراء؟</p>
                <ol className="space-y-1 list-decimal list-inside">
                  <li>سيتم حجز المبلغ في ضمان المنصة</li>
                  <li>سيتم إرسال الجهاز إليك</li>
                  <li>لديك 5 أيام لفحص الجهاز</li>
                  <li>بعد تأكيد الاستلام يصل المبلغ للبائع</li>
                </ol>
              </div>

              <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                تأكيد الشراء والدفع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barter Modal */}
      {showBarterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">اقتراح مقايضة</h3>
              <button onClick={() => setShowBarterModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="text-sm text-purple-600 mb-1">تريد الحصول على</div>
                <div className="font-bold text-purple-800">{listing.title}</div>
                <div className="text-lg font-bold text-purple-600 mt-1">
                  {formatMobilePrice(listing.priceEgp)}
                </div>
              </div>

              <div className="text-center py-2">
                <ArrowLeftRight className="w-6 h-6 text-gray-400 mx-auto" />
              </div>

              <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl text-center">
                <Smartphone className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">اختر جهازك للمقايضة</p>
                <Link
                  href="/mobile/my-listings"
                  className="inline-block mt-2 text-blue-600 text-sm font-medium hover:underline"
                >
                  اختر من إعلاناتي
                </Link>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  فرق نقدي (إن وجد)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رسالة للبائع
                </label>
                <textarea
                  rows={3}
                  placeholder="اكتب رسالة..."
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <button className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700">
                إرسال عرض المقايضة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
