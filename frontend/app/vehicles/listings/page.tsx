"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Grid,
  List,
  Car,
  MapPin,
  Eye,
  Heart,
  ArrowLeftRight,
  Sparkles,
  ChevronDown,
  X,
  SlidersHorizontal,
  ArrowLeft,
} from "lucide-react";
import {
  VehicleMake,
  VEHICLE_MAKE_AR,
  VehicleBodyType,
  BODY_TYPE_AR,
  SELLER_TYPE_AR,
  VERIFICATION_AR,
  GOVERNORATE_AR,
  Governorate,
  formatVehiclePrice,
  formatMileage,
  MOCK_VEHICLE_LISTINGS,
  VehicleListing,
  SellerType,
} from "@/lib/api/vehicle-marketplace";

// Constants
const MAKES = Object.keys(VEHICLE_MAKE_AR) as VehicleMake[];
const BODY_TYPES = Object.keys(BODY_TYPE_AR) as VehicleBodyType[];
const GOVERNORATES = Object.keys(GOVERNORATE_AR) as Governorate[];
const SELLER_TYPES: SellerType[] = ["OWNER", "DEALER", "SHOWROOM"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

const PRICE_RANGES = [
  { label: "الكل", min: 0, max: null },
  { label: "أقل من 300 ألف", min: 0, max: 300000 },
  { label: "300 - 500 ألف", min: 300000, max: 500000 },
  { label: "500 ألف - مليون", min: 500000, max: 1000000 },
  { label: "مليون - 2 مليون", min: 1000000, max: 2000000 },
  { label: "أكثر من 2 مليون", min: 2000000, max: null },
];

const MILEAGE_RANGES = [
  { label: "الكل", max: null },
  { label: "أقل من 30 ألف", max: 30000 },
  { label: "أقل من 50 ألف", max: 50000 },
  { label: "أقل من 100 ألف", max: 100000 },
  { label: "أقل من 150 ألف", max: 150000 },
];

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "oldest", label: "الأقدم" },
  { value: "price_asc", label: "السعر: من الأقل" },
  { value: "price_desc", label: "السعر: من الأعلى" },
  { value: "mileage_asc", label: "الكيلومترات: الأقل" },
  { value: "year_desc", label: "السنة: الأحدث" },
  { value: "popular", label: "الأكثر مشاهدة" },
];

