"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  ArrowRight,
  ArrowLeftRight,
  Search,
  Filter,
  CheckCircle,
  Users,
  Zap,
  TrendingUp,
  Info,
} from "lucide-react";
import {
  MobileBrand,
  MOBILE_BRAND_AR,
  formatMobilePrice,
  getConditionGradeColor,
} from "@/lib/api/mobile-marketplace";

// Mock barter matches
const MOCK_DIRECT_MATCHES = [
  {
    id: "match-1",
    yourListing: {
      id: "1",
      title: "iPhone 14 Pro 256GB",
      brand: "APPLE" as MobileBrand,
      priceEgp: 45000,
      conditionGrade: "A",
    },
    theirListing: {
      id: "2",
      title: "Samsung Galaxy S24 256GB",
      brand: "SAMSUNG" as MobileBrand,
      priceEgp: 42000,
      conditionGrade: "A",
      seller: { name: "محمد أحمد", rating: 4.8 },
    },
    cashDifference: 3000,
    cashDirection: "you_receive",
    matchScore: 95,
  },
  {
    id: "match-2",
    yourListing: {
      id: "1",
      title: "iPhone 14 Pro 256GB",
      brand: "APPLE" as MobileBrand,
      priceEgp: 45000,
      conditionGrade: "A",
    },
    theirListing: {
      id: "3",
      title: "iPhone 15 128GB",
      brand: "APPLE" as MobileBrand,
      priceEgp: 50000,
      conditionGrade: "A",
      seller: { name: "أحمد علي", rating: 4.5 },
    },
    cashDifference: 5000,
    cashDirection: "you_pay",
    matchScore: 88,
  },
];

const MOCK_THREE_WAY_MATCHES = [
  {
    id: "3way-1",
    participants: [
      { name: "أنت", listing: "iPhone 14 Pro", wants: "Samsung S24", avatar: "" },
      { name: "محمد", listing: "Samsung S24", wants: "Xiaomi 14", avatar: "" },
      { name: "أحمد", listing: "Xiaomi 14", wants: "iPhone 14 Pro", avatar: "" },
    ],
    cashSettlements: { "أنت": -2000, "محمد": 3000, "أحمد": -1000 },
    matchScore: 82,
  },
];

export default function MobileBarterPage() {
  const [activeTab, setActiveTab] = useState<"direct" | "three_way" | "proposals">("direct");

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-purple-600 to-violet-700 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/mobile" className="text-white/80 hover:text-white">
              <ArrowRight className="w-6 h-6" />
            </Link>
            <ArrowLeftRight className="w-8 h-8" />
            <h1 className="text-2xl font-bold">نظام المقايضة</h1>
          </div>
          <p className="text-purple-100 max-w-2xl">
            بادل جهازك مع مستخدمين آخرين مباشرة أو من خلال سلسلة مقايضة ذكية
          </p>
        </div>
      </header>

      {/* How it Works */}
      <section className="bg-white py-8 border-b">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-bold text-gray-800 mb-6 text-center">كيف تعمل المقايضة؟</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ArrowLeftRight className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">مقايضة مباشرة</h3>
              <p className="text-sm text-gray-500">تبادل مباشر بين طرفين مع تسوية الفرق نقدياً</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">مقايضة ثلاثية</h3>
              <p className="text-sm text-gray-500">A يعطي B، B يعطي C، C يعطي A</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">مطابقة ذكية</h3>
              <p className="text-sm text-gray-500">خوارزمية تجد أفضل الفرص تلقائياً</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "direct", label: "مقايضة مباشرة", count: MOCK_DIRECT_MATCHES.length },
            { key: "three_way", label: "مقايضة ثلاثية", count: MOCK_THREE_WAY_MATCHES.length },
            { key: "proposals", label: "عروضي", count: 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-full transition flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? "bg-white/20" : "bg-purple-100 text-purple-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Direct Matches */}
        {activeTab === "direct" && (
          <div className="space-y-4">
            {MOCK_DIRECT_MATCHES.map(match => (
              <div key={match.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4">
                  {/* Match Score */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">نسبة التطابق</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                      {match.matchScore}%
                    </span>
                  </div>

                  {/* Exchange Visual */}
                  <div className="flex items-center gap-4">
                    {/* Your Listing */}
                    <div className="flex-1 p-4 bg-purple-50 rounded-xl">
                      <div className="text-xs text-purple-600 mb-1">تقدم</div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm">{match.yourListing.title}</div>
                          <div className="text-purple-600 font-medium">{formatMobilePrice(match.yourListing.priceEgp)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <ArrowLeftRight className="w-8 h-8 text-purple-400" />
                    </div>

                    {/* Their Listing */}
                    <div className="flex-1 p-4 bg-blue-50 rounded-xl">
                      <div className="text-xs text-blue-600 mb-1">تحصل على</div>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-sm">{match.theirListing.title}</div>
                          <div className="text-blue-600 font-medium">{formatMobilePrice(match.theirListing.priceEgp)}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cash Difference */}
                  {match.cashDifference > 0 && (
                    <div className={`mt-4 p-3 rounded-lg text-center ${
                      match.cashDirection === "you_receive"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {match.cashDirection === "you_receive"
                        ? `تحصل على ${formatMobilePrice(match.cashDifference)} فرق نقدي`
                        : `تدفع ${formatMobilePrice(match.cashDifference)} فرق نقدي`
                      }
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">
                      إرسال عرض مقايضة
                    </button>
                    <Link
                      href={`/mobile/listing/${match.theirListing.id}`}
                      className="px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Three Way Matches */}
        {activeTab === "three_way" && (
          <div className="space-y-4">
            {MOCK_THREE_WAY_MATCHES.map(match => (
              <div key={match.id} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-gray-800">مقايضة ثلاثية</span>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                    {match.matchScore}% تطابق
                  </span>
                </div>

                {/* Circular Flow */}
                <div className="flex items-center justify-center gap-4 py-6">
                  {match.participants.map((p, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-lg font-bold text-purple-600">{p.name.charAt(0)}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-800">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.listing}</div>
                        <div className="text-xs text-purple-600">يريد: {p.wants}</div>
                      </div>
                      {idx < match.participants.length - 1 && (
                        <ArrowLeftRight className="w-6 h-6 text-gray-300 mx-4" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Cash Settlements */}
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">التسوية النقدية:</h4>
                  <div className="flex flex-wrap gap-4">
                    {Object.entries(match.cashSettlements).map(([name, amount]) => (
                      <div key={name} className="flex items-center gap-2">
                        <span className="text-gray-600">{name}:</span>
                        <span className={amount > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {amount > 0 ? `+${formatMobilePrice(amount)}` : formatMobilePrice(Math.abs(amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="w-full mt-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">
                  الانضمام للمقايضة
                </button>
              </div>
            ))}
          </div>
        )}

        {/* My Proposals */}
        {activeTab === "proposals" && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <ArrowLeftRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد عروض مقايضة</h3>
            <p className="text-gray-500 mb-6">ابحث عن فرص المقايضة وأرسل عروضك</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-purple-50 rounded-xl">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-700">
              <p className="font-medium mb-1">نصائح للمقايضة الناجحة:</p>
              <ul className="space-y-1">
                <li>• تأكد من أن جهازك مفعل للمقايضة في إعدادات الإعلان</li>
                <li>• كن صريحاً في وصف حالة جهازك</li>
                <li>• استخدم ضمان المنصة لحماية الصفقة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
