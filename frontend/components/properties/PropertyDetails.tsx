'use client';

import React, { useState } from 'react';
import {
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
  Droplets,
  Flame,
  Wind,
  Sun,
  Lock,
  Users,
  Camera,
  ArrowLeftRight,
} from 'lucide-react';
import { TitleTypeBadge, TitleTypeCard } from './TitleTypeBadge';
import { VerificationBadge, VerificationCard } from './VerificationBadge';

type PropertyType =
  | 'APARTMENT'
  | 'VILLA'
  | 'DUPLEX'
  | 'PENTHOUSE'
  | 'STUDIO'
  | 'CHALET'
  | 'TOWNHOUSE'
  | 'TWIN_HOUSE'
  | 'LAND'
  | 'COMMERCIAL'
  | 'OFFICE'
  | 'RETAIL'
  | 'WAREHOUSE'
  | 'BUILDING';

type TitleType = 'REGISTERED' | 'PRELIMINARY' | 'POA';
type VerificationLevel = 'UNVERIFIED' | 'DOCUMENTS_VERIFIED' | 'FIELD_VERIFIED' | 'GOVERNMENT_VERIFIED';
type ListingType = 'SALE' | 'RENT';
type FinishingLevel = 'NOT_FINISHED' | 'SEMI_FINISHED' | 'FULLY_FINISHED' | 'SUPER_LUX' | 'ULTRA_SUPER_LUX';
type FurnishingStatus = 'UNFURNISHED' | 'SEMI_FURNISHED' | 'FULLY_FURNISHED';

interface PropertyData {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  titleType: TitleType;
  verificationLevel: VerificationLevel;
  price: number;
  pricePerMeter?: number;
  currency?: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  buildYear?: number;
  finishingLevel?: FinishingLevel;
  furnishingStatus?: FurnishingStatus;
  direction?: string;
  governorate: string;
  city: string;
  district?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  virtualTourUrl?: string;
  amenities?: string[];
  openToBarter: boolean;
  barterPreferences?: string[];
  hasEscrow: boolean;
  viewCount: number;
  favoritesCount: number;
  isFavorite?: boolean;
  owner: {
    id: string;
    fullName: string;
    avatar?: string;
    phone?: string;
    isVerified: boolean;
    memberSince?: Date;
    propertiesCount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface PropertyDetailsProps {
  property: PropertyData;
  onFavorite?: () => void;
  onShare?: () => void;
  onContact?: () => void;
  onChat?: () => void;
  onBarterPropose?: () => void;
  onRequestInspection?: () => void;
}

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  DUPLEX: 'دوبلكس',
  PENTHOUSE: 'بنتهاوس',
  STUDIO: 'ستوديو',
  CHALET: 'شاليه',
  TOWNHOUSE: 'تاون هاوس',
  TWIN_HOUSE: 'توين هاوس',
  LAND: 'أرض',
  COMMERCIAL: 'تجاري',
  OFFICE: 'مكتب',
  RETAIL: 'محل',
  WAREHOUSE: 'مخزن',
  BUILDING: 'عمارة',
};

const FINISHING_LABELS: Record<FinishingLevel, string> = {
  NOT_FINISHED: 'بدون تشطيب',
  SEMI_FINISHED: 'نصف تشطيب',
  FULLY_FINISHED: 'تشطيب كامل',
  SUPER_LUX: 'سوبر لوكس',
  ULTRA_SUPER_LUX: 'الترا سوبر لوكس',
};

const FURNISHING_LABELS: Record<FurnishingStatus, string> = {
  UNFURNISHED: 'بدون فرش',
  SEMI_FURNISHED: 'مفروش جزئياً',
  FULLY_FURNISHED: 'مفروش بالكامل',
};

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  parking: <Car className="w-5 h-5" />,
  garden: <Trees className="w-5 h-5" />,
  pool: <Waves className="w-5 h-5" />,
  gym: <Dumbbell className="w-5 h-5" />,
  security: <Shield className="w-5 h-5" />,
  elevator: <Building2 className="w-5 h-5" />,
  ac: <Wind className="w-5 h-5" />,
  heating: <Flame className="w-5 h-5" />,
  balcony: <Sun className="w-5 h-5" />,
  storage: <Lock className="w-5 h-5" />,
  maidRoom: <Users className="w-5 h-5" />,
  cctv: <Camera className="w-5 h-5" />,
};

