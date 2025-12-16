'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getAuction,
  placeBid,
  buyNow,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist,
  payDeposit,
  checkDeposit,
  submitSealedBid,
  checkSealedBid,
  setProxyBid,
  getAuctionReviews,
  canReviewAuction,
  createReview,
  createDispute,
  Auction,
  AuctionType,
  AuctionReview,
  CreateReviewData,
  CreateDisputeData,
} from '@/lib/api/auctions';
import { useAuth } from '@/lib/contexts/AuthContext';

// Countdown Timer Component
const CountdownTimer: React.FC<{ endTime: string; onEnd?: () => void }> = ({ endTime, onEnd }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - Date.now();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setIsUrgent(difference < 3600000);

        if (days > 0) {
          setTimeLeft(`${days} يوم ${hours} ساعة ${minutes} دقيقة`);
        } else if (hours > 0) {
          setTimeLeft(`${hours} س ${minutes} د ${seconds} ث`);
        } else {
          setTimeLeft(`${minutes} د ${seconds} ث`);
        }
      } else {
        setTimeLeft('انتهى');
        onEnd?.();
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  return <span className={isUrgent ? 'text-red-400 animate-pulse' : ''}>{timeLeft}</span>;
};

// Star Rating Input Component
const StarRatingInput: React.FC<{
  value: number;
  onChange: (value: number) => void;
  label: string;
}> = ({ value, onChange, label }) => (
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600 w-20">{label}:</span>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`w-6 h-6 ${star <= value ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition`}
        >
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  </div>
);

// Auction Type Labels
const auctionTypeLabels: Record<AuctionType, { label: string; icon: string; description: string }> = {
  ENGLISH: { label: 'مزاد إنجليزي', icon: '🔨', description: 'المزايدة الأعلى تفوز' },
  SEALED_BID: { label: 'عرض مختوم', icon: '📦', description: 'العروض سرية حتى انتهاء المزاد' },
  DUTCH: { label: 'مزاد هولندي', icon: '🔻', description: 'السعر ينخفض تدريجياً' },
};

