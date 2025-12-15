"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Shield,
  RefreshCw,
  Search,
  ChevronLeft,
  CheckCircle,
  TrendingUp,
  Users,
  ArrowLeftRight,
  Plus,
  Package,
  Gavel,
  MessageSquare,
  Calculator,
  MapPin,
  Filter,
  Star,
  Clock,
  Eye,
  Heart,
  Sparkles,
  Zap,
  Award,
  Building2,
  UserCheck,
  BadgeCheck,
} from "lucide-react";
import {
  VehicleMake,
  VEHICLE_MAKE_AR,
  BODY_TYPE_AR,
  VehicleBodyType,
  CONDITION_AR,
  SELLER_TYPE_AR,
  VERIFICATION_AR,
  GOVERNORATE_AR,
  formatVehiclePrice,
  formatMileage,
  MOCK_VEHICLE_LISTINGS,
  MOCK_MARKET_STATS,
  VehicleListing,
} from "@/lib/api/vehicle-marketplace";

// Featured brands with colors
const FEATURED_BRANDS: { brand: VehicleMake; color: string; gradient: string }[] = [
  { brand: "TOYOTA", color: "from-red-500 to-red-700", gradient: "bg-gradient-to-br" },
  { brand: "HYUNDAI", color: "from-blue-500 to-blue-700", gradient: "bg-gradient-to-br" },
  { brand: "KIA", color: "from-red-600 to-red-800", gradient: "bg-gradient-to-br" },
  { brand: "NISSAN", color: "from-gray-600 to-gray-800", gradient: "bg-gradient-to-br" },
  { brand: "MERCEDES", color: "from-slate-600 to-slate-800", gradient: "bg-gradient-to-br" },
  { brand: "BMW", color: "from-blue-600 to-blue-900", gradient: "bg-gradient-to-br" },
  { brand: "MG", color: "from-red-500 to-orange-600", gradient: "bg-gradient-to-br" },
  { brand: "CHERY", color: "from-purple-500 to-purple-700", gradient: "bg-gradient-to-br" },
];

// Quick actions
const QUICK_ACTIONS = [
  {
    href: "/vehicles/sell",
    icon: Plus,
    title: "بيع سيارتك",
    desc: "أضف إعلانك الآن",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    href: "/vehicles/listings",
    icon: Search,
    title: "تصفح السيارات",
    desc: "ابحث عن سيارتك",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    href: "/vehicles/barter",
    icon: ArrowLeftRight,
    title: "مقايضة",
    desc: "بدّل سيارتك",
    gradient: "from-purple-500 to-violet-600",
  },
  {
    href: "/vehicles/calculator",
    icon: Calculator,
    title: "حاسبة السعر",
    desc: "اعرف قيمة سيارتك",
    gradient: "from-amber-500 to-orange-600",
  },
];

// User links
const USER_LINKS = [
  { href: "/vehicles/my-listings", icon: Package, title: "إعلاناتي", desc: "إدارة إعلاناتك" },
  { href: "/vehicles/my-barters", icon: ArrowLeftRight, title: "مقايضاتي", desc: "عروض المقايضة" },
  { href: "/vehicles/transactions", icon: Gavel, title: "معاملاتي", desc: "سجل المعاملات" },
  { href: "/vehicles/favorites", icon: Heart, title: "المفضلة", desc: "سياراتك المحفوظة" },
];

// Price ranges
const PRICE_RANGES = [
  { label: "أقل من 500 ألف", min: 0, max: 500000 },
  { label: "500 ألف - مليون", min: 500000, max: 1000000 },
  { label: "مليون - 2 مليون", min: 1000000, max: 2000000 },
  { label: "أكثر من 2 مليون", min: 2000000, max: null },
];

