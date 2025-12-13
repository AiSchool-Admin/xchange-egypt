'use client';

/**
 * Cars Barter Marketplace Page
 * صفحة سوق مقايضة السيارات
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
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
  accepts_barter: boolean;
  barter_preferences: any;
  seller_type: string;
  verification_level: string;
  created_at: string;
  user: {
    id: string;
    name: string;
  };
}

// بيانات تجريبية للسيارات المتاحة للمقايضة
const mockBarterListings: CarListing[] = [
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
    accepts_barter: true,
    barter_preferences: {
      types: ['CAR_TO_CAR'],
      preferred_makes: ['Honda', 'Hyundai', 'Kia'],
      min_year: 2020,
      accepts_cash_difference: true
    },
    seller_type: 'OWNER',
    verification_level: 'VERIFIED',
    created_at: '2024-12-10T10:00:00Z',
    user: { id: '1', name: 'أحمد محمد' }
  },
  {
    id: '2',
    make: 'BMW',
    model: '320i',
    year: 2021,
    price: 1200000,
    mileage: 45000,
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    body_type: 'SEDAN',
    exterior_color: 'أسود معدني',
    condition: 'EXCELLENT',
    city: 'الإسكندرية',
    governorate: 'الإسكندرية',
    images: ['/cars/bmw.jpg'],
    accepts_barter: true,
    barter_preferences: {
      types: ['CAR_TO_CAR', 'CAR_TO_PROPERTY'],
      preferred_makes: ['Mercedes-Benz', 'Audi'],
      min_year: 2019,
      accepts_cash_difference: true
    },
    seller_type: 'OWNER',
    verification_level: 'INSPECTED',
    created_at: '2024-12-09T15:00:00Z',
    user: { id: '2', name: 'محمد علي' }
  },
  {
    id: '3',
    make: 'Hyundai',
    model: 'Tucson',
    year: 2023,
    price: 950000,
    mileage: 15000,
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    body_type: 'SUV',
    exterior_color: 'رمادي',
    condition: 'LIKE_NEW',
    city: 'الجيزة',
    governorate: 'الجيزة',
    images: ['/cars/tucson.jpg'],
    accepts_barter: true,
    barter_preferences: {
      types: ['CAR_TO_CAR'],
      preferred_makes: ['Toyota', 'Nissan', 'Kia'],
      min_year: 2021,
      accepts_cash_difference: true
    },
    seller_type: 'DEALER',
    verification_level: 'CERTIFIED',
    created_at: '2024-12-08T12:00:00Z',
    user: { id: '3', name: 'معرض النيل للسيارات' }
  },
  {
    id: '4',
    make: 'Mercedes-Benz',
    model: 'C200',
    year: 2020,
    price: 1400000,
    mileage: 60000,
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    body_type: 'SEDAN',
    exterior_color: 'فضي',
    condition: 'GOOD',
    city: 'المنصورة',
    governorate: 'الدقهلية',
    images: ['/cars/mercedes.jpg'],
    accepts_barter: true,
    barter_preferences: {
      types: ['CAR_TO_CAR', 'CAR_TO_PROPERTY'],
      preferred_makes: ['BMW', 'Audi', 'Lexus'],
      min_year: 2018,
      accepts_cash_difference: true
    },
    seller_type: 'OWNER',
    verification_level: 'VERIFIED',
    created_at: '2024-12-07T09:00:00Z',
    user: { id: '4', name: 'خالد أحمد' }
  },
  {
    id: '5',
    make: 'Kia',
    model: 'Sportage',
    year: 2022,
    price: 780000,
    mileage: 28000,
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    body_type: 'SUV',
    exterior_color: 'أحمر',
    condition: 'EXCELLENT',
    city: 'طنطا',
    governorate: 'الغربية',
    images: ['/cars/sportage.jpg'],
    accepts_barter: true,
    barter_preferences: {
      types: ['CAR_TO_CAR'],
      preferred_makes: ['Hyundai', 'Toyota', 'Nissan'],
      min_year: 2020,
      accepts_cash_difference: false
    },
    seller_type: 'SHOWROOM',
    verification_level: 'CERTIFIED',
    created_at: '2024-12-06T14:00:00Z',
    user: { id: '5', name: 'شركة الدلتا للسيارات' }
  },
  {
    id: '6',
    make: 'Nissan',
    model: 'Sentra',
    year: 2021,
    price: 520000,
    mileage: 40000,
    fuel_type: 'PETROL',
    transmission: 'AUTOMATIC',
    body_type: 'SEDAN',
    exterior_color: 'أزرق',
    condition: 'GOOD',
    city: 'أسيوط',
    governorate: 'أسيوط',
    images: ['/cars/sentra.jpg'],
    accepts_barter: true,
    barter_preferences: {
      types: ['CAR_TO_CAR'],
      preferred_makes: ['Toyota', 'Hyundai', 'Kia', 'Honda'],
      min_year: 2019,
      accepts_cash_difference: true
    },
    seller_type: 'OWNER',
    verification_level: 'BASIC',
    created_at: '2024-12-05T11:00:00Z',
    user: { id: '6', name: 'سامي حسن' }
  }
];

// الماركات المتاحة
const availableMakes = ['Toyota', 'BMW', 'Mercedes-Benz', 'Hyundai', 'Kia', 'Nissan', 'Honda', 'Audi', 'Chevrolet', 'Ford'];

// أنواع الهيكل
const bodyTypes = [
  { value: 'SEDAN', label: 'سيدان' },
  { value: 'SUV', label: 'SUV' },
  { value: 'HATCHBACK', label: 'هاتشباك' },
  { value: 'COUPE', label: 'كوبيه' },
  { value: 'PICKUP', label: 'بيك أب' },
  { value: 'VAN', label: 'فان' }
];

// المحافظات
const governorates = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الغربية', 'الشرقية', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر'];

export default function CarsBarterPage() {
  const [listings, setListings] = useState<CarListing[]>(mockBarterListings);
  const [filteredListings, setFilteredListings] = useState<CarListing[]>(mockBarterListings);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedBodyType, setSelectedBodyType] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [barterType, setBarterType] = useState<string>(''); // CAR_TO_CAR, CAR_TO_PROPERTY
  const [acceptsCashDifference, setAcceptsCashDifference] = useState<boolean | null>(null);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [yearRange, setYearRange] = useState({ min: '', max: '' });

  // Barter Proposal Modal
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<CarListing | null>(null);
  const [proposalData, setProposalData] = useState({
    offered_car_id: '',
    offered_car_description: '',
    cash_difference: 0,
    message: ''
  });

  // Apply filters
  useEffect(() => {
    let filtered = [...listings];

    if (selectedMake) {
      filtered = filtered.filter(l => l.make === selectedMake);
    }
    if (selectedBodyType) {
      filtered = filtered.filter(l => l.body_type === selectedBodyType);
    }
    if (selectedGovernorate) {
      filtered = filtered.filter(l => l.governorate === selectedGovernorate);
    }
    if (barterType) {
      filtered = filtered.filter(l => l.barter_preferences?.types?.includes(barterType));
    }
    if (acceptsCashDifference !== null) {
      filtered = filtered.filter(l => l.barter_preferences?.accepts_cash_difference === acceptsCashDifference);
    }
    if (priceRange.min) {
      filtered = filtered.filter(l => l.price >= parseInt(priceRange.min));
    }
    if (priceRange.max) {
      filtered = filtered.filter(l => l.price <= parseInt(priceRange.max));
    }
    if (yearRange.min) {
      filtered = filtered.filter(l => l.year >= parseInt(yearRange.min));
    }
    if (yearRange.max) {
      filtered = filtered.filter(l => l.year <= parseInt(yearRange.max));
    }

    setFilteredListings(filtered);
  }, [listings, selectedMake, selectedBodyType, selectedGovernorate, barterType, acceptsCashDifference, priceRange, yearRange]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ar-EG').format(mileage);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      'NEW': 'جديدة',
      'LIKE_NEW': 'كالجديدة',
      'EXCELLENT': 'ممتازة',
      'GOOD': 'جيدة',
      'FAIR': 'مقبولة',
      'POOR': 'تحتاج صيانة'
    };
    return labels[condition] || condition;
  };

  const getVerificationBadge = (level: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'BASIC': { label: 'أساسي', color: 'bg-gray-100 text-gray-800' },
      'VERIFIED': { label: 'موثق', color: 'bg-blue-100 text-blue-800' },
      'INSPECTED': { label: 'مفحوص', color: 'bg-green-100 text-green-800' },
      'CERTIFIED': { label: 'معتمد', color: 'bg-purple-100 text-purple-800' }
    };
    return badges[level] || badges['BASIC'];
  };

  const getSellerTypeBadge = (type: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      'OWNER': { label: 'مالك', color: 'bg-emerald-100 text-emerald-800' },
      'DEALER': { label: 'تاجر', color: 'bg-amber-100 text-amber-800' },
      'SHOWROOM': { label: 'معرض', color: 'bg-indigo-100 text-indigo-800' }
    };
    return badges[type] || badges['OWNER'];
  };

  const openProposalModal = (listing: CarListing) => {
    setSelectedListing(listing);
    setProposalData({
      offered_car_id: '',
      offered_car_description: '',
      cash_difference: 0,
      message: ''
    });
    setShowProposalModal(true);
  };

  const submitProposal = async () => {
    if (!selectedListing) return;

    // في الإنتاج سيتم إرسال العرض للـ API
    alert(`تم إرسال عرض المقايضة بنجاح!

السيارة المطلوبة: ${selectedListing.make} ${selectedListing.model} ${selectedListing.year}
وصف سيارتك: ${proposalData.offered_car_description}
فرق السعر: ${formatPrice(proposalData.cash_difference)} جنيه
رسالتك: ${proposalData.message}`);

    setShowProposalModal(false);
  };

  const clearFilters = () => {
    setSelectedMake('');
    setSelectedBodyType('');
    setSelectedGovernorate('');
    setBarterType('');
    setAcceptsCashDifference(null);
    setPriceRange({ min: '', max: '' });
    setYearRange({ min: '', max: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <h1 className="text-4xl font-bold">سوق مقايضة السيارات</h1>
            </div>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-6">
              بادل سيارتك بسيارة أخرى أو عقار - مع إمكانية دفع أو استلام فرق السعر
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/cars/sell"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                أضف سيارتك للمقايضة
              </Link>
              <Link
                href="/cars"
                className="bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors border border-purple-500"
              >
                تصفح جميع السيارات
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How Barter Works */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-center mb-8">كيف تعمل المقايضة؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">اختر السيارة</h3>
              <p className="text-gray-600 text-sm">تصفح السيارات المتاحة للمقايضة واختر ما يناسبك</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">قدم عرضك</h3>
              <p className="text-gray-600 text-sm">أرسل تفاصيل سيارتك وحدد فرق السعر إن وجد</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">تفاوض</h3>
              <p className="text-gray-600 text-sm">تواصل مع البائع للاتفاق على التفاصيل النهائية</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">أتمم الصفقة</h3>
              <p className="text-gray-600 text-sm">استخدم نظام الضمان الآمن لإتمام المقايضة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">تصفية النتائج</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 hover:text-purple-800"
                >
                  مسح الكل
                </button>
              </div>

              {/* Barter Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع المقايضة</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="barterType"
                      value=""
                      checked={barterType === ''}
                      onChange={() => setBarterType('')}
                      className="text-purple-600"
                    />
                    <span>الكل</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="barterType"
                      value="CAR_TO_CAR"
                      checked={barterType === 'CAR_TO_CAR'}
                      onChange={() => setBarterType('CAR_TO_CAR')}
                      className="text-purple-600"
                    />
                    <span>سيارة بسيارة</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="barterType"
                      value="CAR_TO_PROPERTY"
                      checked={barterType === 'CAR_TO_PROPERTY'}
                      onChange={() => setBarterType('CAR_TO_PROPERTY')}
                      className="text-purple-600"
                    />
                    <span>سيارة بعقار</span>
                  </label>
                </div>
              </div>

              {/* Cash Difference */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">قبول فرق السعر</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="cashDiff"
                      checked={acceptsCashDifference === null}
                      onChange={() => setAcceptsCashDifference(null)}
                      className="text-purple-600"
                    />
                    <span>الكل</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="cashDiff"
                      checked={acceptsCashDifference === true}
                      onChange={() => setAcceptsCashDifference(true)}
                      className="text-purple-600"
                    />
                    <span>يقبل فرق السعر</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="cashDiff"
                      checked={acceptsCashDifference === false}
                      onChange={() => setAcceptsCashDifference(false)}
                      className="text-purple-600"
                    />
                    <span>مقايضة فقط</span>
                  </label>
                </div>
              </div>

              {/* Make */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">الماركة</label>
                <select
                  value={selectedMake}
                  onChange={(e) => setSelectedMake(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">جميع الماركات</option>
                  {availableMakes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>

              {/* Body Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الهيكل</label>
                <select
                  value={selectedBodyType}
                  onChange={(e) => setSelectedBodyType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">جميع الأنواع</option>
                  {bodyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Governorate */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة</label>
                <select
                  value={selectedGovernorate}
                  onChange={(e) => setSelectedGovernorate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">جميع المحافظات</option>
                  {governorates.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">نطاق السعر (جنيه)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="من"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="إلى"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Year Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">سنة الصنع</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="من"
                    value={yearRange.min}
                    onChange={(e) => setYearRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="إلى"
                    value={yearRange.max}
                    onChange={(e) => setYearRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {filteredListings.length} سيارة متاحة للمقايضة
              </h2>
              <select className="border border-gray-300 rounded-lg px-4 py-2">
                <option>الأحدث أولاً</option>
                <option>السعر: من الأقل للأعلى</option>
                <option>السعر: من الأعلى للأقل</option>
                <option>الموديل: الأحدث أولاً</option>
              </select>
            </div>

            {/* Listings */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">جاري التحميل...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-600 mb-4">جرب تغيير معايير البحث</p>
                <button
                  onClick={clearFilters}
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredListings.map((listing) => {
                  const verificationBadge = getVerificationBadge(listing.verification_level);
                  const sellerBadge = getSellerTypeBadge(listing.seller_type);

                  return (
                    <div key={listing.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Image */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-indigo-100">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg className="w-20 h-20 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${verificationBadge.color}`}>
                            {verificationBadge.label}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${sellerBadge.color}`}>
                            {sellerBadge.label}
                          </span>
                        </div>

                        {/* Barter Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            مقايضة
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg">
                            {listing.make} {listing.model}
                          </h3>
                          <span className="text-sm text-gray-500">{listing.year}</span>
                        </div>

                        <div className="text-2xl font-bold text-purple-600 mb-3">
                          {formatPrice(listing.price)} جنيه
                        </div>

                        {/* Quick Info */}
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {formatMileage(listing.mileage)} كم
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {getConditionLabel(listing.condition)}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {listing.city}
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {listing.user.name}
                          </div>
                        </div>

                        {/* Barter Preferences */}
                        <div className="bg-purple-50 rounded-lg p-3 mb-4">
                          <h4 className="text-sm font-medium text-purple-800 mb-2">يقبل المقايضة بـ:</h4>
                          <div className="flex flex-wrap gap-2">
                            {listing.barter_preferences?.types?.includes('CAR_TO_CAR') && (
                              <span className="bg-white text-purple-700 px-2 py-1 rounded text-xs">
                                سيارة
                              </span>
                            )}
                            {listing.barter_preferences?.types?.includes('CAR_TO_PROPERTY') && (
                              <span className="bg-white text-purple-700 px-2 py-1 rounded text-xs">
                                عقار
                              </span>
                            )}
                            {listing.barter_preferences?.accepts_cash_difference && (
                              <span className="bg-white text-purple-700 px-2 py-1 rounded text-xs">
                                + فرق نقدي
                              </span>
                            )}
                          </div>
                          {listing.barter_preferences?.preferred_makes?.length > 0 && (
                            <p className="text-xs text-purple-600 mt-2">
                              يفضل: {listing.barter_preferences.preferred_makes.slice(0, 3).join('، ')}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link
                            href={`/cars/${listing.id}`}
                            className="flex-1 text-center py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium"
                          >
                            عرض التفاصيل
                          </Link>
                          <button
                            onClick={() => openProposalModal(listing)}
                            className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            قدم عرض مقايضة
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barter Proposal Modal */}
      {showProposalModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">عرض مقايضة</h2>
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Target Car */}
              <div className="bg-purple-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-purple-600 mb-1">السيارة المطلوبة</p>
                <p className="font-bold text-lg">
                  {selectedListing.make} {selectedListing.model} {selectedListing.year}
                </p>
                <p className="text-purple-700 font-semibold">
                  {formatPrice(selectedListing.price)} جنيه
                </p>
              </div>

              {/* Your Car */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف سيارتك للمقايضة *
                </label>
                <textarea
                  value={proposalData.offered_car_description}
                  onChange={(e) => setProposalData(prev => ({ ...prev, offered_car_description: e.target.value }))}
                  placeholder="مثال: تويوتا كورولا 2021 - فضي - أوتوماتيك - 40,000 كم - حالة ممتازة"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 resize-none"
                  required
                />
              </div>

              {/* Cash Difference */}
              {selectedListing.barter_preferences?.accepts_cash_difference && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    فرق السعر (جنيه)
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setProposalData(prev => ({ ...prev, cash_difference: Math.abs(prev.cash_difference) * -1 }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        proposalData.cash_difference < 0
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      أدفع
                    </button>
                    <input
                      type="number"
                      value={Math.abs(proposalData.cash_difference)}
                      onChange={(e) => setProposalData(prev => ({
                        ...prev,
                        cash_difference: prev.cash_difference >= 0
                          ? parseInt(e.target.value) || 0
                          : -(parseInt(e.target.value) || 0)
                      }))}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-center"
                      placeholder="0"
                    />
                    <button
                      onClick={() => setProposalData(prev => ({ ...prev, cash_difference: Math.abs(prev.cash_difference) }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        proposalData.cash_difference > 0
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      أستلم
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {proposalData.cash_difference > 0
                      ? `ستستلم ${formatPrice(proposalData.cash_difference)} جنيه بالإضافة لسيارتك`
                      : proposalData.cash_difference < 0
                      ? `ستدفع ${formatPrice(Math.abs(proposalData.cash_difference))} جنيه بالإضافة لسيارتك`
                      : 'مقايضة بدون فرق نقدي'
                    }
                  </p>
                </div>
              )}

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رسالة للبائع (اختياري)
                </label>
                <textarea
                  value={proposalData.message}
                  onChange={(e) => setProposalData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="أضف أي تفاصيل إضافية عن عرضك..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 h-20 resize-none"
                />
              </div>

              {/* Info */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">كيف تعمل المقايضة الآمنة؟</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>سيتم إرسال عرضك للبائع للموافقة</li>
                      <li>عند القبول، يتم فحص السيارتين في مركز معتمد</li>
                      <li>يتم إيداع فرق السعر (إن وجد) في نظام الضمان</li>
                      <li>عمولة 1.5% على كل طرف</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={submitProposal}
                  disabled={!proposalData.offered_car_description}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  إرسال العرض
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
