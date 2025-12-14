"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Trash2,
  Bell,
  BellOff,
  MapPin,
  Eye,
  Phone,
  MessageSquare,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Settings,
  Grid,
  List,
  Search,
  Filter,
  X,
  User,
  Building2,
  Store,
} from "lucide-react";
import {
  VEHICLE_MAKE_AR,
  CONDITION_AR,
  GOVERNORATE_AR,
  SELLER_TYPE_AR,
  MOCK_VEHICLE_LISTINGS,
  type VehicleListing,
  formatVehiclePrice,
  formatMileage,
} from "@/lib/api/vehicle-marketplace";

// Simulated saved vehicles with price alerts
interface SavedVehicle extends VehicleListing {
  savedAt: string;
  priceAlert: boolean;
  alertThreshold?: number;
  priceHistory: { date: string; price: number }[];
  notes?: string;
}

const SAVED_VEHICLES: SavedVehicle[] = MOCK_VEHICLE_LISTINGS.slice(0, 4).map((v, i) => ({
  ...v,
  savedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
  priceAlert: i < 2,
  alertThreshold: v.askingPrice - 50000,
  priceHistory: [
    { date: "2024-01-01", price: v.askingPrice + 100000 },
    { date: "2024-01-15", price: v.askingPrice + 50000 },
    { date: "2024-02-01", price: v.askingPrice },
  ],
  notes: i === 0 ? "سيارة ممتازة - يجب المتابعة" : undefined,
}));

const SELLER_TYPE_ICONS = {
  OWNER: User,
  DEALER: Building2,
  SHOWROOM: Store,
};

