"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Heart,
  Eye,
  MapPin,
  ChevronDown,
  X,
  Star,
  ArrowLeftRight,
  CheckCircle,
  Clock,
  Sparkles,
  User,
  Building2,
  Store,
  Plus,
} from "lucide-react";
import {
  VEHICLE_MAKE_AR,
  BODY_TYPE_AR,
  CONDITION_AR,
  GOVERNORATE_AR,
  SELLER_TYPE_AR,
  MOCK_VEHICLE_LISTINGS,
  type VehicleListing,
  formatVehiclePrice,
  formatMileage,
} from "@/lib/api/vehicle-marketplace";

// Filter only listings that allow barter
const BARTER_LISTINGS = MOCK_VEHICLE_LISTINGS.filter((v) => v.allowBarter);

const SELLER_TYPE_ICONS = {
  OWNER: User,
  DEALER: Building2,
  SHOWROOM: Store,
};

export default function BarterMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMakes, setSelectedMakes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter and sort listings
  const filteredListings = useMemo(() => {
    let results = [...BARTER_LISTINGS];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (v) =>
          v.make.toLowerCase().includes(query) ||
          v.model.toLowerCase().includes(query) ||
          VEHICLE_MAKE_AR[v.make]?.includes(query)
      );
    }

    // Make filter
    if (selectedMakes.length > 0) {
      results = results.filter((v) => selectedMakes.includes(v.make));
    }

    // Price filter
    results = results.filter(
      (v) => v.askingPrice >= priceRange[0] && v.askingPrice <= priceRange[1]
    );

    // Governorate filter
    if (selectedGovernorate) {
      results = results.filter((v) => v.governorate === selectedGovernorate);
    }

    // Sorting
    switch (sortBy) {
      case "price_low":
        results.sort((a, b) => a.askingPrice - b.askingPrice);
        break;
      case "price_high":
        results.sort((a, b) => b.askingPrice - a.askingPrice);
        break;
      case "newest":
        results.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "mileage":
        results.sort((a, b) => a.mileage - b.mileage);
        break;
    }

    return results;
  }, [searchQuery, selectedMakes, priceRange, selectedGovernorate, sortBy]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleMake = (make: string) => {
    setSelectedMakes((prev) =>
      prev.includes(make) ? prev.filter((m) => m !== make) : [...prev, make]
    );
  };

  const clearFilters = () => {
    setSelectedMakes([]);
    setPriceRange([0, 5000000]);
    setSelectedGovernorate("");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedMakes.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000000 ||
    selectedGovernorate ||
    searchQuery;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/vehicles"
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة للسوق</span>
            </Link>
            <Link
              href="/vehicles/my-barters"
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              عروض المقايضة الخاصة بي
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <RefreshCw className="w-10 h-10" />
              <h1 className="text-3xl md:text-4xl font-bold">سوق المقايضة</h1>
            </div>
            <p className="text-green-100 text-lg">
              بادل سيارتك بسيارة أخرى - نظام مقايضة ذكي ومتطور
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن سيارة للمقايضة..."
                className="w-full pr-12 pl-4 py-4 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-green-600" />
            كيف تعمل المقايضة؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">1. ابحث</h3>
              <p className="text-sm text-gray-600">
                ابحث عن السيارة التي تريد المقايضة بها
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ArrowLeftRight className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">2. قدّم عرضاً</h3>
              <p className="text-sm text-gray-600">أرسل عرض مقايضة بسيارتك</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">3. انتظر الرد</h3>
              <p className="text-sm text-gray-600">البائع سيراجع عرضك ويرد عليك</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">4. أتمم الصفقة</h3>
              <p className="text-sm text-gray-600">تواصل مع البائع وأتمم المقايضة</p>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              <span>الفلاتر</span>
              {hasActiveFilters && (
                <span className="bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  !
                </span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
                <span>مسح الفلاتر</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-600">{filteredListings.length} سيارة متاحة للمقايضة</span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="newest">الأحدث</option>
              <option value="price_low">السعر: من الأقل</option>
              <option value="price_high">السعر: من الأعلى</option>
              <option value="mileage">الأقل كيلومترات</option>
            </select>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Makes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشركة المصنعة
                </label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {Object.entries(VEHICLE_MAKE_AR)
                    .slice(0, 10)
                    .map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => toggleMake(key)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedMakes.includes(key)
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نطاق السعر
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                    }
                    placeholder="من"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value) || 5000000])
                    }
                    placeholder="إلى"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Governorate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحافظة
                </label>
                <select
                  value={selectedGovernorate}
                  onChange={(e) => setSelectedGovernorate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="">جميع المحافظات</option>
                  {Object.entries(GOVERNORATE_AR).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Your Vehicle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سيارتك للمقايضة
                </label>
                <Link
                  href="/vehicles/sell"
                  className="flex items-center justify-center gap-2 w-full p-2 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:bg-green-50"
                >
                  <Plus className="w-5 h-5" />
                  <span>أضف سيارتك</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((vehicle) => {
            const SellerIcon = SELLER_TYPE_ICONS[vehicle.sellerType];
            return (
              <div
                key={vehicle.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
              >
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <img
                    src={vehicle.images[0]?.url || "/images/placeholder-car.jpg"}
                    alt={`${VEHICLE_MAKE_AR[vehicle.make]} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <RefreshCw className="w-4 h-4" />
                      مقايضة
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(vehicle.id)}
                    className="absolute top-3 left-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.has(vehicle.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600"
                      }`}
                    />
                  </button>

                  {/* Price */}
                  <div className="absolute bottom-3 right-3">
                    <p className="text-2xl font-bold text-white">
                      {formatVehiclePrice(vehicle.askingPrice)}
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {VEHICLE_MAKE_AR[vehicle.make]} {vehicle.model}
                    </h3>
                    <span className="text-sm text-gray-500">{vehicle.year}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>{formatMileage(vehicle.mileage)}</span>
                    <span>•</span>
                    <span>{CONDITION_AR[vehicle.condition]}</span>
                  </div>

                  {/* Seller Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{GOVERNORATE_AR[vehicle.governorate]}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <SellerIcon className="w-4 h-4" />
                      <span>{SELLER_TYPE_AR[vehicle.sellerType]}</span>
                    </div>
                  </div>

                  {/* Barter Preferences */}
                  {vehicle.barterPreferences && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg text-sm text-green-700">
                      <span className="font-medium">يفضل: </span>
                      {vehicle.barterPreferences}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/vehicles/${vehicle.id}`}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-center hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4 inline ml-1" />
                      التفاصيل
                    </Link>
                    <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1">
                      <ArrowLeftRight className="w-4 h-4" />
                      قدّم عرض
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 && (
          <div className="text-center py-16">
            <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              لا توجد سيارات متاحة للمقايضة
            </h3>
            <p className="text-gray-600 mb-6">جرب تغيير معايير البحث أو الفلاتر</p>
            <button
              onClick={clearFilters}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors"
            >
              مسح جميع الفلاتر
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
