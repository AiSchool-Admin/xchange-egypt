'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the location picker (no SSR for Leaflet)
const RideLocationPicker = dynamic(
  () => import('@/components/rides/RideLocationPicker'),
  { ssr: false }
);

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://xchange-egypt-production.up.railway.app/api/v1';

// ============================================
// Transport Providers Configuration
// ============================================
const PROVIDERS = {
  uber: {
    id: 'uber',
    name: 'Uber',
    nameAr: 'أوبر',
    logo: '/providers/uber.png',
    emoji: '⬛',
    color: '#000000',
    bgColor: 'bg-black',
    textColor: 'text-white',
    deepLinkiOS: 'uber://',
    deepLinkAndroid: 'uber://',
    webFallback: 'https://m.uber.com',
    types: [
      { id: 'uberx', name: 'UberX', nameAr: 'أوبر إكس', category: 'economy', baseFare: 15, perKm: 4.5, perMin: 0.8, minFare: 20, icon: '🚗' },
      { id: 'comfort', name: 'Comfort', nameAr: 'كومفورت', category: 'comfort', baseFare: 20, perKm: 5.5, perMin: 1.0, minFare: 30, icon: '🚙' },
      { id: 'uberxl', name: 'UberXL', nameAr: 'أوبر XL', category: 'comfort', baseFare: 25, perKm: 6.0, perMin: 1.2, minFare: 40, icon: '🚐' },
      { id: 'black', name: 'Black', nameAr: 'بلاك', category: 'premium', baseFare: 40, perKm: 8.0, perMin: 1.5, minFare: 60, icon: '🖤' },
    ],
  },
  careem: {
    id: 'careem',
    name: 'Careem',
    nameAr: 'كريم',
    logo: '/providers/careem.png',
    emoji: '🟢',
    color: '#4CAF50',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    deepLinkiOS: 'careem://',
    deepLinkAndroid: 'careem://',
    webFallback: 'https://www.careem.com',
    types: [
      { id: 'go', name: 'Go', nameAr: 'جو', category: 'economy', baseFare: 14, perKm: 4.2, perMin: 0.75, minFare: 18, icon: '🚗' },
      { id: 'goplus', name: 'Go+', nameAr: 'جو بلس', category: 'comfort', baseFare: 18, perKm: 5.0, perMin: 0.9, minFare: 25, icon: '🚙' },
      { id: 'business', name: 'Business', nameAr: 'بيزنس', category: 'premium', baseFare: 35, perKm: 7.5, perMin: 1.4, minFare: 55, icon: '💼' },
    ],
  },
  bolt: {
    id: 'bolt',
    name: 'Bolt',
    nameAr: 'بولت',
    logo: '/providers/bolt.png',
    emoji: '⚡',
    color: '#34D186',
    bgColor: 'bg-green-400',
    textColor: 'text-black',
    deepLinkiOS: 'bolt://',
    deepLinkAndroid: 'bolt://',
    webFallback: 'https://bolt.eu',
    types: [
      { id: 'bolt', name: 'Bolt', nameAr: 'بولت', category: 'economy', baseFare: 12, perKm: 3.8, perMin: 0.7, minFare: 15, icon: '⚡' },
      { id: 'boltplus', name: 'Bolt+', nameAr: 'بولت بلس', category: 'comfort', baseFare: 16, perKm: 4.8, perMin: 0.85, minFare: 22, icon: '⚡' },
    ],
  },
  indrive: {
    id: 'indrive',
    name: 'inDrive',
    nameAr: 'إن درايف',
    logo: '/providers/indrive.png',
    emoji: '🔵',
    color: '#2196F3',
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    deepLinkiOS: 'indrive://',
    deepLinkAndroid: 'indrive://',
    webFallback: 'https://indrive.com',
    types: [
      { id: 'city', name: 'City', nameAr: 'سيتي', category: 'economy', baseFare: 10, perKm: 3.5, perMin: 0.6, minFare: 12, icon: '🚗' },
      { id: 'intercity', name: 'Intercity', nameAr: 'بين المدن', category: 'economy', baseFare: 20, perKm: 2.5, perMin: 0.5, minFare: 50, icon: '🛣️' },
    ],
  },
  didi: {
    id: 'didi',
    name: 'DiDi',
    nameAr: 'ديدي',
    logo: '/providers/didi.png',
    emoji: '🟠',
    color: '#FF6600',
    bgColor: 'bg-orange-500',
    textColor: 'text-white',
    deepLinkiOS: 'didiglobal://',
    deepLinkAndroid: 'didiglobal://',
    webFallback: 'https://www.didiglobal.com',
    types: [
      { id: 'express', name: 'Express', nameAr: 'إكسبريس', category: 'economy', baseFare: 11, perKm: 3.6, perMin: 0.65, minFare: 14, icon: '🚗' },
      { id: 'didi', name: 'DiDi', nameAr: 'ديدي', category: 'comfort', baseFare: 15, perKm: 4.5, perMin: 0.8, minFare: 20, icon: '🚙' },
    ],
  },
  swvl: {
    id: 'swvl',
    name: 'Swvl',
    nameAr: 'سويفل',
    logo: '/providers/swvl.png',
    emoji: '🚌',
    color: '#E53935',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    deepLinkiOS: 'swvl://',
    deepLinkAndroid: 'swvl://',
    webFallback: 'https://www.swvl.com',
    types: [
      { id: 'bus', name: 'Bus', nameAr: 'باص', category: 'bus', baseFare: 5, perKm: 1.0, perMin: 0.2, minFare: 10, icon: '🚌' },
      { id: 'travel', name: 'Travel', nameAr: 'سفر', category: 'bus', baseFare: 10, perKm: 1.5, perMin: 0.3, minFare: 30, icon: '🚎' },
    ],
  },
  halan: {
    id: 'halan',
    name: 'Halan',
    nameAr: 'هلان',
    logo: '/providers/halan.png',
    emoji: '🛵',
    color: '#FFC107',
    bgColor: 'bg-yellow-500',
    textColor: 'text-black',
    deepLinkiOS: 'halan://',
    deepLinkAndroid: 'halan://',
    webFallback: 'https://www.halan.com',
    types: [
      { id: 'bike', name: 'Bike', nameAr: 'موتوسيكل', category: 'bike', baseFare: 8, perKm: 2.5, perMin: 0.4, minFare: 10, icon: '🛵' },
      { id: 'tuk', name: 'Tuk Tuk', nameAr: 'توك توك', category: 'economy', baseFare: 6, perKm: 2.0, perMin: 0.3, minFare: 8, icon: '🛺' },
    ],
  },
};

