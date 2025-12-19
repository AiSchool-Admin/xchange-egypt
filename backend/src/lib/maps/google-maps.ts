/**
 * Google Maps Distance Matrix API Integration
 * ============================================
 *
 * للحصول على المسافة والوقت الفعلي بين نقطتين
 * مع مراعاة حركة المرور
 */

import { redis } from '../../config/redis';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface RouteInfo {
  distanceKm: number;
  distanceMeters: number;
  durationMin: number;
  durationSeconds: number;
  durationInTrafficMin: number;
  durationInTrafficSeconds: number;
  trafficCondition: 'light' | 'moderate' | 'heavy';
  polyline?: string;
}

export interface GeocodingResult {
  formattedAddress: string;
  formattedAddressAr: string;
  lat: number;
  lng: number;
  placeId: string;
  city: string;
  district: string;
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const CACHE_TTL = 300; // 5 دقائق

/**
 * حساب المسافة والوقت بين نقطتين
 */
export async function getRouteInfo(
  origin: Location,
  destination: Location,
  departureTime: Date = new Date()
): Promise<RouteInfo> {
  // التحقق من الـ Cache
  const cacheKey = `route:${origin.lat},${origin.lng}:${destination.lat},${destination.lng}`;

  try {
    const cached = await redis?.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // Redis غير متاح - نستمر بدون cache
  }

  // إذا لم يكن هناك API Key، استخدم حساب تقريبي
  if (!GOOGLE_MAPS_API_KEY) {
    return calculateApproximateRoute(origin, destination);
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.append('origins', `${origin.lat},${origin.lng}`);
    url.searchParams.append('destinations', `${destination.lat},${destination.lng}`);
    url.searchParams.append('mode', 'driving');
    url.searchParams.append('departure_time', Math.floor(departureTime.getTime() / 1000).toString());
    url.searchParams.append('traffic_model', 'best_guess');
    url.searchParams.append('language', 'ar');
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json() as any;

    if (data.status !== 'OK' || !data.rows?.[0]?.elements?.[0]) {
      console.error('Google Maps API error:', data);
      return calculateApproximateRoute(origin, destination);
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      return calculateApproximateRoute(origin, destination);
    }

    const distanceMeters = element.distance.value;
    const durationSeconds = element.duration.value;
    const durationInTrafficSeconds = element.duration_in_traffic?.value || durationSeconds;

    // تحديد حالة المرور
    const trafficRatio = durationInTrafficSeconds / durationSeconds;
    let trafficCondition: 'light' | 'moderate' | 'heavy';
    if (trafficRatio < 1.2) {
      trafficCondition = 'light';
    } else if (trafficRatio < 1.5) {
      trafficCondition = 'moderate';
    } else {
      trafficCondition = 'heavy';
    }

    const result: RouteInfo = {
      distanceKm: distanceMeters / 1000,
      distanceMeters,
      durationMin: Math.ceil(durationSeconds / 60),
      durationSeconds,
      durationInTrafficMin: Math.ceil(durationInTrafficSeconds / 60),
      durationInTrafficSeconds,
      trafficCondition
    };

    // حفظ في الـ Cache
    try {
      await redis?.setEx(cacheKey, CACHE_TTL, JSON.stringify(result));
    } catch (e) {
      // Redis غير متاح
    }

    return result;
  } catch (error) {
    console.error('Error calling Google Maps API:', error);
    return calculateApproximateRoute(origin, destination);
  }
}

/**
 * حساب تقريبي للمسافة باستخدام معادلة Haversine
 * يستخدم عندما Google Maps API غير متاح
 */
export function calculateApproximateRoute(origin: Location, destination: Location): RouteInfo {
  const R = 6371; // نصف قطر الأرض بالكيلومتر

  const lat1 = origin.lat * Math.PI / 180;
  const lat2 = destination.lat * Math.PI / 180;
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLng = (destination.lng - origin.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const directDistance = R * c;

  // المسافة الفعلية للطريق أطول بـ 30% تقريباً
  const roadDistance = directDistance * 1.3;

  // تقدير الوقت بناءً على سرعة متوسطة 25 كم/ساعة في القاهرة
  const avgSpeedKmh = 25;
  const durationMin = Math.ceil((roadDistance / avgSpeedKmh) * 60);

  // إضافة وقت للمرور بناءً على الوقت
  const hour = new Date().getHours();
  let trafficMultiplier = 1.0;
  let trafficCondition: 'light' | 'moderate' | 'heavy' = 'light';

  if ((hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    trafficMultiplier = 1.5;
    trafficCondition = 'heavy';
  } else if ((hour >= 12 && hour <= 14) || (hour >= 21 && hour <= 23)) {
    trafficMultiplier = 1.2;
    trafficCondition = 'moderate';
  }

  const durationInTrafficMin = Math.ceil(durationMin * trafficMultiplier);

  return {
    distanceKm: Math.round(roadDistance * 10) / 10,
    distanceMeters: Math.round(roadDistance * 1000),
    durationMin,
    durationSeconds: durationMin * 60,
    durationInTrafficMin,
    durationInTrafficSeconds: durationInTrafficMin * 60,
    trafficCondition
  };
}

/**
 * تحويل إحداثيات إلى عنوان (Reverse Geocoding)
 */
export async function reverseGeocode(location: Location): Promise<GeocodingResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    return {
      formattedAddress: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      formattedAddressAr: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      lat: location.lat,
      lng: location.lng,
      placeId: '',
      city: 'القاهرة',
      district: ''
    };
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.append('latlng', `${location.lat},${location.lng}`);
    url.searchParams.append('language', 'ar');
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json() as any;

    if (data.status !== 'OK' || !data.results?.[0]) {
      return null;
    }

    const result = data.results[0];

    // استخراج المدينة والحي
    let city = '';
    let district = '';

    for (const component of result.address_components) {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
        district = component.long_name;
      }
    }

    return {
      formattedAddress: result.formatted_address,
      formattedAddressAr: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      placeId: result.place_id,
      city: city || 'القاهرة',
      district
    };
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
}

/**
 * البحث عن مكان (Places Autocomplete)
 */
export async function searchPlaces(query: string, location?: Location): Promise<GeocodingResult[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    return [];
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    url.searchParams.append('input', query);
    url.searchParams.append('components', 'country:eg');
    url.searchParams.append('language', 'ar');
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);

