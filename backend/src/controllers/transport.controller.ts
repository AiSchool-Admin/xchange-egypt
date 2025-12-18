import { Request, Response } from 'express';

// ============================================
// Transport Provider Types
// ============================================
type TransportProvider = 'UBER' | 'CAREEM' | 'BOLT' | 'INDRIVE' | 'DIDI' | 'SWVL' | 'HALAN';
type VehicleType = 'ECONOMY' | 'COMFORT' | 'PREMIUM' | 'XL' | 'BUS' | 'BIKE';

interface ProviderConfig {
  name: string;
  nameAr: string;
  isActive: boolean;
  deepLinkScheme: string;
  webUrl: string;
  avgRating: number;
  reliabilityScore: number;
  vehicleTypes: VehicleTypeConfig[];
}

interface VehicleTypeConfig {
  type: VehicleType;
  name: string;
  nameAr: string;
  baseFare: number;
  perKmRate: number;
  perMinRate: number;
  bookingFee: number;
  minimumFare: number;
}

// ============================================
// Provider Configurations
// ============================================
const PROVIDER_CONFIGS: Record<TransportProvider, ProviderConfig> = {
  UBER: {
    name: 'Uber',
    nameAr: 'أوبر',
    isActive: true,
    deepLinkScheme: 'uber://',
    webUrl: 'https://m.uber.com',
    avgRating: 4.7,
    reliabilityScore: 95,
    vehicleTypes: [
      { type: 'ECONOMY', name: 'UberX', nameAr: 'أوبر إكس', baseFare: 15, perKmRate: 5.5, perMinRate: 0.8, bookingFee: 5, minimumFare: 25 },
      { type: 'COMFORT', name: 'Uber Comfort', nameAr: 'أوبر كومفورت', baseFare: 20, perKmRate: 7, perMinRate: 1, bookingFee: 7, minimumFare: 35 },
      { type: 'PREMIUM', name: 'Uber Black', nameAr: 'أوبر بلاك', baseFare: 35, perKmRate: 12, perMinRate: 1.5, bookingFee: 10, minimumFare: 60 },
      { type: 'XL', name: 'UberXL', nameAr: 'أوبر XL', baseFare: 25, perKmRate: 8, perMinRate: 1.2, bookingFee: 8, minimumFare: 45 },
    ]
  },
  CAREEM: {
    name: 'Careem',
    nameAr: 'كريم',
    isActive: true,
    deepLinkScheme: 'careem://',
    webUrl: 'https://app.careem.com',
    avgRating: 4.6,
    reliabilityScore: 92,
    vehicleTypes: [
      { type: 'ECONOMY', name: 'Go', nameAr: 'جو', baseFare: 12, perKmRate: 5, perMinRate: 0.7, bookingFee: 4, minimumFare: 22 },
      { type: 'COMFORT', name: 'Go Plus', nameAr: 'جو بلس', baseFare: 18, perKmRate: 6.5, perMinRate: 0.9, bookingFee: 6, minimumFare: 32 },
      { type: 'PREMIUM', name: 'Business', nameAr: 'بيزنس', baseFare: 30, perKmRate: 10, perMinRate: 1.3, bookingFee: 9, minimumFare: 55 },
    ]
  },
  BOLT: {
    name: 'Bolt',
    nameAr: 'بولت',
    isActive: true,
    deepLinkScheme: 'bolt://',
    webUrl: 'https://bolt.eu',
    avgRating: 4.5,
    reliabilityScore: 88,
    vehicleTypes: [
      { type: 'ECONOMY', name: 'Bolt', nameAr: 'بولت', baseFare: 10, perKmRate: 4.5, perMinRate: 0.6, bookingFee: 3, minimumFare: 18 },
      { type: 'COMFORT', name: 'Bolt Plus', nameAr: 'بولت بلس', baseFare: 15, perKmRate: 6, perMinRate: 0.85, bookingFee: 5, minimumFare: 28 },
    ]
  },
  INDRIVE: {
    name: 'inDrive',
    nameAr: 'إن درايف',
    isActive: true,
    deepLinkScheme: 'indrive://',
    webUrl: 'https://indrive.com',
    avgRating: 4.3,
    reliabilityScore: 80,
    vehicleTypes: [
      { type: 'ECONOMY', name: 'City', nameAr: 'سيتي', baseFare: 8, perKmRate: 4, perMinRate: 0.5, bookingFee: 2, minimumFare: 15 },
      { type: 'COMFORT', name: 'Comfort', nameAr: 'كومفورت', baseFare: 12, perKmRate: 5.5, perMinRate: 0.75, bookingFee: 4, minimumFare: 25 },
    ]
  },
  DIDI: {
    name: 'DiDi',
    nameAr: 'ديدي',
    isActive: true,
    deepLinkScheme: 'didiglobal://',
    webUrl: 'https://web.didiglobal.com',
    avgRating: 4.4,
    reliabilityScore: 85,
    vehicleTypes: [
      { type: 'ECONOMY', name: 'DiDi Express', nameAr: 'ديدي إكسبرس', baseFare: 11, perKmRate: 4.8, perMinRate: 0.65, bookingFee: 3.5, minimumFare: 20 },
      { type: 'COMFORT', name: 'DiDi Plus', nameAr: 'ديدي بلس', baseFare: 16, perKmRate: 6.2, perMinRate: 0.9, bookingFee: 5.5, minimumFare: 30 },
    ]
  },
  SWVL: {
    name: 'Swvl',
    nameAr: 'سويفل',
    isActive: true,
    deepLinkScheme: 'swvl://',
    webUrl: 'https://swvl.com',
    avgRating: 4.2,
    reliabilityScore: 90,
    vehicleTypes: [
      { type: 'BUS', name: 'Swvl Bus', nameAr: 'باص سويفل', baseFare: 5, perKmRate: 1.5, perMinRate: 0.2, bookingFee: 2, minimumFare: 10 },
    ]
  },
  HALAN: {
    name: 'Halan',
    nameAr: 'هلان',
    isActive: true,
    deepLinkScheme: 'halan://',
    webUrl: 'https://halan.com',
    avgRating: 4.1,
    reliabilityScore: 78,
    vehicleTypes: [
      { type: 'BIKE', name: 'Halan Bike', nameAr: 'هلان بايك', baseFare: 5, perKmRate: 2, perMinRate: 0.3, bookingFee: 1, minimumFare: 10 },
      { type: 'ECONOMY', name: 'Halan Tuk-Tuk', nameAr: 'هلان توك توك', baseFare: 8, perKmRate: 3, perMinRate: 0.4, bookingFee: 2, minimumFare: 12 },
    ]
  },
};

