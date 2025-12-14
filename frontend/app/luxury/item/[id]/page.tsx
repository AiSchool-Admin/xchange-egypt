'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getItem, Item } from '@/lib/api/items';
import {
  formatLuxuryPrice,
  getConditionColor,
  getPriceTier,
  LUXURY_CATEGORY_AR,
  LUXURY_STATUS_AR,
  LuxuryCategoryType,
} from '@/lib/api/luxury-marketplace';

// Mock data for demo (in production, this comes from API)
interface LuxuryItemDetails extends Item {
  brand?: string;
  model?: string;
  referenceNumber?: string;
  yearOfManufacture?: number;
  conditionGrade?: string;
  hasOriginalBox?: boolean;
  hasPapers?: boolean;
  hasWarranty?: boolean;
  isVerified?: boolean;
  verificationCertificate?: string;
  acceptsBids?: boolean;
  currentBid?: number;
  totalBids?: number;
  auctionEnd?: string;
  bidIncrement?: number;
  watchDetails?: {
    movementType?: string;
    caseMaterial?: string;
    caseDiameter?: number;
    dialColor?: string;
    strapMaterial?: string;
    waterResistance?: number;
    complications?: string[];
  };
}

export default function LuxuryItemPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as string;

  const [item, setItem] = useState<LuxuryItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  const loadItem = async () => {
    setLoading(true);
    try {
      const response = await getItem(itemId);
      // Extend with luxury-specific mock data for demo
      const luxuryItem: LuxuryItemDetails = {
        ...response.data,
        brand: response.data.title.split(' ')[0],
        model: response.data.title.split(' ').slice(1, 3).join(' '),
        referenceNumber: '126610LN',
        yearOfManufacture: 2023,
        conditionGrade: 'A+',
        hasOriginalBox: true,
        hasPapers: true,
        hasWarranty: true,
        isVerified: true,
        acceptsBids: true,
        currentBid: (response.data.estimatedValue || 0) * 0.9,
        totalBids: 5,
        auctionEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        bidIncrement: 5000,
        watchDetails: {
          movementType: 'أوتوماتيك',
          caseMaterial: 'ستانلس ستيل',
          caseDiameter: 41,
          dialColor: 'أسود',
          strapMaterial: 'أويستر',
          waterResistance: 300,
          complications: ['تاريخ', 'إضاءة لومي'],
        },
      };
      setItem(luxuryItem);
    } catch (error) {
      console.error('Failed to load item:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeRemaining = (endDate: string): string => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'انتهى المزاد';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} يوم ${hours} ساعة`;
    if (hours > 0) return `${hours} ساعة ${minutes} دقيقة`;
    return `${minutes} دقيقة`;
  };

  const handlePlaceBid = () => {
    // In production, this would call the API
    alert(`تم تقديم عرض بقيمة ${bidAmount} ج.م`);
    setShowBidModal(false);
    setBidAmount('');
  };

  const handleSubmitOffer = () => {
    // In production, this would call the API
    alert(`تم إرسال العرض بقيمة ${offerAmount} ج.م`);
    setShowOfferModal(false);
    setOfferAmount('');
    setOfferMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😔</span>
          <h2 className="text-2xl font-bold text-white mb-2">المنتج غير موجود</h2>
          <p className="text-gray-400 mb-6">لم نتمكن من العثور على هذا المنتج</p>
          <Link
            href="/luxury"
            className="px-6 py-3 bg-amber-500 text-gray-900 rounded-lg font-medium hover:bg-amber-400 transition"
          >
            العودة للسوق
          </Link>
        </div>
      </div>
    );
  }

  const tier = getPriceTier(item.estimatedValue || 0);
  const minBid = (item.currentBid || item.estimatedValue || 0) + (item.bidIncrement || 5000);

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Breadcrumb */}
      <div className="bg-gray-900/50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link href="/luxury" className="hover:text-white">السلع الفاخرة</Link>
            <span>/</span>
            <Link href="/luxury/watches" className="hover:text-white">ساعات</Link>
            <span>/</span>
            <span className="text-amber-400 truncate max-w-xs">{item.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden mb-4">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[activeImage]?.url}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl opacity-20">⌚</span>
                </div>
              )}

              {/* Verified Badge */}
              {item.isVerified && (
                <div className="absolute top-4 right-4 px-3 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold">موثق أصلي</span>
                </div>
              )}

              {/* Tier Badge */}
              <div className={`absolute top-4 left-4 px-3 py-2 rounded-lg bg-gradient-to-r ${tier.color} text-white font-bold`}>
                {tier.labelAr}
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="absolute bottom-4 right-4 p-3 bg-white/90 rounded-full hover:bg-white transition"
              >
                <svg
                  className={`w-6 h-6 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-700'}`}
                  fill={isFavorited ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Share Button */}
              <button className="absolute bottom-4 left-4 p-3 bg-white/90 rounded-full hover:bg-white transition">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>

            {/* Thumbnails */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {item.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      activeImage === i ? 'border-amber-500' : 'border-transparent hover:border-gray-600'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`${item.title} - ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            {/* Brand & Title */}
            <div className="mb-6">
              <div className="text-amber-500 font-medium mb-2">{item.brand}</div>
              <h1 className="text-3xl font-bold text-white mb-3">{item.title}</h1>
              <div className="flex items-center gap-3 text-gray-400">
                <span className="flex items-center gap-1">
                  <span>📍</span>
                  {item.governorate || 'القاهرة'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>👁️</span>
                  {item.views || 0} مشاهدة
                </span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded ${getConditionColor(item.conditionGrade)}`}>
                  {item.conditionGrade}
                </span>
              </div>
            </div>

            {/* Price Section */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-gray-400 text-sm mb-1">السعر المطلوب</div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                    {formatLuxuryPrice(item.estimatedValue || 0)}
                  </div>
                </div>
                <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                  قابل للتفاوض
                </span>
              </div>

              {/* Auction Info */}
              {item.acceptsBids && item.auctionEnd && (
                <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-purple-400 font-medium">🔨 مزاد نشط</span>
                    <span className="text-white font-bold">{getTimeRemaining(item.auctionEnd)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-gray-400 text-xs mb-1">أعلى عرض</div>
                      <div className="text-xl font-bold text-white">
                        {formatLuxuryPrice(item.currentBid || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-xs mb-1">عدد العروض</div>
                      <div className="text-xl font-bold text-white">{item.totalBids}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {item.acceptsBids ? (
                  <button
                    onClick={() => setShowBidModal(true)}
                    className="py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 transition flex items-center justify-center gap-2"
                  >
                    <span>🔨</span>
                    <span>قدم عرضك</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowOfferModal(true)}
                    className="py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition"
                  >
                    اشتر الآن
                  </button>
                )}
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="py-4 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition"
                >
                  قدم عرض سعر
                </button>
              </div>
            </div>

            {/* Accessories */}
            <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700/50">
              <h3 className="text-white font-bold mb-4">الملحقات والتوثيق</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { has: item.hasOriginalBox, icon: '📦', label: 'العلبة الأصلية' },
                  { has: item.hasPapers, icon: '📜', label: 'أوراق الضمان' },
                  { has: item.hasWarranty, icon: '🛡️', label: 'ضمان ساري' },
                  { has: item.isVerified, icon: '✅', label: 'موثق من خبير' },
                ].map((acc, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      acc.has
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-gray-700/50 text-gray-500'
                    }`}
                  >
                    <span className="text-xl">{acc.icon}</span>
                    <span>{acc.label}</span>
                    {acc.has && <span className="mr-auto">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Watch Specifications */}
            {item.watchDetails && (
              <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-white font-bold mb-4">المواصفات التقنية</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'نوع الحركة', value: item.watchDetails.movementType },
                    { label: 'مادة العلبة', value: item.watchDetails.caseMaterial },
                    { label: 'قطر العلبة', value: `${item.watchDetails.caseDiameter} مم` },
                    { label: 'لون الميناء', value: item.watchDetails.dialColor },
                    { label: 'مادة السوار', value: item.watchDetails.strapMaterial },
                    { label: 'مقاومة الماء', value: `${item.watchDetails.waterResistance} متر` },
                  ].map((spec, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-gray-400">{spec.label}</span>
                      <span className="text-white font-medium">{spec.value}</span>
                    </div>
                  ))}
                </div>
                {item.watchDetails.complications && item.watchDetails.complications.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <span className="text-gray-400 text-sm">المزايا: </span>
                    <span className="text-white">
                      {item.watchDetails.complications.join('، ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {item.description && (
              <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700/50">
                <h3 className="text-white font-bold mb-4">الوصف</h3>
                <p className="text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            )}

            {/* Seller Info */}
            {item.seller && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-white font-bold mb-4">البائع</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                    {item.seller.avatar ? (
                      <img
                        src={item.seller.avatar}
                        alt={item.seller.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">👤</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-bold">{item.seller.fullName}</div>
                    <div className="text-gray-400 text-sm flex items-center gap-2">
                      <span className="text-yellow-400">⭐ 4.9</span>
                      <span>•</span>
                      <span>12 منتج</span>
                    </div>
                  </div>
                  <Link
                    href={`/messages?user=${item.seller.id}`}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                  >
                    تواصل
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">قدم عرضك</h3>
              <button
                onClick={() => setShowBidModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="text-gray-400 text-sm mb-2">أعلى عرض حالي</div>
              <div className="text-2xl font-bold text-white mb-4">
                {formatLuxuryPrice(item.currentBid || 0)}
              </div>
              <div className="text-amber-400 text-sm">
                الحد الأدنى للعرض: {formatLuxuryPrice(minBid)}
              </div>
            </div>

            <div className="mb-6">
              <label className="text-white font-medium block mb-2">مبلغ العرض (ج.م)</label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={minBid.toString()}
                min={minBid}
                step={item.bidIncrement}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePlaceBid}
                disabled={!bidAmount || Number(bidAmount) < minBid}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-500 hover:to-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                تأكيد العرض
              </button>
              <button
                onClick={() => setShowBidModal(false)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">قدم عرض سعر</h3>
              <button
                onClick={() => setShowOfferModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="text-gray-400 text-sm mb-2">السعر المطلوب</div>
              <div className="text-2xl font-bold text-white">
                {formatLuxuryPrice(item.estimatedValue || 0)}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white font-medium block mb-2">عرضك (ج.م)</label>
              <input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="text-white font-medium block mb-2">رسالة (اختياري)</label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="أضف رسالة للبائع..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitOffer}
                disabled={!offerAmount}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-lg font-bold hover:from-amber-400 hover:to-yellow-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                إرسال العرض
              </button>
              <button
                onClick={() => setShowOfferModal(false)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
