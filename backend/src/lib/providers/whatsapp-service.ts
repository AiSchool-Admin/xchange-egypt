/**
 * WhatsApp Business Integration Service
 * ======================================
 *
 * Integration via WhatsApp for providers without official APIs
 *
 * Methods:
 * 1. Click-to-Chat (wa.me) - Opens WhatsApp with pre-filled message
 * 2. WhatsApp Business API - For automated messaging (requires business account)
 *
 * Providers using WhatsApp:
 * - inDrive, DiDi, Swvl, Halan (Rides)
 * - Fetchr, Rabbit (Shipping)
 */

import {
  BookingRequest,
  ShippingRequest,
  Location,
  PROVIDER_CONFIGS,
  ProviderConfig,
} from './provider-integration';

// WhatsApp message templates
interface WhatsAppMessage {
  provider: string;
  phone: string;
  message: string;
  url: string;
}

// Provider-specific WhatsApp numbers (Egypt)
// These need to be updated with real numbers
const PROVIDER_WHATSAPP_NUMBERS: Record<string, string> = {
  // Ride-hailing
  'INDRIVE': '201000000000',   // Placeholder - get real number
  'DIDI': '201000000000',       // Placeholder
  'SWVL': '201028888880',       // Swvl Egypt support
  'HALAN': '201000000000',      // Placeholder

  // Shipping
  'FETCHR': '201000000000',     // Placeholder
  'RABBIT': '201000000000',     // Placeholder
};

export class WhatsAppService {
  /**
   * Generate Click-to-Chat URL for ride booking
   */
  generateRideBookingMessage(
    provider: string,
    request: BookingRequest,
    estimatedPrice?: number
  ): WhatsAppMessage {
    const config = PROVIDER_CONFIGS[provider];
    const phone = PROVIDER_WHATSAPP_NUMBERS[provider] || config?.whatsappNumber;

    if (!phone) {
      throw new Error(`WhatsApp number not configured for provider: ${provider}`);
    }

    // Format the booking message in Arabic
    const message = this.formatRideMessage(config, request, estimatedPrice);

    // Generate wa.me URL
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;

    return {
      provider,
      phone,
      message,
      url,
    };
  }

