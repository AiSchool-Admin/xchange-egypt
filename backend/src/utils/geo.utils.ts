/**
 * Geographic Utility Functions
 *
 * Distance calculations and location-based scoring
 * for geographic clustering in barter matching
 */

import { EGYPT_GOVERNORATES, getGovernorateById, findCity } from '../data/egypt-geography';

// ============================================
// Distance Calculation
// ============================================

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 *
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

// ============================================
// Location Scoring
// ============================================

/**
 * Convert distance to match score (0-1)
 * Prioritizes nearby users for better logistics
 *
 * Distance Tiers:
 * - 0-5 km: Same city (Score: 1.0)
 * - 5-20 km: Nearby cities (Score: 0.8)
 * - 20-50 km: Same governorate (Score: 0.6)
 * - 50-100 km: Nearby governorates (Score: 0.4)
 * - 100+ km: Far (Score: 0.2)
 *
 * @param distanceKm Distance in kilometers
 * @returns Score between 0 and 1
 */
export function distanceToScore(distanceKm: number): number {
  if (distanceKm <= 5) return 1.0;    // Same city
  if (distanceKm <= 20) return 0.8;   // Nearby cities
  if (distanceKm <= 50) return 0.6;   // Same governorate
  if (distanceKm <= 100) return 0.4;  // Nearby governorates
  return 0.2;                         // Far
}

/**
 * Calculate location score between two users
 * Returns score between 0 and 1, with neutral 0.5 if no location data
 *
 * @param user1 First user location data
 * @param user2 Second user location data
 * @returns Location match score (0-1)
 */
export function calculateLocationScore(
  user1: { primaryLatitude?: number | null; primaryLongitude?: number | null },
  user2: { primaryLatitude?: number | null; primaryLongitude?: number | null }
): { score: number; distance?: number } {
  // If either user has no location data, return neutral score
  if (!user1.primaryLatitude || !user1.primaryLongitude ||
      !user2.primaryLatitude || !user2.primaryLongitude) {
    return { score: 0.5 }; // Neutral score
  }

  const distance = calculateDistance(
    user1.primaryLatitude,
    user1.primaryLongitude,
    user2.primaryLatitude,
    user2.primaryLongitude
  );

  const score = distanceToScore(distance);

  return { score, distance };
}

// ============================================
// Governorate & City Helpers
// ============================================

/**
 * Get coordinates for a governorate
 */
export function getGovernorateCoordinates(governorateName: string): { lat: number; lon: number } | null {
  const gov = EGYPT_GOVERNORATES.find(
    g => g.nameEn.toLowerCase() === governorateName.toLowerCase() ||
         g.nameAr === governorateName
  );

  if (!gov) return null;

  return {
    lat: gov.latitude,
    lon: gov.longitude,
  };
}

/**
 * Get coordinates for a city
 */
export function getCityCoordinates(
  governorateName: string,
  cityName: string
): { lat: number; lon: number } | null {
  const gov = EGYPT_GOVERNORATES.find(
    g => g.nameEn.toLowerCase() === governorateName.toLowerCase() ||
         g.nameAr === governorateName
  );

  if (!gov) return null;

  const city = gov.cities.find(
    c => c.nameEn.toLowerCase() === cityName.toLowerCase() ||
         c.nameAr === cityName
  );

  if (!city) return null;

  return {
    lat: city.lat,
    lon: city.lon,
  };
}

/**
 * Calculate distance between two governorates
 */
export function calculateGovernorateDistance(
  gov1Name: string,
  gov2Name: string
): number | null {
  const coords1 = getGovernorateCoordinates(gov1Name);
  const coords2 = getGovernorateCoordinates(gov2Name);

  if (!coords1 || !coords2) return null;

  return calculateDistance(coords1.lat, coords1.lon, coords2.lat, coords2.lon);
}

// ============================================
// Geographic Clustering
// ============================================

/**
 * Determine if two users are in the same city
 */
export function isSameCity(
  user1: { primaryGovernorate?: string | null; primaryCity?: string | null },
  user2: { primaryGovernorate?: string | null; primaryCity?: string | null }
): boolean {
  if (!user1.primaryCity || !user2.primaryCity) return false;
  if (!user1.primaryGovernorate || !user2.primaryGovernorate) return false;

  return (
    user1.primaryGovernorate.toLowerCase() === user2.primaryGovernorate.toLowerCase() &&
    user1.primaryCity.toLowerCase() === user2.primaryCity.toLowerCase()
  );
}

/**
 * Determine if two users are in the same governorate
 */
export function isSameGovernorate(
  user1: { primaryGovernorate?: string | null },
  user2: { primaryGovernorate?: string | null }
): boolean {
  if (!user1.primaryGovernorate || !user2.primaryGovernorate) return false;

  return user1.primaryGovernorate.toLowerCase() === user2.primaryGovernorate.toLowerCase();
}

/**
 * Get distance tier description
 */
export function getDistanceTier(distanceKm: number): string {
  if (distanceKm <= 5) return 'Same City';
  if (distanceKm <= 20) return 'Nearby Cities';
  if (distanceKm <= 50) return 'Same Governorate';
  if (distanceKm <= 100) return 'Nearby Governorates';
  return 'Far';
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

// ============================================
// Batch Operations
// ============================================

/**
 * Calculate distances from a point to multiple other points
 * Useful for finding nearest matches
 */
export function calculateDistances(
  origin: { lat: number; lon: number },
  destinations: Array<{ id: string; lat: number; lon: number }>
): Array<{ id: string; distance: number }> {
  return destinations
    .map(dest => ({
      id: dest.id,
      distance: calculateDistance(origin.lat, origin.lon, dest.lat, dest.lon),
    }))
    .sort((a, b) => a.distance - b.distance); // Sort by nearest first
}

/**
 * Filter users within a certain radius
 */
export function getUsersWithinRadius(
  origin: { lat: number; lon: number },
  users: Array<{ id: string; lat?: number | null; lon?: number | null }>,
  radiusKm: number
): string[] {
  return users
    .filter(user => {
      if (!user.lat || !user.lon) return false;
      const distance = calculateDistance(origin.lat, origin.lon, user.lat, user.lon);
      return distance <= radiusKm;
    })
    .map(user => user.id);
}