// ============================================
// Surge Patterns (Time-based)
// ============================================
const SURGE_PATTERNS: Record<string, number> = {
  // Hour-based surge multipliers
  '0-6': 0.9,   // Late night/early morning - lower demand
  '6-8': 1.3,   // Morning rush
  '8-10': 1.5,  // Peak morning
  '10-14': 1.0, // Normal hours
  '14-16': 1.1, // Afternoon
  '16-18': 1.4, // Evening rush
  '18-20': 1.6, // Peak evening
  '20-22': 1.2, // Night
  '22-24': 1.0, // Late night
};

// ============================================
// Helper Functions
// ============================================
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getSurgeMultiplier(): number {
  const hour = new Date().getHours();
  for (const [range, multiplier] of Object.entries(SURGE_PATTERNS)) {
    const [start, end] = range.split('-').map(Number);
    if (hour >= start && hour < end) {
      // Add some randomness
      return multiplier + (Math.random() * 0.2 - 0.1);
    }
  }
  return 1.0;
}

function calculateETA(distanceKm: number): number {
  // Base ETA calculation with traffic consideration
  const baseMinutes = 3; // Base wait time
  const trafficFactor = getSurgeMultiplier() > 1.3 ? 1.5 : 1.0;
  return Math.round(baseMinutes + (Math.random() * 5 * trafficFactor));
}

