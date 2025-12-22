'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ClockIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  StarIcon,
  ChartBarIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  FunnelIcon,
  CalendarDaysIcon,
  TrophyIcon,
  FireIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Provider configuration
const PROVIDERS = {
  UBER: { name: 'Uber', nameAr: 'أوبر', color: 'bg-black', textColor: 'text-white', logo: '🚗', gradient: 'from-gray-900 to-black' },
  CAREEM: { name: 'Careem', nameAr: 'كريم', color: 'bg-green-600', textColor: 'text-white', logo: '🚕', gradient: 'from-green-500 to-green-700' },
  BOLT: { name: 'Bolt', nameAr: 'بولت', color: 'bg-[#34D186]', textColor: 'text-white', logo: '⚡', gradient: 'from-emerald-400 to-emerald-600' },
  INDRIVE: { name: 'inDrive', nameAr: 'إن درايف', color: 'bg-[#C8F026]', textColor: 'text-black', logo: '🤝', gradient: 'from-lime-400 to-lime-500' },
  DIDI: { name: 'DiDi', nameAr: 'ديدي', color: 'bg-orange-500', textColor: 'text-white', logo: '🔶', gradient: 'from-orange-400 to-orange-600' },
  SWVL: { name: 'Swvl', nameAr: 'سويفل', color: 'bg-red-600', textColor: 'text-white', logo: '🚌', gradient: 'from-red-500 to-red-700' },
  HALAN: { name: 'Halan', nameAr: 'هلان', color: 'bg-yellow-500', textColor: 'text-black', logo: '🛵', gradient: 'from-yellow-400 to-yellow-600' },
};

interface RideHistory {
  id: string;
  date: string;
  time: string;
  pickupAddress: string;
  pickupAddressAr: string;
  dropoffAddress: string;
  dropoffAddressAr: string;
  provider: keyof typeof PROVIDERS;
  vehicleType: string;
  vehicleTypeAr: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  distanceKm: number;
  durationMin: number;
  status: 'completed' | 'cancelled' | 'in_progress';
  rating?: number;
  review?: string;
  driverName?: string;
  driverRating?: number;
  vehiclePlate?: string;
  vehicleModel?: string;
  paymentMethod: string;
  pricePerKm?: number;
}

