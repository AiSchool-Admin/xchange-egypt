"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  Shield,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  Star,
  CheckCircle,
  TrendingUp,
  Users,
  ArrowLeftRight,
  Bell,
  Plus,
  Package,
  Gavel,
  MessageSquare,
} from "lucide-react";
import {
  MobileBrand,
  MOBILE_BRAND_AR,
  formatMobilePrice,
  POPULAR_MODELS,
} from "@/lib/api/mobile-marketplace";

// Brand data with colors
const FEATURED_BRANDS: { brand: MobileBrand; color: string; icon: string }[] = [
  { brand: "APPLE", color: "from-gray-800 to-gray-900", icon: "" },
  { brand: "SAMSUNG", color: "from-blue-600 to-blue-800", icon: "" },
  { brand: "XIAOMI", color: "from-orange-500 to-orange-700", icon: "" },
  { brand: "OPPO", color: "from-green-500 to-green-700", icon: "" },
  { brand: "HUAWEI", color: "from-red-500 to-red-700", icon: "" },
  { brand: "REALME", color: "from-yellow-500 to-yellow-700", icon: "" },
  { brand: "ONEPLUS", color: "from-red-600 to-red-800", icon: "" },
  { brand: "INFINIX", color: "from-purple-500 to-purple-700", icon: "" },
];

// Quick actions for users
const QUICK_ACTIONS = [
  { href: "/mobiles/sell", icon: Plus, title: "بيع موبايلك", desc: "أضف إعلانك الآن", gradient: "from-emerald-500 to-teal-600" },
  { href: "/mobiles/listings", icon: Search, title: "تصفح الموبايلات", desc: "ابحث عن جهازك", gradient: "from-blue-500 to-indigo-600" },
  { href: "/mobiles/barter", icon: ArrowLeftRight, title: "مقايضة", desc: "بدّل جهازك", gradient: "from-purple-500 to-violet-600" },
  { href: "/mobiles/my-listings", icon: Package, title: "إعلاناتي", desc: "إدارة منتجاتك", gradient: "from-amber-500 to-orange-600" },
];

// User account links
const USER_LINKS = [
  { href: "/mobiles/my-listings", icon: Package, title: "إعلاناتي", desc: "إدارة إعلاناتك" },
  { href: "/mobiles/my-barters", icon: ArrowLeftRight, title: "مقايضاتي", desc: "عروض المقايضة" },
  { href: "/mobiles/transactions", icon: Gavel, title: "معاملاتي", desc: "سجل المعاملات" },
  { href: "/mobiles/disputes", icon: MessageSquare, title: "النزاعات", desc: "حل المشكلات" },
];

// Mock featured listings
const MOCK_LISTINGS = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB",
    brand: "APPLE" as MobileBrand,
    model: "iPhone 15 Pro Max",
    priceEgp: 65000,
    conditionGrade: "A",
    batteryHealth: 98,
    imeiVerified: true,
    governorate: "القاهرة",
    image: "/images/phones/iphone15promax.jpg",
    acceptsBarter: true,
  },
  {
    id: "2",
    title: "Samsung Galaxy S24 Ultra 512GB",
    brand: "SAMSUNG" as MobileBrand,
    model: "Galaxy S24 Ultra",
    priceEgp: 55000,
    conditionGrade: "A",
    batteryHealth: 95,
    imeiVerified: true,
    governorate: "الجيزة",
    image: "/images/phones/s24ultra.jpg",
    acceptsBarter: false,
  },
  {
    id: "3",
    title: "Xiaomi 14 Pro 256GB",
    brand: "XIAOMI" as MobileBrand,
    model: "14 Pro",
    priceEgp: 28000,
    conditionGrade: "B",
    batteryHealth: 92,
    imeiVerified: true,
    governorate: "الإسكندرية",
    image: "/images/phones/xiaomi14.jpg",
    acceptsBarter: true,
  },
  {
    id: "4",
    title: "iPhone 14 128GB",
    brand: "APPLE" as MobileBrand,
    model: "iPhone 14",
    priceEgp: 35000,
    conditionGrade: "B",
    batteryHealth: 88,
    imeiVerified: true,
    governorate: "المنصورة",
    image: "/images/phones/iphone14.jpg",
    acceptsBarter: true,
  },
];

