'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PauseIcon,
  ChartBarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  SparklesIcon,
  BoltIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import {
  VEHICLE_MAKE_AR,
  VEHICLE_BODY_TYPE_AR,
  type VehicleMake,
  type VehicleBodyType,
} from '@/lib/api/vehicle-marketplace';

type ListingStatus = 'active' | 'pending' | 'paused' | 'sold' | 'expired' | 'rejected';

interface MyListing {
  id: string;
  make: VehicleMake;
  model: string;
  year: number;
  price: number;
  image: string;
  bodyType: VehicleBodyType;
  mileage: number;
  status: ListingStatus;
  createdAt: string;
  expiresAt: string;
  views: number;
  favorites: number;
  inquiries: number;
  acceptsBarter: boolean;
  location: string;
  featured: boolean;
}

const MOCK_MY_LISTINGS: MyListing[] = [
  {
    id: 'ml1',
    make: 'TOYOTA',
    model: 'كامري',
    year: 2020,
    price: 850000,
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
    bodyType: 'SEDAN',
    mileage: 45000,
    status: 'active',
    createdAt: '2024-01-01',
    expiresAt: '2024-02-01',
    views: 1250,
    favorites: 45,
    inquiries: 12,
    acceptsBarter: true,
    location: 'القاهرة',
    featured: true,
  },
  {
    id: 'ml2',
    make: 'HYUNDAI',
    model: 'توسان',
    year: 2021,
    price: 920000,
    image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400',
    bodyType: 'SUV',
    mileage: 32000,
    status: 'active',
    createdAt: '2024-01-05',
    expiresAt: '2024-02-05',
    views: 890,
    favorites: 32,
    inquiries: 8,
    acceptsBarter: false,
    location: 'الجيزة',
    featured: false,
  },
  {
    id: 'ml3',
    make: 'NISSAN',
    model: 'سنترا',
    year: 2022,
    price: 780000,
    image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
    bodyType: 'SEDAN',
    mileage: 18000,
    status: 'pending',
    createdAt: '2024-01-10',
    expiresAt: '2024-02-10',
    views: 0,
    favorites: 0,
    inquiries: 0,
    acceptsBarter: true,
    location: 'القاهرة',
    featured: false,
  },
  {
    id: 'ml4',
    make: 'KIA',
    model: 'سبورتاج',
    year: 2019,
    price: 720000,
    image: 'https://images.unsplash.com/photo-1619767886558-efdc259b6e09?w=400',
    bodyType: 'SUV',
    mileage: 65000,
    status: 'sold',
    createdAt: '2023-12-01',
    expiresAt: '2024-01-01',
    views: 2100,
    favorites: 78,
    inquiries: 25,
    acceptsBarter: false,
    location: 'الإسكندرية',
    featured: false,
  },
  {
    id: 'ml5',
    make: 'CHEVROLET',
    model: 'كروز',
    year: 2018,
    price: 450000,
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
    bodyType: 'SEDAN',
    mileage: 95000,
    status: 'paused',
    createdAt: '2023-11-15',
    expiresAt: '2024-01-15',
    views: 560,
    favorites: 12,
    inquiries: 3,
    acceptsBarter: true,
    location: 'المنصورة',
    featured: false,
  },
];

const STATUS_CONFIG: Record<ListingStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircleIcon }> = {
  active: { label: 'نشط', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon },
  pending: { label: 'قيد المراجعة', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: ClockIcon },
  paused: { label: 'متوقف', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: PauseIcon },
  sold: { label: 'تم البيع', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircleIcon },
  expired: { label: 'منتهي', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircleIcon },
  rejected: { label: 'مرفوض', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircleIcon },
};

