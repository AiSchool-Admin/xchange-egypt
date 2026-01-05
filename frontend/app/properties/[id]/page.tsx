'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getProperty,
  addToFavorites,
  removeFromFavorites,
  getBarterSuggestions,
  Property,
  PROPERTY_TYPE_AR,
  LISTING_TYPE_AR,
  TITLE_TYPE_AR,
  VERIFICATION_LEVEL_AR,
  FINISHING_LEVEL_AR,
  FURNISHING_STATUS_AR,
} from '@/lib/api/properties';
import { TitleTypeBadge, TitleTypeCard } from '@/components/properties/TitleTypeBadge';
import { VerificationBadge, VerificationCard } from '@/components/properties/VerificationBadge';
import {
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Building2,
  Car,
  Trees,
  Waves,
  Dumbbell,
  Shield,
  Heart,
  Share2,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Home,
  Layers,
  Compass,
  Paintbrush,
  Zap,
  Wind,
  Sun,
  Lock,
  Users,
  Camera,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';

// Amenity icons and labels
const AMENITY_CONFIG: Record<string, { icon: React.ReactNode; label: string }> = {
  parking: { icon: <Car className="w-5 h-5" />, label: 'موقف سيارات' },
  garden: { icon: <Trees className="w-5 h-5" />, label: 'حديقة' },
  pool: { icon: <Waves className="w-5 h-5" />, label: 'حمام سباحة' },
  gym: { icon: <Dumbbell className="w-5 h-5" />, label: 'صالة رياضية' },
  security: { icon: <Shield className="w-5 h-5" />, label: 'أمن 24/7' },
  elevator: { icon: <Building2 className="w-5 h-5" />, label: 'مصعد' },
  ac: { icon: <Wind className="w-5 h-5" />, label: 'تكييف مركزي' },
  balcony: { icon: <Sun className="w-5 h-5" />, label: 'بلكونة' },
  storage: { icon: <Lock className="w-5 h-5" />, label: 'مخزن' },
  maidRoom: { icon: <Users className="w-5 h-5" />, label: 'غرفة خادمة' },
  cctv: { icon: <Camera className="w-5 h-5" />, label: 'كاميرات مراقبة' },
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [barterSuggestions, setBarterSuggestions] = useState<Property[]>([]);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);

  useEffect(() => {
    if (propertyId) {
      loadProperty();
    }
  }, [propertyId]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const data = await getProperty(propertyId);
      setProperty(data);
      setIsFavorite(data.isFavorite || false);

      // Load barter suggestions if property is open to barter
      if (data.openToBarter) {
        try {
          const suggestions = await getBarterSuggestions(propertyId);
          setBarterSuggestions(suggestions);
        } catch (e) {
          console.error('Error loading barter suggestions:', e);
        }
      }
    } catch (err) {
      console.error('Error loading property:', err);
      setError('فشل في تحميل بيانات العقار');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!property) return;
    try {
      if (isFavorite) {
        await removeFromFavorites(property.id);
      } else {
        await addToFavorites(property.id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleShare = async () => {
    if (!property) return;
    try {
      await navigator.share({
        title: property.title,
        text: `${property.title} - ${formatCurrency(property.price)}`,
        url: window.location.href,
      });
    } catch (err) {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط!');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: property?.currency || 'EGP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const nextImage = () => {
    if (!property || !property.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    if (!property || !property.images?.length) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + property.images.length) % property.images.length
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-2xl mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl p-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-12 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
              <div className="bg-white rounded-xl p-6">
                <div className="h-16 bg-gray-200 rounded-full w-16 mx-auto mb-4" />
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'العقار غير موجود'}
          </h2>
          <p className="text-gray-600 mb-6">تعذر العثور على هذا العقار</p>
          <Link
            href="/properties"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للعقارات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Back button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowRight className="w-5 h-5" />
            <span>رجوع</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Image Gallery */}
        <div className="relative mb-6">
          <div className="aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100">
            {property.images?.length > 0 ? (
              <img
                src={property.images[currentImageIndex] || ''}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Home className="w-16 h-16" />
              </div>
            )}

            {/* Navigation */}
            {property.images?.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image counter */}
            {property.images?.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            )}

            {/* Virtual tour button */}
            {property.virtualTourUrl && (
              <a
                href={property.virtualTourUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-5 h-5 text-blue-600" />
                <span className="font-medium">جولة افتراضية 360°</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            )}

            {/* Action buttons */}
            <div className="absolute top-4 left-4 flex gap-2">
              <button
                onClick={handleShare}
                className="w-12 h-12 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleFavorite}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                  isFavorite
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 hover:bg-white text-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
              <TitleTypeBadge titleType={property.titleType} size="lg" />
              <VerificationBadge level={property.verificationLevel} size="lg" />
              {property.hasEscrow && (
                <div className="bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Escrow
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail strip */}
          {property.images?.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    currentImageIndex === idx
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Price */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <span>{PROPERTY_TYPE_AR[property.propertyType]}</span>
                    <span>•</span>
                    <span>{LISTING_TYPE_AR[property.listingType]}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-gray-600 mt-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {property.district ? `${property.district}، ` : ''}
                      {property.city}، {property.governorate}
                    </span>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-3xl md:text-4xl font-bold text-blue-600">
                    {formatCurrency(property.price)}
                  </div>
                  {property.listingType === 'RENT' && (
                    <span className="text-gray-500">/ شهر</span>
                  )}
                  {property.pricePerMeter && (
                    <div className="text-sm text-gray-500 mt-1">
                      {formatCurrency(property.pricePerMeter)} / م²
                    </div>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap gap-4 py-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{property.area} م²</span>
                </div>
                {property.bedrooms !== undefined && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{property.bedrooms} غرف</span>
                  </div>
                )}
                {property.bathrooms !== undefined && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{property.bathrooms} حمام</span>
                  </div>
                )}
                {property.floor !== undefined && (
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">
                      الدور {property.floor}
                      {property.totalFloors && ` من ${property.totalFloors}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Views & date */}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {property.viewCount} مشاهدة
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {property.favoritesCount} مفضلة
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(property.createdAt)}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">الوصف</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">تفاصيل العقار</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">نوع العقار</div>
                    <div className="font-medium">
                      {PROPERTY_TYPE_AR[property.propertyType]}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Maximize2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">المساحة</div>
                    <div className="font-medium">{property.area} م²</div>
                  </div>
                </div>
                {property.buildYear && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">سنة البناء</div>
                      <div className="font-medium">{property.buildYear}</div>
                    </div>
                  </div>
                )}
                {property.finishingLevel && (
                  <div className="flex items-center gap-3">
                    <Paintbrush className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">التشطيب</div>
                      <div className="font-medium">
                        {FINISHING_LEVEL_AR[property.finishingLevel]}
                      </div>
                    </div>
                  </div>
                )}
                {property.furnishingStatus && (
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">الفرش</div>
                      <div className="font-medium">
                        {FURNISHING_STATUS_AR[property.furnishingStatus]}
                      </div>
                    </div>
                  </div>
                )}
                {property.direction && (
                  <div className="flex items-center gap-3">
                    <Compass className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">الواجهة</div>
                      <div className="font-medium">{property.direction}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">المميزات</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.amenities.map((amenity) => {
                    const config = AMENITY_CONFIG[amenity];
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                      >
                        <div className="text-blue-600">
                          {config?.icon || <Zap className="w-5 h-5" />}
                        </div>
                        <span className="font-medium text-gray-700">
                          {config?.label || amenity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Title Type & Verification Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TitleTypeCard titleType={property.titleType} />
              <VerificationCard level={property.verificationLevel} />
            </div>

            {/* Barter Section */}
            {property.openToBarter && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <ArrowLeftRight className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">يقبل المبادلة</h2>
                    <p className="text-sm text-gray-600">
                      المالك مستعد للمبادلة بعقارات أو أصول أخرى
                    </p>
                  </div>
                </div>

                {property.barterPreferences && property.barterPreferences.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">يفضل المبادلة بـ:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {property.barterPreferences.map((pref, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-white rounded-full text-sm text-purple-700 border border-purple-200"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href={`/properties/${property.id}/barter`}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                  اقتراح مبادلة
                </Link>

                {/* Barter suggestions */}
                {barterSuggestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      عقارات مقترحة للمبادلة:
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {barterSuggestions.slice(0, 4).map((suggestion) => (
                        <Link
                          key={suggestion.id}
                          href={`/properties/${suggestion.id}`}
                          className="flex-shrink-0 w-40 bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-purple-300 transition-colors"
                        >
                          <div className="aspect-video bg-gray-100">
                            {suggestion.images?.[0] && (
                              <img
                                src={suggestion.images[0]}
                                alt={suggestion.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs text-gray-500 truncate">
                              {suggestion.city}
                            </p>
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {formatCurrency(suggestion.price)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Location placeholder */}
            {property.address && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">الموقع</h2>
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-medium">خريطة الموقع</p>
                  </div>
                </div>
                <p className="text-gray-700">{property.address}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Owner Card */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {property.owner.avatar ? (
                    <img
                      src={property.owner.avatar}
                      alt={property.owner.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                      {property.owner.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{property.owner.fullName}</h3>
                  {property.owner.isVerified && (
                    <div className="flex items-center gap-1 text-blue-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حساب موثق</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {property.owner.phone && (
                  <button
                    onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    {showPhoneNumber ? property.owner.phone : 'إظهار رقم الهاتف'}
                  </button>
                )}

                <Link
                  href={`/messages?user=${property.owner.id}`}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  محادثة
                </Link>

                {property.verificationLevel !== 'FIELD_VERIFIED' &&
                  property.verificationLevel !== 'GOVERNMENT_VERIFIED' && (
                    <Link
                      href={`/properties/${property.id}/inspection`}
                      className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      طلب فحص ميداني
                    </Link>
                  )}
              </div>

              {/* Escrow info */}
              {property.hasEscrow && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                    <Shield className="w-5 h-5" />
                    حماية Escrow متاحة
                  </div>
                  <p className="text-sm text-purple-600">
                    يمكنك إتمام الصفقة بأمان من خلال نظام الضمان. أموالك محمية حتى
                    إتمام جميع الإجراءات.
                  </p>
                </div>
              )}

              {/* Safety tips */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                  <Info className="w-5 h-5" />
                  نصائح الأمان
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• تأكد من مطابقة العقار للوصف</li>
                  <li>• اطلب فحص ميداني قبل الشراء</li>
                  <li>• استخدم نظام Escrow للحماية</li>
                  <li>• لا تحول أموال قبل التحقق</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