function generateDeepLink(provider: TransportProvider, pickup: { lat: number; lng: number }, dropoff: { lat: number; lng: number }): string {
  const config = PROVIDER_CONFIGS[provider];
  const params = new URLSearchParams({
    pickup_lat: pickup.lat.toString(),
    pickup_lng: pickup.lng.toString(),
    dropoff_lat: dropoff.lat.toString(),
    dropoff_lng: dropoff.lng.toString(),
  });
  return `${config.deepLinkScheme}ride?${params.toString()}`;
}

function calculateRecommendationScore(price: number, eta: number, surge: number, reliability: number): number {
  // Weighted scoring: price (40%), confidence (30%), surge (20%), reliability (10%)
  const priceScore = Math.max(0, 100 - (price / 2)); // Lower price = higher score
  const etaScore = Math.max(0, 100 - (eta * 10)); // Lower ETA = higher score
  const surgeScore = Math.max(0, 100 - ((surge - 1) * 50)); // Lower surge = higher score
  const reliabilityScore = reliability;

  return Math.round(
    priceScore * 0.4 +
    etaScore * 0.3 +
    surgeScore * 0.2 +
    reliabilityScore * 0.1
  );
}

// ============================================
// Controller Functions
// ============================================

/**
 * Get price estimates from all providers
 */
export const getPriceEstimates = async (req: Request, res: Response) => {
  try {
    const {
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      vehicleTypes
    } = req.query;

    // Validate inputs
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and dropoff coordinates are required',
      });
    }

    const pickup = {
      lat: parseFloat(pickupLat as string),
      lng: parseFloat(pickupLng as string),
    };

    const dropoff = {
      lat: parseFloat(dropoffLat as string),
      lng: parseFloat(dropoffLng as string),
    };

    // Calculate distance and duration
    const distanceKm = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
    const durationMin = Math.round((distanceKm / 30) * 60); // Assume avg 30 km/h

    // Get surge multiplier
    const surgeMultiplier = getSurgeMultiplier();

    // Filter vehicle types if specified
    const requestedTypes = vehicleTypes
      ? (vehicleTypes as string).split(',') as VehicleType[]
      : ['ECONOMY', 'COMFORT', 'PREMIUM', 'XL', 'BUS', 'BIKE'] as VehicleType[];

    // Generate estimates for all providers
    const estimates: any[] = [];

    for (const [providerKey, config] of Object.entries(PROVIDER_CONFIGS)) {
      if (!config.isActive) continue;

      const provider = providerKey as TransportProvider;

      for (const vehicleType of config.vehicleTypes) {
        if (!requestedTypes.includes(vehicleType.type)) continue;

        // Calculate price
        const distanceFare = distanceKm * vehicleType.perKmRate;
        const timeFare = durationMin * vehicleType.perMinRate;
        const basePrice = vehicleType.baseFare + distanceFare + timeFare + vehicleType.bookingFee;
        const surgedPrice = basePrice * surgeMultiplier;
        const finalPrice = Math.max(vehicleType.minimumFare, Math.round(surgedPrice));

        // Calculate ETA
        const eta = calculateETA(distanceKm);

        // Calculate confidence score
        const confidenceScore = Math.min(100, 70 + Math.random() * 25);

        // Calculate recommendation score
        const recommendationScore = calculateRecommendationScore(
          finalPrice,
          eta,
          surgeMultiplier,
          config.reliabilityScore
        );

        estimates.push({
          id: `${provider}_${vehicleType.type}_${Date.now()}`,
          provider,
          providerName: config.name,
          providerNameAr: config.nameAr,
          vehicleType: vehicleType.type,
          vehicleTypeName: vehicleType.name,
          vehicleTypeNameAr: vehicleType.nameAr,
          price: finalPrice,
          originalPrice: surgeMultiplier > 1.1 ? Math.round(basePrice) : null,
          discount: null,
          currency: 'EGP',
          priceBreakdown: {
            baseFare: vehicleType.baseFare,
            distanceFare: Math.round(distanceFare),
            timeFare: Math.round(timeFare),
            bookingFee: vehicleType.bookingFee,
            surgeMultiplier: Math.round(surgeMultiplier * 100) / 100,
          },
          etaMinutes: eta,
          confidenceScore: Math.round(confidenceScore),
          recommendationScore,
          isRecommended: false, // Will be set after sorting
          deepLink: generateDeepLink(provider, pickup, dropoff),
          webFallbackUrl: config.webUrl,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min expiry
        });
      }
    }

    // Sort by recommendation score and mark the best one
    estimates.sort((a, b) => b.recommendationScore - a.recommendationScore);
    if (estimates.length > 0) {
      estimates[0].isRecommended = true;
    }

    return res.json({
      success: true,
      data: {
        route: {
          pickup,
          dropoff,
          distanceKm: Math.round(distanceKm * 10) / 10,
          durationMin,
        },
        surge: {
          multiplier: Math.round(surgeMultiplier * 100) / 100,
          isActive: surgeMultiplier > 1.1,
          demandLevel: surgeMultiplier > 1.4 ? 'HIGH' : surgeMultiplier > 1.2 ? 'MEDIUM' : 'LOW',
        },
        estimates,
        meta: {
          totalProviders: Object.keys(PROVIDER_CONFIGS).filter(p => PROVIDER_CONFIGS[p as TransportProvider].isActive).length,
          totalEstimates: estimates.length,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error getting price estimates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get price estimates',
    });
  }
};

