"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Search,
  Filter,
  Grid,
  List,
  MapPin,
  Heart,
  Eye,
  RefreshCw,
  ChevronDown,
  X,
  Star,
  ShieldCheck,
  Sparkles,
  User,
  Building2,
  Store,
} from "lucide-react";
import {
  VehicleMake,
  VEHICLE_MAKE_AR,
  BODY_TYPE_AR,
  VehicleBodyType,
  CONDITION_AR,
  SELLER_TYPE_AR,
  GOVERNORATE_AR,
  Governorate,
  SellerType,
  formatVehiclePrice,
  formatMileage,
  MOCK_VEHICLE_LISTINGS,
} from "@/lib/api/vehicle-marketplace";

const PRICE_RANGES = [
  { min: 0, max: 300000, label: "أقل من 300,000" },
  { min: 300000, max: 500000, label: "300,000 - 500,000" },
  { min: 500000, max: 800000, label: "500,000 - 800,000" },
  { min: 800000, max: 1200000, label: "800,000 - 1,200,000" },
  { min: 1200000, max: 2000000, label: "1,200,000 - 2,000,000" },
  { min: 2000000, max: Infinity, label: "أكثر من 2,000,000" },
];

export default function VehicleListingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMakes, setSelectedMakes] = useState<VehicleMake[]>([]);
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<VehicleBodyType[]>([]);
  const [selectedSellerTypes, setSelectedSellerTypes] = useState<SellerType[]>([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState<Governorate | "">("");
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [barterOnly, setBarterOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "mileage">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const toggleMake = (make: VehicleMake) => {
    setSelectedMakes((prev) => (prev.includes(make) ? prev.filter((m) => m !== make) : [...prev, make]));
  };

  const toggleBodyType = (type: VehicleBodyType) => {
    setSelectedBodyTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const toggleSellerType = (type: SellerType) => {
    setSelectedSellerTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const clearFilters = () => {
    setSelectedMakes([]);
    setSelectedBodyTypes([]);
    setSelectedSellerTypes([]);
    setSelectedGovernorate("");
    setPriceRange(null);
    setBarterOnly(false);
    setSearchQuery("");
  };

  const filteredListings = MOCK_VEHICLE_LISTINGS.filter((listing) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const makeAr = VEHICLE_MAKE_AR[listing.make].toLowerCase();
      const model = listing.model.toLowerCase();
      if (!makeAr.includes(q) && !model.includes(q) && !listing.titleAr?.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedMakes.length > 0 && !selectedMakes.includes(listing.make)) return false;
    if (selectedBodyTypes.length > 0 && !selectedBodyTypes.includes(listing.bodyType)) return false;
    if (selectedSellerTypes.length > 0 && !selectedSellerTypes.includes(listing.sellerType)) return false;
    if (selectedGovernorate && listing.governorate !== selectedGovernorate) return false;
    if (priceRange && (listing.askingPrice < priceRange.min || listing.askingPrice > priceRange.max)) return false;
    if (barterOnly && !listing.allowBarter) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.askingPrice - b.askingPrice;
      case "price_desc":
        return b.askingPrice - a.askingPrice;
      case "mileage":
        return a.mileage - b.mileage;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const activeFiltersCount = selectedMakes.length + selectedBodyTypes.length + selectedSellerTypes.length + (selectedGovernorate ? 1 : 0) + (priceRange ? 1 : 0) + (barterOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/vehicles" className="text-gray-600 hover:text-gray-900">
                <ArrowRight className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900">تصفح السيارات</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-primary-100 text-primary-600" : "text-gray-500"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-primary-100 text-primary-600" : "text-gray-500"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن سيارة..."
                className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl transition-colors ${
                showFilters ? "bg-primary-600 text-white border-primary-600" : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>فلترة</span>
              {activeFiltersCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${showFilters ? "bg-white text-primary-600" : "bg-primary-100 text-primary-600"}`}>
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-4 sticky top-32">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">الفلاتر</h3>
                  {activeFiltersCount > 0 && (
                    <button onClick={clearFilters} className="text-sm text-primary-600 hover:underline">
                      مسح الكل
                    </button>
                  )}
                </div>

                {/* Seller Type */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">نوع البائع</h4>
                  <div className="space-y-2">
                    {(["OWNER", "DEALER", "SHOWROOM"] as SellerType[]).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSellerTypes.includes(type)}
                          onChange={() => toggleSellerType(type)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{SELLER_TYPE_AR[type].label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Barter Toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-purple-50 rounded-xl">
                    <input
                      type="checkbox"
                      checked={barterOnly}
                      onChange={(e) => setBarterOnly(e.target.checked)}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <RefreshCw className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">يقبل المقايضة فقط</span>
                  </label>
                </div>

                {/* Makes */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">الشركة المصنعة</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(Object.keys(VEHICLE_MAKE_AR) as VehicleMake[]).slice(0, 12).map((make) => (
                      <label key={make} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMakes.includes(make)}
                          onChange={() => toggleMake(make)}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{VEHICLE_MAKE_AR[make]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Body Types */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">نوع الهيكل</h4>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(BODY_TYPE_AR) as VehicleBodyType[]).slice(0, 6).map((type) => (
                      <button
                        key={type}
                        onClick={() => toggleBodyType(type)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedBodyTypes.includes(type) ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {BODY_TYPE_AR[type].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">نطاق السعر</h4>
                  <div className="space-y-2">
                    {PRICE_RANGES.map((range, index) => (
                      <label key={index} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="priceRange"
                          checked={priceRange?.min === range.min && priceRange?.max === range.max}
                          onChange={() => setPriceRange(range)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Governorate */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">المحافظة</h4>
                  <select
                    value={selectedGovernorate}
                    onChange={(e) => setSelectedGovernorate(e.target.value as Governorate)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">جميع المحافظات</option>
                    {(Object.keys(GOVERNORATE_AR) as Governorate[]).map((gov) => (
                      <option key={gov} value={gov}>
                        {GOVERNORATE_AR[gov]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Listings */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-600">
                <span className="font-bold text-gray-900">{filteredListings.length}</span> سيارة
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="newest">الأحدث</option>
                <option value="price_asc">السعر: الأقل أولاً</option>
                <option value="price_desc">السعر: الأعلى أولاً</option>
                <option value="mileage">الكيلومترات: الأقل أولاً</option>
              </select>
            </div>

            {/* Active Filters Tags */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedMakes.map((make) => (
                  <span key={make} className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {VEHICLE_MAKE_AR[make]}
                    <button onClick={() => toggleMake(make)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedBodyTypes.map((type) => (
                  <span key={type} className="flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {BODY_TYPE_AR[type].label}
                    <button onClick={() => toggleBodyType(type)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedSellerTypes.map((type) => (
                  <span key={type} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {SELLER_TYPE_AR[type].label}
                    <button onClick={() => toggleSellerType(type)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {barterOnly && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    يقبل المقايضة
                    <button onClick={() => setBarterOnly(false)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Grid/List View */}
            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500 mb-4">جرب تغيير معايير البحث</p>
                <button onClick={clearFilters} className="text-primary-600 font-medium hover:underline">
                  مسح جميع الفلاتر
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map((listing) => (
                  <Link key={listing.id} href={`/vehicles/${listing.id}`} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-48">
                      <img
                        src={listing.images[0]?.url || "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400"}
                        alt={listing.titleAr}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(listing.id);
                        }}
                        className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-white"
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(listing.id) ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
                      </button>
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {listing.featured && (
                          <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-medium rounded">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            مميز
                          </span>
                        )}
                        {listing.allowBarter && <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded">مقايضة</span>}
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded ${SELLER_TYPE_AR[listing.sellerType].color}`}>
                          {SELLER_TYPE_AR[listing.sellerType].label}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {VEHICLE_MAKE_AR[listing.make]} {listing.model} {listing.year}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>{formatMileage(listing.mileage)}</span>
                        <span>•</span>
                        <span>{BODY_TYPE_AR[listing.bodyType].label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary-600">{formatVehiclePrice(listing.askingPrice)} جنيه</span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          {GOVERNORATE_AR[listing.governorate]}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/vehicles/${listing.id}`}
                    className="flex bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-48 h-36 flex-shrink-0">
                      <img
                        src={listing.images[0]?.url || "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400"}
                        alt={listing.titleAr}
                        className="w-full h-full object-cover"
                      />
                      {listing.allowBarter && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded">مقايضة</span>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {VEHICLE_MAKE_AR[listing.make]} {listing.model} {listing.year}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span>{formatMileage(listing.mileage)}</span>
                            <span>•</span>
                            <span>{BODY_TYPE_AR[listing.bodyType].label}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {GOVERNORATE_AR[listing.governorate]}
                            </span>
                          </div>
                          <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded ${SELLER_TYPE_AR[listing.sellerType].color}`}>
                            {SELLER_TYPE_AR[listing.sellerType].label}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-primary-600">{formatVehiclePrice(listing.askingPrice)} جنيه</div>
                          {listing.priceNegotiable && <span className="text-xs text-green-600">قابل للتفاوض</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