export default function VehicleListingsPage() {
  const searchParams = useSearchParams();

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedMakes, setSelectedMakes] = useState<VehicleMake[]>(
    searchParams.get("make") ? [searchParams.get("make") as VehicleMake] : []
  );
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<VehicleBodyType[]>(
    searchParams.get("bodyType") ? [searchParams.get("bodyType") as VehicleBodyType] : []
  );
  const [yearMin, setYearMin] = useState<number | null>(
    searchParams.get("yearMin") ? parseInt(searchParams.get("yearMin")!) : null
  );
  const [yearMax, setYearMax] = useState<number | null>(
    searchParams.get("yearMax") ? parseInt(searchParams.get("yearMax")!) : null
  );
  const [priceRange, setPriceRange] = useState<{ min: number; max: number | null }>(
    { min: 0, max: null }
  );
  const [mileageMax, setMileageMax] = useState<number | null>(null);
  const [selectedGovernorates, setSelectedGovernorates] = useState<Governorate[]>([]);
  const [selectedSellerTypes, setSelectedSellerTypes] = useState<SellerType[]>([]);
  const [allowBarterOnly, setAllowBarterOnly] = useState(
    searchParams.get("allowBarter") === "true"
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  // Results
  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter and sort listings
  useEffect(() => {
    setLoading(true);

    let filtered = [...MOCK_VEHICLE_LISTINGS];

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(query) ||
          l.titleAr.includes(query) ||
          l.model.toLowerCase().includes(query) ||
          VEHICLE_MAKE_AR[l.make].includes(query)
      );
    }

    // Makes
    if (selectedMakes.length > 0) {
      filtered = filtered.filter((l) => selectedMakes.includes(l.make));
    }

    // Body types
    if (selectedBodyTypes.length > 0) {
      filtered = filtered.filter((l) => selectedBodyTypes.includes(l.bodyType));
    }

    // Year range
    if (yearMin) {
      filtered = filtered.filter((l) => l.year >= yearMin);
    }
    if (yearMax) {
      filtered = filtered.filter((l) => l.year <= yearMax);
    }

    // Price range
    if (priceRange.min > 0) {
      filtered = filtered.filter((l) => l.askingPrice >= priceRange.min);
    }
    if (priceRange.max) {
      filtered = filtered.filter((l) => l.askingPrice <= priceRange.max);
    }

    // Mileage
    if (mileageMax) {
      filtered = filtered.filter((l) => l.mileage <= mileageMax);
    }

    // Governorates
    if (selectedGovernorates.length > 0) {
      filtered = filtered.filter((l) => selectedGovernorates.includes(l.governorate));
    }

    // Seller types
    if (selectedSellerTypes.length > 0) {
      filtered = filtered.filter((l) => selectedSellerTypes.includes(l.sellerType));
    }

    // Barter only
    if (allowBarterOnly) {
      filtered = filtered.filter((l) => l.allowBarter);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "price_asc":
        filtered.sort((a, b) => a.askingPrice - b.askingPrice);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.askingPrice - a.askingPrice);
        break;
      case "mileage_asc":
        filtered.sort((a, b) => a.mileage - b.mileage);
        break;
      case "year_desc":
        filtered.sort((a, b) => b.year - a.year);
        break;
      case "popular":
        filtered.sort((a, b) => b.views - a.views);
        break;
    }

    setTotalCount(filtered.length);
    setListings(filtered);
    setLoading(false);
  }, [
    searchQuery,
    selectedMakes,
    selectedBodyTypes,
    yearMin,
    yearMax,
    priceRange,
    mileageMax,
    selectedGovernorates,
    selectedSellerTypes,
    allowBarterOnly,
    sortBy,
  ]);

  // Toggle make selection
  const toggleMake = (make: VehicleMake) => {
    setSelectedMakes((prev) =>
      prev.includes(make) ? prev.filter((m) => m !== make) : [...prev, make]
    );
  };

  // Toggle body type selection
  const toggleBodyType = (type: VehicleBodyType) => {
    setSelectedBodyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Toggle governorate
  const toggleGovernorate = (gov: Governorate) => {
    setSelectedGovernorates((prev) =>
      prev.includes(gov) ? prev.filter((g) => g !== gov) : [...prev, gov]
    );
  };

  // Toggle seller type
  const toggleSellerType = (type: SellerType) => {
    setSelectedSellerTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedMakes([]);
    setSelectedBodyTypes([]);
    setYearMin(null);
    setYearMax(null);
    setPriceRange({ min: 0, max: null });
    setMileageMax(null);
    setSelectedGovernorates([]);
    setSelectedSellerTypes([]);
    setAllowBarterOnly(false);
    setSortBy("newest");
  };

  // Count active filters
  const activeFiltersCount =
    selectedMakes.length +
    selectedBodyTypes.length +
    (yearMin ? 1 : 0) +
    (yearMax ? 1 : 0) +
    (priceRange.min > 0 || priceRange.max ? 1 : 0) +
    (mileageMax ? 1 : 0) +
    selectedGovernorates.length +
    selectedSellerTypes.length +
    (allowBarterOnly ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/vehicles"
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>سوق السيارات</span>
            </Link>

            <h1 className="text-xl font-bold text-gray-800">تصفح السيارات</h1>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${
                  viewMode === "grid" ? "bg-blue-100 text-blue-600" : "text-gray-400"
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${
                  viewMode === "list" ? "bg-blue-100 text-blue-600" : "text-gray-400"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن سيارة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border flex items-center gap-2 ${
                showFilters || activeFiltersCount > 0
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "border-gray-200"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>فلاتر</span>
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div
            className={`${
              showFilters ? "block" : "hidden lg:block"
            } w-full lg:w-80 flex-shrink-0`}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">الفلاتر</h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    مسح الكل
                  </button>
                )}
              </div>

              {/* Seller Type Filter - Featured */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-bold text-sm text-blue-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  نوع البائع (ميزة حصرية)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SELLER_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleSellerType(type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        selectedSellerTypes.includes(type)
                          ? SELLER_TYPE_AR[type].color
                          : "bg-white border border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {SELLER_TYPE_AR[type].icon} {SELLER_TYPE_AR[type].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Barter Toggle */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowBarterOnly}
                    onChange={(e) => setAllowBarterOnly(e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <span className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">قابلة للمقايضة فقط</span>
                  </span>
                </label>
              </div>

              {/* Makes */}
              <div className="mb-6">
                <h3 className="font-bold text-sm text-gray-700 mb-3">الماركة</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {MAKES.slice(0, 15).map((make) => (
                    <label key={make} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMakes.includes(make)}
                        onChange={() => toggleMake(make)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">{VEHICLE_MAKE_AR[make]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Body Types */}
              <div className="mb-6">
                <h3 className="font-bold text-sm text-gray-700 mb-3">نوع الهيكل</h3>
                <div className="grid grid-cols-2 gap-2">
                  {BODY_TYPES.slice(0, 8).map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleBodyType(type)}
                      className={`p-2 rounded-lg text-sm transition flex items-center gap-2 ${
                        selectedBodyTypes.includes(type)
                          ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <span>{BODY_TYPE_AR[type].icon}</span>
                      <span>{BODY_TYPE_AR[type].label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-bold text-sm text-gray-700 mb-3">السعر</h3>
                <div className="space-y-2">
                  {PRICE_RANGES.map((range, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="priceRange"
                        checked={priceRange.min === range.min && priceRange.max === range.max}
                        onChange={() => setPriceRange({ min: range.min, max: range.max })}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Year Range */}
              <div className="mb-6">
                <h3 className="font-bold text-sm text-gray-700 mb-3">سنة الصنع</h3>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={yearMin || ""}
                    onChange={(e) => setYearMin(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">من</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <select
                    value={yearMax || ""}
                    onChange={(e) => setYearMax(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    <option value="">إلى</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mileage */}
              <div className="mb-6">
                <h3 className="font-bold text-sm text-gray-700 mb-3">الكيلومترات</h3>
                <div className="space-y-2">
                  {MILEAGE_RANGES.map((range, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="mileage"
                        checked={mileageMax === range.max}
                        onChange={() => setMileageMax(range.max)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Governorates */}
              <div className="mb-6">
                <h3 className="font-bold text-sm text-gray-700 mb-3">المحافظة</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {GOVERNORATES.map((gov) => (
                    <label key={gov} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGovernorates.includes(gov)}
                        onChange={() => toggleGovernorate(gov)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">{GOVERNORATE_AR[gov]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                عرض <span className="font-bold text-gray-900">{totalCount}</span> سيارة
              </p>

              {/* Active Filters Tags */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedMakes.map((make) => (
                    <span
                      key={make}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                    >
                      {VEHICLE_MAKE_AR[make]}
                      <button onClick={() => toggleMake(make)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {allowBarterOnly && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">
                      مقايضة
                      <button onClick={() => setAllowBarterOnly(false)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Loading */}
            {loading ? (
              <div
                className={`grid gap-6 ${
                  viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : ""
                }`}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500 mb-6">جرب تغيير معايير البحث</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
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
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            SELLER_TYPE_AR[listing.sellerType].color
                          }`}
                        >
                          {SELLER_TYPE_AR[listing.sellerType].icon}{" "}
                          {SELLER_TYPE_AR[listing.sellerType].label}
                        </span>

                        {listing.verificationLevel !== "BASIC" && (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              VERIFICATION_AR[listing.verificationLevel].color
                            }`}
                          >
                            {VERIFICATION_AR[listing.verificationLevel].icon}
                          </span>
                        )}
                      </div>

                      {listing.allowBarter && (
                        <div className="absolute bottom-3 right-3 bg-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          مقايضة
                        </div>
                      )}

                      {listing.featured && (
                        <div className="absolute top-3 left-3 bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                        </div>
                      )}

                      {listing.condition === "NEW" && (
                        <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                          زيرو
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="text-sm text-blue-600 font-medium mb-1">
                        {VEHICLE_MAKE_AR[listing.make]} • {listing.year}
                      </div>

                      <h3 className="font-bold text-gray-800 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {listing.titleAr}
                      </h3>

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
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/vehicles/${listing.id}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all flex"
                  >
                    {/* Image */}
                    <div className="relative w-64 flex-shrink-0 bg-gradient-to-br from-blue-50 to-slate-100">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Car className="w-16 h-16 text-gray-300" />
                      </div>

                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold ${
                          SELLER_TYPE_AR[listing.sellerType].color
                        }`}
                      >
                        {SELLER_TYPE_AR[listing.sellerType].icon}
                      </span>

                      {listing.allowBarter && (
                        <div className="absolute bottom-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                          🔄
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm text-blue-600 font-medium mb-1">
                            {VEHICLE_MAKE_AR[listing.make]} • {listing.model} • {listing.year}
                          </div>
                          <h3 className="font-bold text-gray-800 text-xl mb-2">
                            {listing.titleAr}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span>{formatMileage(listing.mileage)}</span>
                            <span>•</span>
                            <span>{BODY_TYPE_AR[listing.bodyType].label}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {GOVERNORATE_AR[listing.governorate]}
                            </span>
                          </div>
                        </div>

                        <div className="text-left">
                          <div className="text-2xl font-bold text-blue-600">
                            {formatVehiclePrice(listing.askingPrice)}
                          </div>
                          {listing.priceNegotiable && (
                            <span className="text-xs text-gray-500">قابل للتفاوض</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="flex items-center gap-4 text-gray-400">
                          <span className="flex items-center gap-1 text-sm">
                            <Eye className="w-4 h-4" />
                            {listing.views} مشاهدة
                          </span>
                          <span className="flex items-center gap-1 text-sm">
                            <Heart className="w-4 h-4" />
                            {listing.favorites} إعجاب
                          </span>
                        </div>

                        {listing.verificationLevel !== "BASIC" && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              VERIFICATION_AR[listing.verificationLevel].color
                            }`}
                          >
                            {VERIFICATION_AR[listing.verificationLevel].icon}{" "}
                            {VERIFICATION_AR[listing.verificationLevel].label}
                          </span>
                        )}
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
