'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSocket } from '@/lib/contexts/SocketContext';
import { getUnreadCount } from '@/lib/api/notifications';
import LanguageSwitcher from './LanguageSwitcher';

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
      { href: '/cars', icon: '🚗', label: 'سوق السيارات', desc: 'سيارات بنظام Escrow ومقايضة' },
      { href: '/properties', icon: '🏠', label: 'سوق العقارات', desc: 'شقق وفيلات مع نظام Escrow وتحقق حكومي' },
      { href: '/mobiles', icon: '📱', label: 'سوق الموبايلات', desc: 'موبايلات مع IMEI موثق ومقايضة ذكية' },
      { href: '/auctions', icon: '🔨', label: 'المزادات', desc: 'مزادات حية ومباشرة' },
      { href: '/scrap', icon: '♻️', label: 'سوق التوالف', desc: 'خردة ومواد قابلة للتدوير' },
      { href: '/gold', icon: '💰', label: 'سوق الذهب', desc: 'بيع وشراء الذهب بأفضل الأسعار' },
      { href: '/silver', icon: '🥈', label: 'سوق الفضة', desc: 'فضة بأسعار مميزة وتوفير حتى 30%' },
      { href: '/luxury', icon: '👑', label: 'السوق الفاخر', desc: 'منتجات راقية ومميزة' },
      { href: '/deals', icon: '⚡', label: 'عروض اليوم', desc: 'خصومات لفترة محدودة' },
    ],
  },
  services: {
    title: 'الخدمات',
    items: [
      { href: '/board', icon: '🏛️', label: 'مجلس الإدارة AI', desc: 'استشر فريقك التنفيذي' },
      { href: '/escrow', icon: '🔒', label: 'نظام الضمان', desc: 'حماية صفقاتك' },
      { href: '/installments', icon: '💳', label: 'التقسيط', desc: 'اشتر الآن وادفع لاحقاً' },
      { href: '/delivery', icon: '🚚', label: 'التوصيل', desc: 'تتبع شحناتك' },
      { href: '/badges', icon: '🏅', label: 'الشارات', desc: 'زد مصداقيتك' },
      { href: '/compare', icon: '📊', label: 'المقارنة', desc: 'قارن المنتجات' },
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
// Categories ordered by popularity
const categoriesData = [
  {
    id: 'electronics',
    name: 'الإلكترونيات',
    icon: '💻',
    href: '/items?category=electronics-computers',
    subcategories: [
      {
        title: 'الهواتف الذكية',
        items: [
          { name: 'آيفون', href: '/items?category=mobile-phones&brand=apple' },
          { name: 'سامسونج', href: '/items?category=mobile-phones&brand=samsung' },
          { name: 'شاومي', href: '/items?category=mobile-phones&brand=xiaomi' },
          { name: 'أوبو', href: '/items?category=mobile-phones&brand=oppo' },
          { name: 'فيفو', href: '/items?category=mobile-phones&brand=vivo' },
        ],
        hasMore: true
      },
      {
        title: 'أجهزة كمبيوتر',
        items: [
          { name: 'لابتوب', href: '/items?category=laptops' },
          { name: 'كمبيوتر مكتبي', href: '/items?category=desktop-computers' },
          { name: 'شاشات', href: '/items?category=monitors' },
          { name: 'طابعات', href: '/items?category=printers' },
        ],
        showAllLink: true
      },
      {
        title: 'أجهزة التلفزيون',
        items: [
          { name: 'تلفزيون ذكي', href: '/items?category=smart-tv' },
          { name: '32 بوصة', href: '/items?category=tv-32' },
          { name: '43 بوصة', href: '/items?category=tv-43' },
          { name: '55 بوصة', href: '/items?category=tv-55' },
          { name: '65 بوصة وأكثر', href: '/items?category=tv-65-plus' },
        ],
        hasMore: true
      },
      {
        title: 'كاميرات',
        items: [
          { name: 'دي إس إل آر', href: '/items?category=dslr' },
          { name: 'ميرورليس', href: '/items?category=mirrorless' },
          { name: 'كاميرات الأكشن', href: '/items?category=action-cameras' },
          { name: 'كاميرات صغيرة', href: '/items?category=compact-cameras' },
          { name: 'كاميرات أخرى', href: '/items?category=other-cameras' },
        ]
      },
    ],
  },
  {
    id: 'vehicles',
    name: 'سيارات',
    icon: '🚗',
    href: '/items?category=vehicles',
    subcategories: [
      {
        title: 'سيارات للبيع',
        items: [
          { name: 'سيارات ملاكي', href: '/items?category=passenger-cars' },
          { name: 'سيارات SUV', href: '/items?category=suv' },
          { name: 'ميكروباص', href: '/items?category=microbus' },
          { name: 'نصف نقل', href: '/items?category=pickup' },
        ]
      },
      {
        title: 'قطع غيار',
        items: [
          { name: 'محركات', href: '/items?category=car-engines' },
          { name: 'فرامل', href: '/items?category=car-brakes' },
          { name: 'إطارات', href: '/items?category=tires' },
          { name: 'بطاريات', href: '/items?category=car-batteries' },
          { name: 'زيوت وفلاتر', href: '/items?category=oils-filters' },
        ],
        hasMore: true
      },
      {
        title: 'دراجات',
        items: [
          { name: 'موتوسيكلات', href: '/items?category=motorcycles' },
          { name: 'سكوتر', href: '/items?category=scooters' },
          { name: 'دراجات هوائية', href: '/items?category=bicycles' },
        ]
      },
      {
        title: 'اكسسوارات السيارات',
        items: [
          { name: 'شنط سيارات', href: '/items?category=car-bags' },
          { name: 'كاميرات سيارات', href: '/items?category=car-cameras' },
          { name: 'شواحن', href: '/items?category=car-chargers' },
        ]
      },
    ],
  },
  {
    id: 'home',
    name: 'أثاث',
    icon: '🏠',
    href: '/items?category=home-garden',
    subcategories: [
      {
        title: 'غرف النوم',
        items: [
          { name: 'سرير', href: '/items?category=beds' },
          { name: 'دولاب', href: '/items?category=wardrobes' },
          { name: 'تسريحة', href: '/items?category=dressers' },
          { name: 'كومودينو', href: '/items?category=nightstands' },
        ]
      },
      {
        title: 'غرف المعيشة',
        items: [
          { name: 'أنتريه', href: '/items?category=sofas' },
          { name: 'ركنة', href: '/items?category=corner-sofas' },
          { name: 'طاولة وسط', href: '/items?category=coffee-tables' },
          { name: 'مكتبة تلفزيون', href: '/items?category=tv-units' },
        ]
      },
      {
        title: 'السفرة',
        items: [
          { name: 'طاولة سفرة', href: '/items?category=dining-tables' },
          { name: 'كراسي سفرة', href: '/items?category=dining-chairs' },
          { name: 'بوفيه', href: '/items?category=buffets' },
        ]
      },
      {
        title: 'المكتب',
        items: [
          { name: 'مكتب', href: '/items?category=desks' },
          { name: 'كرسي مكتب', href: '/items?category=office-chairs' },
          { name: 'أرفف', href: '/items?category=shelves' },
        ]
      },
    ],
  },
  {
    id: 'fashion-men',
    name: 'أزياء الرجال',
    icon: '👔',
    href: '/items?category=mens-fashion',
    subcategories: [
      {
        title: 'ملابس',
        items: [
          { name: 'تيشرتات', href: '/items?category=mens-tshirts' },
          { name: 'تيشرتات بولو', href: '/items?category=mens-polo' },
          { name: 'بنطلونات', href: '/items?category=mens-pants' },
          { name: 'جينزات', href: '/items?category=mens-jeans' },
          { name: 'ملابس رياضية', href: '/items?category=mens-sportswear' },
        ]
      },
      {
        title: 'ملابس رياضية',
        items: [
          { name: 'تيشرتات', href: '/items?category=sports-tshirts' },
          { name: 'جواكت', href: '/items?category=sports-jackets' },
          { name: 'بنطلونات وشورتات', href: '/items?category=sports-pants' },
          { name: 'أحذية رياضية', href: '/items?category=sports-shoes' },
          { name: 'سنيكرز', href: '/items?category=sneakers' },
          { name: 'بنطلونات رياضية', href: '/items?category=joggers' },
        ]
      },
      {
        title: 'أحذية',
        items: [
          { name: 'أحذية رياضية', href: '/items?category=mens-sneakers' },
          { name: 'سنيكرز', href: '/items?category=mens-casual-sneakers' },
          { name: 'أبوات', href: '/items?category=mens-boots' },
          { name: 'شباشب', href: '/items?category=mens-slippers' },
        ]
      },
      {
        title: 'شنط',
        items: [
          { name: 'شنط الظهر', href: '/items?category=backpacks' },
          { name: 'محافظ', href: '/items?category=mens-wallets' },
          { name: 'شنط السفر', href: '/items?category=travel-bags' },
          { name: 'مجوهرات', href: '/items?category=mens-jewelry' },
          { name: 'أحزمة', href: '/items?category=mens-belts' },
          { name: 'ساعات', href: '/items?category=mens-watches' },
          { name: 'نظارات', href: '/items?category=mens-sunglasses' },
        ]
      },
    ],
  },
  {
    id: 'fashion-women',
    name: 'أزياء النساء',
    icon: '👗',
    href: '/items?category=womens-fashion',
    subcategories: [
      {
        title: 'ملابس',
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
          { name: 'شنط سفر', href: '/items?category=womens-travel-bags' },
        ]
      },
      {
        title: 'إكسسوارات',
        items: [
          { name: 'مجوهرات', href: '/items?category=womens-jewelry' },
          { name: 'ساعات', href: '/items?category=womens-watches' },
          { name: 'نظارات', href: '/items?category=womens-sunglasses' },
          { name: 'إيشاربات', href: '/items?category=scarves' },
        ]
      },
    ],
  },
  {
    id: 'kids',
    name: 'أزياء الأطفال',
    icon: '👶',
    href: '/items?category=baby-kids',
    subcategories: [
      {
        title: 'ملابس أولاد',
        items: [
          { name: 'تيشرتات', href: '/items?category=boys-tshirts' },
          { name: 'بنطلونات', href: '/items?category=boys-pants' },
          { name: 'بيجامات', href: '/items?category=boys-pajamas' },
        ]
      },
      {
        title: 'ملابس بنات',
        items: [
          { name: 'فساتين', href: '/items?category=girls-dresses' },
          { name: 'بلوزات', href: '/items?category=girls-tops' },
          { name: 'بيجامات', href: '/items?category=girls-pajamas' },
        ]
      },
      {
        title: 'أحذية أطفال',
        items: [
          { name: 'أحذية أولاد', href: '/items?category=boys-shoes' },
          { name: 'أحذية بنات', href: '/items?category=girls-shoes' },
          { name: 'صنادل', href: '/items?category=kids-sandals' },
        ]
      },
      {
        title: 'مستلزمات',
        items: [
          { name: 'شنط مدرسة', href: '/items?category=school-bags' },
          { name: 'ألعاب', href: '/items?category=toys' },
          { name: 'عربات أطفال', href: '/items?category=strollers' },
        ]
      },
    ],
  },
  {
    id: 'beauty',
    name: 'لوازم الجمال والبرفيوم',
    icon: '💄',
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
          { name: 'غسول', href: '/items?category=cleansers' },
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
      {
        title: 'العناية بالشعر',
        items: [
          { name: 'شامبو', href: '/items?category=shampoo' },
          { name: 'بلسم', href: '/items?category=conditioner' },
          { name: 'زيوت شعر', href: '/items?category=hair-oils' },
        ]
      },
    ],
  },
  {
    id: 'appliances',
    name: 'أجهزة منزلية',
    icon: '🔌',
    href: '/items?category=home-appliances',
    subcategories: [
      {
        title: 'أجهزة كبيرة',
        items: [
          { name: 'ثلاجات', href: '/items?category=refrigerators' },
          { name: 'غسالات', href: '/items?category=washing-machines' },
          { name: 'تكييفات', href: '/items?category=air-conditioners' },
          { name: 'سخانات', href: '/items?category=water-heaters' },
        ]
      },
      {
        title: 'أجهزة المطبخ',
        items: [
          { name: 'بوتاجازات', href: '/items?category=stoves' },
          { name: 'ميكروويف', href: '/items?category=microwave' },
          { name: 'خلاطات', href: '/items?category=blenders' },
          { name: 'محضر طعام', href: '/items?category=food-processors' },
        ]
      },
      {
        title: 'أجهزة صغيرة',
        items: [
          { name: 'مكواة', href: '/items?category=irons' },
          { name: 'مكنسة كهربائية', href: '/items?category=vacuum-cleaners' },
          { name: 'مروحة', href: '/items?category=fans' },
        ]
      },
      {
        title: 'أدوات منزلية',
        items: [
          { name: 'حلل وطاسات', href: '/items?category=cookware' },
          { name: 'أطباق', href: '/items?category=dishes' },
          { name: 'أدوات المائدة', href: '/items?category=cutlery' },
        ]
      },
    ],
  },
  {
    id: 'sports',
    name: 'الرياضة',
    icon: '⚽',
    href: '/items?category=sports-outdoors',
    subcategories: [
      {
        title: 'معدات رياضية',
        items: [
          { name: 'أجهزة رياضية', href: '/items?category=gym-equipment' },
          { name: 'دمبلز وأثقال', href: '/items?category=weights' },
          { name: 'سجادة يوجا', href: '/items?category=yoga-mats' },
        ]
      },
      {
        title: 'كرة القدم',
        items: [
          { name: 'كرات', href: '/items?category=footballs' },
          { name: 'أحذية كرة قدم', href: '/items?category=football-shoes' },
          { name: 'ملابس كرة قدم', href: '/items?category=football-wear' },
        ]
      },
      {
        title: 'رياضات أخرى',
        items: [
          { name: 'تنس', href: '/items?category=tennis' },
          { name: 'سباحة', href: '/items?category=swimming' },
          { name: 'كامبينج', href: '/items?category=camping' },
        ]
      },
    ],
  },
  {
    id: 'real-estate',
    name: 'العقارات',
    icon: '🏠',
    href: '/properties',
    subcategories: [
      {
        title: 'سكني',
        items: [
          { name: 'شقق', href: '/properties?type=APARTMENT' },
          { name: 'فلل', href: '/properties?type=VILLA' },
          { name: 'أراضي', href: '/properties?type=LAND' },
        ]
      },
      {
        title: 'تجاري',
        items: [
          { name: 'محلات', href: '/properties?type=SHOP' },
          { name: 'مكاتب', href: '/properties?type=OFFICE' },
          { name: 'مخازن', href: '/properties?type=WAREHOUSE' },
        ]
      },
    ],
  },
  {
    id: 'art-collectibles',
    name: 'الفن والمقتنيات',
    icon: '🎨',
    href: '/items?category=art-collectibles',
    subcategories: [
      {
        title: 'التحف',
        items: [
          { name: 'ساعات أثرية', href: '/items?category=antique-clocks' },
          { name: 'أثاث أثري', href: '/items?category=antique-furniture' },
          { name: 'فخار', href: '/items?category=pottery' },
        ]
      },
      {
        title: 'المقتنيات',
        items: [
          { name: 'عملات', href: '/items?category=coins-currency' },
          { name: 'طوابع', href: '/items?category=stamps' },
          { name: 'لوحات', href: '/items?category=paintings' },
        ]
      },
    ],
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
  const t = useTranslations();

  // State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'آيفون 14 برو',
    'سيارات مستعملة',
    'شقق للإيجار',
    'لابتوب جيمنج',
  ]);
  const [trendingSearches] = useState<string[]>([
    'بلايستيشن 5',
    'آيفون 15',
    'سيارة هيونداي',
    'ساعة أبل',
    'ايباد برو',
  ]);
  const [locationMenuOpen, setLocationMenuOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    governorate: 'كل مصر',
    city: '',
    district: ''
  });
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredCategoryPosition, setHoveredCategoryPosition] = useState<number>(0);
  const categoryMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const categoryBarRef = useRef<HTMLDivElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationMenuRef = useRef<HTMLDivElement>(null);
  const marketsScrollRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      fetchCartCount();
    } else {
      setUnreadCount(0);
      setCartCount(0);
    }
  }, [user]);

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        const cart = result.data || result;
        setCartCount(cart?.items?.length || 0);
      }
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

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

  // Generate search suggestions based on query
  useEffect(() => {
    if (searchQuery.length >= 2) {
      // Mock suggestions - in production, this would call an API
      const allSuggestions = [
        'آيفون 14 برو ماكس',
        'آيفون 15 برو',
        'آيفون 13',
        'سامسونج جالاكسي S23',
        'سامسونج جالاكسي نوت',
        'لابتوب ماك بوك',
        'لابتوب HP',
        'لابتوب Dell',
        'سيارة تويوتا كورولا',
        'سيارة هيونداي النترا',
        'شقة للإيجار القاهرة',
        'شقة للبيع الإسكندرية',
        'بلايستيشن 5',
        'اكس بوكس سيريس',
        'ساعة أبل واتش',
        'سماعات ايربودز',
      ];
      const filtered = allSuggestions.filter(s =>
        s.includes(searchQuery) || searchQuery.split(' ').some(word => s.includes(word))
      ).slice(0, 5);
      setSearchSuggestions(filtered);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

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

    // Calculate position for mega menu
    const categoryElement = categoryRefs.current[categoryId];
    const containerElement = categoryBarRef.current;
    if (categoryElement && containerElement) {
      const categoryRect = categoryElement.getBoundingClientRect();
      const containerRect = containerElement.getBoundingClientRect();
      // Calculate right offset from container's right edge (for RTL)
      const rightOffset = containerRect.right - categoryRect.right;
      setHoveredCategoryPosition(rightOffset);
    }
  };

  // Scroll categories to the left (for RTL - shows more categories)
  const handleScrollCategories = () => {
    if (categoriesScrollRef.current) {
      categoriesScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  // Scroll markets bar left (RTL: shows items on the right)
  const handleScrollMarketsLeft = () => {
    if (marketsScrollRef.current) {
      marketsScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Scroll markets bar right (RTL: shows items on the left)
  const handleScrollMarketsRight = () => {
    if (marketsScrollRef.current) {
      marketsScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
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
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
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

            {/* Search Bar - Desktop with Suggestions */}
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
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder={t('nav.searchPlaceholder')}
                  className="w-full px-4 py-2.5 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-primary-500 text-white rounded-l-xl hover:bg-primary-600 transition-colors"
                >
                  <Icons.Search />
                </button>
              </div>

              {/* Search Suggestions Dropdown */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {/* Search Suggestions */}
                  {searchQuery.length >= 2 && searchSuggestions.length > 0 && (
                    <div className="p-3 border-b border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">{t('nav.searchSuggestions')}</h4>
                      {searchSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            router.push(`/items?search=${encodeURIComponent(suggestion)}`);
                          }}
                          className="w-full text-right flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <span className="text-gray-400">🔍</span>
                          <span className="text-gray-700">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Recent Searches */}
                  {searchQuery.length < 2 && recentSearches.length > 0 && (
                    <div className="p-3 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-gray-400 uppercase">{t('nav.recentSearches')}</h4>
                        <button
                          type="button"
                          onClick={() => setRecentSearches([])}
                          className="text-xs text-primary-600 hover:underline"
                        >
                          {t('nav.clearAll')}
                        </button>
                      </div>
                      {recentSearches.map((search, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSearchQuery(search);
                            router.push(`/items?search=${encodeURIComponent(search)}`);
                          }}
                          className="w-full text-right flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <span className="text-gray-400">🕐</span>
                          <span className="text-gray-700">{search}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Trending Searches */}
                  <div className="p-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">{t('nav.trending')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {trendingSearches.map((trend, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSearchQuery(trend);
                            router.push(`/items?search=${encodeURIComponent(trend)}`);
                          }}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-primary-100 hover:text-primary-600 rounded-full text-sm text-gray-600 transition-colors flex items-center gap-1"
                        >
                          <span>🔥</span>
                          {trend}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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
                  <span>{t('nav.browse')}</span>
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
              <LanguageSwitcher />

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

                  {/* Dashboard Button */}
                  <Link
                    href="/dashboard"
                    className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                  >
                    <span>📊</span>
                    <span>{t('nav.dashboard')}</span>
                  </Link>

                  {/* Add Listing Button */}
                  <Link
                    href="/inventory/add"
                    className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all shadow-button hover:shadow-button-hover"
                  >
                    <span>➕</span>
                    <span className="hidden md:inline">{t('nav.addListing')}</span>
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
                    {t('common.login')}
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all shadow-button hover:shadow-button-hover"
                  >
                    {t('common.register')}
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
                placeholder={t('nav.searchInXchange')}
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
            <div className="flex items-center gap-0 py-1">
              {/* Category Links with Scroll */}
              <div
                ref={categoriesScrollRef}
                className="flex-1 flex items-center gap-0 overflow-x-auto scrollbar-hide"
              >
                {categoriesData.map((category) => (
                  <div
                    key={category.id}
                    ref={(el) => { categoryRefs.current[category.id] = el; }}
                    className="relative flex-shrink-0"
                    onMouseEnter={() => handleCategoryMouseEnter(category.id)}
                    onMouseLeave={handleCategoryMouseLeave}
                  >
                    <Link
                      href={category.href}
                      className={`flex items-center gap-1.5 px-4 py-2.5 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
                        hoveredCategory === category.id
                          ? 'text-primary-600 border-primary-500'
                          : 'text-gray-700 hover:text-primary-600 border-transparent'
                      }`}
                    >
                      <span>{category.icon}</span>
                      {category.name}
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Link>
                  </div>
                ))}
              </div>

              {/* Scroll Arrow - Functional */}
              <button
                onClick={handleScrollCategories}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category Mega Menu Dropdown - Compact */}
          {hoveredCategory && (
            <div
              className="absolute top-full bg-white shadow-xl border border-gray-200 rounded-lg z-50 mt-1"
              style={{
                minWidth: '600px',
                maxWidth: '700px',
                right: `${Math.max(16, hoveredCategoryPosition)}px`
              }}
              onMouseEnter={handleMegaMenuMouseEnter}
              onMouseLeave={handleMegaMenuMouseLeave}
            >
              <div className="p-4">
                {categoriesData.filter(c => c.id === hoveredCategory).map((category) => (
                  <div key={category.id}>
                    {/* Category Header */}
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                      <span>{category.icon}</span>
                      <Link
                        href={category.href}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                      >
                        تصفح كل {category.name}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Link>
                    </div>

                    {/* Subcategories Grid - Compact Layout */}
                    <div className="flex gap-6">
                      {category.subcategories.map((subcat) => (
                        <div key={subcat.title} className="min-w-[120px]">
                          <h4 className="font-bold text-gray-900 mb-1.5 text-sm">
                            {subcat.title}
                          </h4>
                          <ul className="space-y-0.5">
                            {subcat.items.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  className="text-gray-600 hover:text-primary-600 transition-colors text-sm block py-0.5"
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                            {subcat.hasMore && (
                              <li>
                                <Link
                                  href={category.href}
                                  className="text-primary-600 hover:text-primary-700 text-sm font-medium block py-0.5"
                                >
                                  + المزيد
                                </Link>
                              </li>
                            )}
                            {subcat.showAllLink && (
                              <li>
                                <Link
                                  href={category.href}
                                  className="text-primary-600 hover:text-primary-700 text-sm block py-0.5"
                                >
                                  عرض المنتجات ←
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Categories Scroll */}
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
            {categoriesData.map((category) => (
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
            - Main Competitive Advantage of the Platform
            ============================================ */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1 py-3">
              {/* Right Arrow (RTL: scrolls to show left items) */}
              <button
                onClick={handleScrollMarketsRight}
                className="flex-shrink-0 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="تمرير لليمين"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Scrollable Markets Container */}
              <div
                ref={marketsScrollRef}
                className="flex-1 flex items-center justify-start gap-1 overflow-x-auto scrollbar-hide"
              >
              <Link
                href="/items"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/items')
                    ? 'bg-white text-emerald-800 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">🛒</span>
                {t('nav.generalMarket')}
              </Link>
              <Link
                href="/cars"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/cars')
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">🚗</span>
                {t('nav.carsMarket')}
              </Link>
              <Link
                href="/properties"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/properties')
                    ? 'bg-white text-emerald-700 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">🏠</span>
                {t('nav.propertiesMarket')}
              </Link>
              <Link
                href="/mobiles"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/mobiles')
                    ? 'bg-white text-indigo-700 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">📱</span>
                {t('nav.mobilesMarket')}
              </Link>
              <Link
                href="/auctions"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/auctions')
                    ? 'bg-white text-amber-700 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">🔨</span>
                {t('nav.auctionsMarket')}
              </Link>
              <Link
                href="/reverse-auctions"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/reverse-auctions')
                    ? 'bg-white text-blue-700 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">📋</span>
                {t('nav.tendersMarket')}
              </Link>
              <Link
                href="/luxury"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/luxury')
                    ? 'bg-white text-purple-700 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">👑</span>
                {t('nav.luxuryMarket')}
              </Link>
              <Link
                href="/scrap"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/scrap')
                    ? 'bg-white text-green-700 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">♻️</span>
                {t('nav.scrapMarket')}
              </Link>
              <Link
                href="/gold"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/gold')
                    ? 'bg-white text-yellow-700 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">💰</span>
                {t('nav.goldMarket')}
              </Link>
              <Link
                href="/silver"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/silver')
                    ? 'bg-white text-slate-600 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">🥈</span>
                {t('nav.silverMarket')}
              </Link>
              <Link
                href="/barter"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  isActive('/barter')
                    ? 'bg-white text-orange-700 shadow-md'
                    : 'text-white/90 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span className="text-lg">🔄</span>
                {t('nav.barterMarket')}
              </Link>
              </div>

              {/* Left Arrow (RTL: scrolls to show right items) */}
              <button
                onClick={handleScrollMarketsLeft}
                className="flex-shrink-0 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                aria-label="تمرير لليسار"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
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
                      {t('common.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/login"
                      className="px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium text-center"
                    >
                      {t('common.login')}
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-3 bg-primary-500 text-white rounded-xl font-medium text-center"
                    >
                      {t('common.register')}
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
            <span className="text-xs mt-1 font-medium">{t('mobileNav.home')}</span>
          </Link>

          {/* Browse */}
          <Link
            href="/items"
            className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${
              isActive('/items') ? 'text-primary-600' : 'text-gray-500'
            }`}
          >
            <Icons.Grid active={isActive('/items')} />
            <span className="text-xs mt-1 font-medium">{t('mobileNav.browse')}</span>
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
            <span className="text-xs mt-1 font-medium">{t('mobileNav.messages')}</span>
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
            <span className="text-xs mt-1 font-medium">{t('mobileNav.account')}</span>
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