// Sample ride history
const SAMPLE_RIDES: RideHistory[] = [
  {
    id: '1',
    date: '2024-01-18',
    time: '14:30',
    pickupAddress: 'Cairo International Airport Terminal 2',
    pickupAddressAr: 'مطار القاهرة الدولي - صالة 2',
    dropoffAddress: 'Downtown Cairo, Tahrir Square',
    dropoffAddressAr: 'وسط البلد، ميدان التحرير',
    provider: 'UBER',
    vehicleType: 'UberX',
    vehicleTypeAr: 'أوبر إكس',
    price: 95,
    originalPrice: 110,
    discount: 15,
    distanceKm: 22.5,
    durationMin: 45,
    status: 'completed',
    rating: 5,
    review: 'سائق محترم والسيارة نظيفة',
    driverName: 'أحمد محمد',
    driverRating: 4.9,
    vehiclePlate: 'أ ب ج 1234',
    vehicleModel: 'Hyundai Accent 2022',
    paymentMethod: 'Cash',
    pricePerKm: 4.22
  },
  {
    id: '2',
    date: '2024-01-17',
    time: '09:15',
    pickupAddress: 'Maadi, Road 9',
    pickupAddressAr: 'المعادي، شارع 9',
    dropoffAddress: 'Smart Village, Building B2',
    dropoffAddressAr: 'القرية الذكية، مبنى B2',
    provider: 'CAREEM',
    vehicleType: 'Go',
    vehicleTypeAr: 'جو',
    price: 75,
    distanceKm: 35.2,
    durationMin: 55,
    status: 'completed',
    rating: 4,
    driverName: 'محمود حسن',
    driverRating: 4.7,
    vehiclePlate: 'س ع ي 5678',
    vehicleModel: 'Chevrolet Optra 2021',
    paymentMethod: 'Visa ****4532',
    pricePerKm: 2.13
  },
  {
    id: '3',
    date: '2024-01-16',
    time: '18:45',
    pickupAddress: 'Sheikh Zayed, Arkan Mall',
    pickupAddressAr: 'الشيخ زايد، أركان مول',
    dropoffAddress: 'Mall of Egypt',
    dropoffAddressAr: 'مول مصر',
    provider: 'BOLT',
    vehicleType: 'Bolt',
    vehicleTypeAr: 'بولت',
    price: 42,
    originalPrice: 48,
    discount: 6,
    distanceKm: 8.5,
    durationMin: 20,
    status: 'completed',
    rating: 5,
    driverName: 'عمر سعيد',
    driverRating: 4.95,
    vehiclePlate: 'م ن و 9012',
    vehicleModel: 'Suzuki Dzire 2023',
    paymentMethod: 'Cash',
    pricePerKm: 4.94
  },
  {
    id: '4',
    date: '2024-01-15',
    time: '11:00',
    pickupAddress: '6th October City',
    pickupAddressAr: 'مدينة 6 أكتوبر',
    dropoffAddress: 'Giza Pyramids',
    dropoffAddressAr: 'أهرامات الجيزة',
    provider: 'INDRIVE',
    vehicleType: 'City',
    vehicleTypeAr: 'سيتي',
    price: 55,
    distanceKm: 18.3,
    durationMin: 35,
    status: 'cancelled',
    paymentMethod: 'Cash',
    pricePerKm: 3.0
  },
  {
    id: '5',
    date: '2024-01-14',
    time: '20:30',
    pickupAddress: 'Cairo Festival City Mall',
    pickupAddressAr: 'كايرو فيستيفال سيتي مول',
    dropoffAddress: 'Heliopolis, Korba',
    dropoffAddressAr: 'مصر الجديدة، كوربا',
    provider: 'DIDI',
    vehicleType: 'DiDi Express',
    vehicleTypeAr: 'ديدي إكسبرس',
    price: 38,
    distanceKm: 12.1,
    durationMin: 28,
    status: 'completed',
    rating: 4,
    driverName: 'خالد إبراهيم',
    driverRating: 4.6,
    vehiclePlate: 'ق ف ص 3456',
    vehicleModel: 'Nissan Sunny 2022',
    paymentMethod: 'Cash',
    pricePerKm: 3.14
  },
  {
    id: '6',
    date: '2024-01-13',
    time: '07:00',
    pickupAddress: 'Nasr City, Abbas El Akkad',
    pickupAddressAr: 'مدينة نصر، عباس العقاد',
    dropoffAddress: 'New Cairo, AUC Campus',
    dropoffAddressAr: 'التجمع الخامس، الجامعة الأمريكية',
    provider: 'SWVL',
    vehicleType: 'Bus',
    vehicleTypeAr: 'باص',
    price: 15,
    distanceKm: 15.8,
    durationMin: 40,
    status: 'completed',
    rating: 5,
    paymentMethod: 'Wallet',
    pricePerKm: 0.95
  },
  {
    id: '7',
    date: '2024-01-12',
    time: '16:20',
    pickupAddress: 'Zamalek, 26th July St',
    pickupAddressAr: 'الزمالك، شارع 26 يوليو',
    dropoffAddress: 'Mohandessin, Arab League St',
    dropoffAddressAr: 'المهندسين، شارع جامعة الدول العربية',
    provider: 'HALAN',
    vehicleType: 'Tuk-Tuk',
    vehicleTypeAr: 'توك توك',
    price: 20,
    distanceKm: 4.2,
    durationMin: 15,
    status: 'completed',
    rating: 4,
    driverName: 'سيد علي',
    driverRating: 4.5,
    paymentMethod: 'Cash',
    pricePerKm: 4.76
  },
  {
    id: '8',
    date: '2024-01-11',
    time: '13:45',
    pickupAddress: 'Giza, Dokki Square',
    pickupAddressAr: 'الجيزة، ميدان الدقي',
    dropoffAddress: 'Maadi, Degla',
    dropoffAddressAr: 'المعادي، دجلة',
    provider: 'CAREEM',
    vehicleType: 'Go Plus',
    vehicleTypeAr: 'جو بلس',
    price: 52,
    distanceKm: 14.5,
    durationMin: 32,
    status: 'completed',
    rating: 5,
    driverName: 'حسام فتحي',
    driverRating: 4.85,
    vehiclePlate: 'ر ز ك 7890',
    vehicleModel: 'Toyota Corolla 2023',
    paymentMethod: 'Visa ****4532',
    pricePerKm: 3.59
  }
];

