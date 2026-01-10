'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MapPin, Bed, Bath, Maximize2, Shield, RefreshCw, Eye } from 'lucide-react';
import { TitleTypeBadge } from './TitleTypeBadge';
import { VerificationBadge } from './VerificationBadge';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    titleAr?: string;
    propertyType: string;
    governorate: string;
    city?: string;
    district?: string;
    compoundName?: string;
    // Support both naming conventions
    areaSqm?: number;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    salePrice?: number;
    rentPrice?: number;
    price?: number;
    pricePerSqm?: number;
    rentPeriod?: string;
    listingType?: 'SALE' | 'RENT' | 'BOTH';
    titleType: 'REGISTERED' | 'PRELIMINARY' | 'POA';
    verificationLevel: 'UNVERIFIED' | 'DOCUMENTS_VERIFIED' | 'FIELD_VERIFIED' | 'GOVERNMENT_VERIFIED';
    finishingLevel?: string;
    openForBarter?: boolean;
    openToBarter?: boolean;
    hasEscrow?: boolean;
    virtualTourUrl?: string;
    images: (string | { url: string })[];
    viewsCount?: number;
    viewCount?: number;
    favoritesCount?: number;
    isFavorite?: boolean;
    estimatedValue?: number;
    owner?: {
      id: string;
      fullName: string;
      avatar?: string;
      rating?: number;
    };
  };
  isFavorited?: boolean;
  onFavorite?: (propertyId: string) => void;
  onBarter?: (propertyId: string) => void;
  showOwner?: boolean;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  TOWNHOUSE: 'تاون هاوس',
  TWIN_HOUSE: 'توين هاوس',
  DUPLEX: 'دوبلكس',
  PENTHOUSE: 'بنتهاوس',
  STUDIO: 'ستوديو',
  CHALET: 'شاليه',
  LAND: 'أرض',
  OFFICE: 'مكتب',
  SHOP: 'محل',
  WAREHOUSE: 'مخزن',
  BUILDING: 'مبنى',
  FARM: 'مزرعة',
  ROOF: 'روف',
};

const FINISHING_LABELS: Record<string, string> = {
  SUPER_LUX: 'سوبر لوكس',
  LUX: 'لوكس',
  SEMI_FINISHED: 'نصف تشطيب',
  UNFINISHED: 'بدون تشطيب',
  CORE_SHELL: 'على الطوب',
};

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isFavorited = false,
  onFavorite,
  onBarter,
  showOwner = false,
}) => {
  const images = Array.isArray(property.images) ? property.images : [];
  const mainImage = images.length > 0
    ? (typeof images[0] === 'string' ? images[0] : images[0]?.url)
    : '/placeholder-property.jpg';

  // Support alternative property names
  const area = property.area || property.areaSqm || 0;
  const price = property.price || property.salePrice || property.rentPrice || 0;
  const isOpenToBarter = property.openToBarter || property.openForBarter || false;
  const views = property.viewCount || property.viewsCount || 0;
  const isFavorite = property.isFavorite || isFavorited;

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} مليون`;
    }
    return value.toLocaleString('ar-EG');
  };

  const getPriceRating = () => {
    const salePrice = property.salePrice || property.price;
    if (!property.estimatedValue || !salePrice) return null;
    const ratio = salePrice / property.estimatedValue;
    if (ratio <= 0.9) return { label: 'سعر ممتاز', color: 'text-green-600', bg: 'bg-green-100' };
    if (ratio <= 1.05) return { label: 'سعر جيد', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (ratio <= 1.15) return { label: 'سعر معقول', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'سعر مرتفع', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const priceRating = getPriceRating();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Image Container */}
      <div className="relative h-48 w-full">
        <Link href={`/properties/${property.id}`}>
          <Image
            src={mainImage}
            alt={property.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <TitleTypeBadge titleType={property.titleType} size="sm" />
          {property.verificationLevel !== 'UNVERIFIED' && (
            <VerificationBadge level={property.verificationLevel} size="sm" />
          )}
        </div>

        {/* Bottom Badges */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {property.virtualTourUrl && (
            <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Eye className="w-3 h-3" />
              جولة 360°
            </span>
          )}
          {isOpenToBarter && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              قابل للمقايضة
            </span>
          )}
        </div>

        {/* Favorite Button */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavorite(property.id);
            }}
            className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
            />
          </button>
        )}

        {/* Property Type Badge */}
        <div className="absolute bottom-2 right-2">
          <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <Link href={`/properties/${property.id}`}>
          <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
            {property.titleAr || property.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center text-gray-500 text-sm mt-1">
          <MapPin className="w-4 h-4 ml-1" />
          <span className="line-clamp-1">
            {property.district || property.city}, {property.governorate}
            {property.compoundName && ` - ${property.compoundName}`}
          </span>
        </div>

        {/* Specs */}
        <div className="flex items-center gap-4 mt-3 text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <Maximize2 className="w-4 h-4" />
            <span>{area} م²</span>
          </div>
          {property.bedrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms} غرف</span>
            </div>
          )}
          {property.bathrooms !== undefined && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
        </div>

        {/* Finishing */}
        {property.finishingLevel && (
          <div className="mt-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {FINISHING_LABELS[property.finishingLevel] || property.finishingLevel}
            </span>
          </div>
        )}

        {/* Price Section */}
        <div className="mt-3 flex items-end justify-between">
          <div>
            {property.listingType === 'RENT' || property.listingType === 'BOTH' ? (
              property.rentPrice && (
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(property.rentPrice)} ج.م
                  <span className="text-sm font-normal text-gray-500">
                    /{property.rentPeriod === 'yearly' ? 'سنوياً' : 'شهرياً'}
                  </span>
                </div>
              )
            ) : (
              property.salePrice && (
                <div className="text-lg font-bold text-blue-600">
                  {formatPrice(property.salePrice)} ج.م
                </div>
              )
            )}
            {property.pricePerSqm && (
              <div className="text-xs text-gray-500">
                {formatPrice(property.pricePerSqm)} ج.م/م²
              </div>
            )}
          </div>

          {priceRating && (
            <span className={`text-xs px-2 py-1 rounded-full ${priceRating.bg} ${priceRating.color}`}>
              {priceRating.label}
            </span>
          )}
        </div>

        {/* Owner Info */}
        {showOwner && property.owner && (
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                {property.owner.avatar ? (
                  <Image
                    src={property.owner.avatar}
                    alt={property.owner.fullName}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    {property.owner.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-600">{property.owner.fullName}</span>
            </div>
            {property.owner.rating && (
              <div className="flex items-center text-yellow-500 text-sm">
                <span className="ml-1">{property.owner.rating.toFixed(1)}</span>
                <span>★</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <Link
            href={`/properties/${property.id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            عرض التفاصيل
          </Link>
          {isOpenToBarter && onBarter && (
            <button
              onClick={() => onBarter(property.id)}
              className="px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition-colors text-sm flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              مقايضة
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Skeleton loading component
export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 animate-pulse">
      {/* Image placeholder */}
      <div className="relative aspect-[4/3] bg-gray-200" />

      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-4 mt-3">
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-16" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
        <div className="flex gap-2 mt-3">
          <div className="h-8 bg-gray-200 rounded flex-1" />
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