export default function MobileMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    activeListings: 2500,
    successfulTrades: 15000,
    verifiedUsers: 8500,
    barterMatches: 3200,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      {/* Hero Section */}
      <header className="bg-gradient-to-l from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 py-12 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-6">
              <Smartphone className="w-5 h-5" />
              <span className="font-medium">سوق الموبايلات</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              سوق الموبايلات المستعملة
              <br />
              <span className="text-blue-200">الأكثر أماناً في مصر</span>
            </h1>

            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              بيع واشتري وبادل الموبايلات بأمان تام مع التحقق من IMEI ونظام الضمان المالي
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن موبايل... (مثال: iPhone 15 Pro)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-14 rounded-2xl text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-xl"
                />
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Link
                  href={`/mobiles/listings?q=${searchQuery}`}
                  className="absolute left-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  بحث
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.activeListings.toLocaleString()}+</div>
                <div className="text-blue-200 text-sm">إعلان نشط</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.successfulTrades.toLocaleString()}+</div>
                <div className="text-blue-200 text-sm">صفقة ناجحة</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.verifiedUsers.toLocaleString()}+</div>
                <div className="text-blue-200 text-sm">مستخدم موثق</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.barterMatches.toLocaleString()}+</div>
                <div className="text-blue-200 text-sm">مقايضة ناجحة</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className={`p-5 rounded-2xl bg-gradient-to-br ${action.gradient} text-white hover:scale-105 transition-transform shadow-lg`}
              >
                <action.icon className="w-8 h-8 mb-3" />
                <h3 className="font-bold text-lg">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Brand */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">تصفح حسب الماركة</h2>
            <Link
              href="/mobiles/listings"
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
                href={`/mobiles/listings?brand=${item.brand}`}
                className={`p-4 rounded-xl bg-gradient-to-br ${item.color} text-white text-center hover:scale-105 transition-transform`}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-bold">{MOBILE_BRAND_AR[item.brand]}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">إعلانات مميزة</h2>
            <Link
              href="/mobiles/listings?featured=true"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_LISTINGS.map((listing) => (
              <Link
                key={listing.id}
                href={`/mobiles/${listing.id}`}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Smartphone className="w-16 h-16 text-gray-300" />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {listing.imeiVerified && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        IMEI موثق
                      </span>
                    )}
                    {listing.acceptsBarter && (
                      <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full flex items-center gap-1">
                        <ArrowLeftRight className="w-3 h-3" />
                        يقبل المقايضة
                      </span>
                    )}
                  </div>

                  {/* Condition Grade */}
                  <div className="absolute bottom-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        listing.conditionGrade === "A"
                          ? "bg-green-100 text-green-800"
                          : listing.conditionGrade === "B"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      حالة {listing.conditionGrade}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="text-sm text-blue-600 font-medium mb-1">
                    {MOBILE_BRAND_AR[listing.brand]}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {listing.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      🔋 {listing.batteryHealth}%
                    </span>
                    <span>•</span>
                    <span>{listing.governorate}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      {formatMobilePrice(listing.priceEgp)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-12">
            لماذا سوق موبايلات Xchange؟
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "التحقق من IMEI",
                desc: "نتحقق من أن الجهاز غير مسروق أو محظور",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: RefreshCw,
                title: "نظام المقايضة",
                desc: "بادل جهازك بجهاز آخر مباشرة أو مع فرق نقدي",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: CheckCircle,
                title: "ضمان المنصة",
                desc: "5 أيام فحص مع ضمان استرداد المبلغ",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: Users,
                title: "مستخدمين موثقين",
                desc: "توثيق الهوية ونظام تقييمات شفاف",
                color: "bg-amber-100 text-amber-600",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-gray-100 text-center hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Account Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            إدارة حسابك
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {USER_LINKS.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="p-5 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors text-center group"
              >
                <link.icon className="w-8 h-8 mx-auto mb-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
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
            جميع صفحات السوق
          </h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {/* Sell Page */}
            <Link
              href="/mobiles/sell"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Plus className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">بيع موبايل</h3>
                  <p className="text-gray-400 text-sm">/mobiles/sell</p>
                </div>
              </div>
            </Link>

            {/* Listings Page */}
            <Link
              href="/mobiles/listings"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">تصفح الإعلانات</h3>
                  <p className="text-gray-400 text-sm">/mobiles/listings</p>
                </div>
              </div>
            </Link>

            {/* Barter Page */}
            <Link
              href="/mobiles/barter"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <ArrowLeftRight className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">المقايضة</h3>
                  <p className="text-gray-400 text-sm">/mobiles/barter</p>
                </div>
              </div>
            </Link>

            {/* My Listings */}
            <Link
              href="/mobiles/my-listings"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-amber-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Package className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">إعلاناتي</h3>
                  <p className="text-gray-400 text-sm">/mobiles/my-listings</p>
                </div>
              </div>
            </Link>

            {/* My Barters */}
            <Link
              href="/mobiles/my-barters"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-violet-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <RefreshCw className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">مقايضاتي</h3>
                  <p className="text-gray-400 text-sm">/mobiles/my-barters</p>
                </div>
              </div>
            </Link>

            {/* Transactions */}
            <Link
              href="/mobiles/transactions"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-green-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <Gavel className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">المعاملات</h3>
                  <p className="text-gray-400 text-sm">/mobiles/transactions</p>
                </div>
              </div>
            </Link>

            {/* Disputes */}
            <Link
              href="/mobiles/disputes"
              className="p-6 bg-white rounded-xl border border-gray-200 hover:border-red-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition">
                  <MessageSquare className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">النزاعات</h3>
                  <p className="text-gray-400 text-sm">/mobiles/disputes</p>
                </div>
              </div>
            </Link>

            {/* Current Page */}
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-600">أنت هنا</h3>
                  <p className="text-gray-400 text-sm">/mobiles</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">هل لديك موبايل للبيع؟</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            أضف إعلانك الآن واستفد من التحقق المجاني من IMEI ونظام الضمان
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/mobiles/sell"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              أضف إعلانك الآن
            </Link>
            <Link
              href="/mobiles/listings"
              className="px-8 py-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-400 transition flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              تصفح الموبايلات
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                سوق الموبايلات
              </h3>
              <p className="text-gray-400 text-sm">
                المنصة الأكثر أماناً لبيع وشراء ومقايضة الموبايلات المستعملة في مصر
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/mobiles/sell" className="hover:text-white">بيع موبايل</Link></li>
                <li><Link href="/mobiles/listings" className="hover:text-white">تصفح الإعلانات</Link></li>
                <li><Link href="/mobiles/barter" className="hover:text-white">المقايضة</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">حسابي</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/mobiles/my-listings" className="hover:text-white">إعلاناتي</Link></li>
                <li><Link href="/mobiles/my-barters" className="hover:text-white">مقايضاتي</Link></li>
                <li><Link href="/mobiles/transactions" className="hover:text-white">المعاملات</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">الماركات الشهيرة</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/mobiles/listings?brand=APPLE" className="hover:text-white">آبل</Link></li>
                <li><Link href="/mobiles/listings?brand=SAMSUNG" className="hover:text-white">سامسونج</Link></li>
                <li><Link href="/mobiles/listings?brand=XIAOMI" className="hover:text-white">شاومي</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} Xchange - سوق الموبايلات في مصر
          </div>
        </div>
      </footer>
    </div>
  );
}