  /**
   * Generate Click-to-Chat URL for shipping booking
   */
  generateShippingBookingMessage(
    provider: string,
    request: ShippingRequest,
    estimatedPrice?: number
  ): WhatsAppMessage {
    const config = PROVIDER_CONFIGS[provider];
    const phone = PROVIDER_WHATSAPP_NUMBERS[provider] || config?.whatsappNumber;

    if (!phone) {
      throw new Error(`WhatsApp number not configured for provider: ${provider}`);
    }

    // Format the shipping message in Arabic
    const message = this.formatShippingMessage(config, request, estimatedPrice);

    // Generate wa.me URL
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${phone}?text=${encodedMessage}`;

    return {
      provider,
      phone,
      message,
      url,
    };
  }

  /**
   * Format ride booking message
   */
  private formatRideMessage(
    config: ProviderConfig | undefined,
    request: BookingRequest,
    estimatedPrice?: number
  ): string {
    const providerName = config?.nameAr || config?.name || 'المزود';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('ar-EG');

    let message = `🚗 *طلب رحلة جديد عبر Xchange*

━━━━━━━━━━━━━━━━━━

📍 *من:* ${request.pickup.name || request.pickup.address || `${request.pickup.lat}, ${request.pickup.lng}`}

📍 *إلى:* ${request.dropoff.name || request.dropoff.address || `${request.dropoff.lat}, ${request.dropoff.lng}`}

🕐 *الوقت:* ${request.scheduledTime ? request.scheduledTime.toLocaleString('ar-EG') : `الآن (${timeStr})`}
📅 *التاريخ:* ${dateStr}`;

    if (estimatedPrice) {
      message += `

💰 *السعر التقديري:* ${estimatedPrice} ج.م`;
    }

    if (request.customerName) {
      message += `

👤 *اسم العميل:* ${request.customerName}`;
    }

    if (request.customerPhone) {
      message += `
📱 *رقم التواصل:* ${request.customerPhone}`;
    }

    if (request.notes) {
      message += `

📝 *ملاحظات:* ${request.notes}`;
    }

    message += `

━━━━━━━━━━━━━━━━━━

✅ أرجو تأكيد الطلب
🔗 _طلب عبر منصة Xchange Egypt_`;

    return message;
  }

  /**
   * Format shipping booking message
   */
  private formatShippingMessage(
    config: ProviderConfig | undefined,
    request: ShippingRequest,
    estimatedPrice?: number
  ): string {
    const providerName = config?.nameAr || config?.name || 'المزود';
    const now = new Date();
    const dateStr = now.toLocaleDateString('ar-EG');

    let message = `📦 *طلب شحن جديد عبر Xchange*

━━━━━━━━━━━━━━━━━━

📍 *عنوان الاستلام:*
${request.pickup.name || request.pickup.address || `${request.pickup.lat}, ${request.pickup.lng}`}

📍 *عنوان التوصيل:*
${request.dropoff.name || request.dropoff.address || `${request.dropoff.lat}, ${request.dropoff.lng}`}

👤 *اسم المستلم:* ${request.customerName}
📱 *رقم التواصل:* ${request.customerPhone}`;

    if (request.weight) {
      message += `

⚖️ *الوزن:* ${request.weight} كجم`;
    }

    if (request.dimensions) {
      message += `
📐 *الأبعاد:* ${request.dimensions.length}x${request.dimensions.width}x${request.dimensions.height} سم`;
    }

    if (request.description) {
      message += `
📋 *الوصف:* ${request.description}`;
    }

    if (request.codAmount) {
      message += `

💵 *تحصيل عند الاستلام:* ${request.codAmount} ج.م`;
    }

    if (estimatedPrice) {
      message += `

💰 *تكلفة الشحن التقديرية:* ${estimatedPrice} ج.م`;
    }

    message += `

📅 *تاريخ الطلب:* ${dateStr}

━━━━━━━━━━━━━━━━━━

✅ أرجو تأكيد الطلب وموعد الاستلام
🔗 _طلب عبر منصة Xchange Egypt_`;

    return message;
  }

  /**
   * Generate Google Maps link for location
   */
  private generateMapsLink(location: Location): string {
    return `https://maps.google.com/?q=${location.lat},${location.lng}`;
  }

  /**
   * Check if provider uses WhatsApp integration
   */
  isWhatsAppProvider(provider: string): boolean {
    const config = PROVIDER_CONFIGS[provider];
    return config?.integrationType === 'WHATSAPP';
  }

  /**
   * Get all WhatsApp-based providers
   */
  getWhatsAppProviders(): string[] {
    return Object.entries(PROVIDER_CONFIGS)
      .filter(([_, config]) => config.integrationType === 'WHATSAPP')
      .map(([id]) => id);
  }
}

// Export singleton
export const whatsappService = new WhatsAppService();

/**
 * Quick helper to generate WhatsApp booking URL
 */
export function generateWhatsAppBookingUrl(
  provider: string,
  pickup: Location,
  dropoff: Location,
  estimatedPrice?: number,
  customerPhone?: string,
  customerName?: string
): string {
  const request: BookingRequest = {
    pickup,
    dropoff,
    customerPhone,
    customerName,
  };

  const message = whatsappService.generateRideBookingMessage(
    provider,
    request,
    estimatedPrice
  );

  return message.url;
}

/**
 * Quick helper to generate WhatsApp shipping URL
 */
export function generateWhatsAppShippingUrl(
  provider: string,
  pickup: Location,
  dropoff: Location,
  customerName: string,
  customerPhone: string,
  weight?: number,
  codAmount?: number,
  estimatedPrice?: number
): string {
  const request: ShippingRequest = {
    pickup,
    dropoff,
    customerName,
    customerPhone,
    weight,
    codAmount,
  };

  const message = whatsappService.generateShippingBookingMessage(
    provider,
    request,
    estimatedPrice
  );

  return message.url;
}
