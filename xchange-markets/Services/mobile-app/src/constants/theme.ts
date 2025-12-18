// ============================================
// Theme Constants - Design System
// ============================================

export const theme = {
  colors: {
    // Primary Brand Colors
    primary: '#FF6B35',           // Xchange Orange
    primaryDark: '#E55A2B',
    primaryLight: '#FF8A5C',

    // Secondary Colors
    secondary: '#2D3436',         // Dark Gray
    secondaryDark: '#1E2526',
    secondaryLight: '#636E72',

    // Accent Colors
    accent: '#00B894',            // Success Green
    accentDark: '#00A884',

    // Status Colors
    success: '#00B894',
    warning: '#FDCB6E',
    error: '#E74C3C',
    info: '#0984E3',

    // Background
    background: '#FFFFFF',
    backgroundDark: '#121212',
    backgroundSecondary: '#F8F9FA',
    backgroundSecondaryDark: '#1E1E1E',

    // Surface
    surface: '#FFFFFF',
    surfaceDark: '#1E1E1E',
    surfaceElevated: '#FFFFFF',
    surfaceElevatedDark: '#2D2D2D',

    // Text
    text: '#2D3436',
    textDark: '#FFFFFF',
    textSecondary: '#636E72',
    textSecondaryDark: '#B2BEC3',
    textDisabled: '#B2BEC3',
    textDisabledDark: '#636E72',

    // Borders
    border: '#E9ECEF',
    borderDark: '#3D3D3D',

    // Verification Levels
    verificationBasic: '#95A5A6',
    verificationTrusted: '#3498DB',
    verificationPro: '#9B59B6',
    verificationElite: '#F1C40F',
    verificationCertified: '#FF6B35',

    // Booking Status
    statusPending: '#FDCB6E',
    statusConfirmed: '#74B9FF',
    statusOnWay: '#A29BFE',
    statusInProgress: '#81ECEC',
    statusCompleted: '#00B894',
    statusCancelled: '#E74C3C',
    statusDisputed: '#E17055',

    // Rating Stars
    star: '#F1C40F',
    starEmpty: '#E9ECEF',

    // Misc
    overlay: 'rgba(0, 0, 0, 0.5)',
    shimmer: '#E9ECEF',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  typography: {
    fontFamily: {
      regular: 'Cairo-Regular',
      medium: 'Cairo-Medium',
      semiBold: 'Cairo-SemiBold',
      bold: 'Cairo-Bold',
      light: 'Cairo-Light',
    },
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
      display: 40,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 12,
    },
  },

  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};

// Protection Level Colors & Details
export const protectLevelConfig = {
  NONE: {
    color: theme.colors.textSecondary,
    label: { ar: 'بدون حماية', en: 'No Protection' },
    duration: null,
    percentage: 0,
  },
  BASIC: {
    color: '#95A5A6',
    label: { ar: 'حماية أساسية', en: 'Basic Protection' },
    duration: '14 days',
    percentage: 0,
    coverage: { ar: 'إعادة الخدمة فقط', en: 'Re-service only' },
  },
  STANDARD: {
    color: '#3498DB',
    label: { ar: 'حماية قياسية', en: 'Standard Protection' },
    duration: '30 days',
    percentage: 5,
    coverage: { ar: 'استرداد أو إعادة الخدمة', en: 'Refund or re-service' },
  },
  PREMIUM: {
    color: '#9B59B6',
    label: { ar: 'حماية متميزة', en: 'Premium Protection' },
    duration: '90 days',
    percentage: 10,
    coverage: { ar: 'استرداد + تعويض', en: 'Refund + compensation' },
  },
  ELITE: {
    color: '#F1C40F',
    label: { ar: 'حماية النخبة', en: 'Elite Protection' },
    duration: '365 days',
    percentage: 15,
    coverage: { ar: 'تغطية كاملة + تأمين', en: 'Full coverage + insurance' },
  },
};

