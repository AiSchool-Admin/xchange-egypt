'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

// Types
interface StoreData {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  banner?: string;
  description: string;
  themeColor: string;
  owner: {
    id: string;
    fullName: string;
    avatar?: string;
    rating: number;
    totalReviews: number;
    memberSince: string;
    verified: boolean;
  };
  stats: {
    totalProducts: number;
    totalSales: number;
    followers: number;
    responseRate: number;
    responseTime: string;
  };
  badges: string[];
  categories: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
}

interface Product {
  id: string;
  title: string;
  price: number;
  images: { url: string }[];
  condition: string;
  location: string;
  createdAt: string;
  isFeatured?: boolean;
}

interface Review {
  id: string;
  reviewer: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  date: string;
  productTitle?: string;
}

// Mock data for demonstration
const mockStore: StoreData = {
  id: '1',
  name: 'متجر التقنية الحديثة',
  slug: 'modern-tech-store',
  logo: '',
  banner: '',
  description: 'متجر متخصص في بيع أحدث الأجهزة الإلكترونية والهواتف الذكية بأفضل الأسعار. نوفر ضمان حقيقي وخدمة ما بعد البيع.',
  themeColor: '#10B981',
  owner: {
    id: '1',
    fullName: 'أحمد محمد',
    rating: 4.8,
    totalReviews: 256,
    memberSince: '2022-03-15',
    verified: true,
  },
  stats: {
    totalProducts: 145,
    totalSales: 1250,
    followers: 3420,
    responseRate: 98,
    responseTime: 'خلال ساعة',
  },
  badges: ['VERIFIED_SELLER', 'TOP_RATED', 'FAST_SHIPPER', 'TRUSTED'],
  categories: ['إلكترونيات', 'هواتف', 'لابتوب', 'اكسسوارات'],
  socialLinks: {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    whatsapp: '+201234567890',
  },
};

const mockProducts: Product[] = [
  { id: '1', title: 'iPhone 15 Pro Max 256GB', price: 65000, images: [{ url: '' }], condition: 'NEW', location: 'القاهرة', createdAt: '2024-01-15', isFeatured: true },
  { id: '2', title: 'Samsung Galaxy S24 Ultra', price: 55000, images: [{ url: '' }], condition: 'NEW', location: 'القاهرة', createdAt: '2024-01-14', isFeatured: true },
  { id: '3', title: 'MacBook Pro M3 14"', price: 95000, images: [{ url: '' }], condition: 'NEW', location: 'الجيزة', createdAt: '2024-01-13' },
  { id: '4', title: 'iPad Pro 12.9" M2', price: 45000, images: [{ url: '' }], condition: 'LIKE_NEW', location: 'القاهرة', createdAt: '2024-01-12' },
  { id: '5', title: 'AirPods Pro 2nd Gen', price: 8500, images: [{ url: '' }], condition: 'NEW', location: 'الإسكندرية', createdAt: '2024-01-11' },
  { id: '6', title: 'Apple Watch Series 9', price: 18000, images: [{ url: '' }], condition: 'NEW', location: 'القاهرة', createdAt: '2024-01-10' },
];

const mockReviews: Review[] = [
  { id: '1', reviewer: { name: 'محمد علي' }, rating: 5, comment: 'بائع ممتاز وتعامل راقي جداً. المنتج وصل بحالة ممتازة والتوصيل سريع.', date: '2024-01-10', productTitle: 'iPhone 15 Pro' },
  { id: '2', reviewer: { name: 'سارة أحمد' }, rating: 5, comment: 'أفضل متجر للإلكترونيات. أسعار منافسة وضمان حقيقي.', date: '2024-01-08', productTitle: 'MacBook Pro' },
  { id: '3', reviewer: { name: 'أحمد حسن' }, rating: 4, comment: 'تجربة شراء ممتازة. التوصيل تأخر يوم واحد لكن المنتج ممتاز.', date: '2024-01-05', productTitle: 'AirPods Pro' },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price);
};

const getBadgeInfo = (badge: string) => {
  const badges: Record<string, { label: string; icon: string; color: string }> = {
    VERIFIED_SELLER: { label: 'بائع موثق', icon: '✓', color: 'bg-blue-500' },
    TOP_RATED: { label: 'الأعلى تقييماً', icon: '⭐', color: 'bg-amber-500' },
    FAST_SHIPPER: { label: 'شحن سريع', icon: '🚀', color: 'bg-green-500' },
    TRUSTED: { label: 'موثوق', icon: '🛡️', color: 'bg-purple-500' },
    POWER_SELLER: { label: 'بائع متميز', icon: '💎', color: 'bg-indigo-500' },
  };
  return badges[badge] || { label: badge, icon: '🏷️', color: 'bg-gray-500' };
};