// ============================================
// Popular Locations in Egypt
// ============================================
const POPULAR_LOCATIONS = [
  { id: 'cairo-airport', name: 'مطار القاهرة الدولي', nameEn: 'Cairo International Airport', lat: 30.1219, lng: 31.4056, icon: '✈️' },
  { id: 'tahrir', name: 'ميدان التحرير', nameEn: 'Tahrir Square', lat: 30.0444, lng: 31.2357, icon: '🏛️' },
  { id: 'mall-egypt', name: 'مول مصر', nameEn: 'Mall of Egypt', lat: 29.9725, lng: 31.0167, icon: '🏬' },
  { id: 'citystars', name: 'سيتي ستارز', nameEn: 'City Stars', lat: 30.0729, lng: 31.3456, icon: '🏬' },
  { id: 'pyramids', name: 'الأهرامات', nameEn: 'Pyramids of Giza', lat: 29.9792, lng: 31.1342, icon: '🔺' },
  { id: 'downtown', name: 'وسط البلد', nameEn: 'Downtown Cairo', lat: 30.0459, lng: 31.2243, icon: '🏙️' },
  { id: 'maadi', name: 'المعادي', nameEn: 'Maadi', lat: 29.9602, lng: 31.2569, icon: '🏘️' },
  { id: 'nasr-city', name: 'مدينة نصر', nameEn: 'Nasr City', lat: 30.0511, lng: 31.3656, icon: '🏘️' },
  { id: 'sheikh-zayed', name: 'الشيخ زايد', nameEn: 'Sheikh Zayed City', lat: 30.0392, lng: 30.9876, icon: '🏘️' },
  { id: '6-october', name: '6 أكتوبر', nameEn: '6th of October City', lat: 29.9285, lng: 30.9188, icon: '🏘️' },
  { id: 'new-cairo', name: 'القاهرة الجديدة', nameEn: 'New Cairo', lat: 30.0131, lng: 31.4913, icon: '🏘️' },
  { id: 'alex-airport', name: 'مطار الإسكندرية', nameEn: 'Borg El Arab Airport', lat: 30.9177, lng: 29.6963, icon: '✈️' },
  { id: 'alex-downtown', name: 'وسط الإسكندرية', nameEn: 'Downtown Alexandria', lat: 31.2001, lng: 29.9187, icon: '🏙️' },
  { id: 'smart-village', name: 'القرية الذكية', nameEn: 'Smart Village', lat: 30.0711, lng: 31.0167, icon: '💼' },
  { id: 'katameya', name: 'القطامية', nameEn: 'Katameya', lat: 29.9864, lng: 31.4297, icon: '🏘️' },
];

