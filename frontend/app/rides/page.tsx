'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ============================================
// Transport Providers
// ============================================
const PROVIDERS = [
  {
    id: 'uber',
    name: 'Uber',
    nameAr: 'أوبر',
    logo: '🚗',
    color: 'bg-black',
    textColor: 'text-white',
    deepLinkBase: 'uber://',
    types: [
      { id: 'uberx', name: 'UberX', nameAr: 'أوبر إكس', multiplier: 1.0 },
      { id: 'comfort', name: 'Comfort', nameAr: 'كومفورت', multiplier: 1.3 },
      { id: 'uberxl', name: 'UberXL', nameAr: 'أوبر XL', multiplier: 1.5 },
      { id: 'black', name: 'Black', nameAr: 'بلاك', multiplier: 2.0 },
    ],
  },
  {
    id: 'careem',
    name: 'Careem',
    nameAr: 'كريم',
    logo: '🟢',
    color: 'bg-green-500',
    textColor: 'text-white',
    deepLinkBase: 'careem://',
    types: [
      { id: 'go', name: 'Go', nameAr: 'جو', multiplier: 1.0 },
      { id: 'goplus', name: 'Go+', nameAr: 'جو بلس', multiplier: 1.2 },
      { id: 'business', name: 'Business', nameAr: 'بيزنس', multiplier: 1.8 },
    ],
  },
  {
    id: 'bolt',
    name: 'Bolt',
    nameAr: 'بولت',
    logo: '⚡',
    color: 'bg-green-400',
    textColor: 'text-black',
    deepLinkBase: 'bolt://',
    types: [
      { id: 'bolt', name: 'Bolt', nameAr: 'بولت', multiplier: 0.95 },
      { id: 'comfort', name: 'Comfort', nameAr: 'كومفورت', multiplier: 1.2 },
    ],
  },
  {
    id: 'indrive',
    name: 'inDrive',
    nameAr: 'إن درايف',
    logo: '🔵',
    color: 'bg-blue-600',
    textColor: 'text-white',
    deepLinkBase: 'indrive://',
    types: [
      { id: 'city', name: 'City', nameAr: 'سيتي', multiplier: 0.85 },
      { id: 'intercity', name: 'Intercity', nameAr: 'بين المدن', multiplier: 1.1 },
    ],
  },
  {
    id: 'didi',
    name: 'DiDi',
    nameAr: 'ديدي',
    logo: '🟠',
    color: 'bg-orange-500',
    textColor: 'text-white',
    deepLinkBase: 'didiglobal://',
    types: [
      { id: 'express', name: 'Express', nameAr: 'إكسبريس', multiplier: 0.9 },
      { id: 'didi', name: 'DiDi', nameAr: 'ديدي', multiplier: 1.0 },
    ],
  },
  {
    id: 'swvl',
    name: 'Swvl',
    nameAr: 'سويفل',
    logo: '🚌',
    color: 'bg-red-500',
    textColor: 'text-white',
    deepLinkBase: 'swvl://',
    types: [
      { id: 'bus', name: 'Bus', nameAr: 'باص', multiplier: 0.3 },
      { id: 'travel', name: 'Travel', nameAr: 'سفر', multiplier: 0.5 },
    ],
  },
];

// ============================================
// Egyptian Governorates & Popular Locations
// ============================================
const POPULAR_LOCATIONS = [
  { name: 'مطار القاهرة الدولي', nameEn: 'Cairo Airport', lat: 30.1219, lng: 31.4056 },
  { name: 'ميدان التحرير', nameEn: 'Tahrir Square', lat: 30.0444, lng: 31.2357 },
  { name: 'مول مصر', nameEn: 'Mall of Egypt', lat: 29.9725, lng: 31.0167 },
  { name: 'سيتي ستارز', nameEn: 'City Stars', lat: 30.0729, lng: 31.3456 },
  { name: 'الأهرامات', nameEn: 'Pyramids', lat: 29.9792, lng: 31.1342 },
  { name: 'داون تاون', nameEn: 'Downtown', lat: 30.0459, lng: 31.2243 },
  { name: 'المعادي', nameEn: 'Maadi', lat: 29.9602, lng: 31.2569 },
  { name: 'مدينة نصر', nameEn: 'Nasr City', lat: 30.0511, lng: 31.3656 },
  { name: 'الشيخ زايد', nameEn: 'Sheikh Zayed', lat: 30.0392, lng: 30.9876 },
  { name: '6 أكتوبر', nameEn: '6th October', lat: 29.9285, lng: 30.9188 },
];

