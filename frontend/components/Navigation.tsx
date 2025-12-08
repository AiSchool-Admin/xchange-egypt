'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSocket } from '@/lib/contexts/SocketContext';
import { getUnreadCount } from '@/lib/api/notifications';

// ============================================
// Icons - Lucide-style SVG Icons
// ============================================
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Home: ({ active }: { active?: boolean }) => (
    <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Grid: ({ active }: { active?: boolean }) => (
    <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
    </svg>
  ),
  MessageCircle: ({ active }: { active?: boolean }) => (
    <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  User: ({ active }: { active?: boolean }) => (
    <svg className="w-6 h-6" fill={active ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Cart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

// ============================================
// Mega Menu Data
// ============================================
const megaMenuData = {
  markets: {
    title: 'الأسواق',
    items: [
      { href: '/items', icon: '🛒', label: 'السوق العام', desc: 'تصفح جميع المنتجات' },
      { href: '/auctions', icon: '🔨', label: 'المزادات', desc: 'مزادات حية ومباشرة' },
      { href: '/scrap', icon: '♻️', label: 'سوق التوالف', desc: 'خردة ومواد قابلة للتدوير' },
      { href: '/luxury', icon: '👑', label: 'السوق الفاخر', desc: 'منتجات راقية ومميزة' },
      { href: '/deals', icon: '⚡', label: 'عروض اليوم', desc: 'خصومات لفترة محدودة' },
    ],
  },
  services: {
    title: 'الخدمات',
    items: [
      { href: '/escrow', icon: '🔒', label: 'نظام الضمان', desc: 'حماية صفقاتك' },
      { href: '/wallet', icon: '💳', label: 'المحفظة', desc: 'إدارة رصيدك' },
      { href: '/facilitators', icon: '🤝', label: 'الوسطاء', desc: 'مساعدة في الصفقات' },
      { href: '/exchange-points', icon: '📍', label: 'نقاط التبادل', desc: 'أماكن آمنة للقاء' },
      { href: '/barter-chains', icon: '🔗', label: 'سلاسل المقايضة', desc: 'مقايضات متعددة الأطراف' },
    ],
  },
  account: {
    title: 'حسابي',
    items: [
      { href: '/inventory', icon: '📦', label: 'مخزوني', desc: 'إدارة منتجاتك' },
      { href: '/barter/my-offers', icon: '🔄', label: 'مقايضاتي', desc: 'عروض المقايضة' },
      { href: '/notifications', icon: '🔔', label: 'الإشعارات', desc: 'آخر التحديثات' },
      { href: '/saved-searches', icon: '🔍', label: 'التنبيهات', desc: 'بحث محفوظ' },
      { href: '/dashboard', icon: '📊', label: 'لوحة التحكم', desc: 'إحصائيات حسابك' },
    ],
  },
};

// ============================================
// Noon-Style Categories Mega Menu Data
// ============================================
const categoriesData = [
  {
    id: 'electronics',
    name: 'الإلكترونيات',
    icon: '💻',
    color: 'from-blue-500 to-blue-600',
    href: '/items?category=electronics-computers',
    subcategories: [
      {
        title: 'الموبايلات',
        items: [
          { name: 'آيفون', href: '/items?category=mobile-phones&brand=apple' },
          { name: 'سامسونج', href: '/items?category=mobile-phones&brand=samsung' },
          { name: 'شاومي', href: '/items?category=mobile-phones&brand=xiaomi' },
          { name: 'أوبو', href: '/items?category=mobile-phones&brand=oppo' },
          { name: 'اكسسوارات الموبايل', href: '/items?category=mobile-accessories' },
        ]
      },
      {
        title: 'الكمبيوتر',
        items: [
          { name: 'لابتوب', href: '/items?category=laptops' },
          { name: 'كمبيوتر مكتبي', href: '/items?category=desktop-computers' },
          { name: 'شاشات', href: '/items?category=monitors' },
          { name: 'قطع كمبيوتر', href: '/items?category=computer-components' },
          { name: 'اكسسوارات', href: '/items?category=computer-accessories' },
        ]
      },
      {
        title: 'الألعاب',
        items: [
          { name: 'بلايستيشن', href: '/items?category=gaming&brand=playstation' },
          { name: 'إكس بوكس', href: '/items?category=gaming&brand=xbox' },
          { name: 'نينتندو', href: '/items?category=gaming&brand=nintendo' },
          { name: 'ألعاب فيديو', href: '/items?category=video-games' },
        ]
      },
    ],
    promoImage: '/images/categories/electronics-promo.jpg',
    brands: ['Apple', 'Samsung', 'Sony', 'HP', 'Dell', 'Lenovo']
  },
  {
    id: 'fashion-women',
    name: 'أزياء النساء',
    icon: '👗',
    color: 'from-pink-500 to-rose-500',
    href: '/items?category=womens-fashion',
    subcategories: [
      {
        title: 'الملابس',
        items: [
          { name: 'فساتين', href: '/items?category=womens-dresses' },
          { name: 'بلوزات', href: '/items?category=womens-tops' },
          { name: 'بناطيل', href: '/items?category=womens-pants' },
          { name: 'جاكيتات', href: '/items?category=womens-jackets' },
          { name: 'عبايات', href: '/items?category=abayas' },
        ]
      },
      {
        title: 'الأحذية',
        items: [
          { name: 'كعب عالي', href: '/items?category=womens-heels' },
          { name: 'صنادل', href: '/items?category=womens-sandals' },
          { name: 'أحذية رياضية', href: '/items?category=womens-sneakers' },
          { name: 'بوت', href: '/items?category=womens-boots' },
        ]
      },
      {
        title: 'الحقائب',
        items: [
          { name: 'حقائب يد', href: '/items?category=handbags' },
          { name: 'حقائب كتف', href: '/items?category=shoulder-bags' },
          { name: 'محافظ', href: '/items?category=womens-wallets' },
        ]
      },
    ],
    promoImage: '/images/categories/fashion-women-promo.jpg',
    brands: ['Zara', 'H&M', 'LC Waikiki', 'Defacto', 'Trendyol']
  },
  {
    id: 'fashion-men',
    name: 'أزياء الرجال',
    icon: '👔',
    color: 'from-slate-600 to-slate-700',
    href: '/items?category=mens-fashion',
    subcategories: [
      {
        title: 'الملابس',
        items: [
          { name: 'قمصان', href: '/items?category=mens-shirts' },
          { name: 'تيشيرتات', href: '/items?category=mens-tshirts' },
          { name: 'بناطيل', href: '/items?category=mens-pants' },
          { name: 'جاكيتات', href: '/items?category=mens-jackets' },
          { name: 'بدل', href: '/items?category=mens-suits' },
        ]
      },
      {
        title: 'الأحذية',
        items: [
          { name: 'أحذية رسمية', href: '/items?category=mens-formal-shoes' },
          { name: 'أحذية رياضية', href: '/items?category=mens-sneakers' },
          { name: 'صنادل', href: '/items?category=mens-sandals' },
        ]
      },
      {
        title: 'الإكسسوارات',
        items: [
          { name: 'ساعات', href: '/items?category=mens-watches' },
          { name: 'أحزمة', href: '/items?category=mens-belts' },
          { name: 'محافظ', href: '/items?category=mens-wallets' },
          { name: 'نظارات', href: '/items?category=mens-sunglasses' },
        ]
      },
    ],
    promoImage: '/images/categories/fashion-men-promo.jpg',
    brands: ['Nike', 'Adidas', 'Puma', 'Activ', 'Town Team']
  },
  {
    id: 'home',
    name: 'المنزل والأثاث',
    icon: '🏠',
    color: 'from-amber-500 to-orange-500',
    href: '/items?category=home-garden',
    subcategories: [
      {
        title: 'الأثاث',
        items: [
          { name: 'غرف نوم', href: '/items?category=bedroom-furniture' },
          { name: 'غرف معيشة', href: '/items?category=living-room' },
          { name: 'سفرة وطاولات', href: '/items?category=dining-furniture' },
          { name: 'مكاتب', href: '/items?category=office-furniture' },
        ]
      },
      {
        title: 'الأجهزة المنزلية',
        items: [
          { name: 'ثلاجات', href: '/items?category=refrigerators' },
          { name: 'غسالات', href: '/items?category=washing-machines' },
          { name: 'تكييفات', href: '/items?category=air-conditioners' },
          { name: 'مطبخ', href: '/items?category=kitchen-appliances' },
        ]
      },
      {
        title: 'الديكور',
        items: [
          { name: 'إضاءة', href: '/items?category=lighting' },
          { name: 'سجاد', href: '/items?category=rugs' },
          { name: 'ستائر', href: '/items?category=curtains' },
        ]
      },
    ],
    promoImage: '/images/categories/home-promo.jpg',
    brands: ['IKEA', 'Mobica', 'Istikbal', 'Toshiba', 'Samsung']
  },
  {
    id: 'vehicles',
    name: 'السيارات',
    icon: '🚗',
    color: 'from-red-500 to-red-600',
    href: '/items?category=vehicles',
    subcategories: [
      {
        title: 'أنواع السيارات',
        items: [
          { name: 'سيارات ملاكي', href: '/items?category=passenger-cars' },
          { name: 'سيارات SUV', href: '/items?category=suv' },
          { name: 'ميكروباص', href: '/items?category=microbus' },
          { name: 'نصف نقل', href: '/items?category=pickup' },
        ]
      },
      {
        title: 'قطع الغيار',
        items: [
          { name: 'محركات', href: '/items?category=car-engines' },
          { name: 'فرامل', href: '/items?category=car-brakes' },
          { name: 'إطارات', href: '/items?category=tires' },
          { name: 'بطاريات', href: '/items?category=car-batteries' },
        ]
      },
      {
        title: 'الدراجات',
        items: [
          { name: 'موتوسيكلات', href: '/items?category=motorcycles' },
          { name: 'سكوتر', href: '/items?category=scooters' },
          { name: 'دراجات هوائية', href: '/items?category=bicycles' },
        ]
      },
    ],
    promoImage: '/images/categories/vehicles-promo.jpg',
    brands: ['Toyota', 'Hyundai', 'Chevrolet', 'Nissan', 'BMW']
  },
  {
    id: 'beauty',
    name: 'الجمال والعناية',
    icon: '💄',
    color: 'from-purple-500 to-purple-600',
    href: '/items?category=health-beauty',
    subcategories: [
      {
        title: 'المكياج',
        items: [
          { name: 'الوجه', href: '/items?category=face-makeup' },
          { name: 'العيون', href: '/items?category=eye-makeup' },
          { name: 'الشفاه', href: '/items?category=lip-makeup' },
          { name: 'الأظافر', href: '/items?category=nail-care' },
        ]
      },
      {
        title: 'العناية بالبشرة',
        items: [
          { name: 'كريمات', href: '/items?category=skin-creams' },
          { name: 'سيروم', href: '/items?category=serums' },
          { name: 'واقي شمس', href: '/items?category=sunscreen' },
        ]
      },
      {
        title: 'العطور',
        items: [
          { name: 'عطور نسائية', href: '/items?category=womens-perfumes' },
          { name: 'عطور رجالية', href: '/items?category=mens-perfumes' },
          { name: 'بخور وعود', href: '/items?category=oud' },
        ]
      },
    ],
    promoImage: '/images/categories/beauty-promo.jpg',
    brands: ['Maybelline', 'L\'Oreal', 'MAC', 'NYX', 'Nivea']
  },
  {
    id: 'kids',
    name: 'الأطفال',
    icon: '👶',
    color: 'from-cyan-500 to-teal-500',
    href: '/items?category=baby-kids',
    subcategories: [
      {
        title: 'ملابس الأطفال',
        items: [
          { name: 'أولاد', href: '/items?category=boys-clothing' },
          { name: 'بنات', href: '/items?category=girls-clothing' },
          { name: 'رضع', href: '/items?category=baby-clothing' },
        ]
      },
      {
        title: 'الألعاب',
        items: [
          { name: 'ألعاب تعليمية', href: '/items?category=educational-toys' },
          { name: 'عرائس ودمى', href: '/items?category=dolls' },
          { name: 'ألعاب خارجية', href: '/items?category=outdoor-toys' },
        ]
      },
      {
        title: 'مستلزمات',
        items: [
          { name: 'عربات أطفال', href: '/items?category=strollers' },
          { name: 'كراسي سيارة', href: '/items?category=car-seats' },
          { name: 'أسرة أطفال', href: '/items?category=baby-beds' },
        ]
      },
    ],
    promoImage: '/images/categories/kids-promo.jpg',
    brands: ['Carter\'s', 'LC Waikiki Kids', 'Mothercare', 'Chicco']
  },
  {
    id: 'sports',
    name: 'الرياضة',
    icon: '⚽',
    color: 'from-green-500 to-emerald-500',
    href: '/items?category=sports-outdoors',
    subcategories: [
      {
        title: 'الملابس الرياضية',
        items: [
          { name: 'تيشيرتات رياضية', href: '/items?category=sports-tshirts' },
          { name: 'شورتات', href: '/items?category=sports-shorts' },
          { name: 'ترينج', href: '/items?category=tracksuits' },
        ]
      },
      {
        title: 'المعدات',
        items: [
          { name: 'أجهزة رياضية', href: '/items?category=gym-equipment' },
          { name: 'كرة قدم', href: '/items?category=football' },
          { name: 'تنس', href: '/items?category=tennis' },
        ]
      },
      {
        title: 'الأحذية الرياضية',
        items: [
          { name: 'جري', href: '/items?category=running-shoes' },
          { name: 'كرة قدم', href: '/items?category=football-shoes' },
          { name: 'كاجوال', href: '/items?category=casual-sneakers' },
        ]
      },
    ],
    promoImage: '/images/categories/sports-promo.jpg',
    brands: ['Nike', 'Adidas', 'Puma', 'Under Armour', 'Reebok']
  },
];

// ============================================
// Main Navigation Component
// ============================================
export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { onMatchFound, offMatchFound } = useSocket();

  // State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    governorate: 'كل مصر',
    city: '',
    district: ''
  });
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const categoryMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const locationMenuRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  // Listen for real-time notifications
  useEffect(() => {
    const handleMatchNotification = (notification: any) => {
      setUnreadCount(prev => prev + 1);
      const score = Math.round(notification.averageMatchScore * 100);
      setToastMessage(`تم العثور على مطابقة! نسبة التوافق ${score}%`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    };

    onMatchFound(handleMatchNotification);
    return () => offMatchFound(handleMatchNotification);
  }, [onMatchFound, offMatchFound]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
      if (locationMenuRef.current && !locationMenuRef.current.contains(event.target as Node)) {
        setLocationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  }, [pathname]);

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Hide navigation on auth pages
  const hideNavRoutes = ['/login', '/register'];
  if (hideNavRoutes.includes(pathname)) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  // Category hover handlers with delay
  const handleCategoryMouseEnter = (categoryId: string) => {
    if (categoryMenuTimeoutRef.current) {
      clearTimeout(categoryMenuTimeoutRef.current);
    }
    setHoveredCategory(categoryId);
  };

  const handleCategoryMouseLeave = () => {
    categoryMenuTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  };

  const handleMegaMenuMouseEnter = () => {
    if (categoryMenuTimeoutRef.current) {
      clearTimeout(categoryMenuTimeoutRef.current);
    }
  };

  const handleMegaMenuMouseLeave = () => {
    categoryMenuTimeoutRef.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  };

  return (
    <>
      {/* ============================================
          Desktop & Tablet Navigation
          ============================================ */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50" dir="rtl">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-xl">🔄</span>
              </div>
              <span className="hidden sm:block text-xl font-bold gradient-text">
                Xchange
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-xl relative"
            >
              <div className={`w-full flex items-center bg-gray-50 rounded-xl border-2 transition-all duration-200 ${
                searchFocused ? 'border-primary-500 bg-white shadow-lg' : 'border-gray-200'
              }`}>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  placeholder="ابحث عن منتجات، سيارات، موبايلات..."
                  className="w-full px-4 py-2.5 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary-500 text-white rounded-l-xl hover:bg-primary-600 transition-colors"
                >
                  <Icons.Search />
                </button>
              </div>
            </form>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Browse Dropdown */}
              <div className="relative" ref={megaMenuRef}>
                <button
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  className={`flex items-center gap-1 px-4 py-2 rounded-xl font-medium transition-all ${
                    megaMenuOpen
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>تصفح</span>
                  <Icons.ChevronDown />
                </button>

                {/* Mega Menu Dropdown */}
                {megaMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[600px] bg-white rounded-2xl shadow-xl border border-gray-100 p-6 animate-fade-in-down z-50">
                    <div className="grid grid-cols-3 gap-6">
                      {/* Markets Column */}
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          {megaMenuData.markets.title}
                        </h3>
                        <div className="space-y-1">
                          {megaMenuData.markets.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                              <span className="text-xl">{item.icon}</span>
                              <div>
                                <div className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                  {item.label}
                                </div>
                                <div className="text-xs text-gray-500">{item.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Services Column */}
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          {megaMenuData.services.title}
                        </h3>
                        <div className="space-y-1">
                          {megaMenuData.services.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                            >
                              <span className="text-xl">{item.icon}</span>
                              <div>
                                <div className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                  {item.label}
                                </div>
                                <div className="text-xs text-gray-500">{item.desc}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Account Column */}
                      {user && (
                        <div>
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            {megaMenuData.account.title}
                          </h3>
                          <div className="space-y-1">
                            {megaMenuData.account.items.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                              >
                                <span className="text-xl">{item.icon}</span>
                                <div>
                                  <div className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {item.label}
                                  </div>
                                  <div className="text-xs text-gray-500">{item.desc}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions in Mega Menu */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <Link
                          href="/sell-ai"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all"
                        >
                          <span>✨</span>
                          بيع بالذكاء الصناعي
                        </Link>
                        <Link
                          href="/assistant"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all"
                        >
                          <span>🤖</span>
                          المساعد الذكي
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            {/* Direct Links - Removed عروض per user request */}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1">
              {/* Location Selector */}
              <div className="relative hidden md:block" ref={locationMenuRef}>
                <button
                  onClick={() => setLocationMenuOpen(!locationMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Icons.MapPin />
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {selectedLocation.city || selectedLocation.governorate}
                  </span>
                  <Icons.ChevronDown />
                </button>

                {locationMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <div className="p-3 bg-gray-50 border-b border-gray-100">
                      <span className="font-bold text-gray-800">اختر موقعك</span>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setSelectedLocation({ governorate: 'كل مصر', city: '', district: '' }); setLocationMenuOpen(false); }}
                        className={`w-full text-right p-3 rounded-xl transition-colors ${selectedLocation.governorate === 'كل مصر' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
                      >
                        🇪🇬 كل مصر
                      </button>
                      {['القاهرة', 'الإسكندرية', 'الجيزة', 'الدقهلية', 'الشرقية'].map((gov) => (
                        <button
                          key={gov}
                          onClick={() => { setSelectedLocation({ governorate: gov, city: '', district: '' }); setLocationMenuOpen(false); }}
                          className={`w-full text-right p-3 rounded-xl transition-colors ${selectedLocation.governorate === gov ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
                        >
                          📍 {gov}
                        </button>
                      ))}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                      <Link href="/location" className="text-sm text-primary-600 hover:underline" onClick={() => setLocationMenuOpen(false)}>
                        المزيد من المحافظات ←
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Language Switcher */}
              <div className="relative" ref={languageMenuRef}>
                <button
                  onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                  className="flex items-center gap-1 px-2.5 py-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <Icons.Globe />
                  <span className="text-sm font-medium">{language === 'ar' ? 'ع' : 'EN'}</span>
                </button>

                {languageMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    <button
                      onClick={() => { setLanguage('ar'); setLanguageMenuOpen(false); }}
                      className={`w-full text-right px-4 py-3 transition-colors flex items-center gap-2 ${language === 'ar' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
                    >
                      <span>🇪🇬</span> العربية
                    </button>
                    <button
                      onClick={() => { setLanguage('en'); setLanguageMenuOpen(false); }}
                      className={`w-full text-right px-4 py-3 transition-colors flex items-center gap-2 ${language === 'en' ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-50'}`}
                    >
                      <span>🇬🇧</span> English
                    </button>
                  </div>
                )}
              </div>

              {/* Shopping Cart */}
              <Link
                href="/cart"
                className="relative p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Icons.Cart />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  {/* Notifications */}
                  <Link
                    href="/notifications"
                    className="relative p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <Icons.Bell />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* Add Listing Button */}
                  <Link
                    href="/inventory/add"
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all shadow-button hover:shadow-button-hover"
                  >
                    <span>➕</span>
                    <span className="hidden md:inline">أضف إعلان</span>
                  </Link>

                  {/* User Menu */}
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {user.fullName?.charAt(0).toUpperCase() || 'م'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user.fullName?.split(' ')[0]}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="تسجيل الخروج"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:block px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all shadow-button hover:shadow-button-hover"
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                {mobileMenuOpen ? <Icons.X /> : <Icons.Menu />}
              </button>
            </div>
          </div>

          {/* Mobile Search - Shows below header */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في XChange..."
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-700 placeholder-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              <button
                type="submit"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <Icons.Search />
              </button>
            </form>
          </div>
        </div>

        {/* ============================================
            Noon-Style Categories Navigation Bar
            ============================================ */}
        <div className="hidden lg:block bg-white border-t border-gray-100 relative" ref={categoryBarRef}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 py-1 overflow-x-auto scrollbar-hide">
              {/* All Categories Button */}
              <button
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium text-sm whitespace-nowrap transition-all hover:bg-primary-600"
                onClick={() => router.push('/items')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                كل الفئات
              </button>

              {/* Category Links */}
              {categoriesData.map((category) => (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => handleCategoryMouseEnter(category.id)}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  <Link
                    href={category.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                      hoveredCategory === category.id
                        ? 'bg-gray-100 text-primary-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.icon}</span>
                    {category.name}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Category Mega Menu Dropdown */}
          {hoveredCategory && (
            <div
              className="absolute top-full left-0 right-0 bg-white shadow-2xl border-t border-gray-100 z-50 animate-fade-in-down"
              onMouseEnter={handleMegaMenuMouseEnter}
              onMouseLeave={handleMegaMenuMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-4 py-5">
                {categoriesData.filter(c => c.id === hoveredCategory).map((category) => (
                  <div key={category.id} className="flex gap-6">
                    {/* Subcategories Grid - Compact Layout */}
                    <div className="flex-1 grid grid-cols-4 gap-x-8 gap-y-4">
                      {category.subcategories.map((subcat) => (
                        <div key={subcat.title}>
                          <h4 className="font-bold text-gray-900 mb-2 text-sm">
                            {subcat.title}
                          </h4>
                          <ul className="space-y-1.5">
                            {subcat.items.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className="text-gray-600 hover:text-primary-600 transition-colors text-sm block"
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    {/* View All Link */}
                    <div className="flex-shrink-0 flex items-start pt-1">
                      <Link
                        href={category.href}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium whitespace-nowrap"
                      >
                        عرض الكل ←
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Categories Scroll - Simplified */}
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
            {categoriesData.slice(0, 6).map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="flex flex-col items-center gap-1 px-3 py-2 bg-gray-50 rounded-xl min-w-[70px] hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-xs text-gray-700 font-medium whitespace-nowrap">{category.name.split(' ')[0]}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ============================================
            Specialized Markets Quick Navigation Bar
            ============================================ */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-center gap-1 py-2 overflow-x-auto scrollbar-hide">
              <Link
                href="/items"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  isActive('/items')
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>🛒</span>
                السوق العام
              </Link>
              <Link
                href="/auctions"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  isActive('/auctions')
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>🔨</span>
                المزادات
              </Link>
              <Link
                href="/reverse-auctions"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  isActive('/reverse-auctions')
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>📋</span>
                المناقصات
              </Link>
              <Link
                href="/luxury"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  isActive('/luxury')
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>👑</span>
                سوق الفاخر
              </Link>
              <Link
                href="/scrap"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  isActive('/scrap')
                    ? 'bg-green-500 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>♻️</span>
                سوق التوالف
              </Link>
              <Link
                href="/barter"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  isActive('/barter')
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>🔄</span>
                المقايضات
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[120px] bg-white z-40 overflow-y-auto animate-fade-in">
          <div className="p-4 space-y-4">
              {/* Quick Actions */}
              {user && (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/sell-ai"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium"
                  >
                    <span>✨</span>
                    بيع بالـ AI
                  </Link>
                  <Link
                    href="/inventory/add"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-xl font-medium"
                  >
                    <span>➕</span>
                    أضف إعلان
                  </Link>
                </div>
              )}

              {/* Menu Sections */}
              <div className="space-y-6">
                {/* Markets */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    الأسواق
                  </h3>
                  <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">
                    {megaMenuData.markets.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 p-4"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                    الخدمات
                  </h3>
                  <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">
                    {megaMenuData.services.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 p-4"
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Account Section - Only for logged in users */}
                {user && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                      حسابي
                    </h3>
                    <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">
                      {megaMenuData.account.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 p-4"
                        >
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <div className="font-medium text-gray-900">{item.label}</div>
                            <div className="text-xs text-gray-500">{item.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Info / Auth */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold">
                        {user.fullName?.charAt(0).toUpperCase() || 'م'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors"
                    >
                      خروج
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      className="px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-center"
                    >
                      تسجيل الدخول
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-3 bg-primary-500 text-white rounded-xl font-medium text-center"
                    >
                      إنشاء حساب
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* ============================================
          Mobile Bottom Navigation Bar
          ============================================ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              pathname === '/' ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <Icons.Home active={pathname === '/'} />
            <span className="text-xs mt-1 font-medium">الرئيسية</span>
          </Link>

          {/* Browse */}
          <Link
            href="/items"
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              isActive('/items') ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <Icons.Grid active={isActive('/items')} />
            <span className="text-xs mt-1 font-medium">تصفح</span>
          </Link>

          {/* Add - Center Button */}
          <Link
            href={user ? '/inventory/add' : '/login'}
            className="flex items-center justify-center w-14 h-14 -mt-5 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-all hover:scale-105"
          >
            <Icons.Plus />
          </Link>

          {/* Messages */}
          <Link
            href="/messages"
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              isActive('/messages') ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <Icons.MessageCircle active={isActive('/messages')} />
            <span className="text-xs mt-1 font-medium">رسائل</span>
          </Link>

          {/* Profile */}
          <Link
            href={user ? '/dashboard' : '/login'}
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              isActive('/dashboard') ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            {user ? (
              <div className="w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                {user.fullName?.charAt(0).toUpperCase() || 'م'}
              </div>
            ) : (
              <Icons.User active={isActive('/dashboard')} />
            )}
            <span className="text-xs mt-1 font-medium">حسابي</span>
          </Link>
        </div>
      </div>

      {/* Bottom Padding for Mobile Content */}
      <div className="lg:hidden h-16" />

      {/* ============================================
          Toast Notification
          ============================================ */}
      {showToast && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-60 animate-slide-up" dir="rtl">
          <div className="bg-primary-600 text-white px-5 py-4 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              🎯
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold">تم العثور على مطابقة!</p>
              <p className="text-sm text-primary-100 truncate">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-primary-200 hover:text-white transition-colors p-1"
            >
              <Icons.X />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
