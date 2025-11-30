'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLatestItems, PublicItem, MarketType, MARKET_CONFIG } from '@/lib/api/inventory';

// Market Tabs Component
function MarketTabs({
  selectedMarket,
  onSelect
}: {
  selectedMarket: MarketType | null;
  onSelect: (market: MarketType | null) => void;
}) {
  const markets = [
    { id: null, nameAr: 'الكل', icon: '🌍', color: 'gray' },
    { id: 'DISTRICT' as MarketType, ...MARKET_CONFIG.DISTRICT },
    { id: 'CITY' as MarketType, ...MARKET_CONFIG.CITY },
    { id: 'GOVERNORATE' as MarketType, ...MARKET_CONFIG.GOVERNORATE },
    { id: 'NATIONAL' as MarketType, ...MARKET_CONFIG.NATIONAL },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {markets.map((market) => (
        <button
          key={market.id || 'all'}
          onClick={() => onSelect(market.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedMarket === market.id
              ? market.id === 'DISTRICT' ? 'bg-green-500 text-white'
              : market.id === 'CITY' ? 'bg-blue-500 text-white'
              : market.id === 'GOVERNORATE' ? 'bg-purple-500 text-white'
              : market.id === 'NATIONAL' ? 'bg-amber-500 text-white'
              : 'bg-gray-800 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>{market.icon}</span>
          <span>{market.nameAr}</span>
        </button>
      ))}
    </div>
  );
}

// Item Card Component for both Supply and Demand
function ItemCard({ item, type }: { item: PublicItem; type: 'supply' | 'demand' }) {
  const isSupply = type === 'supply';

  // Format price in Egyptian Pounds
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-EG');
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border-t-4 ${
      isSupply ? 'border-green-500' : 'border-blue-500'
    }`}>
      {/* Image or placeholder */}
      <div className="relative h-48 bg-gray-100">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0]}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${
            isSupply ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            <span className="text-6xl">
              {isSupply ? '📦' : '🔍'}
            </span>
          </div>
        )}
        {/* Badge */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
          isSupply ? 'bg-green-500' : 'bg-blue-500'
        }`}>
          {isSupply ? 'عرض' : 'طلب'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2" dir="auto">
          {item.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2" dir="auto">
          {item.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-lg font-bold ${isSupply ? 'text-green-600' : 'text-blue-600'}`}>
            {isSupply
              ? formatPrice(item.estimatedValue)
              : item.minValue && item.maxValue
                ? `${formatPrice(item.minValue)} - ${formatPrice(item.maxValue)}`
                : formatPrice(item.estimatedValue)
            }
          </span>
          {item.category && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {item.category.nameAr}
            </span>
          )}
        </div>

        {/* Location & User */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center gap-1">
            {item.user.avatar ? (
              <img src={item.user.avatar} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs">👤</span>
              </div>
            )}
            <span>{item.user.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {item.location || item.user.governorate ? (
              <>
                <span>📍</span>
                <span>{item.location || item.user.governorate}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Time */}
        <div className="text-xs text-gray-400 mt-2 text-left">
          {formatDate(item.createdAt)}
        </div>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({
  title,
  subtitle,
  icon,
  color
}: {
  title: string;
  subtitle: string;
  icon: string;
  color: 'green' | 'blue'
}) {
  return (
    <div className="text-center mb-8">
      <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
        color === 'green' ? 'bg-green-100' : 'bg-blue-100'
      } mb-4`}>
        <span className="text-3xl">{icon}</span>
        <h2 className={`text-2xl font-bold ${
          color === 'green' ? 'text-green-700' : 'text-blue-700'
        }`}>
          {title}
        </h2>
      </div>
      <p className="text-gray-600">{subtitle}</p>
    </div>
  );
}

// Empty State Component
function EmptyState({ type }: { type: 'supply' | 'demand' }) {
  const isSupply = type === 'supply';
  return (
    <div className={`col-span-full text-center py-12 rounded-xl ${
      isSupply ? 'bg-green-50' : 'bg-blue-50'
    }`}>
      <span className="text-5xl mb-4 block">{isSupply ? '📦' : '🔍'}</span>
      <p className="text-gray-600 mb-4">
        {isSupply
          ? 'لا توجد عروض حالياً. كن أول من يضيف عرضاً!'
          : 'لا توجد طلبات حالياً. كن أول من يضيف طلباً!'
        }
      </p>
      <Link
        href="/inventory/add"
        className={`inline-block px-6 py-2 rounded-lg text-white font-semibold ${
          isSupply ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isSupply ? 'أضف عرضك الأول' : 'أضف طلبك الأول'}
      </Link>
    </div>
  );
}

export default function Home() {
  const [supplyItems, setSupplyItems] = useState<PublicItem[]>([]);
  const [demandItems, setDemandItems] = useState<PublicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<MarketType | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await getLatestItems({
          limit: 8,
          marketType: selectedMarket || undefined,
        });
        if (response.success) {
          setSupplyItems(response.data.supply);
          setDemandItems(response.data.demand);
        }
      } catch (err: any) {
        console.error('Failed to fetch items:', err);
        // Don't show error - just show empty state
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedMarket]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-4">
              Xchange
            </h1>
            <p className="text-2xl sm:text-3xl mb-2 text-primary-100">
              منصة التبادل والمقايضة في مصر
            </p>
            <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
              اعرض ما لديك، اطلب ما تريد - نظام ذكي للمطابقة بين العروض والطلبات
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-4xl font-bold">{supplyItems.length}+</div>
                <div className="text-primary-200">عروض نشطة</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{demandItems.length}+</div>
                <div className="text-primary-200">طلبات نشطة</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">27</div>
                <div className="text-primary-200">محافظة</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/inventory/add"
                className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-primary-50 transition-colors font-bold text-lg shadow-lg"
              >
                ➕ أضف عرضك أو طلبك
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-primary-700 text-white rounded-xl hover:bg-primary-800 transition-colors font-semibold text-lg border-2 border-primary-400"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="rgb(249 250 251)"/>
          </svg>
        </div>
      </header>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">كيف يعمل النظام؟</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl bg-white shadow-md">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📦</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">1. أضف ما لديك</h3>
            <p className="text-gray-600">
              سجل المنتجات أو الخدمات التي تريد بيعها أو مبادلتها
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-md">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">2. حدد ما تريد</h3>
            <p className="text-gray-600">
              أخبرنا ما تبحث عنه وسنجد لك أفضل المطابقات
            </p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-md">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🤝</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">3. أتمم الصفقة</h3>
            <p className="text-gray-600">
              تواصل مع الطرف الآخر وأتمم عملية التبادل بأمان
            </p>
          </div>
        </div>
      </section>

      {/* Market Selection Tabs */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">اختر السوق</h2>
          <p className="text-gray-600">تصفح العروض والطلبات حسب نطاق السوق</p>
        </div>
        <MarketTabs selectedMarket={selectedMarket} onSelect={setSelectedMarket} />

        {/* Selected market info */}
        {selectedMarket && (
          <div className={`text-center p-4 rounded-xl mb-4 ${
            selectedMarket === 'DISTRICT' ? 'bg-green-50 text-green-800' :
            selectedMarket === 'CITY' ? 'bg-blue-50 text-blue-800' :
            selectedMarket === 'GOVERNORATE' ? 'bg-purple-50 text-purple-800' :
            'bg-amber-50 text-amber-800'
          }`}>
            <span className="text-2xl mr-2">{MARKET_CONFIG[selectedMarket].icon}</span>
            <span className="font-bold">{MARKET_CONFIG[selectedMarket].nameAr}</span>
            <span className="mx-2">-</span>
            <span>{MARKET_CONFIG[selectedMarket].description}</span>
          </div>
        )}
      </section>

      {/* Latest Offers (Supply) Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-100">
        <SectionHeader
          title="أحدث العروض"
          subtitle="منتجات وخدمات معروضة للبيع أو المقايضة"
          icon="📦"
          color="green"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : supplyItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {supplyItems.map((item) => (
              <ItemCard key={item.id} item={item} type="supply" />
            ))}
          </div>
        ) : (
          <EmptyState type="supply" />
        )}

        {supplyItems.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/items"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-semibold"
            >
              عرض كل العروض
              <span>←</span>
            </Link>
          </div>
        )}
      </section>

      {/* Latest Requests (Demand) Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 bg-blue-50/50">
        <SectionHeader
          title="أحدث الطلبات"
          subtitle="مستخدمون يبحثون عن منتجات أو خدمات معينة"
          icon="🔍"
          color="blue"
        />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : demandItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {demandItems.map((item) => (
              <ItemCard key={item.id} item={item} type="demand" />
            ))}
          </div>
        ) : (
          <EmptyState type="demand" />
        )}

        {demandItems.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/barter/open-offers"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
            >
              عرض كل الطلبات
              <span>←</span>
            </Link>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">ابدأ الآن مجاناً!</h2>
          <p className="text-xl text-primary-100 mb-8">
            سجل حسابك وابدأ في عرض منتجاتك أو البحث عما تحتاج
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-primary-50 transition-colors font-bold text-lg"
            >
              إنشاء حساب جديد
            </Link>
            <Link
              href="/inventory/add"
              className="px-8 py-4 bg-primary-800 text-white rounded-xl hover:bg-primary-900 transition-colors font-semibold text-lg border-2 border-primary-400"
            >
              أضف أول عرض لك
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">Xchange</h3>
              <p className="text-sm">
                منصة مصرية للتبادل والمقايضة الذكية. نربط بين من يملك ومن يحتاج.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/items" className="hover:text-white">تصفح العروض</Link></li>
                <li><Link href="/barter" className="hover:text-white">المقايضة</Link></li>
                <li><Link href="/auctions" className="hover:text-white">المزادات</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">الحساب</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white">تسجيل الدخول</Link></li>
                <li><Link href="/register" className="hover:text-white">إنشاء حساب</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">لوحة التحكم</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-sm">
                <li>📧 support@xchange.eg</li>
                <li>📱 +20 123 456 7890</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Xchange Egypt. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