// ============================================
// Pricing Formula (Base + Distance + Time)
// ============================================
const BASE_FARE = 15; // EGP
const PRICE_PER_KM = 4.5; // EGP
const PRICE_PER_MIN = 0.8; // EGP
const SURGE_TIMES = [7, 8, 9, 17, 18, 19, 20]; // Rush hours

function calculatePrice(distanceKm: number, durationMin: number, multiplier: number): number {
  const hour = new Date().getHours();
  const surgeMultiplier = SURGE_TIMES.includes(hour) ? 1.3 : 1.0;
  const basePrice = BASE_FARE + (distanceKm * PRICE_PER_KM) + (durationMin * PRICE_PER_MIN);
  return Math.round(basePrice * multiplier * surgeMultiplier);
}

// ============================================
// Types
// ============================================
interface Location {
  name: string;
  lat: number;
  lng: number;
}

interface RideOffer {
  providerId: string;
  providerName: string;
  providerLogo: string;
  providerColor: string;
  typeId: string;
  typeName: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  eta: number;
  surge: boolean;
  confidence: number;
  deepLink: string;
}

// ============================================
// Main Rides Page
// ============================================
export default function RidesPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [pickupSearch, setPickupSearch] = useState('');
  const [dropoffSearch, setDropoffSearch] = useState('');
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [offers, setOffers] = useState<RideOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'eta' | 'recommended'>('recommended');
  const [selectedType, setSelectedType] = useState<'all' | 'economy' | 'comfort' | 'premium'>('all');

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Generate offers when pickup and dropoff are set
  const generateOffers = useCallback(() => {
    if (!pickup || !dropoff) return;

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
      const duration = Math.round(distance * 3 + 5); // Rough estimate: 3 min/km + 5 min buffer
      const hour = new Date().getHours();
      const isSurge = SURGE_TIMES.includes(hour);

      const newOffers: RideOffer[] = [];

      PROVIDERS.forEach(provider => {
        provider.types.forEach(type => {
          const price = calculatePrice(distance, duration, type.multiplier);
          const eta = Math.round(2 + Math.random() * 8); // 2-10 min ETA
          const hasDiscount = Math.random() > 0.7;
          const discount = hasDiscount ? Math.round(10 + Math.random() * 20) : 0;
          const originalPrice = hasDiscount ? Math.round(price / (1 - discount/100)) : undefined;

          newOffers.push({
            providerId: provider.id,
            providerName: provider.name,
            providerLogo: provider.logo,
            providerColor: provider.color,
            typeId: type.id,
            typeName: type.nameAr,
            price,
            originalPrice,
            discount: hasDiscount ? discount : undefined,
            eta,
            surge: isSurge,
            confidence: Math.round(85 + Math.random() * 15),
            deepLink: `${provider.deepLinkBase}?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&dropoff_lat=${dropoff.lat}&dropoff_lng=${dropoff.lng}`,
          });
        });
      });

      setOffers(newOffers);
      setLoading(false);
    }, 1500);
  }, [pickup, dropoff, calculateDistance]);

  useEffect(() => {
    if (pickup && dropoff) {
      generateOffers();
    }
  }, [pickup, dropoff, generateOffers]);

  // Sort and filter offers
  const sortedOffers = [...offers]
    .filter(offer => {
      if (selectedType === 'all') return true;
      if (selectedType === 'economy') return offer.price < 50;
      if (selectedType === 'comfort') return offer.price >= 50 && offer.price < 100;
      if (selectedType === 'premium') return offer.price >= 100;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'eta') return a.eta - b.eta;
      // Recommended: weighted score
      const scoreA = (100 - a.price/2) + (10 - a.eta) + a.confidence/10;
      const scoreB = (100 - b.price/2) + (10 - b.eta) + b.confidence/10;
      return scoreB - scoreA;
    });

  const cheapestOffer = offers.length > 0 ? offers.reduce((min, o) => o.price < min.price ? o : min, offers[0]) : null;
  const fastestOffer = offers.length > 0 ? offers.reduce((min, o) => o.eta < min.eta ? o : min, offers[0]) : null;

  const filteredPickupLocations = POPULAR_LOCATIONS.filter(loc =>
    loc.name.includes(pickupSearch) || loc.nameEn.toLowerCase().includes(pickupSearch.toLowerCase())
  );

  const filteredDropoffLocations = POPULAR_LOCATIONS.filter(loc =>
    loc.name.includes(dropoffSearch) || loc.nameEn.toLowerCase().includes(dropoffSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/" className="text-white/70 text-sm hover:text-white mb-2 block">← العودة للرئيسية</Link>
              <h1 className="text-3xl md:text-4xl font-black text-white">
                🚗 Xchange Transport
              </h1>
              <p className="text-white/80 mt-2">قارن أسعار جميع تطبيقات النقل واحجز الأرخص</p>
            </div>
            <Link
              href="/rides/history"
              className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
            >
              📋 رحلاتي
            </Link>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Pickup Location */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🟢 نقطة الانطلاق
                </label>
                <input
                  type="text"
                  value={pickup ? pickup.name : pickupSearch}
                  onChange={(e) => {
                    setPickupSearch(e.target.value);
                    setPickup(null);
                    setShowPickupSuggestions(true);
                  }}
                  onFocus={() => setShowPickupSuggestions(true)}
                  placeholder="من أين؟"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                {showPickupSuggestions && pickupSearch && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredPickupLocations.map((loc) => (
                      <button
                        key={loc.name}
                        onClick={() => {
                          setPickup({ name: loc.name, lat: loc.lat, lng: loc.lng });
                          setPickupSearch('');
                          setShowPickupSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-900">{loc.name}</div>
                        <div className="text-sm text-gray-500">{loc.nameEn}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dropoff Location */}
              <div className="relative">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  🔴 الوجهة
                </label>
                <input
                  type="text"
                  value={dropoff ? dropoff.name : dropoffSearch}
                  onChange={(e) => {
                    setDropoffSearch(e.target.value);
                    setDropoff(null);
                    setShowDropoffSuggestions(true);
                  }}
                  onFocus={() => setShowDropoffSuggestions(true)}
                  placeholder="إلى أين؟"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
                {showDropoffSuggestions && dropoffSearch && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredDropoffLocations.map((loc) => (
                      <button
                        key={loc.name}
                        onClick={() => {
                          setDropoff({ name: loc.name, lat: loc.lat, lng: loc.lng });
                          setDropoffSearch('');
                          setShowDropoffSuggestions(false);
                        }}
                        className="w-full px-4 py-3 text-right hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-900">{loc.name}</div>
                        <div className="text-sm text-gray-500">{loc.nameEn}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Locations */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">أماكن شائعة:</span>
              {POPULAR_LOCATIONS.slice(0, 5).map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    if (!pickup) {
                      setPickup({ name: loc.name, lat: loc.lat, lng: loc.lng });
                    } else if (!dropoff) {
                      setDropoff({ name: loc.name, lat: loc.lat, lng: loc.lng });
                    }
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {(loading || offers.length > 0) && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin text-6xl mb-4">🚗</div>
                <p className="text-gray-600 text-lg">جاري البحث عن أفضل الأسعار...</p>
                <p className="text-gray-400 text-sm mt-2">نقارن 6 تطبيقات في وقت واحد</p>
              </div>
            ) : (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-2xl font-black text-purple-600">{offers.length}</div>
                    <div className="text-sm text-gray-500">عرض متاح</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-2xl font-black text-green-600">{cheapestOffer?.price} ج.م</div>
                    <div className="text-sm text-gray-500">أقل سعر</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-2xl font-black text-blue-600">{fastestOffer?.eta} د</div>
                    <div className="text-sm text-gray-500">أسرع وصول</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="text-2xl font-black text-amber-600">
                      {Math.round(offers.filter(o => o.discount).length / offers.length * 100)}%
                    </div>
                    <div className="text-sm text-gray-500">عروض خاصة</div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex gap-2">
                    {(['all', 'economy', 'comfort', 'premium'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-full font-medium transition-colors ${
                          selectedType === type
                            ? 'bg-purple-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {type === 'all' && 'الكل'}
                        {type === 'economy' && '💰 اقتصادي'}
                        {type === 'comfort' && '🛋️ مريح'}
                        {type === 'premium' && '👑 فاخر'}
                      </button>
                    ))}
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl"
                  >
                    <option value="recommended">🌟 الأفضل</option>
                    <option value="price">💰 السعر</option>
                    <option value="eta">⏱️ الوقت</option>
                  </select>
                </div>

                {/* Offers Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedOffers.map((offer, index) => (
                    <div
                      key={`${offer.providerId}-${offer.typeId}`}
                      className={`bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all border-2 ${
                        index === 0 && sortBy === 'recommended' ? 'border-purple-500' :
                        offer === cheapestOffer ? 'border-green-500' :
                        offer === fastestOffer ? 'border-blue-500' :
                        'border-transparent'
                      }`}
                    >
                      {/* Badges */}
                      <div className="flex gap-2 mb-3">
                        {index === 0 && sortBy === 'recommended' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">⭐ الأفضل</span>
                        )}
                        {offer === cheapestOffer && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">💰 الأرخص</span>
                        )}
                        {offer === fastestOffer && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">⚡ الأسرع</span>
                        )}
                        {offer.discount && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">-{offer.discount}%</span>
                        )}
                        {offer.surge && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">🔥 ذروة</span>
                        )}
                      </div>

                      {/* Provider Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 ${offer.providerColor} rounded-xl flex items-center justify-center text-2xl`}>
                          {offer.providerLogo}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{offer.providerName}</h3>
                          <p className="text-sm text-gray-500">{offer.typeName}</p>
                        </div>
                      </div>

                      {/* Price & Details */}
                      <div className="flex items-end justify-between mb-4">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900">{offer.price}</span>
                            <span className="text-gray-500">ج.م</span>
                            {offer.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">{offer.originalPrice}</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            ⏱️ {offer.eta} دقيقة • 📊 {offer.confidence}% دقة
                          </div>
                        </div>
                      </div>

                      {/* Book Button */}
                      <a
                        href={offer.deepLink}
                        className={`block w-full py-3 ${offer.providerColor} text-white rounded-xl font-bold text-center hover:opacity-90 transition-opacity`}
                      >
                        احجز الآن
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      {offers.length === 0 && !loading && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-4">لماذا Xchange Transport؟</h2>
              <p className="text-gray-600">أول مجمع نقل ذكي في مصر</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '💰', title: 'وفّر حتى 40%', desc: 'قارن جميع التطبيقات واختر الأرخص' },
                { icon: '⚡', title: 'حجز فوري', desc: 'احجز مباشرة من التطبيق المفضل' },
                { icon: '🤖', title: 'ذكاء اصطناعي', desc: 'توصيات ذكية بناءً على الوقت والمسافة' },
                { icon: '📊', title: 'أسعار حية', desc: 'تحديث الأسعار كل 30 ثانية' },
                { icon: '🚗', title: '6 تطبيقات', desc: 'Uber, Careem, Bolt, inDrive, DiDi, Swvl' },
                { icon: '🔒', title: 'آمن 100%', desc: 'لا نحتفظ ببيانات الدفع' },
              ].map((feature, index) => (
                <div key={index} className="text-center p-6">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-500">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Providers Section */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-8">التطبيقات المتاحة</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {PROVIDERS.map((provider) => (
              <div key={provider.id} className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow-sm">
                <span className="text-2xl">{provider.logo}</span>
                <span className="font-bold text-gray-900">{provider.nameAr}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
