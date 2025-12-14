'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  HeartIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  CalendarIcon,
  BellIcon,
  ShareIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import {
  VEHICLE_MAKE_AR,
  VEHICLE_BODY_TYPE_AR,
  GOVERNORATE_AR,
  MOCK_VEHICLE_LISTINGS,
  type VehicleListing,
  type VehicleMake,
  type VehicleBodyType,
} from '@/lib/api/vehicle-marketplace';

interface FavoriteVehicle extends VehicleListing {
  favoriteDate: string;
  priceAlert: boolean;
  priceHistory: { date: string; price: number }[];
}

// Convert mock listings to favorites
const MOCK_FAVORITES: FavoriteVehicle[] = MOCK_VEHICLE_LISTINGS.slice(0, 6).map((listing, index) => ({
  ...listing,
  favoriteDate: `2024-01-${String(10 - index).padStart(2, '0')}`,
  priceAlert: index % 2 === 0,
  priceHistory: [
    { date: '2024-01-01', price: listing.price + Math.floor(Math.random() * 50000) },
    { date: '2024-01-05', price: listing.price + Math.floor(Math.random() * 25000) },
    { date: '2024-01-10', price: listing.price },
  ],
}));

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>(MOCK_FAVORITES);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'price_asc' | 'price_desc'>('date');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showPriceAlertModal, setShowPriceAlertModal] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedItems.size === favorites.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(favorites.map(f => f.id)));
    }
  };

  const removeSelected = () => {
    setFavorites(prev => prev.filter(f => !selectedItems.has(f.id)));
    setSelectedItems(new Set());
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const togglePriceAlert = (id: string) => {
    setFavorites(prev => prev.map(f =>
      f.id === id ? { ...f, priceAlert: !f.priceAlert } : f
    ));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'date':
      default:
        return new Date(b.favoriteDate).getTime() - new Date(a.favoriteDate).getTime();
    }
  });

  const getPriceChange = (favorite: FavoriteVehicle) => {
    if (favorite.priceHistory.length < 2) return null;
    const oldPrice = favorite.priceHistory[0].price;
    const newPrice = favorite.price;
    const change = newPrice - oldPrice;
    const percentage = Math.round((change / oldPrice) * 100);
    return { change, percentage };
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/vehicles" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">المفضلة</h1>
                <p className="text-sm text-gray-500">{favorites.length} سيارة محفوظة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedItems.size > 0 && (
                <button
                  onClick={removeSelected}
                  className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                  حذف المحدد ({selectedItems.size})
                </button>
              )}
              <Link
                href="/vehicles/listings"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                تصفح السيارات
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartIcon className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد سيارات مفضلة</h3>
            <p className="text-gray-500 mb-6">لم تقم بإضافة أي سيارات للمفضلة بعد. تصفح السيارات وأضف ما يعجبك!</p>
            <Link
              href="/vehicles/listings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              تصفح السيارات
            </Link>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === favorites.length}
                    onChange={selectAll}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">تحديد الكل</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'price_asc' | 'price_desc')}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="date">الأحدث إضافة</option>
                  <option value="price_asc">السعر: الأقل أولاً</option>
                  <option value="price_desc">السعر: الأعلى أولاً</option>
                </select>

                <div className="flex items-center bg-white border border-gray-300 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
                  >
                    <ListBulletIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedFavorites.map((vehicle) => {
                  const priceChange = getPriceChange(vehicle);
                  const isSelected = selectedItems.has(vehicle.id);

                  return (
                    <div
                      key={vehicle.id}
                      className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all ${
                        isSelected ? 'ring-2 ring-primary-500' : ''
                      }`}
                    >
                      {/* Image */}
                      <div className="relative h-48">
                        <img
                          src={vehicle.images[0]}
                          alt={vehicle.model}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(vehicle.id)}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 bg-white"
                          />
                        </div>
                        <button
                          onClick={() => removeFavorite(vehicle.id)}
                          className="absolute top-2 left-2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <HeartSolidIcon className="w-5 h-5 text-red-500" />
                        </button>
                        {priceChange && priceChange.change !== 0 && (
                          <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-bold ${
                            priceChange.change < 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {priceChange.change < 0 ? '↓' : '↑'} {Math.abs(priceChange.percentage)}%
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {VEHICLE_MAKE_AR[vehicle.make]} {vehicle.model}
                            </h3>
                            <div className="text-sm text-gray-500">{vehicle.year}</div>
                          </div>
                          <div className="text-left">
                            <div className="text-lg font-bold text-primary-600">
                              {formatPrice(vehicle.price)}
                            </div>
                            <div className="text-xs text-gray-500">جنيه</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                          <span>{formatPrice(vehicle.mileage)} كم</span>
                          <span>•</span>
                          <span>{VEHICLE_BODY_TYPE_AR[vehicle.bodyType]}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {GOVERNORATE_AR[vehicle.location.governorate]}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" />
                            {vehicle.favoriteDate}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => togglePriceAlert(vehicle.id)}
                            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                              vehicle.priceAlert
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <BellIcon className="w-4 h-4" />
                            {vehicle.priceAlert ? 'تنبيه مفعل' : 'تنبيه السعر'}
                          </button>
                          <Link
                            href={`/vehicles/${vehicle.id}`}
                            className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                          >
                            <EyeIcon className="w-4 h-4" />
                            عرض
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-4">
                {sortedFavorites.map((vehicle) => {
                  const priceChange = getPriceChange(vehicle);
                  const isSelected = selectedItems.has(vehicle.id);

                  return (
                    <div
                      key={vehicle.id}
                      className={`bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all ${
                        isSelected ? 'ring-2 ring-primary-500' : ''
                      }`}
                    >
                      <div className="flex">
                        {/* Checkbox */}
                        <div className="flex items-center px-4 border-l border-gray-100">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(vehicle.id)}
                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                          />
                        </div>

                        {/* Image */}
                        <div className="relative w-48 h-36 flex-shrink-0">
                          <img
                            src={vehicle.images[0]}
                            alt={vehicle.model}
                            className="w-full h-full object-cover"
                          />
                          {priceChange && priceChange.change !== 0 && (
                            <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-bold ${
                              priceChange.change < 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}>
                              {priceChange.change < 0 ? '↓' : '↑'} {formatPrice(Math.abs(priceChange.change))} ({Math.abs(priceChange.percentage)}%)
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {VEHICLE_MAKE_AR[vehicle.make]} {vehicle.model} {vehicle.year}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span>{formatPrice(vehicle.mileage)} كم</span>
                                <span>•</span>
                                <span>{VEHICLE_BODY_TYPE_AR[vehicle.bodyType]}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPinIcon className="w-3 h-3" />
                                  {GOVERNORATE_AR[vehicle.location.governorate]}
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                أضيف للمفضلة: {vehicle.favoriteDate}
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="text-xl font-bold text-primary-600">
                                {formatPrice(vehicle.price)} جنيه
                              </div>
                              {vehicle.acceptsBarter && (
                                <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                  <ArrowPathIcon className="w-3 h-3" />
                                  مقايضة
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col justify-center gap-2 px-4 border-r border-gray-100">
                          <button
                            onClick={() => togglePriceAlert(vehicle.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              vehicle.priceAlert
                                ? 'bg-amber-100 text-amber-600'
                                : 'hover:bg-gray-100 text-gray-500'
                            }`}
                            title={vehicle.priceAlert ? 'إلغاء التنبيه' : 'تفعيل تنبيه السعر'}
                          >
                            <BellIcon className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
                            title="مشاركة"
                          >
                            <ShareIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => removeFavorite(vehicle.id)}
                            className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-colors"
                            title="إزالة من المفضلة"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                          <Link
                            href={`/vehicles/${vehicle.id}`}
                            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Price Alert Info */}
            <div className="mt-8 bg-gradient-to-l from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <BellIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">تنبيهات الأسعار</h3>
                  <p className="text-white/80 mb-4">
                    فعّل تنبيهات الأسعار على السيارات المفضلة لديك وسنخبرك فور انخفاض سعرها. لا تفوت أي فرصة!
                  </p>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>{favorites.filter(f => f.priceAlert).length} سيارات مفعّل عليها التنبيه</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
