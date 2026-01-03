'use client';

import Image from 'next/image';
import { MapPin, Tag, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import {
  ListingCategory,
  TransactionType,
  LISTING_CATEGORIES,
  TRANSACTION_TYPES,
  CommonFields
} from '@/types/listing';

interface ReviewStepProps {
  category: ListingCategory;
  transactionType: TransactionType;
  formData: Partial<CommonFields>;
  categoryData: Record<string, any>;
  pricingData: Record<string, any>;
  auctionData: Record<string, any>;
  barterData: Record<string, any>;
}

export default function ReviewStep({
  category,
  transactionType,
  formData,
  categoryData,
  pricingData,
  auctionData,
  barterData
}: ReviewStepProps) {
  const categoryInfo = LISTING_CATEGORIES.find(c => c.id === category);
  const transactionInfo = TRANSACTION_TYPES.find(t => t.id === transactionType);

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price) + ' ج.م';
  };

  // Render category-specific details
  const renderCategoryDetails = () => {
    switch (category) {
      case 'MOBILE':
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {categoryData.brand && (
              <div className="flex justify-between">
                <span className="text-gray-500">العلامة:</span>
                <span className="font-medium">{categoryData.brand}</span>
              </div>
            )}
            {categoryData.model && (
              <div className="flex justify-between">
                <span className="text-gray-500">الموديل:</span>
                <span className="font-medium">{categoryData.model}</span>
              </div>
            )}
            {categoryData.storageCapacity && (
              <div className="flex justify-between">
                <span className="text-gray-500">السعة:</span>
                <span className="font-medium">{categoryData.storageCapacity} GB</span>
              </div>
            )}
            {categoryData.batteryHealth && (
              <div className="flex justify-between">
                <span className="text-gray-500">البطارية:</span>
                <span className="font-medium">{categoryData.batteryHealth}%</span>
              </div>
            )}
            {categoryData.condition && (
              <div className="flex justify-between">
                <span className="text-gray-500">الحالة:</span>
                <span className="font-medium">
                  {categoryData.condition === 'A' ? 'ممتاز' :
                   categoryData.condition === 'B' ? 'جيد جداً' :
                   categoryData.condition === 'C' ? 'جيد' : 'مقبول'}
                </span>
              </div>
            )}
          </div>
        );

      case 'CAR':
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {categoryData.make && (
              <div className="flex justify-between">
                <span className="text-gray-500">الماركة:</span>
                <span className="font-medium">{categoryData.make}</span>
              </div>
            )}
            {categoryData.model && (
              <div className="flex justify-between">
                <span className="text-gray-500">الموديل:</span>
                <span className="font-medium">{categoryData.model}</span>
              </div>
            )}
            {categoryData.year && (
              <div className="flex justify-between">
                <span className="text-gray-500">السنة:</span>
                <span className="font-medium">{categoryData.year}</span>
              </div>
            )}
            {categoryData.mileage && (
              <div className="flex justify-between">
                <span className="text-gray-500">الكيلومترات:</span>
                <span className="font-medium">{categoryData.mileage.toLocaleString()} كم</span>
              </div>
            )}
          </div>
        );

      case 'PROPERTY':
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {categoryData.propertyType && (
              <div className="flex justify-between">
                <span className="text-gray-500">النوع:</span>
                <span className="font-medium">{categoryData.propertyType}</span>
              </div>
            )}
            {categoryData.area && (
              <div className="flex justify-between">
                <span className="text-gray-500">المساحة:</span>
                <span className="font-medium">{categoryData.area} م²</span>
              </div>
            )}
            {categoryData.bedrooms && (
              <div className="flex justify-between">
                <span className="text-gray-500">الغرف:</span>
                <span className="font-medium">{categoryData.bedrooms}</span>
              </div>
            )}
            {categoryData.bathrooms && (
              <div className="flex justify-between">
                <span className="text-gray-500">الحمامات:</span>
                <span className="font-medium">{categoryData.bathrooms}</span>
              </div>
            )}
          </div>
        );

      case 'GOLD':
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {categoryData.karat && (
              <div className="flex justify-between">
                <span className="text-gray-500">العيار:</span>
                <span className="font-medium">{categoryData.karat}</span>
              </div>
            )}
            {categoryData.weightGrams && (
              <div className="flex justify-between">
                <span className="text-gray-500">الوزن:</span>
                <span className="font-medium">{categoryData.weightGrams} جرام</span>
              </div>
            )}
            {categoryData.category && (
              <div className="flex justify-between">
                <span className="text-gray-500">النوع:</span>
                <span className="font-medium">{categoryData.category}</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {categoryData.condition && (
              <div className="flex justify-between">
                <span className="text-gray-500">الحالة:</span>
                <span className="font-medium">{categoryData.condition}</span>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">مراجعة الإعلان</h2>
      <p className="text-gray-600 mb-8">تأكد من صحة جميع البيانات قبل النشر</p>

      <div className="space-y-6">
        {/* Main Preview Card */}
        <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
          {/* Images */}
          {(formData.images || []).length > 0 && (
            <div className="relative h-64 bg-gray-100">
              <img
                src={formData.images![0]}
                alt="صورة المنتج"
                className="w-full h-full object-contain"
              />
              {(formData.images || []).length > 1 && (
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  +{(formData.images || []).length - 1} صور
                </span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Category & Transaction badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gradient-to-r ${categoryInfo?.color} text-white`}>
                {categoryInfo?.icon} {categoryInfo?.nameAr}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                {transactionInfo?.icon} {transactionInfo?.nameAr}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {formData.title || 'بدون عنوان'}
            </h3>

            {/* Location */}
            <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
              <MapPin className="w-4 h-4" />
              {formData.governorate}{formData.city ? ` - ${formData.city}` : ''}
            </p>

            {/* Description */}
            {formData.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {formData.description}
              </p>
            )}

            {/* Category-specific details */}
            <div className="pt-4 border-t">
              {renderCategoryDetails()}
            </div>
          </div>
        </div>

        {/* Pricing/Transaction Details */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5" />
            تفاصيل المعاملة
          </h4>

          {/* Direct Sale/Purchase */}
          {(transactionType === 'DIRECT_SALE' || transactionType === 'DIRECT_PURCHASE') && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">السعر:</span>
                <span className="text-2xl font-bold text-green-600">
                  {pricingData.price ? formatPrice(Number(pricingData.price)) : 'غير محدد'}
                </span>
              </div>
              {pricingData.negotiable && (
                <span className="inline-block text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                  قابل للتفاوض
                </span>
              )}
            </div>
          )}

          {/* Auction */}
          {transactionType === 'AUCTION' && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">سعر البداية:</span>
                <span className="font-bold text-amber-600">
                  {auctionData.startingPrice ? formatPrice(Number(auctionData.startingPrice)) : 'غير محدد'}
                </span>
              </div>
              {auctionData.reservePrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600">السعر الاحتياطي:</span>
                  <span className="font-medium">{formatPrice(Number(auctionData.reservePrice))}</span>
                </div>
              )}
              {auctionData.buyNowPrice && (
                <div className="flex justify-between">
                  <span className="text-gray-600">الشراء الفوري:</span>
                  <span className="font-medium">{formatPrice(Number(auctionData.buyNowPrice))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">المدة:</span>
                <span className="font-medium">{auctionData.duration || 7} أيام</span>
              </div>
            </div>
          )}

          {/* Reverse Auction */}
          {transactionType === 'REVERSE_AUCTION' && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">الميزانية القصوى:</span>
                <span className="font-bold text-blue-600">
                  {pricingData.maxPrice ? formatPrice(Number(pricingData.maxPrice)) : 'غير محدد'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">مدة استقبال العروض:</span>
                <span className="font-medium">{auctionData.duration || 7} أيام</span>
              </div>
            </div>
          )}

          {/* Barter */}
          {transactionType === 'BARTER' && (
            <div className="space-y-3">
              {barterData.preferences && (
                <div>
                  <span className="text-gray-600 text-sm block mb-1">أبحث عن:</span>
                  <p className="text-gray-900">{barterData.preferences}</p>
                </div>
              )}
              {barterData.estimatedValue && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">القيمة التقديرية:</span>
                  <span className="font-medium">{formatPrice(Number(barterData.estimatedValue))}</span>
                </div>
              )}
              {barterData.acceptsCashDifference && (
                <span className="inline-block text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  يقبل فرق نقدي {barterData.maxCashDifference ? `(حتى ${formatPrice(Number(barterData.maxCashDifference))})` : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Warning Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div>
            <h5 className="font-bold text-yellow-800 mb-1">تأكد قبل النشر</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• جميع المعلومات المدخلة صحيحة ودقيقة</li>
              <li>• الصور واضحة وتمثل المنتج الفعلي</li>
              <li>• السعر مناسب ومنافس في السوق</li>
              <li>• لا يمكن تعديل نوع المعاملة بعد النشر</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
