'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getExchangePoints,
  getNearbyPoints,
  getGovernorates,
  getMyBookings,
  ExchangePoint,
  ExchangeBooking,
} from '@/lib/api/exchange-points';

const TYPE_INFO: Record<string, { label: string; icon: string; color: string }> = {
  XCHANGE_HUB: { label: 'مركز XChange', icon: '🏢', color: 'bg-emerald-100 text-emerald-700' },
  PARTNER_STORE: { label: 'متجر شريك', icon: '🏪', color: 'bg-blue-100 text-blue-700' },
  POLICE_STATION: { label: 'قسم شرطة', icon: '👮', color: 'bg-indigo-100 text-indigo-700' },
  MALL: { label: 'مول تجاري', icon: '🛒', color: 'bg-purple-100 text-purple-700' },
  COFFEE_SHOP: { label: 'كافيه', icon: '☕', color: 'bg-orange-100 text-orange-700' },
  BANK: { label: 'بنك', icon: '🏦', color: 'bg-gray-100 text-gray-700' },
};

const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'في الانتظار', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMED: { label: 'مؤكد', color: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'جاري', color: 'bg-purple-100 text-purple-700' },
  COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'ملغي', color: 'bg-gray-100 text-gray-500' },
  NO_SHOW: { label: 'لم يحضر', color: 'bg-red-100 text-red-700' },
};

