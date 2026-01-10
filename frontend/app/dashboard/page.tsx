'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

// Translations
const translations = {
  ar: {
    // Loading
    loading: 'جاري التحميل...',

    // Header
    welcome: 'مرحباً،',
    homePage: 'الصفحة الرئيسية',
    logout: 'تسجيل الخروج',
    myProfile: 'ملفي الشخصي',

    // Stats
    myProducts: 'منتجاتي',
    mySales: 'مبيعاتي',
    myPurchases: 'مشترياتي',
    newOffers: 'عروض جديدة',
    myAuctions: 'مزاداتي',
    myBids: 'مزايداتي',

    // Main CTA
    fullActivity: 'نشاطي التجاري الكامل',
    fullActivityDesc: 'استعرض جميع منتجاتك ومعاملاتك ومزاداتك ومقايضاتك في مكان واحد',
    viewActivity: 'عرض النشاط التجاري',

    // Quick Actions
    addNewProduct: 'أضف منتج جديد',
    addNewProductDesc: 'أضف منتجاتك للبيع أو المقايضة أو المزاد',
    browseProducts: 'تصفح المنتجات',
    browseProductsDesc: 'استكشف آلاف المنتجات المتاحة',
    auctions: 'المزادات',
    auctionsDesc: 'شارك في المزادات واربح صفقات رائعة',
    barter: 'المقايضة',
    barterDesc: 'بادل منتجاتك بدون حاجة للمال',

    // My Items & Listings
    myItemsAndListings: 'منتجاتي وإعلاناتي',
    myItems: 'منتجاتي',
    addNewItem: 'إضافة منتج جديد',
    createNewAuction: 'إنشاء مزاد جديد',

    // My Transactions
    myTransactions: 'معاملاتي المالية',
    salesAndPurchases: 'مبيعاتي ومشترياتي',
    incomingOrders: 'طلبات من مشترين',
    shoppingCart: 'سلة التسوق',
    myOrders: 'تابع طلباتي',

    // Auctions & Bids
    auctionsAndBids: 'المزادات والمزايدات',
    activeAuctions: 'المزادات النشطة',
    myBidsLink: 'مزايداتي',
    tenders: 'المناقصات',

    // Barter & Exchange
    barterAndExchange: 'المقايضة والتبادل',
    barterOffers: 'عروض المقايضة',
    new: 'جديد',
    searchBarters: 'البحث عن مقايضات',
    createBarterOffer: 'إنشاء عرض مقايضة',

    // Help Section
    howToUseXchange: 'كيف تستخدم XChange؟',
    step1Title: 'أضف منتجاتك',
    step1Desc: 'صوّر منتجاتك وأضفها للمنصة',
    step2Title: 'اختر طريقة البيع',
    step2Desc: 'بيع مباشر، مزاد، أو مقايضة',
    step3Title: 'تواصل مع المشترين',
    step3Desc: 'استقبل العروض وتفاوض',
    step4Title: 'أتمم الصفقة',
    step4Desc: 'سلّم المنتج واستلم المقابل',

    // Footer
    copyright: '© 2024 XChange - منصة التبادل التجاري الأولى في مصر',
    aboutPlatform: 'عن المنصة',
    contactUs: 'تواصل معنا',
    termsAndConditions: 'الشروط والأحكام',
  },
  en: {
    // Loading
    loading: 'Loading...',

    // Header
    welcome: 'Welcome,',
    homePage: 'Home Page',
    logout: 'Logout',
    myProfile: 'My Profile',

    // Stats
    myProducts: 'My Products',
    mySales: 'My Sales',
    myPurchases: 'My Purchases',
    newOffers: 'New Offers',
    myAuctions: 'My Auctions',
    myBids: 'My Bids',

    // Main CTA
    fullActivity: 'My Full Business Activity',
    fullActivityDesc: 'View all your products, transactions, auctions, and barters in one place',
    viewActivity: 'View Business Activity',

    // Quick Actions
    addNewProduct: 'Add New Product',
    addNewProductDesc: 'Add your products for sale, barter, or auction',
    browseProducts: 'Browse Products',
    browseProductsDesc: 'Explore thousands of available products',
    auctions: 'Auctions',
    auctionsDesc: 'Participate in auctions and win great deals',
    barter: 'Barter',
    barterDesc: 'Exchange your products without money',

    // My Items & Listings
    myItemsAndListings: 'My Items & Listings',
    myItems: 'My Products',
    addNewItem: 'Add New Product',
    createNewAuction: 'Create New Auction',

    // My Transactions
    myTransactions: 'My Financial Transactions',
    salesAndPurchases: 'My Sales & Purchases',
    incomingOrders: 'Orders from Buyers',
    shoppingCart: 'Shopping Cart',
    myOrders: 'Track My Orders',

    // Auctions & Bids
    auctionsAndBids: 'Auctions & Bids',
    activeAuctions: 'Active Auctions',
    myBidsLink: 'My Bids',
    tenders: 'Tenders',

    // Barter & Exchange
    barterAndExchange: 'Barter & Exchange',
    barterOffers: 'Barter Offers',
    new: 'new',
    searchBarters: 'Search Barters',
    createBarterOffer: 'Create Barter Offer',

    // Help Section
    howToUseXchange: 'How to use XChange?',
    step1Title: 'Add Your Products',
    step1Desc: 'Take photos and add your products to the platform',
    step2Title: 'Choose Selling Method',
    step2Desc: 'Direct sale, auction, or barter',
    step3Title: 'Connect with Buyers',
    step3Desc: 'Receive offers and negotiate',
    step4Title: 'Complete the Deal',
    step4Desc: 'Deliver the product and receive payment',

    // Footer
    copyright: '© 2024 XChange - The First Trading Platform in Egypt',
    aboutPlatform: 'About Platform',
    contactUs: 'Contact Us',
    termsAndConditions: 'Terms & Conditions',
  },
};