export default function FavoritesPage() {
  const [savedVehicles, setSavedVehicles] = useState<SavedVehicle[]>(SAVED_VEHICLES);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("saved_date");
  const [showPriceAlertModal, setShowPriceAlertModal] = useState<string | null>(null);
  const [alertThreshold, setAlertThreshold] = useState<number>(0);

  const filteredVehicles = savedVehicles.filter((v) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.make.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query) ||
      VEHICLE_MAKE_AR[v.make]?.includes(query)
    );
  });

  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    switch (sortBy) {
      case "price_low":
        return a.askingPrice - b.askingPrice;
      case "price_high":
        return b.askingPrice - a.askingPrice;
      case "saved_date":
      default:
        return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
    }
  });

  const removeVehicle = (id: string) => {
    setSavedVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const togglePriceAlert = (id: string) => {
    setSavedVehicles((prev) =>
      prev.map((v) => (v.id === id ? { ...v, priceAlert: !v.priceAlert } : v))
    );
  };

  const setPriceAlertThreshold = (id: string, threshold: number) => {
    setSavedVehicles((prev) =>
      prev.map((v) =>
        v.id === id ? { ...v, priceAlert: true, alertThreshold: threshold } : v
      )
    );
    setShowPriceAlertModal(null);
  };

  const getPriceChange = (vehicle: SavedVehicle) => {
    if (vehicle.priceHistory.length < 2) return null;
    const oldPrice = vehicle.priceHistory[0].price;
    const newPrice = vehicle.askingPrice;
    const change = ((newPrice - oldPrice) / oldPrice) * 100;
    return change;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500 fill-red-500" />
              السيارات المحفوظة
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600 fill-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{savedVehicles.length}</p>
                <p className="text-sm text-gray-600">سيارة محفوظة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {savedVehicles.filter((v) => v.priceAlert).length}
                </p>
                <p className="text-sm text-gray-600">تنبيه سعر نشط</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {savedVehicles.filter((v) => (getPriceChange(v) || 0) < 0).length}
                </p>
                <p className="text-sm text-gray-600">انخفض سعرها</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث في المحفوظات..."
                  className="pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="saved_date">تاريخ الحفظ</option>
                <option value="price_low">السعر: من الأقل</option>
                <option value="price_high">السعر: من الأعلى</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-500"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-500"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Vehicles */}
        {sortedVehicles.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {sortedVehicles.map((vehicle) => {
              const priceChange = getPriceChange(vehicle);
              const SellerIcon = SELLER_TYPE_ICONS[vehicle.sellerType];

              if (viewMode === "list") {
                return (
                  <div
                    key={vehicle.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <div className="flex">
                      <div className="w-48 h-36 flex-shrink-0">
                        <img
                          src={vehicle.images[0]?.url || "/images/placeholder-car.jpg"}
                          alt={`${VEHICLE_MAKE_AR[vehicle.make]} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {VEHICLE_MAKE_AR[vehicle.make]} {vehicle.model} {vehicle.year}
                            </h3>
                            <p className="text-2xl font-bold text-blue-600 mt-1">
                              {formatVehiclePrice(vehicle.askingPrice)}
                            </p>
                            {priceChange !== null && (
                              <div
                                className={`flex items-center gap-1 text-sm mt-1 ${
                                  priceChange < 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {priceChange < 0 ? (
                                  <TrendingDown className="w-4 h-4" />
                                ) : (
                                  <TrendingUp className="w-4 h-4" />
                                )}
                                <span>
                                  {Math.abs(priceChange).toFixed(1)}%{" "}
                                  {priceChange < 0 ? "انخفاض" : "ارتفاع"}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setAlertThreshold(vehicle.alertThreshold || vehicle.askingPrice);
                                setShowPriceAlertModal(vehicle.id);
                              }}
                              className={`p-2 rounded-lg ${
                                vehicle.priceAlert
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                              title="تنبيه السعر"
                            >
                              {vehicle.priceAlert ? (
                                <Bell className="w-5 h-5" />
                              ) : (
                                <BellOff className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => removeVehicle(vehicle.id)}
                              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                              title="إزالة"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm text-gray-500">
                            {formatMileage(vehicle.mileage)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {CONDITION_AR[vehicle.condition]}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {GOVERNORATE_AR[vehicle.governorate]}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Link
                            href={`/vehicles/${vehicle.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                          >
                            عرض التفاصيل
                          </Link>
                          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            اتصل
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3]">
                    <img
                      src={vehicle.images[0]?.url || "/images/placeholder-car.jpg"}
                      alt={`${VEHICLE_MAKE_AR[vehicle.make]} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Price Change Badge */}
                    {priceChange !== null && (
                      <div
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                          priceChange < 0
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {priceChange < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <TrendingUp className="w-4 h-4" />
                        )}
                        {Math.abs(priceChange).toFixed(0)}%
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setAlertThreshold(vehicle.alertThreshold || vehicle.askingPrice);
                          setShowPriceAlertModal(vehicle.id);
                        }}
                        className={`p-2 rounded-full ${
                          vehicle.priceAlert ? "bg-blue-500 text-white" : "bg-white text-gray-600"
                        }`}
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeVehicle(vehicle.id)}
                        className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-3 right-3">
                      <p className="text-2xl font-bold text-white">
                        {formatVehiclePrice(vehicle.askingPrice)}
                      </p>
                    </div>

                    {/* Barter Badge */}
                    {vehicle.allowBarter && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          مقايضة
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      {VEHICLE_MAKE_AR[vehicle.make]} {vehicle.model} {vehicle.year}
                    </h3>

                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                      <span>{formatMileage(vehicle.mileage)}</span>
                      <span>•</span>
                      <span>{CONDITION_AR[vehicle.condition]}</span>
                    </div>

                    {vehicle.priceAlert && vehicle.alertThreshold && (
                      <div className="mt-3 p-2 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        <span>
                          تنبيه عند: {formatVehiclePrice(vehicle.alertThreshold)}
                        </span>
                      </div>
                    )}

                    {vehicle.notes && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                        📝 {vehicle.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        حُفظت: {formatDate(vehicle.savedAt)}
                      </span>
                      <Link
                        href={`/vehicles/${vehicle.id}`}
                        className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        عرض
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد سيارات محفوظة</h3>
            <p className="text-gray-600 mb-6">
              احفظ السيارات التي تعجبك لتتمكن من مراجعتها لاحقاً
            </p>
            <Link
              href="/vehicles/listings"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors inline-block"
            >
              تصفح السيارات
            </Link>
          </div>
        )}
      </main>

      {/* Price Alert Modal */}
      {showPriceAlertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">إعداد تنبيه السعر</h3>
              <button
                onClick={() => setShowPriceAlertModal(null)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-4">
              سنرسل لك إشعاراً عندما ينخفض سعر السيارة إلى المبلغ المحدد أو أقل
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نبهني عند وصول السعر إلى
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value) || 0)}
                  className="w-full p-3 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  جنيه
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPriceAlertModal(null)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => setPriceAlertThreshold(showPriceAlertModal, alertThreshold)}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                تفعيل التنبيه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