export default function RideHistoryPage() {
  const [rides, setRides] = useState<RideHistory[]>(SAMPLE_RIDES);
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [expandedRide, setExpandedRide] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);

  // Filter rides
  const filteredRides = useMemo(() => {
    return rides.filter(ride => {
      if (filter !== 'all' && ride.status !== filter) return false;
      if (selectedProvider && ride.provider !== selectedProvider) return false;

      // Date range filter
      const rideDate = new Date(ride.date);
      const now = new Date();
      if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (rideDate < weekAgo) return false;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (rideDate < monthAgo) return false;
      } else if (dateRange === 'year') {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        if (rideDate < yearAgo) return false;
      }

      return true;
    });
  }, [rides, filter, selectedProvider, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completed = filteredRides.filter(r => r.status === 'completed');
    const totalSpent = completed.reduce((sum, r) => sum + r.price, 0);
    const totalDistance = completed.reduce((sum, r) => sum + r.distanceKm, 0);
    const totalTime = completed.reduce((sum, r) => sum + r.durationMin, 0);
    const totalSaved = completed.reduce((sum, r) => sum + (r.originalPrice ? r.originalPrice - r.price : 0), 0);
    const avgRating = completed.filter(r => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) /
      completed.filter(r => r.rating).length || 0;
    const avgPricePerKm = totalDistance > 0 ? totalSpent / totalDistance : 0;

    // Provider breakdown
    const byProvider = Object.keys(PROVIDERS).map(p => ({
      provider: p as keyof typeof PROVIDERS,
      count: completed.filter(r => r.provider === p).length,
      spent: completed.filter(r => r.provider === p).reduce((sum, r) => sum + r.price, 0)
    })).filter(p => p.count > 0).sort((a, b) => b.count - a.count);

    // Most frequent route
    const routes = completed.map(r => `${r.pickupAddressAr}-${r.dropoffAddressAr}`);
    const routeCounts = routes.reduce((acc, route) => {
      acc[route] = (acc[route] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostFrequentRoute = Object.entries(routeCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalRides: completed.length,
      cancelledRides: filteredRides.filter(r => r.status === 'cancelled').length,
      totalSpent,
      totalDistance: Math.round(totalDistance * 10) / 10,
      totalTime,
      totalSaved,
      avgRating: Math.round(avgRating * 10) / 10,
      avgPricePerKm: Math.round(avgPricePerKm * 100) / 100,
      byProvider,
      mostFrequentRoute
    };
  }, [filteredRides]);

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}س ${mins}د`;
    return `${mins} دقيقة`;
  };

  // Rebook ride
  const handleRebook = (ride: RideHistory) => {
    window.location.href = `/rides?pickup=${encodeURIComponent(ride.pickupAddressAr)}&dropoff=${encodeURIComponent(ride.dropoffAddressAr)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link href="/rides" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowRightIcon className="w-5 h-5" />
              <span>العودة للنقل الذكي</span>
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <ClockIcon className="w-9 h-9" />
                  سجل رحلاتي
                </h1>
                <p className="text-white/80">تتبع جميع رحلاتك وإحصائياتك</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-colors"
                  title="إحصائيات"
                >
                  <ChartBarIcon className="w-6 h-6" />
                </button>
                <button className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-colors" title="تصدير">
                  <ShareIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        {showStats && (
          <div className="mb-8 space-y-4">
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
                    <p className="text-sm text-gray-500">رحلة مكتملة</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <BanknotesIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSpent} ج.م</p>
                    <p className="text-sm text-gray-500">إجمالي الإنفاق</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDistance} كم</p>
                    <p className="text-sm text-gray-500">إجمالي المسافة</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <StarIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                    <p className="text-sm text-gray-500">متوسط التقييم</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowTrendingDownIcon className="w-5 h-5" />
                  <span className="text-sm text-white/80">وفرت</span>
                </div>
                <p className="text-2xl font-bold">{stats.totalSaved} ج.م</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-5 h-5" />
                  <span className="text-sm text-white/80">وقت السفر</span>
                </div>
                <p className="text-2xl font-bold">{formatTime(stats.totalTime)}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <CurrencyDollarIcon className="w-5 h-5" />
                  <span className="text-sm text-white/80">متوسط/كم</span>
                </div>
                <p className="text-2xl font-bold">{stats.avgPricePerKm} ج.م</p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <XCircleIcon className="w-5 h-5" />
                  <span className="text-sm text-white/80">ملغية</span>
                </div>
                <p className="text-2xl font-bold">{stats.cancelledRides}</p>
              </div>
            </div>

            {/* Provider Breakdown */}
            {stats.byProvider.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-amber-500" />
                  تطبيقاتك المفضلة
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stats.byProvider.map((item, idx) => {
                    const provider = PROVIDERS[item.provider];
                    return (
                      <div
                        key={item.provider}
                        onClick={() => setSelectedProvider(selectedProvider === item.provider ? null : item.provider)}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          selectedProvider === item.provider
                            ? `bg-gradient-to-r ${provider.gradient} text-white`
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{provider.logo}</span>
                          <span className={`font-medium ${selectedProvider === item.provider ? 'text-white' : 'text-gray-900'}`}>
                            {provider.nameAr}
                          </span>
                          {idx === 0 && <span className="text-lg">👑</span>}
                        </div>
                        <div className={`text-sm ${selectedProvider === item.provider ? 'text-white/80' : 'text-gray-500'}`}>
                          {item.count} رحلة • {item.spent} ج.م
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { id: 'all' as const, label: 'الكل', icon: null },
                { id: 'completed' as const, label: 'مكتملة', icon: CheckCircleIcon },
                { id: 'cancelled' as const, label: 'ملغية', icon: XCircleIcon },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === f.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.icon && <f.icon className="w-4 h-4" />}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Date Range */}
            <div className="flex gap-2 lg:mr-auto">
              {[
                { id: 'week' as const, label: 'أسبوع' },
                { id: 'month' as const, label: 'شهر' },
                { id: 'year' as const, label: 'سنة' },
                { id: 'all' as const, label: 'الكل' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDateRange(d.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    dateRange === d.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Clear Provider Filter */}
            {selectedProvider && (
              <button
                onClick={() => setSelectedProvider(null)}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                <XCircleIcon className="w-4 h-4" />
                إلغاء فلتر التطبيق
              </button>
            )}
          </div>
        </div>

        {/* Rides List */}
        {filteredRides.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد رحلات</h3>
            <p className="text-gray-500 mb-6">لم يتم العثور على رحلات مطابقة للفلتر المحدد</p>
            <Link
              href="/rides"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all"
            >
              ابدأ رحلة جديدة
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRides.map((ride) => {
              const provider = PROVIDERS[ride.provider];
              const isExpanded = expandedRide === ride.id;

              return (
                <div
                  key={ride.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    ride.status === 'cancelled'
                      ? 'border-red-200 opacity-70'
                      : 'border-gray-100 hover:border-purple-200 hover:shadow-md'
                  }`}
                >
                  {/* Main Content */}
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Provider Logo */}
                      <div className={`w-14 h-14 ${provider.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <span className="text-2xl">{provider.logo}</span>
                      </div>

                      {/* Ride Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{provider.nameAr}</h3>
                          <span className="text-sm text-gray-500">• {ride.vehicleTypeAr}</span>
                          {ride.status === 'cancelled' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                              ملغية
                            </span>
                          )}
                          {ride.discount && ride.discount > 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              وفرت {ride.discount} ج.م
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {new Date(ride.date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          {' '} • {ride.time}
                        </p>

                        {/* Route */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                          <span className="text-gray-600 truncate">{ride.pickupAddressAr}</span>
                          <span className="text-gray-400">→</span>
                          <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                          <span className="text-gray-600 truncate">{ride.dropoffAddressAr}</span>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                          <span>{ride.distanceKm} كم</span>
                          <span>{ride.durationMin} دقيقة</span>
                          <span>{ride.paymentMethod}</span>
                        </div>
                      </div>

                      {/* Price & Rating */}
                      <div className="text-left">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-gray-900">{ride.price}</span>
                          <span className="text-sm text-gray-500">ج.م</span>
                        </div>
                        {ride.originalPrice && ride.originalPrice > ride.price && (
                          <div className="text-sm text-gray-400 line-through">{ride.originalPrice} ج.م</div>
                        )}
                        {ride.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              i < ride.rating! ? (
                                <StarIconSolid key={i} className="w-4 h-4 text-amber-400" />
                              ) : (
                                <StarIcon key={i} className="w-4 h-4 text-gray-300" />
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => setExpandedRide(isExpanded ? null : ride.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        التفاصيل
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {ride.status === 'completed' && (
                        <button
                          onClick={() => handleRebook(ride)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                          إعادة الحجز
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Driver Info */}
                        {ride.driverName && (
                          <div className="bg-white rounded-xl p-4">
                            <h4 className="font-bold text-gray-900 mb-3">معلومات السائق</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">الاسم</span>
                                <span className="font-medium text-gray-900">{ride.driverName}</span>
                              </div>
                              {ride.driverRating && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">التقييم</span>
                                  <span className="font-medium text-amber-600">{ride.driverRating} ⭐</span>
                                </div>
                              )}
                              {ride.vehicleModel && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">السيارة</span>
                                  <span className="font-medium text-gray-900">{ride.vehicleModel}</span>
                                </div>
                              )}
                              {ride.vehiclePlate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">اللوحة</span>
                                  <span className="font-medium text-gray-900">{ride.vehiclePlate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Trip Details */}
                        <div className="bg-white rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-3">تفاصيل الرحلة</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">المسافة</span>
                              <span className="font-medium text-gray-900">{ride.distanceKm} كم</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">المدة</span>
                              <span className="font-medium text-gray-900">{ride.durationMin} دقيقة</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">سعر الكيلو</span>
                              <span className="font-medium text-gray-900">{ride.pricePerKm?.toFixed(2)} ج.م</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">طريقة الدفع</span>
                              <span className="font-medium text-gray-900">{ride.paymentMethod}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review */}
                      {ride.review && (
                        <div className="mt-4 bg-white rounded-xl p-4">
                          <h4 className="font-bold text-gray-900 mb-2">تقييمك</h4>
                          <p className="text-gray-600 text-sm">"{ride.review}"</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