/**
 * Get all available providers
 */
export const getProviders = async (req: Request, res: Response) => {
  try {
    const providers = Object.entries(PROVIDER_CONFIGS)
      .filter(([_, config]) => config.isActive)
      .map(([key, config]) => ({
        id: key,
        name: config.name,
        nameAr: config.nameAr,
        avgRating: config.avgRating,
        reliabilityScore: config.reliabilityScore,
        vehicleTypes: config.vehicleTypes.map(vt => ({
          type: vt.type,
          name: vt.name,
          nameAr: vt.nameAr,
        })),
      }));

    return res.json({
      success: true,
      data: providers,
    });
  } catch (error) {
    console.error('Error getting providers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get providers',
    });
  }
};

/**
 * Get surge information for a location
 */
export const getSurgeInfo = async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required',
      });
    }

    const surgeMultiplier = getSurgeMultiplier();
    const hour = new Date().getHours();

    // Predict surge for next few hours
    const predictions: { hour: number; multiplier: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const futureHour = (hour + i) % 24;
      for (const [range, multiplier] of Object.entries(SURGE_PATTERNS)) {
        const [start, end] = range.split('-').map(Number);
        if (futureHour >= start && futureHour < end) {
          predictions.push({
            hour: futureHour,
            multiplier: multiplier + (Math.random() * 0.1 - 0.05),
          });
          break;
        }
      }
    }

    return res.json({
      success: true,
      data: {
        current: {
          multiplier: Math.round(surgeMultiplier * 100) / 100,
          isActive: surgeMultiplier > 1.1,
          demandLevel: surgeMultiplier > 1.4 ? 'HIGH' : surgeMultiplier > 1.2 ? 'MEDIUM' : 'LOW',
        },
        predictions,
        bestTimeToBook: predictions.reduce((best, curr) =>
          curr.multiplier < best.multiplier ? curr : best
        , predictions[0]),
      },
    });
  } catch (error) {
    console.error('Error getting surge info:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get surge info',
    });
  }
};

/**
 * Save a price alert
 */
