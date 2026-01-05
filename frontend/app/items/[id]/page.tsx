'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getItem, getItems, Item } from '@/lib/api/items';
import { buyItem } from '@/lib/api/transactions';
import { findMyMatchingItem, BarterMatch } from '@/lib/api/barter';
import { useAuth } from '@/lib/contexts/AuthContext';
import ItemCard from '@/components/ui/ItemCard';

// Icons as inline SVGs
const HeartIcon = ({ filled = false, className = '' }: { filled?: boolean; className?: string }) => (
  <svg className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ShareIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

const LocationIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const VerifiedIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const ChevronLeftIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

const ShieldIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const TruckIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
  </svg>
);

const RefreshIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const CloseIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ZoomIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
  </svg>
);

// Condition badge colors and labels
const conditionConfig: Record<string, { color: string; label: string; labelAr: string }> = {
  NEW: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'New', labelAr: 'جديد' },
  LIKE_NEW: { color: 'bg-blue-100 text-blue-700 border-blue-200', label: 'Like New', labelAr: 'كالجديد' },
  GOOD: { color: 'bg-cyan-100 text-cyan-700 border-cyan-200', label: 'Good', labelAr: 'جيد' },
  FAIR: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Fair', labelAr: 'مقبول' },
  POOR: { color: 'bg-orange-100 text-orange-700 border-orange-200', label: 'Poor', labelAr: 'ضعيف' },
  FOR_PARTS: { color: 'bg-red-100 text-red-700 border-red-200', label: 'For Parts', labelAr: 'للقطع' },
  DAMAGED: { color: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Damaged', labelAr: 'تالف' },
  SCRAP: { color: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Scrap', labelAr: 'خردة' },
};

// Listing type badge config
const listingTypeConfig: Record<string, { color: string; label: string; labelAr: string; icon: string }> = {
  DIRECT_SALE: { color: 'bg-primary-100 text-primary-700', label: 'For Sale', labelAr: 'للبيع', icon: '🏷️' },
  AUCTION: { color: 'bg-amber-100 text-amber-700', label: 'Auction', labelAr: 'مزاد', icon: '🔨' },
  BARTER: { color: 'bg-purple-100 text-purple-700', label: 'Barter', labelAr: 'مقايضة', icon: '🔄' },
  DIRECT_BUY: { color: 'bg-blue-100 text-blue-700', label: 'Wanted', labelAr: 'مطلوب', icon: '🔍' },
  REVERSE_AUCTION: { color: 'bg-pink-100 text-pink-700', label: 'Reverse Auction', labelAr: 'مزاد عكسي', icon: '📉' },
};

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [similarItems, setSimilarItems] = useState<Item[]>([]);

  // Buy Now Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyForm, setBuyForm] = useState({
    paymentMethod: 'CASH_ON_DELIVERY' as const,
    shippingAddress: '',
    phoneNumber: '',
    notes: '',
  });

  // Add to Cart State
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  // Barter Match State
  const [barterMatch, setBarterMatch] = useState<BarterMatch | null>(null);
  const [loadingMatch, setLoadingMatch] = useState(false);

  // Image gallery ref for touch swipe
  const imageRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    if (params.id) {
      loadItem(params.id as string);
    }
  }, [params.id]);

  // Load barter match when item is loaded and user is authenticated
  useEffect(() => {
    if (item && user && (item.desiredItemTitle || item.desiredCategoryId) && item.seller?.id !== user.id) {
      loadBarterMatch(item.id);
    }
  }, [item, user]);

  // Load similar items
  useEffect(() => {
    if (item?.category?.id) {
      loadSimilarItems(item.category.id, item.id);
    }
  }, [item]);

  const loadBarterMatch = async (itemId: string) => {
    try {
      setLoadingMatch(true);
      const response = await findMyMatchingItem(itemId);
      if (response.data) {
        setBarterMatch(response.data);
      }
    } catch (err) {
      console.error('Error loading barter match:', err);
    } finally {
      setLoadingMatch(false);
    }
  };

  const loadItem = async (id: string) => {
    try {
      setLoading(true);
      const response = await getItem(id);
      setItem(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const loadSimilarItems = async (categoryId: string, excludeId: string) => {
    try {
      const response = await getItems({ categoryId, limit: 4 });
      const filtered = response.data.items.filter((i: Item) => i.id !== excludeId);
      setSimilarItems(filtered.slice(0, 4));
    } catch (err) {
      console.error('Error loading similar items:', err);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowBuyModal(true);
    setBuyError('');
    setBuySuccess(false);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setBuyLoading(true);
    setBuyError('');

    try {
      await buyItem({
        itemId: item.id,
        paymentMethod: buyForm.paymentMethod,
        shippingAddress: buyForm.shippingAddress,
        phoneNumber: buyForm.phoneNumber,
        notes: buyForm.notes || undefined,
      });

      setBuySuccess(true);
      setItem({ ...item, status: 'SOLD' });
    } catch (err: any) {
      setBuyError(err.response?.data?.message || 'فشلت عملية الشراء. يرجى المحاولة مرة أخرى.');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!item) return;

    setAddingToCart(true);
    setCartMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        setCartMessage('تمت الإضافة للسلة!');
        setTimeout(() => setCartMessage(''), 3000);
      } else {
        const data = await response.json();
        setCartMessage(data.message || 'فشل في الإضافة للسلة');
      }
    } catch (err) {
      setCartMessage('فشل في الإضافة للسلة');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item?.title,
          text: item?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareMenu(false);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)} ألف`;
    }
    return price.toLocaleString('ar-EG');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'اليوم';
    if (diffDays === 1) return 'أمس';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} شهور`;
    return `منذ ${Math.floor(diffDays / 365)} سنوات`;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      const images = item?.images || [];
      if (diff > 0 && selectedImage < images.length - 1) {
        setSelectedImage(selectedImage + 1);
      } else if (diff < 0 && selectedImage > 0) {
        setSelectedImage(selectedImage - 1);
      }
    }
    setTouchStart(null);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-4 pb-24">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb skeleton */}
          <div className="mb-4 flex items-center gap-2">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <div className="aspect-[4/3] bg-gray-200 animate-pulse"></div>
                <div className="p-4 flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-card p-6 space-y-4">
                <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-12 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'المنتج غير موجود'}
          </h2>
          <p className="text-gray-600 mb-6">
            عذراً، لم نتمكن من العثور على المنتج المطلوب
          </p>
          <button
            onClick={() => router.push('/items')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <ChevronRightIcon className="w-5 h-5" />
            <span>العودة للتصفح</span>
          </button>
        </div>
      </div>
    );
  }

  // Normalize images to always have url property
  const normalizeImage = (img: string | { url: string; isPrimary?: boolean }) => {
    if (typeof img === 'string') {
      return { url: img, isPrimary: false };
    }
    return img;
  };

  const images = item.images && item.images.length > 0
    ? item.images.filter(img => img !== null && img !== undefined).map(normalizeImage)
    : [];
  const isOwner = user?.id === item.seller?.id;
  const condition = conditionConfig[item.condition] || conditionConfig.GOOD;
  const listingType = listingTypeConfig[item.listingType || 'DIRECT_SALE'] || listingTypeConfig.DIRECT_SALE;

  return (
    <div className="min-h-screen bg-gray-50 pt-4 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-sm">
          <Link href="/" className="text-gray-500 hover:text-primary-600 transition">
            الرئيسية
          </Link>
          <ChevronLeftIcon className="w-4 h-4 text-gray-400" />
          <Link href="/items" className="text-gray-500 hover:text-primary-600 transition">
            المنتجات
          </Link>
          <ChevronLeftIcon className="w-4 h-4 text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* Main Image */}
              <div
                ref={imageRef}
                className="aspect-[4/3] bg-gray-100 relative group cursor-zoom-in"
                onClick={() => setIsImageZoomed(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {images.length > 0 ? (
                  <>
                    <img
                      src={images[selectedImage]?.url}
                      alt={item.title}
                      className="w-full h-full object-contain transition-transform duration-300"
                    />
                    {/* Zoom indicator */}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                      <ZoomIcon className="w-4 h-4" />
                      <span>اضغط للتكبير</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <span className="text-8xl mb-2">📦</span>
                    <span>لا توجد صور</span>
                  </div>
                )}

                {/* Image navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Image counter for mobile */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm lg:hidden">
                    {selectedImage + 1} / {images.length}
                  </div>
                )}

                {/* Listing type badge */}
                <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-medium ${listingType.color}`}>
                  {listingType.icon} {listingType.labelAr}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.map((img: any, index: number) => (
                    <button
                      key={img.id || index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary-500 ring-2 ring-primary-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img.url} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: Quick Info & Actions (appears before description on mobile) */}
            <div className="lg:hidden bg-white rounded-2xl shadow-card p-5 space-y-4">
              {/* Title & Price */}
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h1>
                {item.estimatedValue ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary-600">
                      {formatPrice(item.estimatedValue)}
                    </span>
                    <span className="text-lg text-gray-500">جنيه</span>
                  </div>
                ) : (
                  <span className="text-lg text-gray-600">السعر عند الاستفسار</span>
                )}
              </div>

              {/* Location & Date */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {(item.location || item.governorate) && (
                  <div className="flex items-center gap-1">
                    <LocationIcon className="w-4 h-4" />
                    <span>{item.location || item.governorate}</span>
                  </div>
                )}
                <span>•</span>
                <span>{formatDate(item.createdAt)}</span>
              </div>

              {/* Condition Badge */}
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${condition.color}`}>
                  {condition.labelAr}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
                الوصف
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {item.description || 'لا يوجد وصف متاح لهذا المنتج.'}
              </p>
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
                تفاصيل المنتج
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">الحالة</p>
                  <p className="font-semibold text-gray-900">{condition.labelAr}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">الفئة</p>
                  <p className="font-semibold text-gray-900">{item.category?.nameAr || item.category?.nameEn || 'غير محدد'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">الحالة</p>
                  <p className="font-semibold">
                    {item.status === 'ACTIVE' ? (
                      <span className="text-green-600">متاح</span>
                    ) : item.status === 'SOLD' ? (
                      <span className="text-gray-600">تم البيع</span>
                    ) : item.status === 'TRADED' ? (
                      <span className="text-blue-600">تمت المقايضة</span>
                    ) : item.status === 'ARCHIVED' ? (
                      <span className="text-gray-500">مؤرشف</span>
                    ) : (
                      <span className="text-yellow-600">مسودة</span>
                    )}
                  </p>
                </div>
                {(item.location || item.governorate) && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">الموقع</p>
                    <p className="font-semibold text-gray-900">{item.location || item.governorate}</p>
                  </div>
                )}
                {/* Scrap-specific fields */}
                {(item as any).pricePerKg && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">السعر/كجم</p>
                    <p className="font-semibold text-gray-900">{(item as any).pricePerKg} جنيه</p>
                  </div>
                )}
                {(item as any).metalPurity && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">نقاء المعدن</p>
                    <p className="font-semibold text-gray-900">{(item as any).metalPurity}%</p>
                  </div>
                )}
                <div className="col-span-2 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">تاريخ الإضافة</p>
                  <p className="font-semibold text-gray-900">{formatDate(item.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Trust Features */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary-100 flex items-center justify-center">
                    <ShieldIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">دفع آمن</p>
                  <p className="text-xs text-gray-500">معاملات محمية</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center">
                    <TruckIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">توصيل سريع</p>
                  <p className="text-xs text-gray-500">لكل المحافظات</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center">
                    <RefreshIcon className="w-6 h-6 text-amber-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">استرجاع مضمون</p>
                  <p className="text-xs text-gray-500">خلال 7 أيام</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Price & Actions (Desktop) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Price Card */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                {/* Action buttons - favorite & share */}
                <div className="flex justify-between items-start mb-4">
                  <div className="hidden lg:block">
                    <h1 className="text-xl font-bold text-gray-900 leading-tight">{item.title}</h1>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${
                        isFavorite
                          ? 'bg-red-50 border-red-200 text-red-500'
                          : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                      }`}
                    >
                      <HeartIcon filled={isFavorite} className="w-5 h-5" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-primary-500 hover:border-primary-200 transition"
                      >
                        <ShareIcon className="w-5 h-5" />
                      </button>
                      {showShareMenu && (
                        <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border p-2 min-w-[150px] z-10">
                          <button onClick={copyLink} className="w-full px-3 py-2 text-right text-sm hover:bg-gray-50 rounded-lg">
                            نسخ الرابط
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6 hidden lg:block">
                  {/* Condition & Location for desktop */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${condition.color}`}>
                      {condition.labelAr}
                    </span>
                    {(item.location || item.governorate) && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <LocationIcon className="w-4 h-4" />
                        <span>{item.location || item.governorate}</span>
                      </div>
                    )}
                  </div>

                  {item.estimatedValue ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-primary-600">
                        {formatPrice(item.estimatedValue)}
                      </span>
                      <span className="text-xl text-gray-500">جنيه</span>
                    </div>
                  ) : (
                    <p className="text-xl text-gray-600">السعر عند الاستفسار</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    تم النشر {formatDate(item.createdAt)}
                  </p>
                </div>

                {/* Barter Preferences */}
                {(item.desiredItemTitle || item.desiredCategoryId) && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🔄</span>
                      <span className="font-bold text-amber-800">للمقايضة</span>
                    </div>
                    <p className="text-amber-700 text-sm mb-2">يبحث عن:</p>
                    {item.desiredItemTitle && (
                      <p className="text-amber-900 font-bold text-lg">🎯 {item.desiredItemTitle}</p>
                    )}
                    {item.desiredItemDescription && (
                      <p className="text-amber-700 text-sm mt-1">{item.desiredItemDescription}</p>
                    )}
                    {item.desiredCategory && (
                      <p className="text-amber-700 text-sm mt-1">
                        📂 {item.desiredCategory.nameAr || item.desiredCategory.nameEn}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {!isOwner && item.status === 'ACTIVE' && (
                  <div className="space-y-3">
                    {(item.desiredItemTitle || item.desiredCategoryId) ? (
                      // Barter item actions
                      <>
                        {barterMatch ? (
                          <div className="space-y-3">
                            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">🎯</span>
                                <span className="font-bold text-green-700">لديك منتج متطابق!</span>
                              </div>
                              <p className="text-sm text-green-600">
                                "{barterMatch.myItem.title}" يتوافق مع ما يبحث عنه البائع
                              </p>
                            </div>
                            <button
                              onClick={() => router.push(`/barter/complete?theirItem=${item.id}&myItem=${barterMatch.myItem.id}`)}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-600 font-bold transition shadow-lg shadow-green-200"
                            >
                              ✅ إتمام المقايضة
                            </button>
                          </div>
                        ) : loadingMatch ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
                            <span className="text-gray-600 text-sm">جاري البحث عن تطابق...</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (!user) { router.push('/login'); return; }
                              router.push(`/barter/new?wantedItemId=${item.id}`);
                            }}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-4 rounded-xl hover:from-purple-600 hover:to-indigo-600 font-bold transition shadow-lg shadow-purple-200"
                          >
                            🔁 عرض مقايضة
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (!user) { router.push('/login'); return; }
                            router.push(`/messages?userId=${item.seller?.id}&itemId=${item.id}`);
                          }}
                          className="w-full border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:border-primary-300 hover:text-primary-600 font-semibold transition"
                        >
                          💬 تواصل مع البائع
                        </button>
                      </>
                    ) : (
                      // Regular item actions
                      <>
                        <button
                          onClick={handleBuyNow}
                          className="w-full bg-gradient-to-r from-primary-500 to-emerald-500 text-white px-6 py-4 rounded-xl hover:from-primary-600 hover:to-emerald-600 font-bold transition shadow-lg shadow-primary-200"
                        >
                          🛒 اشتر الآن
                        </button>
                        <button
                          onClick={handleAddToCart}
                          disabled={addingToCart}
                          className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 font-semibold transition disabled:opacity-50 shadow-lg shadow-amber-200"
                        >
                          {addingToCart ? 'جاري الإضافة...' : '🛍️ أضف للسلة'}
                        </button>
                        {cartMessage && (
                          <p className={`text-center text-sm font-medium ${cartMessage.includes('تمت') ? 'text-green-600' : 'text-red-600'}`}>
                            {cartMessage}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => {
                              if (!user) { router.push('/login'); return; }
                              router.push(`/messages?userId=${item.seller?.id}&itemId=${item.id}`);
                            }}
                            className="border-2 border-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:border-primary-300 hover:text-primary-600 font-semibold transition text-sm"
                          >
                            💬 تواصل
                          </button>
                          <button
                            onClick={() => {
                              if (!user) { router.push('/login'); return; }
                              router.push(`/barter/new?wantedItemId=${item.id}`);
                            }}
                            className="border-2 border-purple-200 text-purple-600 px-4 py-3 rounded-xl hover:bg-purple-50 font-semibold transition text-sm"
                          >
                            🔁 قايض
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {item.status === 'SOLD' && !isOwner && (
                  <div className="bg-gray-100 p-4 rounded-xl text-center">
                    <span className="text-2xl mb-2 block">🏷️</span>
                    <p className="text-gray-600 font-semibold">تم بيع هذا المنتج</p>
                  </div>
                )}

                {isOwner && (
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push(`/items/${item.id}/edit`)}
                      className="w-full bg-gradient-to-r from-primary-500 to-emerald-500 text-white px-6 py-4 rounded-xl hover:from-primary-600 hover:to-emerald-600 font-bold transition shadow-lg"
                    >
                      ✏️ تعديل المنتج
                    </button>
                    <button className="w-full border-2 border-red-200 text-red-600 px-6 py-3 rounded-xl hover:bg-red-50 font-semibold transition">
                      🗑️ حذف المنتج
                    </button>
                  </div>
                )}
              </div>

              {/* Seller Info Card */}
              {item.seller && (
                <div className="bg-white rounded-2xl shadow-card p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
                    معلومات البائع
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                      {item.seller.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">{item.seller.fullName || 'مستخدم'}</p>
                        {item.seller.userType === 'BUSINESS' && (
                          <VerifiedIcon className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {item.seller.userType === 'BUSINESS' ? 'حساب تجاري' : 'حساب شخصي'}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/users/${item.seller.id}`}
                    className="mt-4 block w-full text-center border-2 border-primary-200 text-primary-600 px-4 py-2.5 rounded-xl hover:bg-primary-50 font-semibold transition"
                  >
                    عرض الملف الشخصي
                  </Link>
                </div>
              )}

              {/* Safety Tips */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <ShieldIcon className="w-5 h-5" />
                  نصائح الأمان
                </h3>
                <ul className="text-sm text-amber-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>قابل البائع في مكان عام وآمن</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>افحص المنتج جيداً قبل الدفع</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>لا تدفع مقدماً قبل استلام المنتج</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>بلّغ عن أي نشاط مشبوه</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items Section */}
        {similarItems.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-primary-500 rounded-full"></span>
                منتجات مشابهة
              </h2>
              <Link
                href={`/items?categoryId=${item.category?.id}`}
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
              >
                عرض الكل
                <ChevronLeftIcon className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarItems.map((similarItem) => (
                <ItemCard
                  key={similarItem.id}
                  id={similarItem.id}
                  title={similarItem.title}
                  price={similarItem.estimatedValue || 0}
                  images={similarItem.images}
                  condition={similarItem.condition}
                  location={similarItem.location}
                  governorate={similarItem.governorate}
                  listingType={similarItem.listingType}
                  createdAt={similarItem.createdAt}
                  variant="compact"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {isImageZoomed && images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setIsImageZoomed(false)}
        >
          <button
            onClick={() => setIsImageZoomed(false)}
            className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            <CloseIcon className="w-6 h-6" />
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
              >
                <ChevronLeftIcon className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition"
              >
                <ChevronRightIcon className="w-8 h-8" />
              </button>
            </>
          )}

          <img
            src={images[selectedImage]?.url}
            alt={item.title}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full">
              {selectedImage + 1} / {images.length}
            </div>
          )}
        </div>
      )}

      {/* Buy Now Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {buySuccess ? (
                // Success State
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-4xl">✅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">تم الشراء بنجاح!</h2>
                  <p className="text-gray-600 mb-6">
                    تم تقديم طلبك. سيتواصل معك البائع قريباً لترتيب التوصيل.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-xl mb-6 text-right">
                    <p className="text-sm text-gray-500 mb-1">ملخص الطلب:</p>
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="text-2xl font-bold text-primary-600">{formatPrice(item.estimatedValue || 0)} جنيه</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBuyModal(false);
                      router.push('/items');
                    }}
                    className="w-full bg-gradient-to-r from-primary-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-bold"
                  >
                    متابعة التسوق
                  </button>
                </div>
              ) : (
                // Purchase Form
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">إتمام الشراء</h2>
                    <button
                      onClick={() => setShowBuyModal(false)}
                      className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition"
                    >
                      <CloseIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Item Summary */}
                  <div className="bg-gradient-to-r from-primary-50 to-emerald-50 p-4 rounded-xl mb-6 border border-primary-100">
                    <p className="font-bold text-gray-900">{item.title}</p>
                    <p className="text-2xl font-bold text-primary-600">{formatPrice(item.estimatedValue || 0)} جنيه</p>
                  </div>

                  {buyError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-600 text-sm">{buyError}</p>
                    </div>
                  )}

                  <form onSubmit={handlePurchase} className="space-y-4">
                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        طريقة الدفع <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={buyForm.paymentMethod}
                        onChange={(e) => setBuyForm({ ...buyForm, paymentMethod: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="CASH_ON_DELIVERY">الدفع عند الاستلام</option>
                        <option value="BANK_TRANSFER">تحويل بنكي</option>
                        <option value="INSTAPAY">انستاباي</option>
                        <option value="VODAFONE_CASH">فودافون كاش</option>
                      </select>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        رقم الهاتف <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={buyForm.phoneNumber}
                        onChange={(e) => setBuyForm({ ...buyForm, phoneNumber: e.target.value })}
                        placeholder="01012345678"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                        minLength={10}
                        dir="ltr"
                      />
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        عنوان التوصيل <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={buyForm.shippingAddress}
                        onChange={(e) => setBuyForm({ ...buyForm, shippingAddress: e.target.value })}
                        placeholder="العنوان بالتفصيل للتوصيل"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        required
                        minLength={10}
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ملاحظات (اختياري)
                      </label>
                      <textarea
                        value={buyForm.notes}
                        onChange={(e) => setBuyForm({ ...buyForm, notes: e.target.value })}
                        placeholder="أي تعليمات خاصة للبائع"
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={buyLoading}
                      className="w-full bg-gradient-to-r from-primary-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-200"
                    >
                      {buyLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                          جاري المعالجة...
                        </span>
                      ) : (
                        `تأكيد الشراء - ${formatPrice(item.estimatedValue || 0)} جنيه`
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
