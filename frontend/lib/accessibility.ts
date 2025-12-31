/**
 * Accessibility Utilities for Xchange Egypt
 * أدوات إمكانية الوصول
 */

// ============================================
// ARIA Labels in Arabic
// ============================================
export const ariaLabels = {
  // Navigation
  navigation: {
    main: 'التنقل الرئيسي',
    footer: 'التنقل الثانوي',
    breadcrumb: 'مسار التنقل',
    pagination: 'التنقل بين الصفحات',
    menu: 'القائمة',
    menuOpen: 'فتح القائمة',
    menuClose: 'إغلاق القائمة',
  },

  // Common Actions
  actions: {
    search: 'بحث',
    filter: 'فلترة',
    sort: 'ترتيب',
    close: 'إغلاق',
    open: 'فتح',
    submit: 'إرسال',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    remove: 'إزالة',
    next: 'التالي',
    previous: 'السابق',
    back: 'رجوع',
    loading: 'جاري التحميل',
    refresh: 'تحديث',
    share: 'مشاركة',
    copy: 'نسخ',
    download: 'تحميل',
    upload: 'رفع',
    play: 'تشغيل',
    pause: 'إيقاف مؤقت',
    mute: 'كتم الصوت',
    unmute: 'تشغيل الصوت',
  },

  // Items & Products
  items: {
    addToFavorites: 'إضافة للمفضلة',
    removeFromFavorites: 'إزالة من المفضلة',
    addToCart: 'إضافة للسلة',
    removeFromCart: 'إزالة من السلة',
    viewDetails: 'عرض التفاصيل',
    quickView: 'عرض سريع',
    compare: 'مقارنة',
    bid: 'مزايدة',
    barter: 'مقايضة',
    contact: 'تواصل مع البائع',
    report: 'إبلاغ',
  },

  // Form Fields
  forms: {
    required: 'حقل مطلوب',
    optional: 'اختياري',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    phone: 'رقم الهاتف',
    name: 'الاسم',
    title: 'العنوان',
    description: 'الوصف',
    price: 'السعر',
    category: 'الفئة',
    location: 'الموقع',
    images: 'الصور',
    showPassword: 'إظهار كلمة المرور',
    hidePassword: 'إخفاء كلمة المرور',
  },

  // Status & Notifications
  status: {
    success: 'تمت العملية بنجاح',
    error: 'حدث خطأ',
    warning: 'تحذير',
    info: 'معلومة',
    newNotifications: 'إشعارات جديدة',
    noNotifications: 'لا توجد إشعارات',
    unreadMessages: 'رسائل غير مقروءة',
  },

  // Regions
  regions: {
    main: 'المحتوى الرئيسي',
    sidebar: 'الشريط الجانبي',
    header: 'رأس الصفحة',
    footer: 'تذييل الصفحة',
    search: 'منطقة البحث',
    filters: 'الفلاتر',
    results: 'نتائج البحث',
    cart: 'سلة التسوق',
    chat: 'المحادثة',
  },
};

// ============================================
// Keyboard Navigation Helpers
// ============================================
export const handleKeyboardNavigation = (
  e: React.KeyboardEvent,
  callbacks: {
    onEnter?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
  }
) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      callbacks.onEnter?.();
      break;
    case 'Escape':
      callbacks.onEscape?.();
      break;
    case 'ArrowUp':
      callbacks.onArrowUp?.();
      e.preventDefault();
      break;
    case 'ArrowDown':
      callbacks.onArrowDown?.();
      e.preventDefault();
      break;
    case 'ArrowLeft':
      callbacks.onArrowLeft?.();
      break;
    case 'ArrowRight':
      callbacks.onArrowRight?.();
      break;
    case 'Tab':
      callbacks.onTab?.();
      break;
  }
};

// ============================================
// Focus Management
// ============================================
export const focusableSelectors = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(container.querySelectorAll(focusableSelectors));
};

export const trapFocus = (container: HTMLElement) => {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  };

  container.addEventListener('keydown', handleTabKey);
  return () => container.removeEventListener('keydown', handleTabKey);
};

// ============================================
// Screen Reader Announcements
// ============================================
let announcer: HTMLElement | null = null;