export const createPriceAlert = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      pickupLat,
      pickupLng,
      pickupAddress,
      dropoffLat,
      dropoffLng,
      dropoffAddress,
      targetPrice,
      provider,
      vehicleType,
      expiresInDays = 7,
      notifyPush = true,
      notifyEmail = false,
      notifySms = false,
    } = req.body;

    // Validate inputs
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng || !targetPrice) {
      return res.status(400).json({
        success: false,
        message: 'Route and target price are required',
      });
    }

    // Calculate current average price for comparison
    const distanceKm = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const avgPrice = Math.round(15 + (distanceKm * 5.5)); // Rough estimate

    const alert = {
      id: `alert_${Date.now()}`,
      userId,
      pickupLat,
      pickupLng,
      pickupAddress,
      dropoffLat,
      dropoffLng,
      dropoffAddress,
      targetPrice,
      currentPrice: avgPrice,
      provider: provider || null,
      vehicleType: vehicleType || null,
      isActive: true,
      isTriggered: false,
      notifyPush,
      notifyEmail,
      notifySms,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
    };

    // In a real implementation, save to database
    // await prisma.priceAlert.create({ data: alert });

    return res.status(201).json({
      success: true,
      data: alert,
      message: 'Price alert created successfully',
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create price alert',
    });
  }
};

/**
 * Get user's price alerts
 */
export const getPriceAlerts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    // In a real implementation, fetch from database
    // const alerts = await prisma.priceAlert.findMany({ where: { userId } });

    // Return mock data for now
    const alerts: any[] = [];

    return res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    console.error('Error getting price alerts:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get price alerts',
    });
  }
};

/**
 * Delete a price alert
 */
export const deletePriceAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const userId = (req as any).user?.id;

    // In a real implementation, delete from database
    // await prisma.priceAlert.delete({ where: { id: alertId, userId } });

    return res.json({
      success: true,
      message: 'Price alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete price alert',
    });
  }
};

/**
 * Save an address
 */
export const saveAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const {
      name,
      nameAr,
      type = 'FAVORITE',
      lat,
      lng,
      address,
      addressAr,
      buildingName,
      floor,
      apartment,
      landmark,
      instructions,
    } = req.body;

    // Validate inputs
    if (!lat || !lng || !address) {
      return res.status(400).json({
        success: false,
        message: 'Location and address are required',
      });
    }

    const savedAddress = {
      id: `addr_${Date.now()}`,
      userId,
      name: name || 'Address',
      nameAr: nameAr || name || 'عنوان',
      type,
      lat,
      lng,
      address,
      addressAr: addressAr || address,
      buildingName,
      floor,
      apartment,
      landmark,
      instructions,
      useCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real implementation, save to database
    // await prisma.savedAddress.create({ data: savedAddress });

    return res.status(201).json({
      success: true,
      data: savedAddress,
      message: 'Address saved successfully',
    });
  } catch (error) {
    console.error('Error saving address:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save address',
    });
  }
};

/**
 * Get user's saved addresses
 */
export const getSavedAddresses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    // In a real implementation, fetch from database
    // const addresses = await prisma.savedAddress.findMany({ where: { userId } });

    // Return mock data for now
    const addresses: any[] = [];

    return res.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Error getting saved addresses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get saved addresses',
    });
  }
};

/**
 * Get user's ride history
 */
export const getRideHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { limit = 20, offset = 0, status } = req.query;

    // In a real implementation, fetch from database
    // const rides = await prisma.completedRide.findMany({
    //   where: { userId, status },
    //   take: parseInt(limit as string),
    //   skip: parseInt(offset as string),
    //   orderBy: { completedAt: 'desc' }
    // });

    // Return mock data for now
    const rides: any[] = [];

    return res.json({
      success: true,
      data: {
        rides,
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: 0,
        },
      },
    });
  } catch (error) {
    console.error('Error getting ride history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get ride history',
    });
  }
};

/**
 * Get ride statistics
 */
export const getRideStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { period = 'month' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    // In a real implementation, aggregate from database
    // const stats = await prisma.completedRide.aggregate({...})

    // Return mock stats
    const stats = {
      totalRides: 0,
      totalSpent: 0,
      totalDistance: 0,
      totalTime: 0,
      totalSaved: 0,
      avgRating: 0,
      avgPricePerKm: 0,
      byProvider: [],
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting ride stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get ride stats',
    });
  }
};

export default {
  getPriceEstimates,
  getProviders,
  getSurgeInfo,
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert,
  saveAddress,
  getSavedAddresses,
  getRideHistory,
  getRideStats,
};