export default function VehicleMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredListings, setFeaturedListings] = useState<VehicleListing[]>([]);
  const [latestListings, setLatestListings] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const featured = MOCK_VEHICLE_LISTINGS.filter((l) => l.featured);
    const latest = [...MOCK_VEHICLE_LISTINGS].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFeaturedListings(featured);
    setLatestListings(latest);
    setLoading(false);
  }, []);

  const stats = MOCK_MARKET_STATS;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Hero Section */}
      <header className="bg-gradient-to-l from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-full mb-8 border border-white/30">
              <Car className="w-5 h-5" />
              <span className="font-semibold">أكبر سوق سيارات في مصر</span>
              <span className="bg-amber-400 text-amber-900 text-xs px-2 py-0.5 rounded-full font-bold">
                جديد
              </span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              سوق السيارات
              <br />
              <span className="text-blue-200">الأكثر أماناً في مصر</span>
            </h1>

            <p className="text-xl lg:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              بيع واشتري وبادل السيارات بأمان تام مع نظام Escrow والفحص المعتمد
              <br />
              <span className="text-amber-300 font-semibold">
                + خوارزمية تسعير ذكية ونظام مقايضة متطور
              </span>
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="relative bg-white rounded-2xl shadow-2xl p-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ابحث عن سيارة... (مثال: تويوتا كورولا 2023)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-6 py-4 pr-14 rounded-xl text-gray-800 text-lg focus:outline-none"
                    />
                  </div>
                  <Link
                    href={`/vehicles/listings?q=${searchQuery}`}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    بحث
                  </Link>
                </div>

                {/* Quick filters */}
                <div className="flex flex-wrap items-center gap-2 mt-3 px-2">
                  <span className="text-gray-500 text-sm">بحث سريع:</span>
                  {["سيدان", "SUV", "كروس أوفر", "هاتشباك"].map((type) => (
                    <Link
                      key={type}
                      href={`/vehicles/listings?bodyType=${type}`}
                      className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-blue-100 hover:text-blue-700 transition"
                    >
                      {type}
                    </Link>
                  ))}
                  <Link
                    href="/vehicles/listings?allowBarter=true"
                    className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition flex items-center gap-1"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    قابلة للمقايضة
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="text-4xl font-bold mb-1">
                  {stats.activeListings.toLocaleString()}+
                </div>
                <div className="text-blue-200 text-sm">سيارة معروضة</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="text-4xl font-bold mb-1">
                  {stats.completedTransactions.total.toLocaleString()}+
                </div>
                <div className="text-blue-200 text-sm">صفقة ناجحة</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="text-4xl font-bold mb-1">
                  {stats.barterListings.toLocaleString()}+
                </div>
                <div className="text-blue-200 text-sm">قابلة للمقايضة</div>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <div className="text-4xl font-bold mb-1">{stats.certifiedListings}+</div>
                <div className="text-blue-200 text-sm">سيارة معتمدة</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="py-8 bg-white border-b relative -mt-8 z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {QUICK_ACTIONS.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className={`p-6 rounded-2xl bg-gradient-to-br ${action.gradient} text-white hover:scale-105 transition-all shadow-lg hover:shadow-xl`}
              >
                <action.icon className="w-10 h-10 mb-4" />
                <h3 className="font-bold text-xl mb-1">{action.title}</h3>
                <p className="text-white/80">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-12 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">فلتر نوع البائع</h3>
              <p className="text-gray-500 text-sm mb-2">مالك / تاجر / معرض</p>
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                ميزة حصرية!
              </span>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">نظام Escrow</h3>
              <p className="text-gray-500 text-sm mb-2">المبلغ محفوظ لحين إتمام المعاملة</p>
              <span className="inline-block px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
                حماية كاملة
              </span>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ArrowLeftRight className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">مقايضة ذكية</h3>
              <p className="text-gray-500 text-sm mb-2">سيارة بسيارة أو بعقار</p>
              <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-bold">
                متعدد الأطراف
              </span>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">تسعير ذكي</h3>
              <p className="text-gray-500 text-sm mb-2">خوارزمية تحدد السعر العادل</p>
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold">
                AI متطور
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Brand */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">تصفح حسب الماركة</h2>
            <Link
              href="/vehicles/listings"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {FEATURED_BRANDS.map((item) => (
              <Link
                key={item.brand}
                href={`/vehicles/listings?make=${item.brand}`}
                className={`p-5 rounded-2xl ${item.gradient} ${item.color} text-white text-center hover:scale-105 transition-transform shadow-lg`}
              >
                <div className="text-4xl mb-2">🚗</div>
                <div className="font-bold text-lg">{VEHICLE_MAKE_AR[item.brand]}</div>
                <div className="text-white/70 text-sm mt-1">
                  {stats.topMakes.find((m) => m.make === item.brand)?.count || "500+"} سيارة
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Price */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">تصفح حسب الميزانية</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {PRICE_RANGES.map((range, i) => (
              <Link
                key={i}
                href={`/vehicles/listings?priceMin=${range.min}${range.max ? `&priceMax=${range.max}` : ""}`}
                className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all text-center group"
              >
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {range.label}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-gray-800">إعلانات مميزة</h2>
            </div>
            <Link
              href="/vehicles/listings?featured=true"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.slice(0, 4).map((listing) => (
                <Link
                  key={listing.id}
                  href={`/vehicles/${listing.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
                >
                  {/* Image */}
                  <div className="relative h-52 bg-gradient-to-br from-blue-50 to-slate-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Car className="w-20 h-20 text-gray-300" />
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      {/* Seller Type */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          SELLER_TYPE_AR[listing.sellerType].color
                        }`}
                      >
                        {SELLER_TYPE_AR[listing.sellerType].icon}{" "}
                        {SELLER_TYPE_AR[listing.sellerType].label}
                      </span>

                      {/* Verification */}
                      {listing.verificationLevel !== "BASIC" && (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            VERIFICATION_AR[listing.verificationLevel].color
                          }`}
                        >
                          {VERIFICATION_AR[listing.verificationLevel].icon}{" "}
                          {VERIFICATION_AR[listing.verificationLevel].label}
                        </span>
                      )}
                    </div>

                    {/* Barter Badge */}
                    {listing.allowBarter && (
                      <div className="absolute bottom-3 right-3 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                        مقايضة
                      </div>
                    )}

                    {/* Featured Badge */}
                    {listing.featured && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        مميز
                      </div>
                    )}

                    {/* Condition */}
                    {listing.condition === "NEW" && (
                      <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                        زيرو
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Brand & Model */}
                    <div className="text-sm text-blue-600 font-medium mb-1">
                      {VEHICLE_MAKE_AR[listing.make]} • {listing.year}
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {listing.titleAr}
                    </h3>

                    {/* Specs */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {formatMileage(listing.mileage)}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {BODY_TYPE_AR[listing.bodyType].label}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {GOVERNORATE_AR[listing.governorate]}
                      </span>
                    </div>

                    {/* Price & Stats */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {formatVehiclePrice(listing.askingPrice)}
                        </div>
                        {listing.priceNegotiable && (
                          <span className="text-xs text-gray-500">قابل للتفاوض</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-gray-400">
                        <span className="flex items-center gap-1 text-sm">
                          <Eye className="w-4 h-4" />
                          {listing.views}
                        </span>
                        <span className="flex items-center gap-1 text-sm">
                          <Heart className="w-4 h-4" />
                          {listing.favorites}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Listings */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-800">أحدث الإعلانات</h2>
            </div>
            <Link
              href="/vehicles/listings?sort=newest"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestListings.slice(0, 8).map((listing) => (
              <Link
                key={listing.id}
                href={`/vehicles/${listing.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Image */}
                <div className="relative h-44 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="w-16 h-16 text-gray-300" />
                  </div>

                  {/* Seller Badge */}
                  <div
                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                      SELLER_TYPE_AR[listing.sellerType].color
                    }`}
                  >
                    {SELLER_TYPE_AR[listing.sellerType].icon}
                  </div>

                  {/* Barter */}
                  {listing.allowBarter && (
                    <div className="absolute bottom-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      🔄
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {listing.titleAr}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                      {listing.year}
                    </span>
                    <span>{formatMileage(listing.mileage)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      {formatVehiclePrice(listing.askingPrice)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {GOVERNORATE_AR[listing.governorate]}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            لماذا سوق سيارات Xchange؟
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            نقدم لك تجربة شراء وبيع سيارات فريدة من نوعها في مصر
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Shield,
                title: "فحص معتمد",
                desc: "تقرير فحص شامل 150+ نقطة من مراكز معتمدة",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: RefreshCw,
                title: "مقايضة متعددة الأطراف",
                desc: "نظام مقايضة ذكي يدعم سلاسل تبادل معقدة",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: CheckCircle,
                title: "نظام Escrow",
                desc: "5 أيام فحص مع ضمان استرداد المبلغ",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Calculator,
                title: "تسعير ديناميكي",
                desc: "خوارزمية AI تحسب السعر العادل بدقة 95%",
                color: "bg-amber-100 text-amber-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl border border-gray-100 text-center hover:shadow-xl transition-shadow"
              >
                <div
                  className={`w-20 h-20 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                >
                  <feature.icon className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Account Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">إدارة حسابك</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {USER_LINKS.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="p-6 bg-gray-50 rounded-2xl hover:bg-blue-50 transition-colors text-center group"
              >
                <link.icon className="w-10 h-10 mx-auto mb-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-bold text-gray-800">{link.title}</h3>
                <p className="text-gray-500 text-sm">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* All Pages Navigation */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            جميع صفحات سوق السيارات
          </h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {/* Sell Page */}
            <Link
              href="/vehicles/sell"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-lg transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Plus className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">بيع سيارة</h3>
                  <p className="text-gray-400 text-sm">/vehicles/sell</p>
                </div>
              </div>
            </Link>

            {/* Listings Page */}
            <Link
              href="/vehicles/listings"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Search className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">تصفح السيارات</h3>
                  <p className="text-gray-400 text-sm">/vehicles/listings</p>
                </div>
              </div>
            </Link>

            {/* Calculator Page */}
            <Link
              href="/vehicles/calculator"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-amber-500 hover:shadow-lg transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Calculator className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">حاسبة السعر</h3>
                  <p className="text-gray-400 text-sm">/vehicles/calculator</p>
                </div>
              </div>
            </Link>

            {/* Barter Page */}
            <Link
              href="/vehicles/barter"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-lg transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <ArrowLeftRight className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">المقايضة</h3>
                  <p className="text-gray-400 text-sm">/vehicles/barter</p>
                </div>
              </div>
            </Link>

            {/* My Listings */}
            <Link
              href="/vehicles/my-listings"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-teal-500 hover:shadow-lg transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Package className="w-7 h-7 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">إعلاناتي</h3>
                  <p className="text-gray-400 text-sm">/vehicles/my-listings</p>
                </div>
              </div>
            </Link>

            {/* My Barters */}
            <Link
              href="/vehicles/my-barters"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-violet-500 hover:shadow-lg transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <RefreshCw className="w-7 h-7 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">مقايضاتي</h3>
                  <p className="text-gray-400 text-sm">/vehicles/my-barters</p>
                </div>
              </div>
            </Link>

            {/* Transactions */}
            <Link
              href="/vehicles/transactions"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-lg transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Gavel className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">المعاملات</h3>
                  <p className="text-gray-400 text-sm">/vehicles/transactions</p>
                </div>
              </div>
            </Link>

            {/* Favorites */}
            <Link
              href="/vehicles/favorites"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-red-500 hover:shadow-lg transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Heart className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">المفضلة</h3>
                  <p className="text-gray-400 text-sm">/vehicles/favorites</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">هل لديك سيارة للبيع؟</h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto text-xl">
            أضف إعلانك الآن واستفد من التحقق المجاني وخوارزمية التسعير الذكية ونظام الضمان
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vehicles/sell"
              className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-6 h-6" />
              أضف إعلانك الآن
            </Link>
            <Link
              href="/vehicles/calculator"
              className="px-10 py-5 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-400 transition flex items-center justify-center gap-2"
            >
              <Calculator className="w-6 h-6" />
              اعرف سعر سيارتك
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                <Car className="w-6 h-6" />
                سوق السيارات
              </h3>
              <p className="text-gray-400">
                المنصة الأكثر أماناً لبيع وشراء ومقايضة السيارات في مصر
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-6">روابط سريعة</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/vehicles/sell" className="hover:text-white transition">
                    بيع سيارة
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles/listings" className="hover:text-white transition">
                    تصفح السيارات
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles/barter" className="hover:text-white transition">
                    المقايضة
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles/calculator" className="hover:text-white transition">
                    حاسبة السعر
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-6">حسابي</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/vehicles/my-listings" className="hover:text-white transition">
                    إعلاناتي
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles/my-barters" className="hover:text-white transition">
                    مقايضاتي
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles/transactions" className="hover:text-white transition">
                    المعاملات
                  </Link>
                </li>
                <li>
                  <Link href="/vehicles/favorites" className="hover:text-white transition">
                    المفضلة
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-6">الماركات الشهيرة</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link
                    href="/vehicles/listings?make=TOYOTA"
                    className="hover:text-white transition"
                  >
                    تويوتا
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vehicles/listings?make=HYUNDAI"
                    className="hover:text-white transition"
                  >
                    هيونداي
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vehicles/listings?make=MERCEDES"
                    className="hover:text-white transition"
                  >
                    مرسيدس
                  </Link>
                </li>
                <li>
                  <Link
                    href="/vehicles/listings?make=BMW"
                    className="hover:text-white transition"
                  >
                    بي إم دبليو
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            © {new Date().getFullYear()} Xchange - سوق السيارات في مصر
          </div>
        </div>
      </footer>
    </div>
  );
}
