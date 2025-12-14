"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Plus,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  TrendingUp,
  MessageSquare,
  ArrowLeftRight,
} from "lucide-react";
import {
  MobileBrand,
  MobileListingStatus,
  MOBILE_BRAND_AR,
  LISTING_STATUS_AR,
  formatMobilePrice,
  getConditionGradeColor,
} from "@/lib/api/mobile-marketplace";

// Mock user listings
const MOCK_LISTINGS = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB",
    brand: "APPLE" as MobileBrand,
    priceEgp: 65000,
    status: "ACTIVE" as MobileListingStatus,
    conditionGrade: "A",
    viewsCount: 342,
    favoritesCount: 28,
    inquiriesCount: 15,
    offersCount: 3,
    barterProposals: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: "2",
    title: "Samsung Galaxy S23 Ultra 512GB",
    brand: "SAMSUNG" as MobileBrand,
    priceEgp: 48000,
    status: "PENDING_REVIEW" as MobileListingStatus,
    conditionGrade: "B",
    viewsCount: 0,
    favoritesCount: 0,
    inquiriesCount: 0,
    offersCount: 0,
    barterProposals: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "3",
    title: "iPhone 13 128GB",
    brand: "APPLE" as MobileBrand,
    priceEgp: 28000,
    status: "SOLD" as MobileListingStatus,
    conditionGrade: "B",
    viewsCount: 520,
    favoritesCount: 45,
    inquiriesCount: 32,
    offersCount: 8,
    barterProposals: 5,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
  },
];

type TabType = "all" | "active" | "pending" | "sold";

export default function MyMobileListingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [showActions, setShowActions] = useState<string | null>(null);

  const filteredListings = MOCK_LISTINGS.filter(listing => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return listing.status === "ACTIVE";
    if (activeTab === "pending") return listing.status === "PENDING_REVIEW";
    if (activeTab === "sold") return listing.status === "SOLD";
    return true;
  });

  const stats = {
    total: MOCK_LISTINGS.length,
    active: MOCK_LISTINGS.filter(l => l.status === "ACTIVE").length,
    pending: MOCK_LISTINGS.filter(l => l.status === "PENDING_REVIEW").length,
    sold: MOCK_LISTINGS.filter(l => l.status === "SOLD").length,
    totalViews: MOCK_LISTINGS.reduce((sum, l) => sum + l.viewsCount, 0),
    totalOffers: MOCK_LISTINGS.reduce((sum, l) => sum + l.offersCount, 0),
  };

  const getStatusIcon = (status: MobileListingStatus) => {
    switch (status) {
      case "ACTIVE": return <CheckCircle className="w-4 h-4" />;
      case "PENDING_REVIEW": return <Clock className="w-4 h-4" />;
      case "SOLD": return <Package className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-blue-600 to-indigo-700 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/mobile" className="text-white/80 hover:text-white">
                <ArrowRight className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">إعلاناتي</h1>
                <p className="text-blue-100 text-sm">{stats.total} إعلان</p>
              </div>
            </div>
            <Link
              href="/mobile/sell"
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl font-medium hover:bg-blue-50"
            >
              <Plus className="w-5 h-5" />
              إعلان جديد
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 -mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "نشط", value: stats.active, color: "bg-green-500", icon: CheckCircle },
            { label: "قيد المراجعة", value: stats.pending, color: "bg-yellow-500", icon: Clock },
            { label: "تم البيع", value: stats.sold, color: "bg-blue-500", icon: Package },
            { label: "إجمالي المشاهدات", value: stats.totalViews, color: "bg-purple-500", icon: Eye },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: "all", label: "الكل" },
            { key: "active", label: "نشط" },
            { key: "pending", label: "قيد المراجعة" },
            { key: "sold", label: "تم البيع" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد إعلانات</h3>
            <p className="text-gray-500 mb-6">ابدأ ببيع موبايلك الآن</p>
            <Link
              href="/mobile/sell"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              أضف إعلانك الأول
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map(listing => (
              <div key={listing.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <Smartphone className="w-10 h-10 text-gray-300" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-blue-600 font-medium">
                            {MOBILE_BRAND_AR[listing.brand]}
                          </div>
                          <h3 className="font-bold text-gray-800">{listing.title}</h3>
                          <div className="text-lg font-bold text-blue-600 mt-1">
                            {formatMobilePrice(listing.priceEgp)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${LISTING_STATUS_AR[listing.status].color} bg-opacity-10`}
                            style={{ backgroundColor: `currentColor`, opacity: 0.1 }}>
                            {getStatusIcon(listing.status)}
                            <span className={LISTING_STATUS_AR[listing.status].color}>
                              {LISTING_STATUS_AR[listing.status].label}
                            </span>
                          </span>
                          <div className="relative">
                            <button
                              onClick={() => setShowActions(showActions === listing.id ? null : listing.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>
                            {showActions === listing.id && (
                              <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border py-1 z-10 w-40">
                                <Link href={`/mobile/listing/${listing.id}`} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                                  <Eye className="w-4 h-4" />
                                  عرض
                                </Link>
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full">
                                  <Edit className="w-4 h-4" />
                                  تعديل
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-red-600">
                                  <Trash2 className="w-4 h-4" />
                                  حذف
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {listing.viewsCount} مشاهدة
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {listing.inquiriesCount} استفسار
                        </span>
                        {listing.barterProposals > 0 && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <ArrowLeftRight className="w-4 h-4" />
                            {listing.barterProposals} عرض مقايضة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
