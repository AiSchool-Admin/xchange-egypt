'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Shield, RefreshCw, Battery, Smartphone,
  MapPin, Calendar, Eye, Heart, Share2, MessageCircle,
  CheckCircle, AlertTriangle, Star, ChevronLeft, ChevronRight,
  Cpu, HardDrive, Camera, Fingerprint, Wifi, Award, Clock,
  Phone, User, Building, BadgeCheck
} from 'lucide-react';

interface MobileListing {
  id: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  variant: string;
  color: string;
  storageCapacity: number;
  ramSize: number;
  condition: string;
  conditionNotes: string;
  price: number;
  acceptsBarter: boolean;
  barterPreferences: string[];
  images: string[];
  imeiVerified: boolean;
  imeiStatus: string;
  batteryHealth: number;
  screenCondition: string;
  bodyCondition: string;
  accessories: string[];
  warranty: boolean;
  warrantyExpiry: string | null;
  purchaseDate: string | null;
  governorate: string;
  city: string;
  viewCount: number;
  favoriteCount: number;
  status: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    trustLevel: string;
    rating: number;
    reviewCount: number;
    joinedAt: string;
    completedSales: number;
    responseRate: number;
    isVerified: boolean;
  };
  diagnostics: {
    overallScore: number;
    batteryHealth: number;
    screenTest: boolean;
    touchTest: boolean;
    speakerTest: boolean;
    microphoneTest: boolean;
    cameraTest: boolean;
    wifiTest: boolean;
    bluetoothTest: boolean;
    gpsTest: boolean;
    fingerprintTest: boolean;
    faceIdTest: boolean;
  } | null;
  priceReference: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    condition: string;
  } | null;
}

const CONDITION_LABELS: Record<string, { label: string; description: string; color: string }> = {
  'A': { label: 'ممتاز (A)', description: 'كالجديد تماماً - لا توجد أي علامات استخدام', color: 'text-green-600 bg-green-100' },
  'B': { label: 'جيد جداً (B)', description: 'استخدام خفيف - علامات بسيطة جداً', color: 'text-blue-600 bg-blue-100' },
  'C': { label: 'جيد (C)', description: 'علامات استخدام واضحة لكن يعمل بشكل ممتاز', color: 'text-yellow-600 bg-yellow-100' },
  'D': { label: 'مقبول (D)', description: 'قد يحتاج صيانة بسيطة', color: 'text-orange-600 bg-orange-100' },
};

const TRUST_LEVELS: Record<string, { label: string; color: string; icon: any }> = {
  'new': { label: 'جديد', color: 'text-gray-600 bg-gray-100', icon: User },
  'verified': { label: 'موثق', color: 'text-blue-600 bg-blue-100', icon: BadgeCheck },
  'trusted': { label: 'موثوق', color: 'text-green-600 bg-green-100', icon: Shield },
  'pro': { label: 'محترف', color: 'text-purple-600 bg-purple-100', icon: Award },
};

