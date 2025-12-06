'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuction, placeBid, buyNow, Auction } from '@/lib/api/auctions';
import { useAuth } from '@/lib/contexts/AuthContext';

// Countdown Timer Component
const CountdownTimer: React.FC<{ endTime: string }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - Date.now();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      } else {
        setTimeLeft('Ended');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return <span>{timeLeft}</span>;
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
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState('');
  const [buying, setBuying] = useState(false);

  const auctionId = params.id as string;

  useEffect(() => {
    loadAuction();
    // Refresh auction data every 5 seconds for live updates
    const interval = setInterval(loadAuction, 5000);
    return () => clearInterval(interval);
  }, [auctionId]);

  const loadAuction = async () => {
    try {
      setLoading(true);
      const response = await getAuction(auctionId);
      setAuction(response.data);

      // Set default bid amount to minimum increment
      if (!bidAmount && response.data.currentPrice) {
        setBidAmount((response.data.currentPrice + 10).toString());
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load auction');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push('/login');
      return;
    }

    setBidding(true);
    setBidError('');

    try {
      await placeBid(auctionId, { amount: parseFloat(bidAmount) });
      await loadAuction(); // Reload to show new bid
      setBidAmount((parseFloat(bidAmount) + 10).toString()); // Increment for next bid
    } catch (err: any) {
      setBidError(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!confirm('Are you sure you want to buy this item now?')) {
      return;
    }

    setBuying(true);

    try {
      await buyNow(auctionId);
      await loadAuction();
      alert('Congratulations! You won the auction!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to buy now');
    } finally {
      setBuying(false);
    }
  };

  if (loading && !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => router.push('/auctions')}
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            ← Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  if (!auction) return null;

  // Support both API response formats: auction.item or auction.listing.item
  const item = auction.item || (auction as any).listing?.item;

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">بيانات المنتج غير متوفرة</p>
          <button
            onClick={() => router.push('/auctions')}
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            ← العودة للمزادات
          </button>
        </div>
      </div>
    );
  }

  const isEnded = new Date(auction.endTime) < new Date();
  const hasStarted = new Date(auction.startTime) < new Date();
  const isActive = hasStarted && !isEnded;
  const isSeller = user?.id === item.seller?.id;
  const minBid = auction.currentPrice + 10;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/auctions"
            className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
          >
            ← Back to Auctions
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-200">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[selectedImage]?.url}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-6xl">🔨</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isEnded ? (
                    <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Ended
                    </span>
                  ) : !hasStarted ? (
                    <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Starting Soon
                    </span>
                  ) : (
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                      • Live Auction
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnail Navigation */}
              {item.images && item.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {item.images.map((image: any, index: number) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? 'border-purple-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${item.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {item.title}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                {item.category && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {item.category.nameEn}
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {item.condition}
                </span>
              </div>

              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap mb-6">
                {item.description}
              </p>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Auction Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Starting Price</p>
                    <p className="font-semibold">{auction.startingPrice.toLocaleString()} EGP</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Bids</p>
                    <p className="font-semibold">{auction.bidCount} bids</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Started</p>
                    <p className="font-semibold">
                      {new Date(auction.startTime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ends</p>
                    <p className="font-semibold">
                      {new Date(auction.endTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h2 className="text-lg font-semibold mb-2">Seller</h2>
                <p className="text-gray-700">{item.seller?.fullName || (item.seller as any)?.businessName || 'Unknown'}</p>
                <p className="text-sm text-gray-600 capitalize">{item.seller?.userType || 'Individual'}</p>
              </div>
            </div>

            {/* Bid History */}
            {auction.bids && auction.bids.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Bid History</h2>
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
                          {index === 0 && (
                            <span className="ml-2 text-xs text-green-600 font-normal">
                              (Leading)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(bid.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-purple-600">
                        {bid.amount.toLocaleString()} EGP
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Bidding Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              {/* Countdown */}
              {isActive && (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-4 mb-6 text-center">
                  <p className="text-sm font-medium mb-1">Time Remaining</p>
                  <p className="text-3xl font-bold">
                    <CountdownTimer endTime={auction.endTime} />
                  </p>
                </div>
              )}

              {/* Current Price */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Current Bid</p>
                <p className="text-4xl font-bold text-purple-600">
                  {auction.currentPrice.toLocaleString()} EGP
                </p>
                {isActive && (
                  <p className="text-sm text-gray-600 mt-1">
                    Minimum bid: {minBid.toLocaleString()} EGP
                  </p>
                )}
              </div>

              {/* Buy Now Price */}
              {auction.buyNowPrice && isActive && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-700 mb-1">Or Buy It Now</p>
                  <p className="text-2xl font-bold text-green-600">
                    {auction.buyNowPrice.toLocaleString()} EGP
                  </p>
                </div>
              )}

              {/* Bidding Form */}
              {!isSeller && isActive && (
                <div className="space-y-4">
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Bid Amount (EGP)
                      </label>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={minBid}
                        step="10"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
                        placeholder={minBid.toString()}
                      />
                    </div>

                    {bidError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{bidError}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={bidding}
                      className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {bidding ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </form>

                  {auction.buyNowPrice && (
                    <button
                      onClick={handleBuyNow}
                      disabled={buying}
                      className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buying ? 'Processing...' : 'Buy Now'}
                    </button>
                  )}

                  {!user && (
                    <p className="text-sm text-center text-gray-600">
                      <Link href="/login" className="text-purple-600 hover:text-purple-700">
                        Sign in
                      </Link>{' '}
                      to place bids
                    </p>
                  )}
                </div>
              )}

              {/* Seller View */}
              {isSeller && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">
                    This is your auction
                  </p>
                </div>
              )}

              {/* Ended State */}
              {isEnded && (
                <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
                  <p className="text-center font-semibold text-gray-700">
                    Auction Ended
                  </p>
                  {auction.winnerId && (
                    <p className="text-sm text-center text-gray-600 mt-2">
                      Winner: {auction.bids?.[0]?.bidder.fullName}
                    </p>
                  )}
                </div>
              )}

              {/* Not Started */}
              {!hasStarted && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-center font-semibold text-yellow-800">
                    Auction Starting Soon
                  </p>
                  <p className="text-sm text-center text-yellow-700 mt-2">
                    Starts: {new Date(auction.startTime).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
