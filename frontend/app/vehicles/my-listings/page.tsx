"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  TrendingUp,
  MessageSquare,
  Phone,
  Heart,
  Share2,
  RefreshCw,
  BarChart3,
  Calendar,
  MapPin,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import {
  VEHICLE_MAKE_AR,
  CONDITION_AR,
  GOVERNORATE_AR,
  MOCK_VEHICLE_LISTINGS,
  formatVehiclePrice,
  formatMileage,
} from "@/lib/api/vehicle-marketplace";

// Listing status
type ListingStatus = "active" | "pending" | "sold" | "expired" | "draft";

interface MyListing {
  id: string;
  vehicle: (typeof MOCK_VEHICLE_LISTINGS)[0];
  status: ListingStatus;
  createdAt: string;
  expiresAt: string;
  views: number;
  favorites: number;
  inquiries: number;
  calls: number;
  featured: boolean;
  tier: "free" | "premium" | "vip";
}

const STATUS_CONFIG: Record<
  ListingStatus,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  active: { label: "نشط", color: "bg-green-100 text-green-700", icon: CheckCircle },
  pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  sold: { label: "تم البيع", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  expired: { label: "منتهي", color: "bg-gray-100 text-gray-700", icon: XCircle },
  draft: { label: "مسودة", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
};

// Generate mock listings
const MY_LISTINGS: MyListing[] = MOCK_VEHICLE_LISTINGS.slice(0, 5).map((vehicle, index) => ({
  id: `listing-${index + 1}`,
  vehicle,
  status: (["active", "active", "pending", "sold", "expired"] as ListingStatus[])[index],
  createdAt: new Date(Date.now() - index * 7 * 24 * 60 * 60 * 1000).toISOString(),
  expiresAt: new Date(Date.now() + (30 - index * 7) * 24 * 60 * 60 * 1000).toISOString(),
  views: Math.floor(Math.random() * 500) + 50,
  favorites: Math.floor(Math.random() * 30) + 5,
  inquiries: Math.floor(Math.random() * 20) + 2,
  calls: Math.floor(Math.random() * 15) + 1,
  featured: index < 2,
  tier: (["vip", "premium", "free", "free", "free"] as const)[index],
}));

export default function MyListingsPage() {
  const [listings, setListings] = useState<MyListing[]>(MY_LISTINGS);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [filterStatus, setFilterStatus] = useState<ListingStatus | "all">("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filteredListings = listings.filter((listing) => {
    if (filterStatus !== "all" && listing.status !== filterStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        listing.vehicle.make.toLowerCase().includes(query) ||
        listing.vehicle.model.toLowerCase().includes(query) ||
        VEHICLE_MAKE_AR[listing.vehicle.make]?.includes(query)
      );
    }
    return true;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "views":
        return b.views - a.views;
      case "inquiries":
        return b.inquiries - a.inquiries;
      case "price_high":
        return b.vehicle.askingPrice - a.vehicle.askingPrice;
      case "price_low":
        return a.vehicle.askingPrice - b.vehicle.askingPrice;
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === "active").length,
    totalViews: listings.reduce((sum, l) => sum + l.views, 0),
    totalInquiries: listings.reduce((sum, l) => sum + l.inquiries, 0),
  };

  const deleteListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setShowMenu(null);
  };

  const markAsSold = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: "sold" as ListingStatus } : l))
    );
    setShowMenu(null);
  };

  const renewListing = (id: string) => {
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: "active" as ListingStatus,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }
          : l
      )
    );
    setShowMenu(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/vehicles"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowRight className="w-5 h-5" />
                <span>العودة للسوق</span>
              </Link>
            </div>
            <h1 className="text-xl font-bold text-gray-900">إعلاناتي</h1>
            <Link
              href="/vehicles/sell"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>إعلان جديد</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">إجمالي الإعلانات</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-600">إعلانات نشطة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInquiries}</p>
                <p className="text-sm text-gray-600">إجمالي الاستفسارات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في إعلاناتك..."
                  className="pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ListingStatus | "all")}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="pending">قيد المراجعة</option>
                <option value="sold">تم البيع</option>
                <option value="expired">منتهي</option>
                <option value="draft">مسودة</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">الأحدث</option>
                <option value="views">الأكثر مشاهدة</option>
                <option value="inquiries">الأكثر استفساراً</option>
                <option value="price_high">السعر: من الأعلى</option>
                <option value="price_low">السعر: من الأقل</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-500"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-500"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Listings */}
        {sortedListings.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {sortedListings.map((listing) => {
              const StatusIcon = STATUS_CONFIG[listing.status].icon;
              const daysRemaining = getDaysRemaining(listing.expiresAt);

              if (viewMode === "list") {
                return (
                  <div
                    key={listing.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="flex">
                      {/* Image */}
                      <div className="w-48 h-40 flex-shrink-0 relative">
                        <img
                          src={listing.vehicle.images[0]}
                          alt={`${VEHICLE_MAKE_AR[listing.vehicle.make]} ${listing.vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                        {listing.tier !== "free" && (
                          <div
                            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                              listing.tier === "vip"
                                ? "bg-amber-500 text-white"
                                : "bg-blue-500 text-white"
                            }`}
                          >
                            {listing.tier === "vip" ? "VIP" : "مميز"}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {VEHICLE_MAKE_AR[listing.vehicle.make]} {listing.vehicle.model}{" "}
                              {listing.vehicle.year}
                            </h3>
                            <p className="text-xl font-bold text-blue-600 mt-1">
                              {formatVehiclePrice(listing.vehicle.askingPrice)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${STATUS_CONFIG[listing.status].color}`}
                            >
                              <StatusIcon className="w-4 h-4" />
                              {STATUS_CONFIG[listing.status].label}
                            </span>
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setShowMenu(showMenu === listing.id ? null : listing.id)
                                }
                                className="p-2 hover:bg-gray-100 rounded-lg"
                              >
                                <MoreVertical className="w-5 h-5 text-gray-500" />
                              </button>
                              {showMenu === listing.id && (
                                <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                                  <Link
                                    href={`/vehicles/${listing.vehicle.id}`}
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>عرض الإعلان</span>
                                  </Link>
                                  <button className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50">
                                    <Edit className="w-4 h-4" />
                                    <span>تعديل</span>
                                  </button>
                                  {listing.status === "active" && (
                                    <button
                                      onClick={() => markAsSold(listing.id)}
                                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-green-600"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      <span>تم البيع</span>
                                    </button>
                                  )}
                                  {listing.status === "expired" && (
                                    <button
                                      onClick={() => renewListing(listing.id)}
                                      className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-blue-600"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                      <span>تجديد</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteListing(listing.id)}
                                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>حذف</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {listing.views} مشاهدة
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {listing.favorites} إعجاب
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {listing.inquiries} استفسار
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {listing.calls} اتصال
                          </span>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                          <span className="text-sm text-gray-500">
                            نُشر: {formatDate(listing.createdAt)}
                          </span>
                          {listing.status === "active" && (
                            <span
                              className={`text-sm ${
                                daysRemaining <= 5 ? "text-red-600" : "text-gray-500"
                              }`}
                            >
                              متبقي: {daysRemaining} يوم
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Grid view
              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3]">
                    <img
                      src={listing.vehicle.images[0]}
                      alt={`${VEHICLE_MAKE_AR[listing.vehicle.make]} ${listing.vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${STATUS_CONFIG[listing.status].color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {STATUS_CONFIG[listing.status].label}
                      </span>
                    </div>
                    {listing.tier !== "free" && (
                      <div
                        className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                          listing.tier === "vip"
                            ? "bg-amber-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {listing.tier === "vip" ? "VIP" : "مميز"}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {VEHICLE_MAKE_AR[listing.vehicle.make]} {listing.vehicle.model}{" "}
                      {listing.vehicle.year}
                    </h3>
                    <p className="text-xl font-bold text-blue-600 mt-1">
                      {formatVehiclePrice(listing.vehicle.askingPrice)}
                    </p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <Eye className="w-4 h-4 mx-auto text-gray-400" />
                        <p className="text-sm font-bold mt-1">{listing.views}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <Heart className="w-4 h-4 mx-auto text-gray-400" />
                        <p className="text-sm font-bold mt-1">{listing.favorites}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <MessageSquare className="w-4 h-4 mx-auto text-gray-400" />
                        <p className="text-sm font-bold mt-1">{listing.inquiries}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <Phone className="w-4 h-4 mx-auto text-gray-400" />
                        <p className="text-sm font-bold mt-1">{listing.calls}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/vehicles/${listing.vehicle.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-center hover:bg-gray-200"
                      >
                        عرض
                      </Link>
                      <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                        تعديل
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد إعلانات</h3>
            <p className="text-gray-600 mb-6">ابدأ ببيع سيارتك الآن</p>
            <Link
              href="/vehicles/sell"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة إعلان جديد
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
