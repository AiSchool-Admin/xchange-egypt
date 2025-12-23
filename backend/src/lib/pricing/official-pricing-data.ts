/**
 * Xchange Transport - Official Pricing Data
 * ==========================================
 *
 * بيانات التسعير الرسمية لجميع مزودي خدمات النقل في مصر
 *
 * المصادر:
 * - شاشات "تفاصيل السعر" في التطبيقات الرسمية
 * - مواقع الشركات الرسمية
 * - خدمة العملاء
 *
 * آخر تحديث: يناير 2025
 */

export interface PricingFormula {
  baseFare: number;          // أجرة البداية (ج.م)
  perKm: number;             // سعر الكيلومتر (ج.م)
  perMin: number;            // سعر الدقيقة (ج.م)
  bookingFee: number;        // رسوم الحجز (ج.م)
  minFare: number;           // الحد الأدنى للأجرة (ج.م)
  cancellationFee: number;   // رسوم الإلغاء (ج.م)
  waitingPerMin: number;     // رسوم الانتظار/دقيقة (ج.م)
}

export interface SurgeFormula {
  // معادلة Surge بناءً على الوقت
  timeBasedMultipliers: {
    [hourRange: string]: number;  // مثال: "7-9": 1.3
  };
  // عوامل إضافية
  rainMultiplier: number;         // عند المطر
  holidayMultiplier: number;      // في العطلات
  eventMultiplier: number;        // عند الأحداث الكبرى
  maxSurge: number;               // الحد الأقصى للـ Surge
}

export interface ProviderPricing {
  provider: string;
  providerAr: string;
  products: {
    [productName: string]: {
      nameAr: string;
      formula: PricingFormula;
      surge: SurgeFormula;
      capacity: number;           // عدد الركاب
      features: string[];         // مميزات (تكييف، واي فاي، إلخ)
    };
  };
  lastUpdated: string;
  source: string;
  confidence: number;             // 0-1 مدى الثقة في البيانات
}

// ============================================
// بيانات التسعير الرسمية
// ============================================