// ============================================
// Surge Time Patterns
// ============================================
const SURGE_HOURS = {
  morning: [7, 8, 9],
  evening: [17, 18, 19, 20],
  weekend_night: [21, 22, 23, 0, 1],
};

// ============================================
// Types
// ============================================
interface Location {
  id?: string;
  name: string;
  nameEn?: string;
  lat: number;
  lng: number;
  icon?: string;
}

interface RideOffer {
  id: string;
  providerId: string;
  providerName: string;
  providerNameAr: string;
  providerEmoji: string;
  providerColor: string;
  providerBgColor: string;
  typeId: string;
  typeName: string;
  typeNameAr: string;
  typeIcon: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surgeMultiplier: number;
  eta: number;
  confidence: number;
  deepLink: string;
  webFallback: string;
  isRecommended: boolean;
  isCheapest: boolean;
  isFastest: boolean;
  score: number;
}

// ============================================
// Helper Functions
// ============================================
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const getSurgeMultiplier = (): number => {
  const hour = new Date().getHours();
  const day = new Date().getDay();

  if (SURGE_HOURS.morning.includes(hour) || SURGE_HOURS.evening.includes(hour)) {
    return 1.2 + Math.random() * 0.3;
  }
  if ((day === 5 || day === 6) && SURGE_HOURS.weekend_night.includes(hour)) {
    return 1.3 + Math.random() * 0.4;
  }
  return 1.0;
};

const generateDeepLink = (provider: any, pickup: Location, dropoff: Location): string => {
  const params = new URLSearchParams({
    pickup_lat: pickup.lat.toString(),
    pickup_lng: pickup.lng.toString(),
    pickup_name: pickup.name,
    dropoff_lat: dropoff.lat.toString(),
    dropoff_lng: dropoff.lng.toString(),
    dropoff_name: dropoff.name,
  });
  return `${provider.deepLinkiOS}?${params.toString()}`;
};