const AMENITY_LABELS: Record<string, string> = {
  parking: 'موقف سيارات',
  garden: 'حديقة',
  pool: 'حمام سباحة',
  gym: 'صالة رياضية',
  security: 'أمن 24/7',
  elevator: 'مصعد',
  ac: 'تكييف مركزي',
  heating: 'تدفئة',
  balcony: 'بلكونة',
  storage: 'مخزن',
  maidRoom: 'غرفة خادمة',
  cctv: 'كاميرات مراقبة',
};

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  onFavorite,
  onShare,
  onContact,
  onChat,
  onBarterPropose,
  onRequestInspection,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: property.currency || 'EGP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Image Gallery */}
      <div className="relative mb-6">
        <div className="aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100">
          {property.images.length > 0 ? (
            <img
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Home className="w-16 h-16" />
            </div>
          )}

          {/* Navigation */}
          {property.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>

          {/* Virtual tour button */}
          {property.virtualTourUrl && (
            <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="font-medium">جولة افتراضية 360°</span>
            </button>
          )}

          {/* Action buttons */}
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={onShare}
              className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center hover:bg-white transition-colors"
            >
              <Share2 className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={onFavorite}
              className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${
                property.isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-white text-gray-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${property.isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            <TitleTypeBadge titleType={property.titleType} size="lg" />
            <VerificationBadge level={property.verificationLevel} size="lg" />
            {property.hasEscrow && (
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Escrow
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail strip */}
        {property.images.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            {property.images.slice(0, 6).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  currentImageIndex === idx ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {property.images.length > 6 && (
              <button
                onClick={() => setShowAllImages(true)}
                className="flex-shrink-0 w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-medium"
              >
                +{property.images.length - 6}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & Price */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm text-gray-500">
                  {PROPERTY_TYPE_LABELS[property.propertyType]} •{' '}
                  {property.listingType === 'SALE' ? 'للبيع' : 'للإيجار'}
                </span>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{property.title}</h1>
                <div className="flex items-center gap-1 text-gray-600 mt-2">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {property.district ? `${property.district}، ` : ''}
                    {property.city}، {property.governorate}
                  </span>
                </div>
              </div>
              <div className="text-left">
                <div className="text-3xl font-bold text-blue-600">{formatCurrency(property.price)}</div>
                {property.listingType === 'RENT' && (
                  <span className="text-sm text-gray-500">/ شهر</span>
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

            {/* Views & favorites */}
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
                  <div className="font-medium">{PROPERTY_TYPE_LABELS[property.propertyType]}</div>
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
                    <div className="font-medium">{FINISHING_LABELS[property.finishingLevel]}</div>
                  </div>
                </div>
              )}
              {property.furnishingStatus && (
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">الفرش</div>
                    <div className="font-medium">{FURNISHING_LABELS[property.furnishingStatus]}</div>
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
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50"
                  >
                    <div className="text-blue-600">
                      {AMENITY_ICONS[amenity] || <Zap className="w-5 h-5" />}
                    </div>
                    <span className="font-medium text-gray-700">
                      {AMENITY_LABELS[amenity] || amenity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Title Type & Verification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TitleTypeCard titleType={property.titleType} />
            <VerificationCard level={property.verificationLevel} />
          </div>

          {/* Barter section */}
          {property.openToBarter && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <ArrowLeftRight className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">يقبل المبادلة</h2>
                  <p className="text-sm text-gray-600">المالك مستعد للمبادلة بعقارات أو أصول أخرى</p>
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

              <button
                onClick={onBarterPropose}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeftRight className="w-5 h-5" />
                اقتراح مبادلة
              </button>
            </div>
          )}

          {/* Location Map placeholder */}
          {property.latitude && property.longitude && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">الموقع</h2>
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2" />
                  <p>خريطة الموقع</p>
                  <p className="text-sm">{property.address}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Owner Card */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
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
                    <Shield className="w-4 h-4" />
                    <span>حساب موثق</span>
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  {property.owner.propertiesCount !== undefined && `${property.owner.propertiesCount} عقار`}
                  {property.owner.propertiesCount !== undefined && property.owner.memberSince && ' • '}
                  {property.owner.memberSince && `عضو منذ ${new Date(property.owner.memberSince).getFullYear()}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {property.owner.phone && (
                <button
                  onClick={onContact}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  اتصل الآن
                </button>
              )}
              <button
                onClick={onChat}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                محادثة
              </button>

              {property.verificationLevel !== 'FIELD_VERIFIED' &&
                property.verificationLevel !== 'GOVERNMENT_VERIFIED' && (
                  <button
                    onClick={onRequestInspection}
                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    طلب فحص ميداني
                  </button>
                )}
            </div>

            {/* Escrow info */}
            {property.hasEscrow && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700 font-medium mb-1">
                  <Shield className="w-5 h-5" />
                  حماية Escrow متاحة
                </div>
                <p className="text-sm text-purple-600">
                  يمكنك إتمام الصفقة بأمان من خلال نظام الضمان
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
