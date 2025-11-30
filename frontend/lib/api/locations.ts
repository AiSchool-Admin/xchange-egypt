/**
 * Egyptian Locations API Client
 * Fetches governorates, cities, and districts from backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface District {
  id: string;
  nameAr: string;
  nameEn: string;
}

export interface City {
  id: string;
  nameAr: string;
  nameEn: string;
  districts?: District[];
}

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  cities?: City[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Get all Egyptian governorates
 */
export async function getGovernorates(): Promise<Governorate[]> {
  try {
    const response = await fetch(`${API_URL}/api/v1/locations/governorates`);
    const result: ApiResponse<Governorate[]> = await response.json();

    if (!result.success) {
      console.error('Failed to fetch governorates:', result.error);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching governorates:', error);
    return [];
  }
}

/**
 * Get a specific governorate with all its cities
 */
export async function getGovernorate(governorateId: string): Promise<Governorate | null> {
  try {
    const response = await fetch(`${API_URL}/api/v1/locations/governorates/${governorateId}`);
    const result: ApiResponse<Governorate> = await response.json();

    if (!result.success) {
      console.error('Failed to fetch governorate:', result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching governorate:', error);
    return null;
  }
}

/**
 * Get all cities in a governorate
 */
export async function getCities(governorateId: string): Promise<City[]> {
  try {
    const response = await fetch(`${API_URL}/api/v1/locations/governorates/${governorateId}/cities`);
    const result: ApiResponse<City[]> = await response.json();

    if (!result.success) {
      console.error('Failed to fetch cities:', result.error);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

/**
 * Get a specific city with all its districts
 */
export async function getCity(governorateId: string, cityId: string): Promise<City | null> {
  try {
    const response = await fetch(`${API_URL}/api/v1/locations/governorates/${governorateId}/cities/${cityId}`);
    const result: ApiResponse<City> = await response.json();

    if (!result.success) {
      console.error('Failed to fetch city:', result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching city:', error);
    return null;
  }
}

/**
 * Get all districts in a city
 */
export async function getDistricts(governorateId: string, cityId: string): Promise<District[]> {
  try {
    const response = await fetch(`${API_URL}/api/v1/locations/governorates/${governorateId}/cities/${cityId}/districts`);
    const result: ApiResponse<District[]> = await response.json();

    if (!result.success) {
      console.error('Failed to fetch districts:', result.error);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
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