export const initAnnouncer = () => {
  if (typeof window === 'undefined') return;

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('role', 'status');
    announcer.className = 'sr-only';
    announcer.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(announcer);
  }
};

export const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  if (!announcer) initAnnouncer();
  if (!announcer) return;

  announcer.setAttribute('aria-live', priority);
  announcer.textContent = '';

  // Small delay to ensure screen readers pick up the change
  setTimeout(() => {
    if (announcer) announcer.textContent = message;
  }, 100);
};

// ============================================
// Skip Links
// ============================================
export const SkipLinkTargets = {
  mainContent: 'main-content',
  navigation: 'main-navigation',
  search: 'search-input',
  filters: 'filters-section',
};

// ============================================
// Color Contrast Utilities
// ============================================
export const contrastColors = {
  // High contrast text colors
  text: {
    primary: '#111827', // gray-900
    secondary: '#4b5563', // gray-600
    muted: '#6b7280', // gray-500
    inverse: '#ffffff',
  },
  // High contrast backgrounds
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb', // gray-50
    accent: '#10b981', // primary
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#22c55e',
  },
};

// ============================================
// Reduced Motion Support
// ============================================
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// ============================================
// Form Validation Messages (Arabic)
// ============================================
export const validationMessages = {
  required: 'هذا الحقل مطلوب',
  email: 'يرجى إدخال بريد إلكتروني صحيح',
  phone: 'يرجى إدخال رقم هاتف صحيح',
  minLength: (min: number) => `يجب أن يكون على الأقل ${min} أحرف`,
  maxLength: (max: number) => `يجب ألا يتجاوز ${max} حرف`,
  min: (min: number) => `يجب أن تكون القيمة ${min} أو أكثر`,
  max: (max: number) => `يجب أن تكون القيمة ${max} أو أقل`,
  pattern: 'القيمة المدخلة غير صحيحة',
  passwordMismatch: 'كلمات المرور غير متطابقة',
  passwordWeak: 'كلمة المرور ضعيفة',
  fileSize: (size: string) => `حجم الملف يجب أن يكون أقل من ${size}`,
  fileType: 'نوع الملف غير مدعوم',
};

// ============================================
// Semantic HTML Helpers
// ============================================
export const semanticElements = {
  // Landmark roles
  landmarks: {
    main: { role: 'main' as const, ariaLabel: ariaLabels.regions.main },
    nav: { role: 'navigation' as const, ariaLabel: ariaLabels.navigation.main },
    aside: { role: 'complementary' as const, ariaLabel: ariaLabels.regions.sidebar },
    header: { role: 'banner' as const, ariaLabel: ariaLabels.regions.header },
    footer: { role: 'contentinfo' as const, ariaLabel: ariaLabels.regions.footer },
    search: { role: 'search' as const, ariaLabel: ariaLabels.regions.search },
  },

  // Interactive elements
  interactive: {
    button: { role: 'button' as const, tabIndex: 0 },
    link: { role: 'link' as const, tabIndex: 0 },
    menu: { role: 'menu' as const },
    menuitem: { role: 'menuitem' as const },
    dialog: { role: 'dialog' as const, ariaModal: true },
    alert: { role: 'alert' as const, ariaLive: 'assertive' as const },
  },
};

// ============================================
// Image Alt Text Generator
// ============================================
export const generateImageAlt = (
  type: 'product' | 'user' | 'category' | 'banner',
  name?: string,
  details?: string
): string => {
  switch (type) {
    case 'product':
      return name ? `صورة المنتج: ${name}${details ? ` - ${details}` : ''}` : 'صورة المنتج';
    case 'user':
      return name ? `صورة المستخدم ${name}` : 'صورة المستخدم';
    case 'category':
      return name ? `فئة ${name}` : 'صورة الفئة';
    case 'banner':
      return name ? `إعلان: ${name}` : 'صورة إعلانية';
    default:
      return name || 'صورة';
  }
};

export default {
  ariaLabels,
  handleKeyboardNavigation,
  getFocusableElements,
  trapFocus,
  announce,
  initAnnouncer,
  SkipLinkTargets,
  contrastColors,
  prefersReducedMotion,
  validationMessages,
  semanticElements,
  generateImageAlt,
};