// ============================================
// Main Component
// ============================================
export default function RidesPage() {
  const router = useRouter();

  // State
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [pickupSearch, setPickupSearch] = useState('');
  const [dropoffSearch, setDropoffSearch] = useState('');
  const [activeInput, setActiveInput] = useState<'pickup' | 'dropoff' | null>(null);
  const [offers, setOffers] = useState<RideOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price' | 'eta'>('recommended');
  const [filterCategory, setFilterCategory] = useState<'all' | 'economy' | 'comfort' | 'premium' | 'bus'>('all');
  const [showMapPicker, setShowMapPicker] = useState<'pickup' | 'dropoff' | null>(null);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Location[]>([]);
  const [recentSearches, setRecentSearches] = useState<{pickup: Location, dropoff: Location}[]>([]);

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('xchange_saved_addresses');
    if (saved) setSavedAddresses(JSON.parse(saved));

    const recent = localStorage.getItem('xchange_recent_rides');
    if (recent) setRecentSearches(JSON.parse(recent).slice(0, 5));
  }, []);

  // State for API data
  const [routeInfo, setRouteInfo] = useState<{distanceKm: number; durationMin: number; trafficCondition: string} | null>(null);
  const [surgeInfo, setSurgeInfo] = useState<{multiplier: number; demandLevel: string; tips: string[]} | null>(null);
  const [recommendation, setRecommendation] = useState<{provider: string; product: string; price: number; reason: string} | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Refs to prevent infinite loops and rate limiting
  const fetchedForRef = useRef<string>('');
  const lastFetchTimeRef = useRef<number>(0);

  // Generate offers when both locations are set - NOW USES API
  const generateOffers = useCallback(async () => {
    if (!pickup || !dropoff) return;

    // Create a unique key for this pickup/dropoff combination
    const locationKey = `${pickup.lat},${pickup.lng}-${dropoff.lat},${dropoff.lng}`;

    // Prevent duplicate fetches for same locations
    if (fetchedForRef.current === locationKey) return;

    // Rate limit: wait at least 3 seconds between requests
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 3000) {
      console.log('Rate limiting: waiting before next request');
      return;
    }

    setLoading(true);
    setApiError(null);
    fetchedForRef.current = locationKey;
    lastFetchTimeRef.current = now;

    try {
      // Call the real API
      const response = await fetch(
        `${API_URL}/transport/estimates?` +
        `pickupLat=${pickup.lat}&pickupLng=${pickup.lng}` +
        `&dropoffLat=${dropoff.lat}&dropoffLng=${dropoff.lng}`
      );

      // Handle rate limiting
      if (response.status === 429) {
        setApiError('تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch estimates');
      }

      // Store route and surge info
      setRouteInfo(data.data.route);
      setSurgeInfo(data.data.surge);
      setRecommendation(data.data.recommendation);

      // Transform API response to RideOffer format
      const newOffers: RideOffer[] = data.data.estimates.map((estimate: any) => {
        const providerKey = estimate.provider.toLowerCase();
        const provider = PROVIDERS[providerKey as keyof typeof PROVIDERS] || PROVIDERS.uber;

        return {
          id: estimate.id,
          providerId: providerKey,
          providerName: estimate.providerName,
          providerNameAr: estimate.providerNameAr,
          providerEmoji: provider?.emoji || '🚗',
          providerColor: provider?.color || '#000',
          providerBgColor: provider?.bgColor || 'bg-gray-500',
          typeId: estimate.vehicleTypeName.toLowerCase(),
          typeName: estimate.vehicleTypeName,
          typeNameAr: estimate.vehicleTypeNameAr,
          typeIcon: getTypeIcon(estimate.vehicleType),
          category: estimate.vehicleType.toLowerCase(),
          price: estimate.price,
          originalPrice: estimate.originalPrice,
          discount: undefined,
          baseFare: estimate.priceBreakdown.baseFare,
          distanceFare: estimate.priceBreakdown.distanceFare,
          timeFare: estimate.priceBreakdown.timeFare,
          surgeMultiplier: estimate.priceBreakdown.surgeMultiplier,
          eta: estimate.etaMinutes,
          confidence: estimate.confidenceScore,
          deepLink: estimate.deepLink,
          webFallback: estimate.webFallbackUrl,
          isRecommended: estimate.isRecommended,
          isCheapest: false,
          isFastest: false,
          score: estimate.recommendationScore,
          // Extra data from API
          features: estimate.features,
          capacity: estimate.capacity,
          surgeReason: estimate.surgeInfo?.reason,
          priceRange: estimate.priceRange,
        };
      });

      // Mark cheapest and fastest
      if (newOffers.length > 0) {
        const minPrice = Math.min(...newOffers.map(o => o.price));
        const minEta = Math.min(...newOffers.map(o => o.eta));
        newOffers.forEach(offer => {
          offer.isCheapest = offer.price === minPrice;
          offer.isFastest = offer.eta === minEta;
        });
      }

      setOffers(newOffers);

      // Save to recent searches (use functional update to avoid dependency)
      setRecentSearches(prev => {
        const newRecent = [{ pickup, dropoff }, ...prev.filter(
          r => r.pickup.name !== pickup.name || r.dropoff.name !== dropoff.name
        )].slice(0, 5);
        localStorage.setItem('xchange_recent_rides', JSON.stringify(newRecent));
        return newRecent;
      });

    } catch (error) {
      console.error('Error fetching estimates:', error);
      setApiError('حدث خطأ أثناء جلب الأسعار. يرجى المحاولة مرة أخرى.');
      setOffers([]);
    } finally {
      setLoading(false);
    }

  }, [pickup, dropoff]);

  // Helper to get icon for vehicle type
  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'ECONOMY': '🚗',
      'COMFORT': '🚙',
      'PREMIUM': '🖤',
      'XL': '🚐',
      'BUS': '🚌',
      'BIKE': '🛵',
    };
    return icons[type] || '🚗';
  };

  useEffect(() => {
    if (pickup && dropoff) {
      generateOffers();
    }
  }, [pickup, dropoff, generateOffers]);

  // Filter and sort offers
  const filteredOffers = offers
    .filter(offer => filterCategory === 'all' || offer.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'eta') return a.eta - b.eta;
      return b.score - a.score;
    });

  // Stats
  const cheapestOffer = offers.length > 0 ? offers.reduce((min, o) => o.price < min.price ? o : min, offers[0]) : null;
  const fastestOffer = offers.length > 0 ? offers.reduce((min, o) => o.eta < min.eta ? o : min, offers[0]) : null;
  const avgPrice = offers.length > 0 ? Math.round(offers.reduce((sum, o) => sum + o.price, 0) / offers.length) : 0;

  // Filter locations
  const filterLocations = (search: string) => {
    if (!search) return POPULAR_LOCATIONS;
    const searchLower = search.toLowerCase();
    return POPULAR_LOCATIONS.filter(loc =>
      loc.name.includes(search) ||
      loc.nameEn?.toLowerCase().includes(searchLower)
    );
  };

  // Handle booking
  const handleBook = (offer: RideOffer) => {
    // Try deep link first, then web fallback
    window.location.href = offer.deepLink;
    setTimeout(() => {
      window.location.href = offer.webFallback;
    }, 2500);
  };

  // Save address
  const saveAddress = (location: Location, type: 'home' | 'work' | 'favorite') => {
    const newAddress = { ...location, id: Date.now().toString(), icon: type === 'home' ? '🏠' : type === 'work' ? '💼' : '⭐' };
    const updated = [...savedAddresses, newAddress];
    setSavedAddresses(updated);
    localStorage.setItem('xchange_saved_addresses', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-indigo-600 to-blue-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/" className="text-white/70 text-sm hover:text-white flex items-center gap-1 mb-2">
                <span>←</span> العودة للرئيسية
              </Link>
              <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
                <span className="text-4xl">🚕</span>
                Xchange Transport
              </h1>
              <p className="text-white/80 mt-2">قارن أسعار 7 تطبيقات نقل واحجز الأرخص فوراً</p>
            </div>
            <div className="flex gap-3">
              <Link href="/rides/addresses" className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2">
                <span>📍</span>
                <span className="hidden md:inline">عناويني</span>
              </Link>
              <Link href="/rides/alerts" className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2">
                <span>🔔</span>
                <span className="hidden md:inline">تنبيهات</span>
              </Link>
              <Link href="/rides/history" className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2">
                <span>📋</span>
                <span className="hidden md:inline">رحلاتي</span>
              </Link>
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Pickup Input */}
              <div className="relative">
                <label className="flex items-center justify-between text-sm font-bold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    نقطة الانطلاق
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker('pickup')}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
                  >
                    <span>🗺️</span>
                    <span>حدد على الخريطة</span>
                  </button>
                </label>
                <input
                  type="text"
                  value={pickup ? pickup.name : pickupSearch}
                  onChange={(e) => {
                    setPickupSearch(e.target.value);
                    setPickup(null);
                  }}
                  onFocus={() => setActiveInput('pickup')}
                  placeholder="من أين تريد الانطلاق؟"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-lg"
                />
                {pickup && (
                  <button
                    onClick={() => { setPickup(null); setPickupSearch(''); }}
                    className="absolute left-3 top-[52px] text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}

                {/* Suggestions Dropdown */}
                {activeInput === 'pickup' && !pickup && (
                  <div className="absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    {/* Saved Addresses */}
                    {savedAddresses.length > 0 && (
                      <div className="p-2 border-b border-gray-100">
                        <div className="text-xs font-bold text-gray-400 px-2 mb-2">عناوين محفوظة</div>
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            onClick={() => { setPickup(addr); setActiveInput(null); }}
                            className="w-full px-3 py-2 text-right hover:bg-purple-50 rounded-lg flex items-center gap-3"
                          >
                            <span className="text-xl">{addr.icon}</span>
                            <span className="font-medium text-gray-900">{addr.name}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Popular Locations */}
                    <div className="p-2">
                      <div className="text-xs font-bold text-gray-400 px-2 mb-2">أماكن شائعة</div>
                      {filterLocations(pickupSearch).map((loc) => (
                        <button
                          key={loc.id}
                          onClick={() => { setPickup(loc); setActiveInput(null); }}
                          className="w-full px-3 py-3 text-right hover:bg-purple-50 rounded-lg flex items-center gap-3"
                        >
                          <span className="text-xl">{loc.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{loc.name}</div>
                            <div className="text-sm text-gray-500">{loc.nameEn}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dropoff Input */}
              <div className="relative">
                <label className="flex items-center justify-between text-sm font-bold text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    الوجهة
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker('dropoff')}
                    className="text-purple-600 hover:text-purple-700 flex items-center gap-1 font-medium"
                  >
                    <span>🗺️</span>
                    <span>حدد على الخريطة</span>
                  </button>
                </label>
                <input
                  type="text"
                  value={dropoff ? dropoff.name : dropoffSearch}
                  onChange={(e) => {
                    setDropoffSearch(e.target.value);
                    setDropoff(null);
                  }}
                  onFocus={() => setActiveInput('dropoff')}
                  placeholder="إلى أين تريد الذهاب؟"
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-lg"
                />
                {dropoff && (
                  <button
                    onClick={() => { setDropoff(null); setDropoffSearch(''); }}
                    className="absolute left-3 top-[52px] text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}

                {/* Suggestions Dropdown */}
                {activeInput === 'dropoff' && !dropoff && (
                  <div className="absolute z-30 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    {filterLocations(dropoffSearch).map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => { setDropoff(loc); setActiveInput(null); }}
                        className="w-full px-3 py-3 text-right hover:bg-purple-50 rounded-lg flex items-center gap-3"
                      >
                        <span className="text-xl">{loc.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{loc.name}</div>
                          <div className="text-sm text-gray-500">{loc.nameEn}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            {pickup && dropoff && (
              <button
                onClick={() => {
                  const temp = pickup;
                  setPickup(dropoff);
                  setDropoff(temp);
                }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:left-1/2 md:top-[140px] w-10 h-10 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
              >
                ⇅
              </button>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && !pickup && !dropoff && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm font-bold text-gray-500 mb-3">🕐 بحث سابق</div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => { setPickup(search.pickup); setDropoff(search.dropoff); }}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                    >
                      {search.pickup.name} → {search.dropoff.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Provider Logos */}
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            {Object.values(PROVIDERS).map((provider) => (
              <div key={provider.id} className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <span className="text-xl">{provider.emoji}</span>
                <span className="text-white font-medium">{provider.nameAr}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      {(loading || offers.length > 0 || apiError) && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            {loading ? (
              <div className="text-center py-16">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-ping"></div>
                  <div className="absolute inset-2 border-4 border-purple-400 rounded-full animate-spin"></div>
                  <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center text-3xl">
                    🚕
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">جاري البحث عن أفضل الأسعار</h3>
                <p className="text-gray-500">نقارن 7 تطبيقات في وقت واحد...</p>
              </div>
            ) : apiError ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center text-5xl">
                  ⚠️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">عذراً!</h3>
                <p className="text-gray-600 mb-6">{apiError}</p>
                <button
                  onClick={() => {
                    setApiError(null);
                    fetchedForRef.current = ''; // Reset to allow retry
                    lastFetchTimeRef.current = 0; // Reset rate limit
                    if (pickup && dropoff) {
                      generateOffers();
                    }
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  🔄 حاول مرة أخرى
                </button>
              </div>
            ) : (
              <>
                {/* Route Info Bar */}
                {routeInfo && (
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📍</span>
                        <div>
                          <div className="text-sm opacity-80">المسافة</div>
                          <div className="font-bold">{routeInfo.distanceKm} كم</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">⏱️</span>
                        <div>
                          <div className="text-sm opacity-80">الوقت المتوقع</div>
                          <div className="font-bold">{routeInfo.durationMin} دقيقة</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🚦</span>
                        <div>
                          <div className="text-sm opacity-80">حالة المرور</div>
                          <div className="font-bold">{routeInfo.trafficCondition === 'light' ? 'خفيف' : routeInfo.trafficCondition === 'moderate' ? 'متوسط' : 'مزدحم'}</div>
                        </div>
                      </div>
                    </div>
                    {surgeInfo && surgeInfo.multiplier > 1.1 && (
                      <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                        <span className="text-xl">🔥</span>
                        <div>
                          <div className="text-sm">Surge x{surgeInfo.multiplier}</div>
                          <div className="text-xs opacity-80">{surgeInfo.demandLevel === 'HIGH' ? 'طلب مرتفع' : 'طلب متوسط'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center border-2 border-transparent hover:border-purple-200 transition-colors">
                    <div className="text-3xl font-black text-purple-600">{offers.length}</div>
                    <div className="text-sm text-gray-500">عرض متاح</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center border-2 border-green-200">
                    <div className="text-3xl font-black text-green-600">{cheapestOffer?.price} ج.م</div>
                    <div className="text-sm text-gray-500">أقل سعر ({cheapestOffer?.providerNameAr})</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center border-2 border-blue-200">
                    <div className="text-3xl font-black text-blue-600">{fastestOffer?.eta} دقيقة</div>
                    <div className="text-sm text-gray-500">أسرع وصول ({fastestOffer?.providerNameAr})</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center border-2 border-transparent hover:border-purple-200 transition-colors">
                    <div className="text-3xl font-black text-gray-600">{avgPrice} ج.م</div>
                    <div className="text-sm text-gray-500">متوسط السعر</div>
                  </div>
                </div>

                {/* Recommendation Banner */}
                {recommendation && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🎯</span>
                      <div>
                        <div className="font-bold text-lg">نوصي بـ {recommendation.provider} {recommendation.product}</div>
                        <div className="text-sm opacity-90">{recommendation.reason}</div>
                      </div>
                    </div>
                    <div className="text-3xl font-black">{recommendation.price} ج.م</div>
                  </div>
                )}

                {/* Filters */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { id: 'all', label: 'الكل', icon: '📋' },
                      { id: 'economy', label: 'اقتصادي', icon: '💰' },
                      { id: 'comfort', label: 'مريح', icon: '🛋️' },
                      { id: 'premium', label: 'فاخر', icon: '👑' },
                      { id: 'bus', label: 'باص', icon: '🚌' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id as any)}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          filterCategory === cat.id
                            ? 'bg-purple-600 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-700 hover:bg-gray-100 shadow-sm'
                        }`}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">ترتيب:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="recommended">⭐ الأفضل</option>
                      <option value="price">💰 الأرخص</option>
                      <option value="eta">⚡ الأسرع</option>
                    </select>
                  </div>
                </div>

                {/* Price Alert Button */}
                <div className="mb-6">
                  <Link
                    href={`/rides/alerts/new?pickup=${pickup?.name}&dropoff=${dropoff?.name}&price=${cheapestOffer?.price}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-xl hover:bg-amber-200 transition-colors"
                  >
                    <span>🔔</span>
                    نبهني عندما ينخفض السعر عن {cheapestOffer?.price} ج.م
                  </Link>
                </div>

                {/* Offers Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all border-2 ${
                        offer.isRecommended ? 'border-purple-500 ring-4 ring-purple-100' :
                        offer.isCheapest ? 'border-green-500' :
                        offer.isFastest ? 'border-blue-500' :
                        'border-transparent hover:border-gray-200'
                      }`}
                    >
                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-3 min-h-[28px]">
                        {offer.isRecommended && (
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold animate-pulse">⭐ الأفضل لك</span>
                        )}
                        {offer.isCheapest && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">💰 الأرخص</span>
                        )}
                        {offer.isFastest && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">⚡ الأسرع</span>
                        )}
                        {offer.discount && (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">-{offer.discount}%</span>
                        )}
                        {offer.surgeMultiplier > 1.1 && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">🔥 ذروة</span>
                        )}
                      </div>

                      {/* Provider Info */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 ${offer.providerBgColor} rounded-2xl flex items-center justify-center text-2xl shadow-md`}>
                          {offer.providerEmoji}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg">{offer.providerNameAr}</h3>
                          <p className="text-gray-500 flex items-center gap-1">
                            <span>{offer.typeIcon}</span>
                            {offer.typeNameAr}
                          </p>
                        </div>
                        <div className="text-left">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-gray-900">{offer.price}</span>
                            <span className="text-gray-500">ج.م</span>
                          </div>
                          {offer.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">{offer.originalPrice} ج.م</span>
                          )}
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                        <span className="flex items-center gap-1">
                          <span>⏱️</span> {offer.eta} دقيقة
                        </span>
                        <span className="flex items-center gap-1">
                          <span>📊</span> {offer.confidence}% دقة
                        </span>
                        {offer.surgeMultiplier > 1 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <span>📈</span> x{offer.surgeMultiplier}
                          </span>
                        )}
                      </div>

                      {/* Price Breakdown Toggle */}
                      <button
                        onClick={() => setShowPriceBreakdown(showPriceBreakdown === offer.id ? null : offer.id)}
                        className="w-full text-sm text-purple-600 hover:text-purple-700 mb-3 flex items-center justify-center gap-1"
                      >
                        {showPriceBreakdown === offer.id ? '▲ إخفاء التفاصيل' : '▼ تفاصيل السعر'}
                      </button>

                      {/* Price Breakdown */}
                      {showPriceBreakdown === offer.id && (
                        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">أجرة البداية</span>
                            <span className="font-medium">{offer.baseFare} ج.م</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">أجرة المسافة</span>
                            <span className="font-medium">{offer.distanceFare} ج.م</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">أجرة الوقت</span>
                            <span className="font-medium">{offer.timeFare} ج.م</span>
                          </div>
                          {offer.surgeMultiplier > 1 && (
                            <div className="flex justify-between text-amber-600">
                              <span>معامل الذروة</span>
                              <span className="font-medium">x{offer.surgeMultiplier}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-gray-200 pt-2 font-bold">
                            <span>الإجمالي</span>
                            <span>{offer.price} ج.م</span>
                          </div>
                        </div>
                      )}

                      {/* Book Button */}
                      <button
                        onClick={() => handleBook(offer)}
                        className={`w-full py-4 ${offer.providerBgColor} ${offer.providerBgColor === 'bg-yellow-500' ? 'text-black' : 'text-white'} rounded-xl font-bold text-lg hover:opacity-90 transition-all active:scale-95 shadow-lg`}
                      >
                        احجز الآن
                      </button>
                    </div>
                  ))}
                </div>

                {filteredOffers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عروض في هذه الفئة</h3>
                    <p className="text-gray-500">جرب تغيير الفلتر</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Features Section (when no results) */}
      {offers.length === 0 && !loading && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-gray-900 mb-4">🚀 لماذا Xchange Transport؟</h2>
              <p className="text-gray-600 text-lg">أول مجمع نقل ذكي شامل في مصر والشرق الأوسط</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '💰', title: 'وفر حتى 50%', desc: 'قارن جميع التطبيقات واختر الأرخص في ثوانٍ' },
                { icon: '⚡', title: 'حجز فوري', desc: 'احجز مباشرة من أي تطبيق بنقرة واحدة' },
                { icon: '🤖', title: 'ذكاء اصطناعي', desc: 'توصيات ذكية بناءً على السعر والوقت والموثوقية' },
                { icon: '📊', title: 'أسعار لحظية', desc: 'تحديث الأسعار كل 30 ثانية مع رصد الذروة' },
                { icon: '🚗', title: '7 تطبيقات', desc: 'Uber, Careem, Bolt, inDrive, DiDi, Swvl, Halan' },
                { icon: '🔔', title: 'تنبيهات الأسعار', desc: 'نبهك عندما ينخفض السعر لمسارك المفضل' },
                { icon: '📍', title: 'عناوين محفوظة', desc: 'احفظ عناوينك للوصول السريع' },
                { icon: '🔒', title: 'آمن 100%', desc: 'لا نحتفظ ببيانات الدفع أو الموقع' },
              ].map((feature, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-purple-50 transition-colors">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      {offers.length === 0 && !loading && (
        <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black mb-4">🔄 كيف يعمل؟</h2>
              <p className="text-white/80">ثلاث خطوات بسيطة للحصول على أفضل سعر</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: 1, icon: '📍', title: 'حدد المسار', desc: 'اختر نقطة الانطلاق والوجهة' },
                { step: 2, icon: '⚖️', title: 'قارن الأسعار', desc: 'شاهد جميع العروض من كل التطبيقات' },
                { step: 3, icon: '🚗', title: 'احجز مباشرة', desc: 'اضغط للحجز من التطبيق المختار' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
                    {item.icon}
                  </div>
                  <div className="w-10 h-10 bg-white text-purple-600 rounded-full flex items-center justify-center font-black text-xl mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-white/80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Click outside to close dropdowns */}
      {activeInput && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setActiveInput(null)}
        />
      )}

      {/* Map Location Picker Modal */}
      {showMapPicker && (
        <RideLocationPicker
          mode={showMapPicker}
          value={showMapPicker === 'pickup' ? pickup : dropoff}
          onChange={(location) => {
            if (showMapPicker === 'pickup') {
              setPickup(location);
              setPickupSearch('');
            } else {
              setDropoff(location);
              setDropoffSearch('');
            }
          }}
          onClose={() => setShowMapPicker(null)}
          otherLocation={showMapPicker === 'pickup' ? dropoff : pickup}
        />
      )}
    </div>
  );
}
