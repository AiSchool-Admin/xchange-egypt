"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Smartphone,
  Search,
  Filter,
  X,
  ChevronDown,
  CheckCircle,
  ArrowLeftRight,
  MapPin,
  Battery,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowRight,
} from "lucide-react";
import {
  MobileBrand,
  MobileConditionGrade,
  MOBILE_BRAND_AR,
  CONDITION_GRADE_AR,
  POPULAR_MODELS,
  STORAGE_OPTIONS,
  EGYPTIAN_GOVERNORATES,
  formatMobilePrice,
  getConditionGradeColor,
} from "@/lib/api/mobile-marketplace";

// Mock listings data
const MOCK_LISTINGS = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB - Natural Titanium",
    brand: "APPLE" as MobileBrand,
    model: "iPhone 15 Pro Max",
    storageGb: 256,
    priceEgp: 65000,
    conditionGrade: "A" as MobileConditionGrade,
    batteryHealth: 98,
    imeiVerified: true,
    governorate: "القاهرة",
    acceptsBarter: true,
    featured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: "2",
    title: "Samsung Galaxy S24 Ultra 512GB - Titanium Black",
    brand: "SAMSUNG" as MobileBrand,
    model: "Galaxy S24 Ultra",
    storageGb: 512,
    priceEgp: 55000,
    conditionGrade: "A" as MobileConditionGrade,
    batteryHealth: 95,
    imeiVerified: true,
    governorate: "الجيزة",
    acceptsBarter: false,
    featured: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "3",
    title: "Xiaomi 14 Pro 256GB - Black",
    brand: "XIAOMI" as MobileBrand,
    model: "14 Pro",
    storageGb: 256,
    priceEgp: 28000,
    conditionGrade: "B" as MobileConditionGrade,
    batteryHealth: 92,
    imeiVerified: true,
    governorate: "الإسكندرية",
    acceptsBarter: true,
    featured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: "4",
    title: "iPhone 14 128GB - Midnight",
    brand: "APPLE" as MobileBrand,
    model: "iPhone 14",
    storageGb: 128,
    priceEgp: 35000,
    conditionGrade: "B" as MobileConditionGrade,
    batteryHealth: 88,
    imeiVerified: true,
    governorate: "المنصورة",
    acceptsBarter: true,
    featured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "5",
    title: "Samsung Galaxy A54 128GB - Awesome Lime",
    brand: "SAMSUNG" as MobileBrand,
    model: "Galaxy A54",
    storageGb: 128,
    priceEgp: 12000,
    conditionGrade: "A" as MobileConditionGrade,
    batteryHealth: 94,
    imeiVerified: true,
    governorate: "طنطا",
    acceptsBarter: true,
    featured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
  },
  {
    id: "6",
    title: "OPPO Reno 11 Pro 256GB - Pearl White",
    brand: "OPPO" as MobileBrand,
    model: "Reno 11 Pro",
    storageGb: 256,
    priceEgp: 22000,
    conditionGrade: "A" as MobileConditionGrade,
    batteryHealth: 97,
    imeiVerified: true,
    governorate: "القاهرة",
    acceptsBarter: false,
    featured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
  {
    id: "7",
    title: "iPhone 13 Pro 256GB - Sierra Blue",
    brand: "APPLE" as MobileBrand,
    model: "iPhone 13 Pro",
    storageGb: 256,
    priceEgp: 38000,
    conditionGrade: "B" as MobileConditionGrade,
    batteryHealth: 85,
    imeiVerified: true,
    governorate: "الجيزة",
    acceptsBarter: true,
    featured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
  },
  {
    id: "8",
    title: "Infinix Note 30 Pro 256GB - Variable Gold",
    brand: "INFINIX" as MobileBrand,
    model: "Note 30 Pro",
    storageGb: 256,
    priceEgp: 8500,
    conditionGrade: "A" as MobileConditionGrade,
    batteryHealth: 100,
    imeiVerified: true,
    governorate: "أسيوط",
    acceptsBarter: true,
    featured: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
  },
];

