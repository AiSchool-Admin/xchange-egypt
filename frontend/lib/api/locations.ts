/**
 * Egyptian Locations API Client
 * Uses static data for immediate availability (no API dependency)
 */

import {
  egyptLocations,
  getAllGovernorates as getStaticGovernorates,
  getCitiesByGovernorate as getStaticCities,
  getDistrictsByCity as getStaticDistricts,
  Governorate,
  City,
  District,
} from '@/lib/data/egypt-locations';

// Re-export types
export type { Governorate, City, District };

/**
 * Get all Egyptian governorates (static data)
 */
export async function getGovernorates(): Promise<Governorate[]> {
  // Return static data immediately (no network call needed)
  return getStaticGovernorates();
}

/**
 * Get all cities in a governorate (static data)
 */
export async function getCities(governorateId: string): Promise<City[]> {
  return getStaticCities(governorateId);
}

/**
 * Get all districts in a city (static data)
 */
export async function getDistricts(governorateId: string, cityId: string): Promise<District[]> {
  return getStaticDistricts(governorateId, cityId);
}

/**
 * Format location display name (bilingual)
 */
export function formatLocationName(item: { nameEn: string; nameAr: string }, locale: 'en' | 'ar' = 'en'): string {
  return locale === 'ar' ? item.nameAr : item.nameEn;
}

/**
 * Format full location string
 */
export function formatFullLocation(
  governorate?: Governorate | null,
  city?: City | null,
  district?: District | null,
  locale: 'en' | 'ar' = 'en'
): string {
  const parts: string[] = [];

  if (district) {
    parts.push(formatLocationName(district, locale));
  }
  if (city) {
    parts.push(formatLocationName(city, locale));
  }
  if (governorate) {
    parts.push(formatLocationName(governorate, locale));
  }

  return parts.join(', ');
}

// Export static data for direct access if needed
export { egyptLocations };
