'use client';

/**
 * My Car Listings Page
 * صفحة إعلاناتي للسيارات
 */

import { useState } from 'react';
import Link from 'next/link';

interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  exterior_color: string;
  condition: string;
  city: string;
  governorate: string;
  images: string[];
  status: string;
  accepts_barter: boolean;
  verification_level: string;
  views_count: number;
  inquiries_count: number;
  favorites_count: number;
  created_at: string;
  expires_at: string;
}

// بيانات تجريبية لإعلانات المستخدم
const mockMyListings: CarListing[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    price: 850000,
    mileage: 35000,
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    body_type: 'SEDAN',
    exterior_color: 'أبيض لؤلؤي',
    condition: 'EXCELLENT',
    city: 'القاهرة',
    governorate: 'القاهرة',
    images: ['/cars/camry.jpg'],
    status: 'ACTIVE',
    accepts_barter: true,
    verification_level: 'VERIFIED',
    views_count: 245,
    inquiries_count: 12,
    favorites_count: 8,
    created_at: '2024-12-01T10:00:00Z',
    expires_at: '2025-01-01T10:00:00Z',
  },
  {
    id: '2',
    make: 'Hyundai',
    model: 'Tucson',
    year: 2021,
    price: 680000,
    mileage: 55000,
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    body_type: 'SUV',
    exterior_color: 'فضي',
    condition: 'GOOD',
    city: 'الجيزة',
    governorate: 'الجيزة',
    images: ['/cars/tucson.jpg'],
    status: 'PENDING_REVIEW',
    accepts_barter: false,
    verification_level: 'BASIC',
    views_count: 0,
    inquiries_count: 0,
    favorites_count: 0,
    created_at: '2024-12-10T15:00:00Z',
    expires_at: '2025-01-10T15:00:00Z',
  },
  {
    id: '3',
    make: 'BMW',
    model: '320i',
    year: 2020,
    price: 1100000,
    mileage: 70000,
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    body_type: 'SEDAN',
    exterior_color: 'أسود',
    condition: 'GOOD',
    city: 'الإسكندرية',
    governorate: 'الإسكندرية',
    images: ['/cars/bmw.jpg'],
    status: 'SOLD',
    accepts_barter: true,
    verification_level: 'INSPECTED',
    views_count: 520,
    inquiries_count: 35,
    favorites_count: 22,
    created_at: '2024-11-15T10:00:00Z',
    expires_at: '2024-12-15T10:00:00Z',
  },
  {
    id: '4',
    make: 'Kia',
    model: 'Sportage',
    year: 2023,
    price: 920000,
    mileage: 18000,
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    body_type: 'SUV',
    exterior_color: 'أحمر',
    condition: 'LIKE_NEW',
    city: 'القاهرة',
    governorate: 'القاهرة',
    images: ['/cars/sportage.jpg'],
    status: 'EXPIRED',
    accepts_barter: true,
    verification_level: 'CERTIFIED',
    views_count: 180,
    inquiries_count: 8,
    favorites_count: 5,
    created_at: '2024-10-01T10:00:00Z',
    expires_at: '2024-11-01T10:00:00Z',
  },
];

const statusFilters = [
  { value: '', label: 'جميع الحالات' },
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'PENDING_REVIEW', label: 'قيد المراجعة' },
  { value: 'SOLD', label: 'تم البيع' },
  { value: 'EXPIRED', label: 'منتهي' },
  { value: 'INACTIVE', label: 'غير نشط' },
];