type Language = 'ar' | 'en';

interface DashboardStats {
  items: number;
  sales: number;
  purchases: number;
  pendingOffers: number;
  activeAuctions: number;
  activeBids: number;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Language state - default to Arabic
  const [lang, setLang] = useState<Language>('ar');
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const [stats, setStats] = useState<DashboardStats>({
    items: 0,
    sales: 0,
    purchases: 0,
    pendingOffers: 0,
    activeAuctions: 0,
    activeBids: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const [itemsRes, salesRes, purchasesRes, barterRes, auctionsRes, bidsRes] = await Promise.all([
        apiClient.get('/items/my?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 }, items: [] } } })),
        apiClient.get('/transactions/my?role=seller&limit=1').catch(() => ({ data: { data: { pagination: { total: 0 }, transactions: [] } } })),
        apiClient.get('/transactions/my?role=buyer&limit=1').catch(() => ({ data: { data: { pagination: { total: 0 }, transactions: [] } } })),
        apiClient.get('/barter/offers/my?type=received&status=PENDING&limit=1').catch(() => ({ data: { data: { pagination: { total: 0 }, offers: [] } } })),
        apiClient.get('/auctions/my?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 }, auctions: [] } } })),
        apiClient.get('/auctions/my-bids?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 }, bids: [] } } })),
      ]);

      setStats({
        items: itemsRes.data.data?.pagination?.total ?? itemsRes.data.data?.items?.length ?? 0,
        sales: salesRes.data.data?.pagination?.total ?? salesRes.data.data?.transactions?.length ?? 0,
        purchases: purchasesRes.data.data?.pagination?.total ?? purchasesRes.data.data?.transactions?.length ?? 0,
        pendingOffers: barterRes.data.data?.pagination?.total ?? barterRes.data.data?.offers?.length ?? 0,
        activeAuctions: auctionsRes.data.data?.pagination?.total ?? auctionsRes.data.data?.auctions?.length ?? (Array.isArray(auctionsRes.data.data) ? auctionsRes.data.data.length : 0),
        activeBids: bidsRes.data.data?.pagination?.total ?? bidsRes.data.data?.bids?.length ?? (Array.isArray(bidsRes.data.data) ? bidsRes.data.data.length : 0),
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <div className="text-xl text-gray-600">{t.loading}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className={`bg-gradient-to-${isRTL ? 'l' : 'r'} from-primary-600 via-primary-700 to-teal-600 text-white shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <Link href="/dashboard/profile" className="flex items-center gap-4 hover:opacity-90 transition-opacity">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t.welcome} {user.fullName}</h1>
                <p className="text-primary-100 text-sm">{user.email}</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <button
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              >
                <span className="text-lg">{lang === 'ar' ? '🇬🇧' : '🇪🇬'}</span>
                <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
              </button>
              <Link
                href="/dashboard/profile"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              >
                👤 {t.myProfile}
              </Link>
              <Link
                href="/"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              >
                {t.homePage}
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 hover:bg-red-500/80 rounded-lg transition-colors backdrop-blur-sm"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📦</span>
              <span className="text-2xl font-bold text-primary-600">{loadingStats ? '...' : stats.items}</span>
            </div>
            <p className="text-sm text-gray-600">{t.myProducts}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💵</span>
              <span className="text-2xl font-bold text-green-600">{loadingStats ? '...' : stats.sales}</span>
            </div>
            <p className="text-sm text-gray-600">{t.mySales}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🛒</span>
              <span className="text-2xl font-bold text-blue-600">{loadingStats ? '...' : stats.purchases}</span>
            </div>
            <p className="text-sm text-gray-600">{t.myPurchases}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔔</span>
              <span className="text-2xl font-bold text-orange-600">{loadingStats ? '...' : stats.pendingOffers}</span>
            </div>
            <p className="text-sm text-gray-600">{t.newOffers}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔨</span>
              <span className="text-2xl font-bold text-purple-600">{loadingStats ? '...' : stats.activeAuctions}</span>
            </div>
            <p className="text-sm text-gray-600">{t.myAuctions}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎯</span>
              <span className="text-2xl font-bold text-indigo-600">{loadingStats ? '...' : stats.activeBids}</span>
            </div>
            <p className="text-sm text-gray-600">{t.myBids}</p>
          </div>
        </div>

        {/* Main CTA */}
        <div className={`bg-gradient-to-${isRTL ? 'l' : 'r'} from-primary-600 to-teal-600 rounded-2xl p-6 mb-8 text-white shadow-xl`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t.fullActivity}</h2>
              <p className="text-primary-100">{t.fullActivityDesc}</p>
            </div>
            <Link
              href="/dashboard/activity"
              className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-100 transition-all font-bold flex items-center gap-3 shadow-lg whitespace-nowrap"
            >
              <span className="text-2xl">📊</span>
              {t.viewActivity}
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Add New Item */}
          <Link
            href="/items/new"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              ➕
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{t.addNewProduct}</h3>
            <p className="text-sm text-gray-500">{t.addNewProductDesc}</p>
          </Link>

          {/* Browse Items */}
          <Link
            href="/items"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🛍️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{t.browseProducts}</h3>
            <p className="text-sm text-gray-500">{t.browseProductsDesc}</p>
          </Link>

          {/* Auctions */}
          <Link
            href="/auctions"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🔨
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{t.auctions}</h3>
            <p className="text-sm text-gray-500">{t.auctionsDesc}</p>
          </Link>

          {/* Barter */}
          <Link
            href="/barter"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-teal-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🔄
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{t.barter}</h3>
            <p className="text-sm text-gray-500">{t.barterDesc}</p>
          </Link>
        </div>

        {/* My Activity Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* My Items & Listings */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-${isRTL ? 'l' : 'r'} from-purple-500 to-purple-600 px-6 py-4`}>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📦</span> {t.myItemsAndListings}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/items?user=me"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">📦</div>
                  <span className="font-medium">{t.myItems}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
              <Link
                href="/items/new"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">➕</div>
                  <span className="font-medium">{t.addNewItem}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
              <Link
                href="/auctions/new"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">🔨</div>
                  <span className="font-medium">{t.createNewAuction}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
            </div>
          </div>

          {/* My Transactions */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-${isRTL ? 'l' : 'r'} from-green-500 to-green-600 px-6 py-4`}>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💰</span> {t.myTransactions}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/dashboard/sales"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">📥</div>
                  <span className="font-medium">{t.incomingOrders}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
              <Link
                href="/dashboard/transactions"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">💵</div>
                  <span className="font-medium">{t.salesAndPurchases}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
              <Link
                href="/cart"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">🛒</div>
                  <span className="font-medium">{t.shoppingCart}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
              <Link
                href="/dashboard/orders"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">📋</div>
                  <span className="font-medium">{t.myOrders}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
            </div>
          </div>

          {/* Auctions & Bids */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-${isRTL ? 'l' : 'r'} from-indigo-500 to-indigo-600 px-6 py-4`}>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🔨</span> {t.auctionsAndBids}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/auctions"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">🔨</div>
                  <span className="font-medium">{t.activeAuctions}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
              <Link
                href="/dashboard/activity"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">🎯</div>
                  <span className="font-medium">{t.myBidsLink}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
              <Link
                href="/reverse-auctions"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">📉</div>
                  <span className="font-medium">{t.tenders}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
            </div>
          </div>

          {/* Barter & Exchange */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className={`bg-gradient-to-${isRTL ? 'l' : 'r'} from-teal-500 to-teal-600 px-6 py-4`}>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🔄</span> {t.barterAndExchange}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/barter/my-offers"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">📥</div>
                  <div>
                    <span className="font-medium">{t.barterOffers}</span>
                    {stats.pendingOffers > 0 && (
                      <span className={`${isRTL ? 'mr-2' : 'ml-2'} px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full`}>
                        {stats.pendingOffers} {t.new}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
              <Link
                href="/barter"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">🔍</div>
                  <span className="font-medium">{t.searchBarters}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
              <Link
                href="/barter/new"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">➕</div>
                  <span className="font-medium">{t.createBarterOffer}</span>
                </div>
                <span className="text-gray-400">{isRTL ? '←' : '→'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>💡</span> {t.howToUseXchange}
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <div className="text-3xl mb-2">1️⃣</div>
              <h4 className="font-semibold mb-1">{t.step1Title}</h4>
              <p className="text-sm text-gray-500">{t.step1Desc}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <div className="text-3xl mb-2">2️⃣</div>
              <h4 className="font-semibold mb-1">{t.step2Title}</h4>
              <p className="text-sm text-gray-500">{t.step2Desc}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <div className="text-3xl mb-2">3️⃣</div>
              <h4 className="font-semibold mb-1">{t.step3Title}</h4>
              <p className="text-sm text-gray-500">{t.step3Desc}</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <div className="text-3xl mb-2">4️⃣</div>
              <h4 className="font-semibold mb-1">{t.step4Title}</h4>
              <p className="text-sm text-gray-500">{t.step4Desc}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              {t.copyright}
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="/about" className="text-gray-500 hover:text-primary-600">{t.aboutPlatform}</Link>
              <Link href="/contact" className="text-gray-500 hover:text-primary-600">{t.contactUs}</Link>
              <Link href="/terms" className="text-gray-500 hover:text-primary-600">{t.termsAndConditions}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