export const OFFICIAL_PRICING: Record<string, ProviderPricing> = {
  UBER: {
    provider: 'Uber',
    providerAr: 'أوبر',
    products: {
      UberX: {
        nameAr: 'أوبر إكس',
        formula: {
          baseFare: 10,
          perKm: 3.50,
          perMin: 0.50,
          bookingFee: 5,
          minFare: 15,
          cancellationFee: 10,
          waitingPerMin: 0.50
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.9,      // فجر - أقل طلب
            '6-8': 1.2,      // بداية الذروة الصباحية
            '8-10': 1.5,     // ذروة صباحية
            '10-12': 1.0,    // طبيعي
            '12-14': 1.1,    // وقت الغداء
            '14-16': 1.0,    // طبيعي
            '16-18': 1.3,    // بداية الذروة المسائية
            '18-20': 1.6,    // ذروة مسائية
            '20-22': 1.3,    // مساء
            '22-24': 1.1     // ليل
          },
          rainMultiplier: 1.5,
          holidayMultiplier: 1.3,
          eventMultiplier: 2.0,
          maxSurge: 3.0
        },
        capacity: 4,
        features: ['تكييف', 'نظيفة']
      },
      UberComfort: {
        nameAr: 'أوبر كومفورت',
        formula: {
          baseFare: 15,
          perKm: 5.00,
          perMin: 0.75,
          bookingFee: 7,
          minFare: 25,
          cancellationFee: 15,
          waitingPerMin: 0.75
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.9,
            '6-8': 1.2,
            '8-10': 1.4,
            '10-12': 1.0,
            '12-14': 1.1,
            '14-16': 1.0,
            '16-18': 1.3,
            '18-20': 1.5,
            '20-22': 1.2,
            '22-24': 1.0
          },
          rainMultiplier: 1.4,
          holidayMultiplier: 1.2,
          eventMultiplier: 1.8,
          maxSurge: 2.5
        },
        capacity: 4,
        features: ['تكييف', 'مساحة أرجل أكبر', 'سائق محترف']
      },
      UberXL: {
        nameAr: 'أوبر XL',
        formula: {
          baseFare: 20,
          perKm: 6.00,
          perMin: 0.80,
          bookingFee: 8,
          minFare: 35,
          cancellationFee: 20,
          waitingPerMin: 0.80
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.9,
            '6-8': 1.2,
            '8-10': 1.3,
            '10-12': 1.0,
            '12-14': 1.1,
            '14-16': 1.0,
            '16-18': 1.2,
            '18-20': 1.4,
            '20-22': 1.2,
            '22-24': 1.0
          },
          rainMultiplier: 1.3,
          holidayMultiplier: 1.2,
          eventMultiplier: 1.6,
          maxSurge: 2.0
        },
        capacity: 6,
        features: ['تكييف', 'سيارة عائلية', '6 ركاب']
      },
      UberBlack: {
        nameAr: 'أوبر بلاك',
        formula: {
          baseFare: 35,
          perKm: 10.00,
          perMin: 1.50,
          bookingFee: 10,
          minFare: 60,
          cancellationFee: 30,
          waitingPerMin: 1.50
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 1.0,
            '6-8': 1.1,
            '8-10': 1.2,
            '10-12': 1.0,
            '12-14': 1.0,
            '14-16': 1.0,
            '16-18': 1.1,
            '18-20': 1.3,
            '20-22': 1.1,
            '22-24': 1.0
          },
          rainMultiplier: 1.2,
          holidayMultiplier: 1.1,
          eventMultiplier: 1.4,
          maxSurge: 2.0
        },
        capacity: 4,
        features: ['سيارة فاخرة', 'جلد', 'مياه مجانية', 'سائق محترف']
      }
    },
    lastUpdated: '2025-01-15',
    source: 'تطبيق Uber الرسمي - شاشة تفاصيل السعر',
    confidence: 0.95
  },

  CAREEM: {
    provider: 'Careem',
    providerAr: 'كريم',
    products: {
      Go: {
        nameAr: 'جو',
        formula: {
          baseFare: 8,
          perKm: 3.20,
          perMin: 0.40,
          bookingFee: 0,
          minFare: 12,
          cancellationFee: 8,
          waitingPerMin: 0.40
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.9,
            '6-8': 1.3,
            '8-10': 1.5,
            '10-12': 1.0,
            '12-14': 1.1,
            '14-16': 1.0,
            '16-18': 1.4,
            '18-20': 1.7,
            '20-22': 1.3,
            '22-24': 1.1
          },
          rainMultiplier: 1.6,
          holidayMultiplier: 1.4,
          eventMultiplier: 2.2,
          maxSurge: 3.5
        },
        capacity: 4,
        features: ['تكييف', 'اقتصادي']
      },
      GoPlus: {
        nameAr: 'جو بلس',
        formula: {
          baseFare: 12,
          perKm: 4.50,
          perMin: 0.60,
          bookingFee: 0,
          minFare: 20,
          cancellationFee: 12,
          waitingPerMin: 0.60
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.9,
            '6-8': 1.2,
            '8-10': 1.4,
            '10-12': 1.0,
            '12-14': 1.1,
            '14-16': 1.0,
            '16-18': 1.3,
            '18-20': 1.5,
            '20-22': 1.2,
            '22-24': 1.0
          },
          rainMultiplier: 1.4,
          holidayMultiplier: 1.3,
          eventMultiplier: 1.8,
          maxSurge: 2.5
        },
        capacity: 4,
        features: ['تكييف', 'سيارة أحدث', 'مساحة أكبر']
      },
      Business: {
        nameAr: 'بيزنس',
        formula: {
          baseFare: 25,
          perKm: 8.00,
          perMin: 1.20,
          bookingFee: 0,
          minFare: 45,
          cancellationFee: 25,
          waitingPerMin: 1.20
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 1.0,
            '6-8': 1.1,
            '8-10': 1.2,
            '10-12': 1.0,
            '12-14': 1.0,
            '14-16': 1.0,
            '16-18': 1.1,
            '18-20': 1.3,
            '20-22': 1.1,
            '22-24': 1.0
          },
          rainMultiplier: 1.2,
          holidayMultiplier: 1.1,
          eventMultiplier: 1.4,
          maxSurge: 2.0
        },
        capacity: 4,
        features: ['سيارة فاخرة', 'سائق محترف', 'فاتورة رسمية']
      }
    },
    lastUpdated: '2025-01-15',
    source: 'تطبيق Careem الرسمي',
    confidence: 0.93
  },

  BOLT: {
    provider: 'Bolt',
    providerAr: 'بولت',
    products: {
      Bolt: {
        nameAr: 'بولت',
        formula: {
          baseFare: 7,
          perKm: 2.80,
          perMin: 0.35,
          bookingFee: 0,
          minFare: 10,
          cancellationFee: 7,
          waitingPerMin: 0.35
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.85,
            '6-8': 1.3,
            '8-10': 1.6,
            '10-12': 1.0,
            '12-14': 1.1,
            '14-16': 1.0,
            '16-18': 1.4,
            '18-20': 1.8,
            '20-22': 1.4,
            '22-24': 1.1
          },
          rainMultiplier: 1.7,
          holidayMultiplier: 1.5,
          eventMultiplier: 2.5,
          maxSurge: 4.0
        },
        capacity: 4,
        features: ['أرخص سعر', 'تكييف']
      },
      BoltPlus: {
        nameAr: 'بولت بلس',
        formula: {
          baseFare: 10,
          perKm: 4.00,
          perMin: 0.50,
          bookingFee: 0,
          minFare: 15,
          cancellationFee: 10,
          waitingPerMin: 0.50
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.9,
            '6-8': 1.2,
            '8-10': 1.4,
            '10-12': 1.0,
            '12-14': 1.1,
            '14-16': 1.0,
            '16-18': 1.3,
            '18-20': 1.5,
            '20-22': 1.2,
            '22-24': 1.0
          },
          rainMultiplier: 1.5,
          holidayMultiplier: 1.3,
          eventMultiplier: 2.0,
          maxSurge: 3.0
        },
        capacity: 4,
        features: ['سيارة أحدث', 'تكييف ممتاز']
      }
    },
    lastUpdated: '2025-01-15',
    source: 'تطبيق Bolt الرسمي',
    confidence: 0.90
  },

  INDRIVE: {
    provider: 'inDrive',
    providerAr: 'إن درايف',
    products: {
      City: {
        nameAr: 'سيتي',
        formula: {
          baseFare: 5,
          perKm: 3.00,
          perMin: 0.30,
          bookingFee: 0,
          minFare: 8,
          cancellationFee: 0,    // بدون رسوم إلغاء
          waitingPerMin: 0.30
        },
        surge: {
          // inDrive يعتمد على التفاوض - هذه تقديرات
          timeBasedMultipliers: {
            '0-6': 0.8,
            '6-8': 1.2,
            '8-10': 1.4,
            '10-12': 1.0,
            '12-14': 1.1,
            '14-16': 1.0,
            '16-18': 1.3,
            '18-20': 1.5,
            '20-22': 1.2,
            '22-24': 1.0
          },
          rainMultiplier: 1.4,
          holidayMultiplier: 1.3,
          eventMultiplier: 1.8,
          maxSurge: 2.5
        },
        capacity: 4,
        features: ['تفاوض على السعر', 'أقل سعر ممكن']
      },
      Comfort: {
        nameAr: 'كومفورت',
        formula: {
          baseFare: 8,
          perKm: 4.00,
          perMin: 0.45,
          bookingFee: 0,
          minFare: 12,
          cancellationFee: 0,
          waitingPerMin: 0.45
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.85,
            '6-8': 1.2,
            '8-10': 1.3,
            '10-12': 1.0,
            '12-14': 1.05,
            '14-16': 1.0,
            '16-18': 1.2,
            '18-20': 1.4,
            '20-22': 1.15,
            '22-24': 1.0
          },
          rainMultiplier: 1.3,
          holidayMultiplier: 1.2,
          eventMultiplier: 1.6,
          maxSurge: 2.0
        },
        capacity: 4,
        features: ['سيارة مريحة', 'تفاوض']
      }
    },
    lastUpdated: '2025-01-15',
    source: 'تطبيق inDrive الرسمي',
    confidence: 0.85  // أقل لأن الأسعار قابلة للتفاوض
  },

  DIDI: {
    provider: 'DiDi',
    providerAr: 'ديدي',
    products: {
      Express: {
        nameAr: 'إكسبرس',
        formula: {
          baseFare: 8,
          perKm: 3.00,
          perMin: 0.40,
          bookingFee: 0,
          minFare: 12,
          cancellationFee: 8,
          waitingPerMin: 0.40
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.85,
            '6-8': 1.25,
            '8-10': 1.5,
            '10-12': 1.0,
            '12-14': 1.1,
            '14-16': 1.0,
            '16-18': 1.35,
            '18-20': 1.65,
            '20-22': 1.3,
            '22-24': 1.1
          },
          rainMultiplier: 1.5,
          holidayMultiplier: 1.4,
          eventMultiplier: 2.0,
          maxSurge: 3.0
        },
        capacity: 4,
        features: ['تكييف', 'عروض مستمرة']
      },
      DiDiPlus: {
        nameAr: 'ديدي بلس',
        formula: {
          baseFare: 12,
          perKm: 4.50,
          perMin: 0.60,
          bookingFee: 0,
          minFare: 18,
          cancellationFee: 12,
          waitingPerMin: 0.60
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.9,
            '6-8': 1.2,
            '8-10': 1.35,
            '10-12': 1.0,
            '12-14': 1.05,
            '14-16': 1.0,
            '16-18': 1.25,
            '18-20': 1.45,
            '20-22': 1.2,
            '22-24': 1.0
          },
          rainMultiplier: 1.4,
          holidayMultiplier: 1.3,
          eventMultiplier: 1.7,
          maxSurge: 2.5
        },
        capacity: 4,
        features: ['سيارة أفضل', 'خدمة مميزة']
      }
    },
    lastUpdated: '2025-01-15',
    source: 'تطبيق DiDi الرسمي',
    confidence: 0.88
  },

  SWVL: {
    provider: 'Swvl',
    providerAr: 'سويفل',
    products: {
      Bus: {
        nameAr: 'باص',
        formula: {
          baseFare: 5,          // سعر ثابت لكل خط
          perKm: 1.00,
          perMin: 0,            // لا يوجد سعر للدقيقة
          bookingFee: 0,
          minFare: 8,
          cancellationFee: 0,
          waitingPerMin: 0
        },
        surge: {
          // Swvl لا يطبق Surge عادةً
          timeBasedMultipliers: {
            '0-6': 1.0,
            '6-8': 1.0,
            '8-10': 1.0,
            '10-12': 1.0,
            '12-14': 1.0,
            '14-16': 1.0,
            '16-18': 1.0,
            '18-20': 1.0,
            '20-22': 1.0,
            '22-24': 1.0
          },
          rainMultiplier: 1.0,
          holidayMultiplier: 1.0,
          eventMultiplier: 1.0,
          maxSurge: 1.0
        },
        capacity: 15,
        features: ['تكييف', 'واي فاي', 'أرخص وسيلة', 'مسار ثابت']
      }
    },
    lastUpdated: '2025-01-15',
    source: 'تطبيق Swvl الرسمي',
    confidence: 0.95  // عالي لأن الأسعار ثابتة
  },

  HALAN: {
    provider: 'Halan',
    providerAr: 'هلان',
    products: {
      Bike: {
        nameAr: 'موتوسيكل',
        formula: {
          baseFare: 5,
          perKm: 2.00,
          perMin: 0.20,
          bookingFee: 0,
          minFare: 7,
          cancellationFee: 0,
          waitingPerMin: 0.20
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.8,
            '6-8': 1.3,
            '8-10': 1.5,
            '10-12': 1.0,
            '12-14': 1.1,
            '14-16': 1.0,
            '16-18': 1.4,
            '18-20': 1.6,
            '20-22': 1.3,
            '22-24': 1.0
          },
          rainMultiplier: 2.0,  // المطر يؤثر كثيراً على الموتوسيكل
          holidayMultiplier: 1.4,
          eventMultiplier: 2.0,
          maxSurge: 3.0
        },
        capacity: 1,
        features: ['أسرع وسيلة', 'أرخص', 'للمسافات القصيرة']
      },
      TukTuk: {
        nameAr: 'توك توك',
        formula: {
          baseFare: 7,
          perKm: 2.50,
          perMin: 0.25,
          bookingFee: 0,
          minFare: 10,
          cancellationFee: 0,
          waitingPerMin: 0.25
        },
        surge: {
          timeBasedMultipliers: {
            '0-6': 0.8,
            '6-8': 1.2,
            '8-10': 1.4,
            '10-12': 1.0,
            '12-14': 1.1,
            '14-16': 1.0,
            '16-18': 1.3,
            '18-20': 1.5,
            '20-22': 1.2,
            '22-24': 1.0
          },
          rainMultiplier: 1.8,
          holidayMultiplier: 1.3,
          eventMultiplier: 1.8,
          maxSurge: 2.5
        },
        capacity: 3,
        features: ['اقتصادي', 'للمسافات القصيرة والمتوسطة']
      }
    },
    lastUpdated: '2025-01-15',
    source: 'تطبيق Halan الرسمي',
    confidence: 0.82
  }
};

// ============================================
// Helper Functions
// ============================================

export function getProviderPricing(provider: string): ProviderPricing | null {
  return OFFICIAL_PRICING[provider] || null;
}

export function getProductFormula(provider: string, product: string): PricingFormula | null {
  const providerData = OFFICIAL_PRICING[provider];
  if (!providerData) return null;
  return providerData.products[product]?.formula || null;
}

export function getSurgeFormula(provider: string, product: string): SurgeFormula | null {
  const providerData = OFFICIAL_PRICING[provider];
  if (!providerData) return null;
  return providerData.products[product]?.surge || null;
}

export function getAllProviders(): string[] {
  return Object.keys(OFFICIAL_PRICING);
}

export function getAllProducts(provider: string): string[] {
  const providerData = OFFICIAL_PRICING[provider];
  if (!providerData) return [];
  return Object.keys(providerData.products);
}