export default function MobileListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<MobileListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBarterModal, setShowBarterModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        console.error('API URL not configured');
        setError('عذراً، حدث خطأ في الإعدادات');
        setLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl}/mobiles/listings/${params.id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('الإعلان غير موجود');
        } else {
          setError('حدث خطأ أثناء تحميل البيانات');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      const rawListing = data.data?.listing || data.data;

      if (data.success && rawListing) {
        // Map backend field names to frontend expected names
        const mappedListing: MobileListing = {
          id: rawListing.id,
          title: rawListing.title || rawListing.titleAr || '',
          description: rawListing.description || rawListing.descriptionAr || '',
          brand: rawListing.brand || '',
          model: rawListing.model || '',
          variant: rawListing.variant || '',
          color: rawListing.color || rawListing.colorAr || '',
          storageCapacity: rawListing.storageGb || rawListing.storageCapacity || 0,
          ramSize: rawListing.ramGb || rawListing.ramSize || 0,
          condition: rawListing.conditionGrade || rawListing.condition || 'C',
          conditionNotes: rawListing.conditionNotes || '',
          price: rawListing.priceEgp || rawListing.price || 0,
          acceptsBarter: rawListing.acceptsBarter || false,
          barterPreferences: rawListing.barterPreferences || [],
          images: rawListing.images || [],
          imeiVerified: rawListing.imeiVerified || false,
          imeiStatus: rawListing.imeiStatus || '',
          batteryHealth: rawListing.batteryHealth || 0,
          screenCondition: rawListing.screenCondition || '',
          bodyCondition: rawListing.bodyCondition || '',
          accessories: rawListing.accessories || rawListing.accessoriesDetails ? [rawListing.accessoriesDetails] : [],
          warranty: rawListing.warranty || false,
          warrantyExpiry: rawListing.warrantyExpiry || null,
          purchaseDate: rawListing.purchaseDate || null,
          governorate: rawListing.governorate || '',
          city: rawListing.city || '',
          viewCount: rawListing.viewsCount || rawListing.viewCount || 0,
          favoriteCount: rawListing.favoritesCount || rawListing.favoriteCount || 0,
          status: rawListing.status || '',
          createdAt: rawListing.createdAt || '',
          seller: rawListing.seller ? {
            id: rawListing.seller.id || '',
            name: rawListing.seller.fullName || rawListing.seller.name || 'مستخدم',
            avatar: rawListing.seller.avatar || '',
            trustLevel: rawListing.seller.trustLevel || 'new',
            rating: rawListing.seller.rating || 0,
            reviewCount: rawListing.seller.totalReviews || rawListing.seller.reviewCount || 0,
            joinedAt: rawListing.seller.createdAt || rawListing.seller.joinedAt || '',
            completedSales: rawListing.seller.completedSales || 0,
            responseRate: rawListing.seller.responseRate || 0,
            isVerified: rawListing.seller.isVerified || false,
          } : {
            id: '',
            name: 'مستخدم',
            avatar: '',
            trustLevel: 'new',
            rating: 0,
            reviewCount: 0,
            joinedAt: '',
            completedSales: 0,
            responseRate: 0,
            isVerified: false,
          },
          diagnostics: rawListing.diagnostics || null,
          priceReference: rawListing.priceReference || null,
        };
        setListing(mappedListing);
      } else {
        setError('الإعلان غير موجود');
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const method = isFavorite ? 'DELETE' : 'POST';
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/favorites/${params.id}`, {
        method,
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const sendContactMessage = async () => {
    if (!contactMessage.trim()) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    if (!listing?.seller?.id) {
      alert('لا يمكن إرسال الرسالة - معلومات البائع غير متوفرة');
      return;
    }

    try {
      setSendingMessage(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/chat/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: listing.seller.id,
          content: contactMessage,
          listingId: listing.id,
          listingType: 'mobile',
        }),
      });

      if (response.ok) {
        setMessageSent(true);
        setContactMessage('');
        setTimeout(() => {
          setShowContactModal(false);
          setMessageSent(false);
        }, 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData?.message || 'فشل إرسال الرسالة، حاول مرة أخرى');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      alert('حدث خطأ في إرسال الرسالة');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
  };

  const nextImage = () => {
    if (listing && listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing && listing.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center" dir="rtl">
        <Smartphone className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {error || 'الإعلان غير موجود'}
        </h2>
        <p className="text-gray-600 mb-4">قد يكون تم حذفه أو انتهت صلاحيته</p>
        <div className="flex gap-3">
          <button
            onClick={() => fetchListing()}
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            إعادة المحاولة
          </button>
          <Link href="/mobiles" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            العودة للقائمة
          </Link>
        </div>
      </div>
    );
  }

  const condition = CONDITION_LABELS[listing.condition] || CONDITION_LABELS['C'];
  const trustLevel = TRUST_LEVELS[listing.seller?.trustLevel || 'new'] || TRUST_LEVELS['new'];
  const TrustIcon = trustLevel.icon;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowRight className="w-5 h-5 ml-1" />
            <span>رجوع</span>
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={toggleFavorite} className="p-2 hover:bg-gray-100 rounded-full">
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={listing.images?.[currentImageIndex] || '/images/mobile-placeholder.jpg'}
                  alt={listing.title}
                  fill
                  className="object-contain bg-gray-100"
                />

                {/* Navigation Arrows */}
                {listing.images && listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                  </>
                )}

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {listing.imeiVerified && (
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      IMEI موثق
                    </span>
                  )}
                  {listing.acceptsBarter && (
                    <span className="bg-purple-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />
                      يقبل المقايضة
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        idx === currentImageIndex ? 'border-indigo-600' : 'border-transparent'
                      }`}
                    >
                      <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing.governorate}، {listing.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(listing.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {listing.viewCount} مشاهدة
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-3xl font-bold text-indigo-600">
                    {(listing.price || 0).toLocaleString('ar-EG')} ج.م
                  </p>
                  {listing.priceReference && listing.priceReference.avgPrice && (
                    <p className="text-sm text-gray-500 mt-1">
                      متوسط السوق: {listing.priceReference.avgPrice.toLocaleString('ar-EG')} ج.م
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">المواصفات</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-500">العلامة التجارية</p>
                    <p className="font-medium">{listing.brand}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Smartphone className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-500">الموديل</p>
                    <p className="font-medium">{listing.model}</p>
                  </div>
                </div>
                {listing.variant && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-gray-500">الإصدار</p>
                      <p className="font-medium">{listing.variant}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <HardDrive className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-500">السعة التخزينية</p>
                    <p className="font-medium">{listing.storageCapacity} GB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-500">الرام</p>
                    <p className="font-medium">{listing.ramSize} GB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: listing.color.toLowerCase() }}></div>
                  <div>
                    <p className="text-xs text-gray-500">اللون</p>
                    <p className="font-medium">{listing.color}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Battery className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-500">صحة البطارية</p>
                    <p className={`font-medium ${listing.batteryHealth >= 80 ? 'text-green-600' : listing.batteryHealth >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {listing.batteryHealth}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-gray-500">الحالة</p>
                    <span className={`text-sm px-2 py-0.5 rounded ${condition.color}`}>
                      {condition.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* IMEI Verification */}
            {listing.imeiVerified && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-lg font-bold text-green-800">IMEI موثق ✓</h2>
                    <p className="text-sm text-green-600">تم التحقق من سلامة الجهاز</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>غير مسروق</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>غير محظور</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>مسجل رسمياً</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>أصلي 100%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Diagnostics */}
            {listing.diagnostics && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">تقرير الفحص التقني</h2>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                    النتيجة: {listing.diagnostics.overallScore}%
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'screenTest', label: 'الشاشة', icon: Smartphone },
                    { key: 'touchTest', label: 'اللمس', icon: Fingerprint },
                    { key: 'speakerTest', label: 'السماعة', icon: Phone },
                    { key: 'microphoneTest', label: 'المايك', icon: Phone },
                    { key: 'cameraTest', label: 'الكاميرا', icon: Camera },
                    { key: 'wifiTest', label: 'الواي فاي', icon: Wifi },
                    { key: 'bluetoothTest', label: 'البلوتوث', icon: Wifi },
                    { key: 'gpsTest', label: 'GPS', icon: MapPin },
                  ].map(({ key, label, icon: Icon }) => {
                    const passed = listing.diagnostics?.[key as keyof typeof listing.diagnostics];
                    return (
                      <div
                        key={key}
                        className={`flex items-center gap-2 p-3 rounded-lg ${
                          passed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{label}</span>
                        {passed ? (
                          <CheckCircle className="w-4 h-4 mr-auto" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 mr-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold mb-4">الوصف</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>

              {listing.conditionNotes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">ملاحظات عن الحالة:</h3>
                  <p className="text-yellow-700 text-sm">{listing.conditionNotes}</p>
                </div>
              )}
            </div>

            {/* Accessories */}
            {listing.accessories && listing.accessories.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold mb-4">الملحقات المتضمنة</h2>
                <div className="flex flex-wrap gap-2">
                  {listing.accessories.map((acc, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {acc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Barter Preferences */}
            {listing.acceptsBarter && listing.barterPreferences && listing.barterPreferences.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <RefreshCw className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-bold text-purple-800">يقبل المقايضة</h2>
                </div>
                <p className="text-purple-700 mb-3">البائع مهتم بالمقايضة بـ:</p>
                <div className="flex flex-wrap gap-2">
                  {listing.barterPreferences.map((pref, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      {pref}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Info */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <h2 className="text-lg font-bold mb-4">البائع</h2>
              {listing.seller ? (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <Image
                        src={listing.seller.avatar || '/images/default-avatar.png'}
                        alt={listing.seller.name}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                      {listing.seller.isVerified && (
                        <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-blue-500 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{listing.seller.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${trustLevel.color}`}>
                          <TrustIcon className="w-3 h-3" />
                          {trustLevel.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">{listing.seller.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <p className="text-gray-500">{listing.seller.reviewCount || 0} تقييم</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="font-bold text-indigo-600">{listing.seller.completedSales || 0}</p>
                      <p className="text-gray-500">صفقة مكتملة</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="font-bold text-green-600">{listing.seller.responseRate || 0}%</p>
                      <p className="text-gray-500">معدل الرد</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="font-bold text-gray-700">
                        {listing.seller.joinedAt ? new Date(listing.seller.joinedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' }) : '-'}
                      </p>
                      <p className="text-gray-500">تاريخ الانضمام</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>معلومات البائع غير متوفرة</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowContactModal(true)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  تواصل مع البائع
                </button>

                {listing.acceptsBarter && (
                  <button
                    onClick={() => setShowBarterModal(true)}
                    className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    اقترح مقايضة
                  </button>
                )}

                <Link
                  href={`/mobiles/buy/${listing.id}`}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  شراء آمن عبر Escrow
                </Link>
              </div>

              {/* Escrow Info */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">حماية المشتري</span>
                </div>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• المبلغ محفوظ حتى استلام الجهاز</li>
                  <li>• 5 أيام للفحص والتأكد</li>
                  <li>• استرداد كامل في حالة المشاكل</li>
                </ul>
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                نصائح السلامة
              </h3>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• استخدم نظام Escrow للحماية</li>
                <li>• تحقق من IMEI قبل الشراء</li>
                <li>• قابل البائع في مكان عام</li>
                <li>• افحص الجهاز جيداً قبل الدفع</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">تواصل مع البائع</h3>
            {messageSent ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-green-600 font-medium">تم إرسال رسالتك بنجاح!</p>
              </div>
            ) : (
              <>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full border border-gray-200 rounded-lg p-3 h-32 resize-none mb-4"
                  disabled={sendingMessage}
                ></textarea>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowContactModal(false);
                      setContactMessage('');
                    }}
                    className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    disabled={sendingMessage}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={sendContactMessage}
                    disabled={sendingMessage || !contactMessage.trim()}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {sendingMessage ? 'جاري الإرسال...' : 'إرسال'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Barter Modal */}
      {showBarterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold mb-4">اقتراح مقايضة</h3>
            <p className="text-gray-600 mb-4">اختر الجهاز الذي تريد المقايضة به:</p>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              <p className="text-center text-gray-500 py-8">
                يجب أن يكون لديك إعلانات نشطة للمقايضة
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBarterModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <Link
                href="/mobiles/sell"
                className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center"
              >
                أضف جهازك أولاً
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