export default function MyListingsPage() {
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all');
  const [showActions, setShowActions] = useState<string | null>(null);

  const filteredListings = MOCK_MY_LISTINGS.filter(listing => {
    if (statusFilter !== 'all' && listing.status !== statusFilter) return false;
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const totalViews = MOCK_MY_LISTINGS.reduce((sum, l) => sum + l.views, 0);
  const totalFavorites = MOCK_MY_LISTINGS.reduce((sum, l) => sum + l.favorites, 0);
  const totalInquiries = MOCK_MY_LISTINGS.reduce((sum, l) => sum + l.inquiries, 0);

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
                <h1 className="text-xl font-bold text-gray-900">إعلاناتي</h1>
                <p className="text-sm text-gray-500">إدارة إعلانات السيارات الخاصة بك</p>
              </div>
            </div>
            <Link
              href="/vehicles/sell"
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              إضافة إعلان جديد
            </Link>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatPrice(totalViews)}</div>
                <div className="text-sm text-gray-500">مشاهدة</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <HeartIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatPrice(totalFavorites)}</div>
                <div className="text-sm text-gray-500">إعجاب</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalInquiries}</div>
                <div className="text-sm text-gray-500">استفسار</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{MOCK_MY_LISTINGS.length}</div>
                <div className="text-sm text-gray-500">إعلان</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'الكل', count: MOCK_MY_LISTINGS.length },
            { id: 'active', label: 'نشط', count: MOCK_MY_LISTINGS.filter(l => l.status === 'active').length },
            { id: 'pending', label: 'قيد المراجعة', count: MOCK_MY_LISTINGS.filter(l => l.status === 'pending').length },
            { id: 'paused', label: 'متوقف', count: MOCK_MY_LISTINGS.filter(l => l.status === 'paused').length },
            { id: 'sold', label: 'تم البيع', count: MOCK_MY_LISTINGS.filter(l => l.status === 'sold').length },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id as ListingStatus | 'all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                statusFilter === filter.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {filter.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                statusFilter === filter.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChartBarIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد إعلانات</h3>
            <p className="text-gray-500 mb-6">لم تقم بنشر أي إعلانات بعد</p>
            <Link
              href="/vehicles/sell"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              أضف إعلانك الأول
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const statusConfig = STATUS_CONFIG[listing.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Image */}
                    <div className="relative w-full sm:w-56 h-48 sm:h-auto flex-shrink-0">
                      <img
                        src={listing.image}
                        alt={listing.model}
                        className="w-full h-full object-cover"
                      />
                      {listing.featured && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                          <SparklesIcon className="w-3 h-3" />
                          مميز
                        </div>
                      )}
                      <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3 inline ml-1" />
                        {statusConfig.label}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {VEHICLE_MAKE_AR[listing.make]} {listing.model} {listing.year}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span>{formatPrice(listing.mileage)} كم</span>
                            <span>•</span>
                            <span>{VEHICLE_BODY_TYPE_AR[listing.bodyType]}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-3 h-3" />
                              {listing.location}
                            </span>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-primary-600">
                            {formatPrice(listing.price)} جنيه
                          </div>
                          {listing.acceptsBarter && (
                            <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                              <ArrowPathIcon className="w-3 h-3" />
                              يقبل المقايضة
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 py-3 border-t border-b border-gray-100 my-3">
                        <div className="flex items-center gap-2 text-sm">
                          <EyeIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{formatPrice(listing.views)}</span>
                          <span className="text-gray-400">مشاهدة</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <HeartIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{listing.favorites}</span>
                          <span className="text-gray-400">إعجاب</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{listing.inquiries}</span>
                          <span className="text-gray-400">استفسار</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4 inline ml-1" />
                          ينتهي: {listing.expiresAt}
                        </div>

                        <div className="flex items-center gap-2">
                          {listing.status === 'active' && (
                            <>
                              <button className="px-3 py-2 text-amber-600 hover:bg-amber-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                                <BoltIcon className="w-4 h-4" />
                                ترقية
                              </button>
                              <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                                <PauseIcon className="w-4 h-4" />
                                إيقاف
                              </button>
                            </>
                          )}
                          {listing.status === 'paused' && (
                            <button className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                              <CheckCircleIcon className="w-4 h-4" />
                              تفعيل
                            </button>
                          )}
                          <button className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                            <PencilIcon className="w-4 h-4" />
                            تعديل
                          </button>
                          <button className="px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            عرض
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setShowActions(showActions === listing.id ? null : listing.id)}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>
                            {showActions === listing.id && (
                              <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 w-40 z-10">
                                <button className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                  <ChartBarIcon className="w-4 h-4" />
                                  الإحصائيات
                                </button>
                                <button className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                                  <CurrencyDollarIcon className="w-4 h-4" />
                                  تم البيع
                                </button>
                                <button className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                  <TrashIcon className="w-4 h-4" />
                                  حذف
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Promotion Banner */}
        <div className="mt-8 bg-gradient-to-l from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">زد مبيعاتك مع الإعلان المميز</h3>
                <p className="text-white/80">اجعل إعلانك يظهر في أعلى نتائج البحث واحصل على مشاهدات أكثر بـ 10x</p>
              </div>
            </div>
            <button className="px-6 py-3 bg-white text-amber-600 rounded-xl font-bold hover:bg-amber-50 transition-colors">
              اشترك الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