export default function StorePage() {
  const params = useParams();
  const { user } = useAuth();
  const [store, setStore] = useState<StoreData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'about'>('products');
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setStore(mockStore);
      setProducts(mockProducts);
      setReviews(mockReviews);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // API call to follow/unfollow
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: store?.name,
        text: store?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط المتجر!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل المتجر...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">المتجر غير موجود</h1>
          <p className="text-gray-600 mb-4">عذراً، لم نتمكن من العثور على هذا المتجر</p>
          <Link href="/items" className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors">
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p =>
    selectedCategory === 'all' || p.condition === selectedCategory
  ).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'price_low') return a.price - b.price;
    if (sortBy === 'price_high') return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Store Banner */}
      <div
        className="h-48 md:h-64 relative"
        style={{
          background: store.banner
            ? `url(${store.banner}) center/cover`
            : `linear-gradient(135deg, ${store.themeColor} 0%, ${store.themeColor}dd 100%)`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        {/* Store Actions */}
        <div className="absolute top-4 left-4 flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Store Header */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Store Logo */}
            <div className="flex-shrink-0">
              <div
                className="w-32 h-32 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shadow-lg"
                style={{ backgroundColor: store.themeColor }}
              >
                {store.logo ? (
                  <img src={store.logo} alt={store.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  store.name.charAt(0)
                )}
              </div>
            </div>

            {/* Store Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{store.name}</h1>
                    {store.owner.verified && (
                      <span className="bg-blue-500 text-white p-1 rounded-full">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{store.description}</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {store.badges.map((badge) => {
                      const info = getBadgeInfo(badge);
                      return (
                        <span key={badge} className={`${info.color} text-white px-3 py-1 rounded-full text-sm flex items-center gap-1`}>
                          <span>{info.icon}</span>
                          {info.label}
                        </span>
                      );
                    })}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">⭐</span>
                      <span className="font-bold text-gray-900">{store.owner.rating}</span>
                      <span>({store.owner.totalReviews} تقييم)</span>
                    </div>
                    <span>•</span>
                    <span>عضو منذ {new Date(store.owner.memberSince).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      isFollowing
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    {isFollowing ? '✓ متابَع' : '+ متابعة'}
                  </button>
                  <Link
                    href={`/messages?user=${store.owner.id}`}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    💬 مراسلة
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Store Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{store.stats.totalProducts}</div>
              <div className="text-sm text-gray-500">منتج</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatPrice(store.stats.totalSales)}</div>
              <div className="text-sm text-gray-500">عملية بيع</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{formatPrice(store.stats.followers)}</div>
              <div className="text-sm text-gray-500">متابع</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{store.stats.responseRate}%</div>
              <div className="text-sm text-gray-500">معدل الرد</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{store.stats.responseTime}</div>
              <div className="text-sm text-gray-500">وقت الرد</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-2 flex gap-2">
          {[
            { id: 'products', label: 'المنتجات', icon: '📦', count: store.stats.totalProducts },
            { id: 'reviews', label: 'التقييمات', icon: '⭐', count: store.owner.totalReviews },
            { id: 'about', label: 'عن المتجر', icon: 'ℹ️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  الكل
                </button>
                {store.categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === cat ? 'bg-primary-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-gray-100 rounded-lg outline-none"
              >
                <option value="newest">الأحدث</option>
                <option value="price_low">السعر: من الأقل للأعلى</option>
                <option value="price_high">السعر: من الأعلى للأقل</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/items/${product.id}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="relative h-48">
                    {product.images[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                    {product.isFeatured && (
                      <span className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        ⭐ مميز
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary-600">
                        {formatPrice(product.price)} ج.م
                      </span>
                      <span className="text-xs text-gray-500">{product.location}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Rating Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">{store.owner.rating}</div>
                  <div className="flex gap-1 justify-center my-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= Math.round(store.owner.rating) ? 'text-amber-500' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">{store.owner.totalReviews} تقييم</div>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const percentage = rating === 5 ? 75 : rating === 4 ? 20 : 5;
                    return (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="w-8 text-sm text-gray-600">{rating} ⭐</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-sm text-gray-500 text-left">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Reviews List */}
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                    {review.reviewer.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-bold text-gray-900">{review.reviewer.name}</span>
                        {review.productTitle && (
                          <span className="text-sm text-gray-500 mr-2">• اشترى {review.productTitle}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= review.rating ? 'text-amber-500' : 'text-gray-300'}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 معلومات المتجر</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-500">الوصف:</span>
                  <p className="text-gray-900 mt-1">{store.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">التصنيفات:</span>
                  <div className="flex flex-wrap gap-2">
                    {store.categories.map((cat) => (
                      <span key={cat} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📞 التواصل</h3>
              <div className="space-y-3">
                {store.socialLinks?.whatsapp && (
                  <a
                    href={`https://wa.me/${store.socialLinks.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <span className="text-2xl">📱</span>
                    <span className="text-green-700 font-medium">واتساب</span>
                  </a>
                )}
                {store.socialLinks?.facebook && (
                  <a
                    href={store.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-2xl">📘</span>
                    <span className="text-blue-700 font-medium">فيسبوك</span>
                  </a>
                )}
                {store.socialLinks?.instagram && (
                  <a
                    href={store.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
                  >
                    <span className="text-2xl">📸</span>
                    <span className="text-pink-700 font-medium">انستجرام</span>
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 md:col-span-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">🏆 الإنجازات والشارات</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {store.badges.map((badge) => {
                  const info = getBadgeInfo(badge);
                  return (
                    <div key={badge} className="text-center p-4 bg-gray-50 rounded-xl">
                      <div className={`w-16 h-16 ${info.color} rounded-full flex items-center justify-center text-2xl mx-auto mb-2`}>
                        {info.icon}
                      </div>
                      <span className="font-medium text-gray-900">{info.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