export default function AuctionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  // Bidding state
  const [bidAmount, setBidAmount] = useState('');
  const [bidInitialized, setBidInitialized] = useState(false);
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState('');
  const [buying, setBuying] = useState(false);

  // Watchlist state
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  // Deposit state
  const [hasDeposit, setHasDeposit] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  // Sealed bid state
  const [hasSealedBid, setHasSealedBid] = useState(false);
  const [sealedBidAmount, setSealedBidAmount] = useState('');
  const [sealedBidLoading, setSealedBidLoading] = useState(false);

  // Proxy bid state
  const [showProxyBid, setShowProxyBid] = useState(false);
  const [proxyBidAmount, setProxyBidAmount] = useState('');
  const [proxyBidLoading, setProxyBidLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<AuctionReview[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState<CreateReviewData>({
    overallRating: 5,
    comment: '',
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  // Dispute state
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeData, setDisputeData] = useState<CreateDisputeData>({
    disputeType: 'OTHER',
    reason: '',
    description: '',
  });
  const [disputeLoading, setDisputeLoading] = useState(false);

  const auctionId = params.id as string;

  useEffect(() => {
    if (!auctionId || auctionId === 'undefined') {
      setError('معرف المزاد غير صالح');
      setLoading(false);
      return;
    }
    loadAuction();
    const interval = setInterval(loadAuction, 5000);
    return () => clearInterval(interval);
  }, [auctionId]);

  useEffect(() => {
    if (user && auctionId) {
      checkUserStatus();
    }
  }, [user, auctionId]);

  const loadAuction = async () => {
    if (!auctionId || auctionId === 'undefined') return;
    try {
      setLoading(true);
      const response = await getAuction(auctionId);
      setAuction(response.data);

      if (!bidInitialized) {
        const price = response.data.currentPrice || response.data.startingPrice || 0;
        const increment = response.data.minBidIncrement || 10;
        setBidAmount((price + increment).toString());
        setBidInitialized(true);
      }

      // Load reviews
      try {
        const reviewsResponse = await getAuctionReviews(auctionId);
        setReviews(reviewsResponse.data || []);
      } catch {}
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل المزاد');
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    try {
      // Check watchlist
      const watchlistResult = await checkWatchlist(auctionId);
      setIsInWatchlist(watchlistResult.data.isInWatchlist);

      // Check deposit
      const depositResult = await checkDeposit(auctionId);
      setHasDeposit(depositResult.data.hasDeposit);

      // Check sealed bid
      const sealedBidResult = await checkSealedBid(auctionId);
      setHasSealedBid(sealedBidResult.data.hasSubmitted);

      // Check if can review
      const canReviewResult = await canReviewAuction(auctionId);
      setCanReview(canReviewResult.data.canReview);
    } catch {}
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      setBidError('الرجاء إدخال قيمة مزايدة صحيحة');
      return;
    }

    // Check if deposit required
    if (auction?.requiresDeposit && !hasDeposit) {
      setShowDepositModal(true);
      return;
    }

    setBidding(true);
    setBidError('');

    try {
      await placeBid(auctionId, { bidAmount: bidValue });
      await loadAuction();
      setBidAmount((bidValue + (auction?.minBidIncrement || 10)).toString());
    } catch (err: any) {
      if (err.response?.status === 401) {
        setBidError('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
        return;
      }
      let errorMessage = 'فشل في تقديم المزايدة';
      const responseData = err.response?.data;
      if (typeof responseData?.message === 'string') {
        errorMessage = responseData.message;
      } else if (typeof responseData?.error?.message === 'string') {
        errorMessage = responseData.error.message;
      }
      setBidError(errorMessage);
    } finally {
      setBidding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!confirm('هل أنت متأكد من شراء هذا المنتج الآن؟')) return;

    setBuying(true);
    try {
      await buyNow(auctionId);
      router.push(`/checkout/auction/${auctionId}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في الشراء الفوري');
      setBuying(false);
    }
  };

  const handleWatchlistToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setWatchlistLoading(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(auctionId);
        setIsInWatchlist(false);
      } else {
        await addToWatchlist(auctionId, {
          notifyOnBid: true,
          notifyOnOutbid: true,
          notifyOnEnding: true,
          notifyBeforeEnd: 30,
        });
        setIsInWatchlist(true);
      }
    } catch (err: any) {
      console.error('Watchlist error:', err);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handlePayDeposit = async (paymentMethod: string) => {
    setDepositLoading(true);
    try {
      await payDeposit(auctionId, { paymentMethod });
      setHasDeposit(true);
      setShowDepositModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في دفع التأمين');
    } finally {
      setDepositLoading(false);
    }
  };

  const handleSubmitSealedBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    const bidValue = parseFloat(sealedBidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      alert('الرجاء إدخال قيمة عرض صحيحة');
      return;
    }

    if (auction?.requiresDeposit && !hasDeposit) {
      setShowDepositModal(true);
      return;
    }

    setSealedBidLoading(true);
    try {
      await submitSealedBid(auctionId, { bidAmount: bidValue });
      setHasSealedBid(true);
      setSealedBidAmount('');
      alert('تم تقديم عرضك المختوم بنجاح');
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في تقديم العرض');
    } finally {
      setSealedBidLoading(false);
    }
  };

  const handleSetProxyBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    const maxBid = parseFloat(proxyBidAmount);
    if (isNaN(maxBid) || maxBid <= (auction?.currentPrice || 0)) {
      alert('الحد الأقصى يجب أن يكون أعلى من السعر الحالي');
      return;
    }

    setProxyBidLoading(true);
    try {
      await setProxyBid(auctionId, maxBid);
      setShowProxyBid(false);
      setProxyBidAmount('');
      await loadAuction();
      alert('تم تفعيل المزايدة التلقائية بنجاح');
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في تفعيل المزايدة التلقائية');
    } finally {
      setProxyBidLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewData.comment.trim()) {
      alert('الرجاء كتابة تعليق');
      return;
    }

    setReviewLoading(true);
    try {
      await createReview(auctionId, reviewData);
      setShowReviewForm(false);
      setCanReview(false);
      await loadAuction();
      alert('تم إرسال التقييم بنجاح');
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في إرسال التقييم');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeData.reason.trim()) {
      alert('الرجاء كتابة سبب النزاع');
      return;
    }

    setDisputeLoading(true);
    try {
      const result = await createDispute(auctionId, disputeData);
      setShowDisputeForm(false);
      router.push(`/auctions/disputes/${result.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في إنشاء النزاع');
    } finally {
      setDisputeLoading(false);
    }
  };

  if (loading && !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المزاد...</p>
        </div>
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button onClick={() => router.push('/auctions')} className="mt-4 text-purple-600 hover:text-purple-700">
            العودة للمزادات
          </button>
        </div>
      </div>
    );
  }

  if (!auction) return null;

  const item = auction.item || (auction as any).listing?.item;
  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg">بيانات المنتج غير متوفرة</p>
          <button onClick={() => router.push('/auctions')} className="mt-4 text-purple-600 hover:text-purple-700">
            العودة للمزادات
          </button>
        </div>
      </div>
    );
  }

  const isEnded = new Date(auction.endTime) < new Date();
  const hasStarted = new Date(auction.startTime) < new Date();
  const isActive = hasStarted && !isEnded;
  const isSeller = user?.id === item.seller?.id;
  const isWinner = auction.winnerId === user?.id;
  const currentPrice = auction.currentPrice || auction.startingPrice || 0;
  const minBidIncrement = auction.minBidIncrement || 10;
  const minBid = currentPrice + minBidIncrement;
  const auctionType = (auction.auctionType || 'ENGLISH') as AuctionType;
  const isSealedBid = auctionType === 'SEALED_BID';

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/auctions" className="text-purple-600 hover:text-purple-700 flex items-center gap-2">
            العودة للمزادات
          </Link>
          <div className="flex items-center gap-2">
            {/* Watchlist Button */}
            <button
              onClick={handleWatchlistToggle}
              disabled={watchlistLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isInWatchlist
                  ? 'bg-red-100 text-red-600 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill={isInWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{isInWatchlist ? 'في المراقبة' : 'أضف للمراقبة'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[selectedImage]?.url} alt={item.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-6xl">🔨</span>
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  {isEnded ? (
                    <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold">منتهي</span>
                  ) : !hasStarted ? (
                    <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold">قريبا</span>
                  ) : (
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">مباشر</span>
                  )}

                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    auctionType === 'SEALED_BID' ? 'bg-blue-100 text-blue-800' :
                    auctionType === 'DUTCH' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {auctionTypeLabels[auctionType]?.icon} {auctionTypeLabels[auctionType]?.label}
                  </span>

                  {auction.isFeatured && (
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">مميز</span>
                  )}

                  {auction.requiresDeposit && (
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      يتطلب تأمين {auction.depositAmount?.toLocaleString()} ج.م
                    </span>
                  )}
                </div>
              </div>

              {item.images && item.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {item.images.map((image: any, index: number) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index ? 'border-purple-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={image.url} alt={`${item.title} ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

              <div className="flex items-center gap-4 mb-6">
                {item.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {item.category.nameAr || item.category.nameEn}
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {item.condition}
                </span>
              </div>

              <h2 className="text-lg font-semibold mb-2">الوصف</h2>
              <p className="text-gray-700 whitespace-pre-wrap mb-6">{item.description}</p>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">تفاصيل المزاد</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">السعر الابتدائي</p>
                    <p className="font-semibold">{(auction.startingPrice || 0).toLocaleString()} ج.م</p>
                  </div>
                  <div>
                    <p className="text-gray-600">عدد المزايدات</p>
                    <p className="font-semibold">{auction.bidCount || 0} مزايدة</p>
                  </div>
                  <div>
                    <p className="text-gray-600">المشاهدون</p>
                    <p className="font-semibold">{auction.watchlistCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">نوع المزاد</p>
                    <p className="font-semibold">{auctionTypeLabels[auctionType]?.label}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">بدأ في</p>
                    <p className="font-semibold">{new Date(auction.startTime).toLocaleString('ar-EG')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ينتهي في</p>
                    <p className="font-semibold">{new Date(auction.endTime).toLocaleString('ar-EG')}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h2 className="text-lg font-semibold mb-2">البائع</h2>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-xl text-purple-600">{item.seller?.fullName?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.seller?.fullName || 'غير معروف'}</p>
                    <p className="text-sm text-gray-600">{item.seller?.userType === 'BUSINESS' ? 'تاجر' : 'فرد'}</p>
                    {item.seller?.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm text-gray-600">{item.seller.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bid History (for non-sealed bids) */}
            {!isSealedBid && auction.bids && auction.bids.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">سجل المزايدات</h2>
                <div className="space-y-3">
                  {auction.bids.slice(0, 10).map((bid, index) => (
                    <div
                      key={bid.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {bid.bidder.fullName}
                          {index === 0 && <span className="mr-2 text-xs text-green-600 font-normal">(الأعلى)</span>}
                        </p>
                        <p className="text-sm text-gray-600">{new Date(bid.createdAt).toLocaleString('ar-EG')}</p>
                      </div>
                      <p className="text-lg font-bold text-purple-600">{(bid.bidAmount || bid.amount || 0).toLocaleString()} ج.م</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">التقييمات ({reviews.length})</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600">{review.reviewer?.fullName?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{review.reviewer?.fullName}</p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={star <= review.overallRating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      {review.response && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">رد البائع:</p>
                          <p className="text-gray-700">{review.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 space-y-6">
              {/* Countdown */}
              {isActive && (
                <div className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white rounded-lg p-4 text-center">
                  <p className="text-sm font-medium mb-1">الوقت المتبقي</p>
                  <p className="text-3xl font-bold">
                    <CountdownTimer endTime={auction.endTime} onEnd={loadAuction} />
                  </p>
                </div>
              )}

              {/* Current Price */}
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {isSealedBid ? 'السعر المبدئي' : 'المزايدة الحالية'}
                </p>
                <p className="text-4xl font-bold text-purple-600">{currentPrice.toLocaleString()} ج.م</p>
                {!isSealedBid && isActive && (
                  <p className="text-sm text-gray-600 mt-1">الحد الأدنى للمزايدة: {minBid.toLocaleString()} ج.م</p>
                )}
              </div>

              {/* Buy Now */}
              {auction.buyNowPrice && isActive && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-700 mb-1">أو اشتري الآن</p>
                  <p className="text-2xl font-bold text-green-600">{auction.buyNowPrice.toLocaleString()} ج.م</p>
                </div>
              )}

              {/* Deposit Required Notice */}
              {auction.requiresDeposit && !hasDeposit && isActive && !isSeller && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium mb-2">يتطلب هذا المزاد دفع تأمين</p>
                  <p className="text-lg font-bold text-amber-600">{(auction.depositAmount || 0).toLocaleString()} ج.م</p>
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="mt-2 w-full py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium"
                  >
                    دفع التأمين
                  </button>
                </div>
              )}

              {/* Bidding Form - English Auction */}
              {!isSeller && isActive && !isSealedBid && (
                <div className="space-y-4">
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">قيمة مزايدتك (ج.م)</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setBidAmount((prev) => Math.max(minBid, parseFloat(prev || '0') - minBidIncrement).toString())}
                          className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition text-xl font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          min={minBid}
                          step={minBidIncrement}
                          required
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg text-center"
                        />
                        <button
                          type="button"
                          onClick={() => setBidAmount((prev) => (parseFloat(prev || '0') + minBidIncrement).toString())}
                          className="px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-xl font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {bidError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{bidError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bidding || (auction.requiresDeposit && !hasDeposit)}
                      className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bidding ? 'جاري تقديم المزايدة...' : 'تقديم مزايدة'}
                    </button>
                  </form>

                  {/* Proxy Bid */}
                  <button
                    onClick={() => setShowProxyBid(!showProxyBid)}
                    className="w-full py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition text-sm font-medium"
                  >
                    {showProxyBid ? 'إخفاء المزايدة التلقائية' : 'تفعيل المزايدة التلقائية'}
                  </button>

                  {showProxyBid && (
                    <form onSubmit={handleSetProxyBid} className="p-4 bg-purple-50 rounded-lg space-y-3">
                      <p className="text-sm text-purple-800">المزايدة التلقائية تزايد نيابة عنك حتى الحد الأقصى</p>
                      <input
                        type="number"
                        value={proxyBidAmount}
                        onChange={(e) => setProxyBidAmount(e.target.value)}
                        placeholder="الحد الأقصى للمزايدة"
                        min={currentPrice + minBidIncrement}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="submit"
                        disabled={proxyBidLoading}
                        className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        {proxyBidLoading ? 'جاري التفعيل...' : 'تفعيل'}
                      </button>
                    </form>
                  )}

                  {auction.buyNowPrice && (
                    <button
                      onClick={handleBuyNow}
                      disabled={buying}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                    >
                      {buying ? 'جاري المعالجة...' : 'اشتري الآن'}
                    </button>
                  )}
                </div>
              )}

              {/* Sealed Bid Form */}
              {!isSeller && isActive && isSealedBid && !hasSealedBid && (
                <form onSubmit={handleSubmitSealedBid} className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      هذا مزاد بالعروض المختومة. قدم عرضك السري وسيتم الكشف عن جميع العروض بعد انتهاء المزاد.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">قيمة عرضك السري (ج.م)</label>
                    <input
                      type="number"
                      value={sealedBidAmount}
                      onChange={(e) => setSealedBidAmount(e.target.value)}
                      min={auction.startingPrice || 0}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="ادخل قيمة عرضك"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sealedBidLoading || (auction.requiresDeposit && !hasDeposit)}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                  >
                    {sealedBidLoading ? 'جاري التقديم...' : 'تقديم العرض المختوم'}
                  </button>
                </form>
              )}

              {/* Already submitted sealed bid */}
              {isSealedBid && hasSealedBid && isActive && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">تم تقديم عرضك المختوم</p>
                  <p className="text-sm text-green-600 mt-1">سيتم الكشف عن النتائج بعد انتهاء المزاد</p>
                </div>
              )}

              {/* Seller View */}
              {isSeller && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">هذا مزادك الخاص</p>
                </div>
              )}

              {/* Ended State */}
              {isEnded && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                    <p className="text-center font-semibold text-gray-700">انتهى المزاد</p>
                    {isWinner ? (
                      <div className="mt-4 space-y-3">
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-center text-green-700 font-semibold">مبروك! لقد فزت بهذا المزاد</p>
                          <p className="text-sm text-center text-green-600 mt-1">السعر النهائي: {currentPrice.toLocaleString()} ج.م</p>
                        </div>
                        <button
                          onClick={() => router.push(`/checkout/auction/${auctionId}`)}
                          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold"
                        >
                          إتمام الشراء
                        </button>
                      </div>
                    ) : auction.winnerId ? (
                      <p className="text-sm text-center text-gray-600 mt-2">
                        الفائز: {auction.bids?.[0]?.bidder.fullName}
                      </p>
                    ) : (
                      <p className="text-sm text-center text-gray-600 mt-2">لم يفز أحد بهذا المزاد</p>
                    )}
                  </div>

                  {/* Review Button */}
                  {canReview && (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition font-medium"
                    >
                      إضافة تقييم
                    </button>
                  )}

                  {/* Dispute Button */}
                  {(isWinner || isSeller) && (
                    <button
                      onClick={() => setShowDisputeForm(true)}
                      className="w-full py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition font-medium"
                    >
                      فتح نزاع
                    </button>
                  )}
                </div>
              )}

              {/* Not Started */}
              {!hasStarted && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-center font-semibold text-yellow-800">المزاد يبدأ قريبا</p>
                  <p className="text-sm text-center text-yellow-700 mt-2">يبدأ في: {new Date(auction.startTime).toLocaleString('ar-EG')}</p>
                </div>
              )}

              {!user && isActive && (
                <p className="text-sm text-center text-gray-600">
                  <Link href="/login" className="text-purple-600 hover:text-purple-700">سجل دخول</Link> للمزايدة
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6" dir="rtl">
            <h3 className="text-xl font-bold mb-4">دفع التأمين</h3>
            <p className="text-gray-600 mb-4">
              يتطلب هذا المزاد دفع تأمين قدره <strong>{(auction?.depositAmount || 0).toLocaleString()} ج.م</strong> للمشاركة.
              سيتم استرداد التأمين إذا لم تفز بالمزاد.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => handlePayDeposit('CARD')}
                disabled={depositLoading}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {depositLoading ? 'جاري الدفع...' : 'الدفع بالبطاقة'}
              </button>
              <button
                onClick={() => handlePayDeposit('WALLET')}
                disabled={depositLoading}
                className="w-full py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition disabled:opacity-50"
              >
                الدفع من المحفظة
              </button>
              <button
                onClick={() => setShowDepositModal(false)}
                className="w-full py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" dir="rtl">
            <h3 className="text-xl font-bold mb-4">إضافة تقييم</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <StarRatingInput
                value={reviewData.overallRating}
                onChange={(value) => setReviewData({ ...reviewData, overallRating: value })}
                label="التقييم العام"
              />
              <StarRatingInput
                value={reviewData.accuracyRating || 0}
                onChange={(value) => setReviewData({ ...reviewData, accuracyRating: value })}
                label="الدقة"
              />
              <StarRatingInput
                value={reviewData.communicationRating || 0}
                onChange={(value) => setReviewData({ ...reviewData, communicationRating: value })}
                label="التواصل"
              />
              <StarRatingInput
                value={reviewData.shippingRating || 0}
                onChange={(value) => setReviewData({ ...reviewData, shippingRating: value })}
                label="الشحن"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التعليق</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="اكتب تقييمك..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                  {reviewLoading ? 'جاري الإرسال...' : 'إرسال التقييم'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" dir="rtl">
            <h3 className="text-xl font-bold mb-4">فتح نزاع</h3>
            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع النزاع</label>
                <select
                  value={disputeData.disputeType}
                  onChange={(e) => setDisputeData({ ...disputeData, disputeType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="NON_PAYMENT">عدم الدفع</option>
                  <option value="ITEM_NOT_AS_DESCRIBED">المنتج مختلف عن الوصف</option>
                  <option value="ITEM_NOT_RECEIVED">لم يصل المنتج</option>
                  <option value="UNAUTHORIZED_BID">مزايدة غير مصرح بها</option>
                  <option value="SHILL_BIDDING">مزايدة وهمية</option>
                  <option value="OTHER">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السبب</label>
                <input
                  type="text"
                  value={disputeData.reason}
                  onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="سبب النزاع باختصار"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التفاصيل</label>
                <textarea
                  value={disputeData.description}
                  onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="اشرح المشكلة بالتفصيل..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={disputeLoading}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  {disputeLoading ? 'جاري الإرسال...' : 'فتح النزاع'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDisputeForm(false)}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