// Verification Level Config
export const verificationLevelConfig = {
  BASIC: {
    color: theme.colors.verificationBasic,
    icon: 'shield-outline',
    label: { ar: 'أساسي', en: 'Basic' },
    description: { ar: 'تم التحقق من الهوية', en: 'ID Verified' },
  },
  TRUSTED: {
    color: theme.colors.verificationTrusted,
    icon: 'shield-checkmark',
    label: { ar: 'موثوق', en: 'Trusted' },
    description: { ar: 'فحص خلفية + 4.5★ + 20 حجز', en: 'Background check + 4.5★ + 20 bookings' },
  },
  PRO: {
    color: theme.colors.verificationPro,
    icon: 'ribbon',
    label: { ar: 'محترف', en: 'Pro' },
    description: { ar: 'شهادات معتمدة + 4.8★ + 50 حجز', en: 'Certifications + 4.8★ + 50 bookings' },
  },
  ELITE: {
    color: theme.colors.verificationElite,
    icon: 'star',
    label: { ar: 'نخبة', en: 'Elite' },
    description: { ar: 'أفضل 5% + تدريب خاص', en: 'Top 5% + special training' },
  },
  XCHANGE_CERTIFIED: {
    color: theme.colors.verificationCertified,
    icon: 'trophy',
    label: { ar: 'معتمد من إكسشينج', en: 'Xchange Certified' },
    description: { ar: 'خريج أكاديمية إكسشينج', en: 'Xchange Academy graduate' },
  },
};

// Subscription Tier Config
export const subscriptionTierConfig = {
  FREE: {
    color: theme.colors.textSecondary,
    label: { ar: 'مجاني', en: 'Free' },
    commission: 20,
    price: 0,
    features: {
      ar: ['قائمة أساسية', 'دعم بالبريد الإلكتروني'],
      en: ['Basic listing', 'Email support'],
    },
  },
  TRUSTED: {
    color: theme.colors.verificationTrusted,
    label: { ar: 'موثوق', en: 'Trusted' },
    commission: 15,
    price: 300,
    features: {
      ar: ['أولوية في الظهور', 'دعم أسرع', 'تحليلات أساسية'],
      en: ['Priority listing', 'Faster support', 'Basic analytics'],
    },
  },
  PRO: {
    color: theme.colors.verificationPro,
    label: { ar: 'محترف', en: 'Pro' },
    commission: 12,
    price: 700,
    features: {
      ar: ['شارة Pro', 'تحليلات متقدمة', 'دعم مباشر', 'ترويج مجاني'],
      en: ['Pro badge', 'Advanced analytics', 'Live support', 'Free promotion'],
    },
  },
  ELITE: {
    color: theme.colors.verificationElite,
    label: { ar: 'نخبة', en: 'Elite' },
    commission: 10,
    price: 1500,
    features: {
      ar: ['ضمان التسليم في نفس اليوم', 'مدير حساب مخصص', 'ترويج VIP', 'الأولوية في الطوارئ'],
      en: ['Same-day guarantee', 'Dedicated account manager', 'VIP promotion', 'Emergency priority'],
    },
  },
};

// Booking Status Config
export const bookingStatusConfig = {
  PENDING: {
    color: theme.colors.statusPending,
    icon: 'time-outline',
    label: { ar: 'في الانتظار', en: 'Pending' },
  },
  CONFIRMED: {
    color: theme.colors.statusConfirmed,
    icon: 'checkmark-circle-outline',
    label: { ar: 'تم التأكيد', en: 'Confirmed' },
  },
  PROVIDER_ON_WAY: {
    color: theme.colors.statusOnWay,
    icon: 'car-outline',
    label: { ar: 'في الطريق', en: 'On the way' },
  },
  IN_PROGRESS: {
    color: theme.colors.statusInProgress,
    icon: 'construct-outline',
    label: { ar: 'قيد التنفيذ', en: 'In Progress' },
  },
  COMPLETED: {
    color: theme.colors.statusCompleted,
    icon: 'checkmark-done-circle',
    label: { ar: 'مكتمل', en: 'Completed' },
  },
  CANCELLED_BY_CUSTOMER: {
    color: theme.colors.statusCancelled,
    icon: 'close-circle-outline',
    label: { ar: 'ملغي', en: 'Cancelled' },
  },
  CANCELLED_BY_PROVIDER: {
    color: theme.colors.statusCancelled,
    icon: 'close-circle-outline',
    label: { ar: 'ملغي', en: 'Cancelled' },
  },
  NO_SHOW: {
    color: theme.colors.statusCancelled,
    icon: 'alert-circle-outline',
    label: { ar: 'لم يحضر', en: 'No Show' },
  },
  DISPUTED: {
    color: theme.colors.statusDisputed,
    icon: 'warning-outline',
    label: { ar: 'متنازع عليه', en: 'Disputed' },
  },
  REFUNDED: {
    color: theme.colors.info,
    icon: 'return-down-back-outline',
    label: { ar: 'تم الاسترداد', en: 'Refunded' },
  },
};
