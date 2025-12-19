/**
 * Uber API Integration Service
 * ============================
 *
 * Official Uber API integration for ride booking
 * Documentation: https://developer.uber.com/docs/riders/ride-requests/introduction
 *
 * Features:
 * - OAuth 2.0 authentication
 * - Price estimates
 * - Ride requests
 * - Trip tracking
 */

import {
  IProviderService,
  BookingRequest,
  BookingResponse,
  PriceQuote,
  Location,
  PROVIDER_CONFIGS,
} from './provider-integration';

interface UberProduct {
  product_id: string;
  description: string;
  display_name: string;
  capacity: number;
  image: string;
}

interface UberPriceEstimate {
  product_id: string;
  currency_code: string;
  display_name: string;
  estimate: string;
  low_estimate: number;
  high_estimate: number;
  surge_multiplier: number;
  duration: number;
  distance: number;
}

interface UberTimeEstimate {
  product_id: string;
  display_name: string;
  estimate: number; // seconds
}

interface UberRideRequest {
  request_id: string;
  status: string;
  vehicle?: {
    make: string;
    model: string;
    license_plate: string;
  };
  driver?: {
    phone_number: string;
    name: string;
    rating: number;
    picture_url: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  eta?: number;
  surge_multiplier?: number;
}

export class UberService implements IProviderService {
  private config = PROVIDER_CONFIGS.UBER;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    // Initialize
  }

  /**
   * Get OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const clientId = this.config.clientId;
    const clientSecret = this.config.clientSecret;

    if (!clientId || !clientSecret) {
      throw new Error('Uber API credentials not configured');
    }

    const response = await fetch('https://login.uber.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
        scope: 'ride_request.estimate ride_request.receipt',
      }),
    });

    if (!response.ok) {
      throw new Error(`Uber OAuth failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);

    return this.accessToken!;
  }

  /**
   * Make authenticated API request
   */
  private async apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept-Language': 'ar',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Uber API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get available products (vehicle types)
   */
  async getProducts(location: Location): Promise<UberProduct[]> {
    const data = await this.apiRequest(
      `/products?latitude=${location.lat}&longitude=${location.lng}`
    );
    return data.products;
  }

  /**
   * Get price estimates
   */
  async getPriceEstimates(pickup: Location, dropoff: Location): Promise<UberPriceEstimate[]> {
    const data = await this.apiRequest(
      `/estimates/price?start_latitude=${pickup.lat}&start_longitude=${pickup.lng}` +
      `&end_latitude=${dropoff.lat}&end_longitude=${dropoff.lng}`
    );
    return data.prices;
  }

  /**
   * Get time estimates (ETA)
   */
  async getTimeEstimates(location: Location): Promise<UberTimeEstimate[]> {
    const data = await this.apiRequest(
      `/estimates/time?start_latitude=${location.lat}&start_longitude=${location.lng}`
    );
    return data.times;
  }

  /**
   * Get price quotes (implements IProviderService)
   */
  async getQuote(request: BookingRequest): Promise<PriceQuote[]> {
    try {
      const [prices, times] = await Promise.all([
        this.getPriceEstimates(request.pickup, request.dropoff),
        this.getTimeEstimates(request.pickup),
      ]);

      // Combine price and time data
      return prices.map(price => {
        const timeEstimate = times.find(t => t.product_id === price.product_id);

        return {
          provider: 'UBER',
          price: Math.round((price.low_estimate + price.high_estimate) / 2),
          currency: price.currency_code,
          eta: timeEstimate ? Math.round(timeEstimate.estimate / 60) : 5,
          vehicleType: price.display_name,
        };
      });
    } catch (error) {
      console.error('Uber getQuote error:', error);
      return [];
    }
  }

  /**
   * Create ride request (implements IProviderService)
   */
  async createBooking(request: BookingRequest): Promise<BookingResponse> {
    try {
      // First get products to find the right one
      const products = await this.getProducts(request.pickup);

      if (products.length === 0) {
        return {
          success: false,
          error: 'No Uber products available in this area',
        };
      }

      // Use the first available product (usually UberX)
      const productId = products[0].product_id;

      // Create the ride request
      const rideRequest = await this.apiRequest('/requests', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          start_latitude: request.pickup.lat,
          start_longitude: request.pickup.lng,
          start_address: request.pickup.address,
          end_latitude: request.dropoff.lat,
          end_longitude: request.dropoff.lng,
          end_address: request.dropoff.address,
        }),
      });

      return {
        success: true,
        bookingId: rideRequest.request_id,
        status: this.mapUberStatus(rideRequest.status),
        eta: rideRequest.eta,
        driverInfo: rideRequest.driver ? {
          name: rideRequest.driver.name,
          phone: rideRequest.driver.phone_number,
          vehicle: `${rideRequest.vehicle?.make} ${rideRequest.vehicle?.model}`,
          plateNumber: rideRequest.vehicle?.license_plate || '',
          rating: rideRequest.driver.rating,
          photo: rideRequest.driver.picture_url,
        } : undefined,
      };
    } catch (error) {
      console.error('Uber createBooking error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cancel ride request
   */
  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      await this.apiRequest(`/requests/${bookingId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Uber cancelBooking error:', error);
      return false;
    }
  }

  /**
   * Get ride status
   */
  async getBookingStatus(bookingId: string): Promise<BookingResponse> {
    try {
      const rideRequest: UberRideRequest = await this.apiRequest(`/requests/${bookingId}`);

      return {
        success: true,
        bookingId: rideRequest.request_id,
        status: this.mapUberStatus(rideRequest.status),
        eta: rideRequest.eta,
        driverInfo: rideRequest.driver ? {
          name: rideRequest.driver.name,
          phone: rideRequest.driver.phone_number,
          vehicle: `${rideRequest.vehicle?.make} ${rideRequest.vehicle?.model}`,
          plateNumber: rideRequest.vehicle?.license_plate || '',
          rating: rideRequest.driver.rating,
          photo: rideRequest.driver.picture_url,
        } : undefined,
      };
    } catch (error) {
      console.error('Uber getBookingStatus error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get tracking URL
   */
  async getTrackingUrl(bookingId: string): Promise<string> {
    // Uber provides real-time tracking via their map
    return `https://m.uber.com/looking?token=${bookingId}`;
  }

  /**
   * Generate deep link for direct app booking
   */
  generateDeepLink(pickup: Location, dropoff: Location): string {
    const params = new URLSearchParams({
      'action': 'setPickup',
      'pickup[latitude]': pickup.lat.toString(),
      'pickup[longitude]': pickup.lng.toString(),
      'pickup[formatted_address]': pickup.address || '',
      'dropoff[latitude]': dropoff.lat.toString(),
      'dropoff[longitude]': dropoff.lng.toString(),
      'dropoff[formatted_address]': dropoff.address || '',
    });

    return `${this.config.universalLink}?${params.toString()}`;
  }

  /**
   * Map Uber status to our status
   */
  private mapUberStatus(uberStatus: string): BookingResponse['status'] {
    const statusMap: Record<string, BookingResponse['status']> = {
      'processing': 'PENDING',
      'accepted': 'DRIVER_ASSIGNED',
      'arriving': 'DRIVER_ASSIGNED',
      'in_progress': 'IN_PROGRESS',
      'completed': 'COMPLETED',
      'rider_canceled': 'CANCELLED',
      'driver_canceled': 'CANCELLED',
      'no_drivers_available': 'CANCELLED',
    };

    return statusMap[uberStatus] || 'PENDING';
  }
}

// Export singleton instance
export const uberService = new UberService();