function PointCard({ point }: { point: ExchangePoint }) {
  const typeInfo = TYPE_INFO[point.type] || TYPE_INFO.XCHANGE_HUB;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
      {/* Cover Image */}
      <div className="h-40 bg-gradient-to-br from-emerald-400 to-teal-500 relative">
        {point.coverImage ? (
          <img
            src={point.coverImage}
            alt={point.nameAr}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl">{typeInfo.icon}</span>
          </div>
        )}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm font-bold ${typeInfo.color}`}>
          {typeInfo.icon} {typeInfo.label}
        </div>
        {point.distance !== undefined && (
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
            📍 {point.distance.toFixed(1)} كم
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-1">{point.nameAr}</h3>
        <p className="text-sm text-gray-500 mb-3">
          {point.area ? `${point.area}, ` : ''}{point.city}, {point.governorate}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="font-bold">{point.avgRating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({point.ratingCount})</span>
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500">{point.totalExchanges} تبادل</span>
        </div>

        {/* Facilities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {point.hasCCTV && (
            <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">📹 كاميرات</span>
          )}
          {point.hasParking && (
            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">🅿️ موقف</span>
          )}
          {point.hasWifi && (
            <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs">📶 واي فاي</span>
          )}
          {point.hasWaitingArea && (
            <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-full text-xs">🪑 صالة انتظار</span>
          )}
          {point.hasInspection && (
            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs">🔍 فحص منتجات</span>
          )}
          {point.is24Hours && (
            <span className="px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs">🕐 24 ساعة</span>
          )}
        </div>

        {/* Address */}
        <p className="text-sm text-gray-600 mb-3 truncate">
          📍 {point.addressAr || point.address}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {point.googleMapsUrl && (
            <a
              href={point.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 bg-blue-500 text-white text-center rounded-lg font-bold hover:bg-blue-600 text-sm"
            >
              🗺️ الخريطة
            </a>
          )}
          {point.phone && (
            <a
              href={`tel:${point.phone}`}
              className="flex-1 py-2 bg-emerald-500 text-white text-center rounded-lg font-bold hover:bg-emerald-600 text-sm"
            >
              📞 اتصال
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: ExchangeBooking }) {
  const statusInfo = BOOKING_STATUS[booking.status] || BOOKING_STATUS.PENDING;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className={`px-4 py-2 ${statusInfo.color}`}>
        <span className="font-bold">{statusInfo.label}</span>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-gray-800">{booking.point?.nameAr || 'نقطة تبادل'}</h4>
        <p className="text-sm text-gray-500 mb-2">
          📅 {new Date(booking.scheduledDate).toLocaleDateString('ar-EG')} - {booking.scheduledTime}
        </p>
        <p className="text-sm text-gray-500">
          ⏱️ {booking.duration} دقيقة
        </p>
      </div>
    </div>
  );
}

export default function ExchangePointsPage() {
  const { user } = useAuth();
  const [points, setPoints] = useState<ExchangePoint[]>([]);
  const [bookings, setBookings] = useState<ExchangeBooking[]>([]);
  const [governorates, setGovernorates] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'nearby' | 'bookings'>('all');
  const [filters, setFilters] = useState({
    governorate: '',
    type: '',
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    fetchData();
    fetchGovernorates();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getExchangePoints(filters);
      setPoints(response.data?.points || []);
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGovernorates = async () => {
    try {
      const response = await getGovernorates();
      setGovernorates(response.data?.governorates || []);
    } catch (error) {
      console.error('Error fetching governorates:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await getMyBookings();
      setBookings(response.data?.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location error:', error);
        }
      );
    }
  };

  const fetchNearbyPoints = async () => {
    if (!userLocation) {
      alert('يرجى السماح بالوصول للموقع');
      return;
    }
    try {
      setLoading(true);
      const response = await getNearbyPoints(userLocation.lat, userLocation.lng, 20);
      setPoints(response.data?.points || []);
    } catch (error) {
      console.error('Error fetching nearby points:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'nearby' && userLocation) {
      fetchNearbyPoints();
    } else if (tab === 'all') {
      fetchData();
    }
  }, [tab, filters]);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-teal-600 via-emerald-500 to-green-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">📍</span>
            نقاط التبادل الآمنة
          </h1>
          <p className="text-xl text-white/90">أماكن موثوقة للقاء وإتمام صفقاتك بأمان</p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="flex flex-wrap gap-2 bg-white rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              tab === 'all'
                ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏢 جميع النقاط
          </button>
          <button
            onClick={() => setTab('nearby')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              tab === 'nearby'
                ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📍 القريبة مني
          </button>
          {user && (
            <button
              onClick={() => setTab('bookings')}
              className={`px-4 py-2 rounded-lg font-bold transition-all relative ${
                tab === 'bookings'
                  ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📅 حجوزاتي
              {bookings.filter(b => b.status === 'CONFIRMED').length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {bookings.filter(b => b.status === 'CONFIRMED').length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {tab !== 'bookings' && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.governorate}
              onChange={(e) => setFilters({ ...filters, governorate: e.target.value })}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">كل المحافظات</option>
              {governorates.map((gov) => (
                <option key={gov.name} value={gov.name}>
                  {gov.name} ({gov.count})
                </option>
              ))}
            </select>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="border rounded-lg px-4 py-2"
            >
              <option value="">كل الأنواع</option>
              {Object.entries(TYPE_INFO).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.icon} {info.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
            ))}
          </div>
        ) : tab === 'bookings' ? (
          bookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <span className="text-6xl mb-4 block">📅</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد حجوزات</h3>
              <p className="text-gray-500">ستظهر حجوزاتك هنا عند إنشائها</p>
            </div>
          )
        ) : points.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {points.map((point) => (
              <PointCard key={point.id} point={point} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <span className="text-6xl mb-4 block">📍</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد نقاط تبادل</h3>
            <p className="text-gray-500">جرب تغيير معايير البحث</p>
          </div>
        )}
      </section>

      {/* How it Works */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">كيف تعمل نقاط التبادل؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🔍', title: 'اختر نقطة', desc: 'ابحث عن أقرب نقطة تبادل' },
              { icon: '📅', title: 'احجز موعد', desc: 'حدد الوقت المناسب لك' },
              { icon: '🤝', title: 'قابل الطرف الآخر', desc: 'التقِ في مكان آمن' },
              { icon: '✅', title: 'أتم الصفقة', desc: 'افحص وتبادل بأمان' },
            ].map((step, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  {step.icon}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">🛡️ مميزات الأمان</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '📹', title: 'مراقبة بالكاميرات', desc: 'كاميرات CCTV 24/7' },
              { icon: '👮', title: 'أماكن عامة', desc: 'نقاط في أماكن مزدحمة وآمنة' },
              { icon: '⭐', title: 'تقييمات موثوقة', desc: 'تقييمات من مستخدمين حقيقيين' },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <span className="text-4xl block mb-3">{feature.icon}</span>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