    if (location) {
      url.searchParams.append('location', `${location.lat},${location.lng}`);
      url.searchParams.append('radius', '50000'); // 50km
    }

    const response = await fetch(url.toString());
    const data = await response.json() as any;

    if (data.status !== 'OK' || !data.predictions) {
      return [];
    }

    // الحصول على تفاصيل كل مكان
    const results: GeocodingResult[] = [];

    for (const prediction of data.predictions.slice(0, 5)) {
      const details = await getPlaceDetails(prediction.place_id);
      if (details) {
        results.push(details);
      }
    }

    return results;
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

/**
 * الحصول على تفاصيل مكان
 */
async function getPlaceDetails(placeId: string): Promise<GeocodingResult | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.append('place_id', placeId);
    url.searchParams.append('fields', 'geometry,formatted_address,address_components');
    url.searchParams.append('language', 'ar');
    url.searchParams.append('key', GOOGLE_MAPS_API_KEY);

    const response = await fetch(url.toString());
    const data = await response.json() as any;

    if (data.status !== 'OK' || !data.result) {
      return null;
    }

    const result = data.result;

    let city = '';
    let district = '';

    for (const component of result.address_components || []) {
      if (component.types.includes('locality')) {
        city = component.long_name;
      }
      if (component.types.includes('sublocality') || component.types.includes('neighborhood')) {
        district = component.long_name;
      }
    }

    return {
      formattedAddress: result.formatted_address,
      formattedAddressAr: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      placeId,
      city: city || 'القاهرة',
      district
    };
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
}

/**
 * التحقق من توفر Google Maps API
 */
export function isGoogleMapsAvailable(): boolean {
  return !!GOOGLE_MAPS_API_KEY;
}

/**
 * حساب المسافة المباشرة (Haversine)
 */
export function calculateDirectDistance(origin: Location, destination: Location): number {
  const R = 6371;

  const lat1 = origin.lat * Math.PI / 180;
  const lat2 = destination.lat * Math.PI / 180;
  const dLat = (destination.lat - origin.lat) * Math.PI / 180;
  const dLng = (destination.lng - origin.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