type SortOption = "newest" | "price_asc" | "price_desc" | "popular";

export default function MobileListingsPage() {
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get("brand") as MobileBrand | null;
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<MobileBrand | null>(initialBrand);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [selectedCondition, setSelectedCondition] = useState<MobileConditionGrade | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
  const [onlyBarter, setOnlyBarter] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minBattery, setMinBattery] = useState<number>(0);

  // Filtered listings
  const filteredListings = MOCK_LISTINGS.filter((listing) => {
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedBrand && listing.brand !== selectedBrand) return false;
    if (selectedModel && listing.model !== selectedModel) return false;
    if (listing.priceEgp < priceRange[0] || listing.priceEgp > priceRange[1]) return false;
    if (selectedCondition && listing.conditionGrade !== selectedCondition) return false;
    if (selectedGovernorate && listing.governorate !== selectedGovernorate) return false;
    if (selectedStorage && listing.storageGb !== selectedStorage) return false;
    if (onlyBarter && !listing.acceptsBarter) return false;
    if (onlyVerified && !listing.imeiVerified) return false;
    if (minBattery > 0 && listing.batteryHealth < minBattery) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price_asc": return a.priceEgp - b.priceEgp;
      case "price_desc": return b.priceEgp - a.priceEgp;
      case "popular": return b.featured ? 1 : -1;
      default: return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  const clearFilters = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setPriceRange([0, 100000]);
    setSelectedCondition(null);
    setSelectedGovernorate(null);
    setSelectedStorage(null);
    setOnlyBarter(false);
    setOnlyVerified(false);
    setMinBattery(0);
    setSearchQuery("");
  };

  const activeFiltersCount = [
    selectedBrand,
    selectedModel,
    priceRange[0] > 0 || priceRange[1] < 100000,
    selectedCondition,
    selectedGovernorate,
    selectedStorage,
    onlyBarter,
    onlyVerified,
    minBattery > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/mobile" className="text-gray-500 hover:text-gray-700">
              <ArrowRight className="w-6 h-6" />
            </Link>

            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="ابحث عن موبايل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition ${
                showFilters || activeFiltersCount > 0
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>الفلاتر</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Toggle */}
            <div className="flex items-center border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 ${viewMode === "grid" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 ${viewMode === "list" ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">الفلاتر</h3>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-500 hover:text-red-600"
                    >
                      مسح الكل
                    </button>
                  )}
                </div>

                {/* Brand Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">الماركة</label>
                  <select
                    value={selectedBrand || ""}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value as MobileBrand || null);
                      setSelectedModel(null);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">كل الماركات</option>
                    {Object.entries(MOBILE_BRAND_AR).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                {/* Model Filter */}
                {selectedBrand && POPULAR_MODELS[selectedBrand] && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">الموديل</label>
                    <select
                      value={selectedModel || ""}
                      onChange={(e) => setSelectedModel(e.target.value || null)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">كل الموديلات</option>
                      {POPULAR_MODELS[selectedBrand]?.map((model) => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نطاق السعر: {formatMobilePrice(priceRange[0])} - {formatMobilePrice(priceRange[1])}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="من"
                      value={priceRange[0] || ""}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="إلى"
                      value={priceRange[1] || ""}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-1/2 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Condition Grade */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">حالة الجهاز</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["A", "B", "C", "D"] as MobileConditionGrade[]).map((grade) => (
                      <button
                        key={grade}
                        onClick={() => setSelectedCondition(selectedCondition === grade ? null : grade)}
                        className={`p-2 rounded-lg text-sm font-bold transition ${
                          selectedCondition === grade
                            ? getConditionGradeColor(grade)
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                  {selectedCondition && (
                    <p className="text-xs text-gray-500 mt-1">
                      {CONDITION_GRADE_AR[selectedCondition].desc}
                    </p>
                  )}
                </div>

                {/* Storage */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعة التخزينية</label>
                  <div className="flex flex-wrap gap-2">
                    {STORAGE_OPTIONS.map((storage) => (
                      <button
                        key={storage}
                        onClick={() => setSelectedStorage(selectedStorage === storage ? null : storage)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition ${
                          selectedStorage === storage
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {storage >= 1024 ? `${storage / 1024}TB` : `${storage}GB`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Governorate */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة</label>
                  <select
                    value={selectedGovernorate || ""}
                    onChange={(e) => setSelectedGovernorate(e.target.value || null)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">كل المحافظات</option>
                    {EGYPTIAN_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                {/* Battery Health */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    أقل صحة بطارية: {minBattery}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minBattery}
                    onChange={(e) => setMinBattery(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* Toggle Filters */}
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyBarter}
                      onChange={(e) => setOnlyBarter(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-sm">يقبل المقايضة فقط</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyVerified}
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-sm">IMEI موثق فقط</span>
                  </label>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  {selectedBrand ? MOBILE_BRAND_AR[selectedBrand] : "كل الموبايلات"}
                </h1>
                <p className="text-gray-500 text-sm">{filteredListings.length} نتيجة</p>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">الأحدث</option>
                <option value="price_asc">السعر: من الأقل</option>
                <option value="price_desc">السعر: من الأعلى</option>
                <option value="popular">الأكثر شعبية</option>
              </select>
            </div>

            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {MOBILE_BRAND_AR[selectedBrand]}
                    <button onClick={() => setSelectedBrand(null)}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {selectedCondition && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    حالة {selectedCondition}
                    <button onClick={() => setSelectedCondition(null)}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {onlyBarter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    يقبل المقايضة
                    <button onClick={() => setOnlyBarter(false)}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Listings Grid/List */}
            {filteredListings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center">
                <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500 mb-6">جرب تغيير معايير البحث</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/mobile/listing/${listing.id}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-100">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Smartphone className="w-16 h-16 text-gray-300" />
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {listing.featured && (
                          <span className="px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                            مميز
                          </span>
                        )}
                        {listing.imeiVerified && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            IMEI موثق
                          </span>
                        )}
                        {listing.acceptsBarter && (
                          <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full flex items-center gap-1">
                            <ArrowLeftRight className="w-3 h-3" />
                            مقايضة
                          </span>
                        )}
                      </div>

                      {/* Condition */}
                      <div className="absolute bottom-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getConditionGradeColor(listing.conditionGrade)}`}>
                          حالة {listing.conditionGrade}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="text-sm text-blue-600 font-medium mb-1">
                        {MOBILE_BRAND_AR[listing.brand]} • {listing.storageGb}GB
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {listing.title}
                      </h3>

                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Battery className="w-4 h-4" />
                          {listing.batteryHealth}%
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {listing.governorate}
                        </span>
                      </div>

                      <div className="text-xl font-bold text-blue-600">
                        {formatMobilePrice(listing.priceEgp)}
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
                    href={`/mobile/listing/${listing.id}`}
                    className="flex gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="w-32 h-32 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center">
                      <Smartphone className="w-12 h-12 text-gray-300" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm text-blue-600 font-medium mb-1">
                            {MOBILE_BRAND_AR[listing.brand]} • {listing.storageGb}GB
                          </div>
                          <h3 className="font-bold text-gray-800 mb-2">{listing.title}</h3>
                        </div>
                        <div className="text-xl font-bold text-blue-600 whitespace-nowrap">
                          {formatMobilePrice(listing.priceEgp)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getConditionGradeColor(listing.conditionGrade)}`}>
                          حالة {listing.conditionGrade}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Battery className="w-4 h-4" />
                          {listing.batteryHealth}%
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {listing.governorate}
                        </span>
                        {listing.imeiVerified && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            IMEI موثق
                          </span>
                        )}
                        {listing.acceptsBarter && (
                          <span className="flex items-center gap-1 text-purple-600">
                            <ArrowLeftRight className="w-4 h-4" />
                            مقايضة
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