export default function MyListingsPage() {
  const [listings, setListings] = useState<CarListing[]>(mockMyListings);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);

  const filteredListings = selectedStatus
    ? listings.filter(l => l.status === selectedStatus)
    : listings;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; bg: string }> = {
      'ACTIVE': { label: 'نشط', color: 'text-green-800', bg: 'bg-green-100' },
      'PENDING_REVIEW': { label: 'قيد المراجعة', color: 'text-yellow-800', bg: 'bg-yellow-100' },
      'SOLD': { label: 'تم البيع', color: 'text-blue-800', bg: 'bg-blue-100' },
      'EXPIRED': { label: 'منتهي', color: 'text-red-800', bg: 'bg-red-100' },
      'INACTIVE': { label: 'غير نشط', color: 'text-gray-800', bg: 'bg-gray-100' },
      'REJECTED': { label: 'مرفوض', color: 'text-red-800', bg: 'bg-red-100' },
    };
    return badges[status] || { label: status, color: 'text-gray-800', bg: 'bg-gray-100' };
  };

  const getVerificationBadge = (level: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'BASIC': { label: 'أساسي', color: 'bg-gray-100 text-gray-800' },
      'VERIFIED': { label: 'موثق', color: 'bg-blue-100 text-blue-800' },
      'INSPECTED': { label: 'مفحوص', color: 'bg-green-100 text-green-800' },
      'CERTIFIED': { label: 'معتمد', color: 'bg-purple-100 text-purple-800' },
    };
    return badges[level] || badges['BASIC'];
  };

  const handleDelete = (listing: CarListing) => {
    setSelectedListing(listing);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedListing) {
      setListings(listings.filter(l => l.id !== selectedListing.id));
      setShowDeleteModal(false);
      setSelectedListing(null);
    }
  };

  const handleRenew = (listing: CarListing) => {
    const newExpiry = new Date();
    newExpiry.setMonth(newExpiry.getMonth() + 1);
    setListings(listings.map(l =>
      l.id === listing.id
        ? { ...l, status: 'ACTIVE', expires_at: newExpiry.toISOString() }
        : l
    ));
    alert(`تم تجديد إعلان ${listing.make} ${listing.model} بنجاح!`);
  };

  const handleMarkAsSold = (listing: CarListing) => {
    setListings(listings.map(l =>
      l.id === listing.id
        ? { ...l, status: 'SOLD' }
        : l
    ));
  };

  // Statistics
  const stats = {
    total: listings.length,
    active: listings.filter(l => l.status === 'ACTIVE').length,
    sold: listings.filter(l => l.status === 'SOLD').length,
    totalViews: listings.reduce((sum, l) => sum + l.views_count, 0),
    totalInquiries: listings.reduce((sum, l) => sum + l.inquiries_count, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">إعلاناتي</h1>
              <p className="text-gray-600">إدارة إعلانات السيارات الخاصة بك</p>
            </div>
            <Link
              href="/cars/sell"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة إعلان جديد
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">إجمالي الإعلانات</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">إعلانات نشطة</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
            <div className="text-sm text-gray-500">تم بيعها</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{stats.totalViews}</div>
            <div className="text-sm text-gray-500">إجمالي المشاهدات</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{stats.totalInquiries}</div>
            <div className="text-sm text-gray-500">إجمالي الاستفسارات</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-700">تصفية:</span>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedStatus === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد إعلانات</h3>
            <p className="text-gray-600 mb-4">
              {selectedStatus ? 'لا توجد إعلانات بهذه الحالة' : 'لم تقم بإضافة أي إعلانات بعد'}
            </p>
            <Link
              href="/cars/sell"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة أول إعلان
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => {
              const statusBadge = getStatusBadge(listing.status);
              const verificationBadge = getVerificationBadge(listing.verification_level);
              const isExpired = new Date(listing.expires_at) < new Date();

              return (
                <div key={listing.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-48 h-48 md:h-auto bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-bold">
                              {listing.make} {listing.model} {listing.year}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.color}`}>
                              {statusBadge.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${verificationBadge.color}`}>
                              {verificationBadge.label}
                            </span>
                          </div>

                          <div className="text-xl font-bold text-blue-600 mb-3">
                            {formatPrice(listing.price)} جنيه
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>{formatPrice(listing.mileage)} كم</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span>{listing.city}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{formatDate(listing.created_at)}</span>
                            </div>
                            {listing.accepts_barter && (
                              <div className="flex items-center gap-1 text-purple-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                </svg>
                                <span>يقبل المقايضة</span>
                              </div>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1 text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>{listing.views_count} مشاهدة</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span>{listing.inquiries_count} استفسار</span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                              <span>{listing.favorites_count} مفضلة</span>
                            </div>
                          </div>

                          {/* Expiry Warning */}
                          {listing.status === 'ACTIVE' && isExpired && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                              انتهت صلاحية الإعلان في {formatDate(listing.expires_at)}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row md:flex-col gap-2">
                          <Link
                            href={`/cars/${listing.id}`}
                            className="flex-1 md:flex-none px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                          >
                            عرض
                          </Link>
                          {listing.status !== 'SOLD' && (
                            <Link
                              href={`/cars/edit/${listing.id}`}
                              className="flex-1 md:flex-none px-4 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center"
                            >
                              تعديل
                            </Link>
                          )}
                          {listing.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleMarkAsSold(listing)}
                              className="flex-1 md:flex-none px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              تم البيع
                            </button>
                          )}
                          {(listing.status === 'EXPIRED' || isExpired) && (
                            <button
                              onClick={() => handleRenew(listing)}
                              className="flex-1 md:flex-none px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                              تجديد
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(listing)}
                            className="flex-1 md:flex-none px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link href="/cars/my-transactions" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">معاملاتي</h3>
              <p className="text-sm text-gray-500">تتبع عمليات البيع والشراء</p>
            </div>
          </Link>
          <Link href="/cars/my-barter" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">عروض المقايضة</h3>
              <p className="text-sm text-gray-500">إدارة عروض التبادل</p>
            </div>
          </Link>
          <Link href="/cars/calculator" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">حاسبة السعر</h3>
              <p className="text-sm text-gray-500">قيم سيارتك</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">حذف الإعلان</h2>
              <p className="text-gray-600 mb-6">
                هل أنت متأكد من حذف إعلان {selectedListing.make} {selectedListing.model}؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
