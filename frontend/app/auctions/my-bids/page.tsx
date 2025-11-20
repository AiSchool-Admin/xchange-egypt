'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMyBids, MyAuctionBid, getAuctionItem, getBidAmount } from '@/lib/api/auctions';

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

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${minutes}m`);
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

export default function MyBidsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [myBids, setMyBids] = useState<MyAuctionBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'winning' | 'outbid' | 'won' | 'lost'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadMyBids();
    }
  }, [user]);

  const loadMyBids = async () => {
    try {
      setLoading(true);
      const response = await getMyBids();
      setMyBids(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const getBidStatus = (auctionBid: MyAuctionBid): string => {
    const latestBid = auctionBid.latestBid;
    if (!latestBid) return 'unknown';

    if (latestBid.status === 'WON') return 'won';
    if (latestBid.status === 'LOST') return 'lost';
    if (latestBid.status === 'WINNING') return 'winning';
    if (latestBid.status === 'OUTBID') return 'outbid';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'winning':
        return 'bg-green-100 text-green-800';
      case 'won':
        return 'bg-blue-100 text-blue-800';
      case 'outbid':
        return 'bg-yellow-100 text-yellow-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBids = myBids.filter((bid) => {
    if (filter === 'all') return true;
    return getBidStatus(bid) === filter;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading your bids...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const winningCount = myBids.filter(b => getBidStatus(b) === 'winning').length;
  const outbidCount = myBids.filter(b => getBidStatus(b) === 'outbid').length;
  const wonCount = myBids.filter(b => getBidStatus(b) === 'won').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/auctions"
            className="text-indigo-100 hover:text-white flex items-center gap-2 mb-4"
          >
            ← Back to Auctions
          </Link>
          <h1 className="text-4xl font-bold">My Bids</h1>
          <p className="text-indigo-100 mt-2">Track your auction activity</p>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm text-indigo-100">Winning</p>
              <p className="text-3xl font-bold">{winningCount}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm text-indigo-100">Outbid</p>
              <p className="text-3xl font-bold">{outbidCount}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm text-indigo-100">Won</p>
              <p className="text-3xl font-bold">{wonCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {(['all', 'winning', 'outbid', 'won', 'lost'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                  filter === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status} ({status === 'all'
                  ? myBids.length
                  : myBids.filter(b => getBidStatus(b) === status).length})
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {filteredBids.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No bids yet' : `No ${filter} bids`}
            </h2>
            <p className="text-gray-500 mb-6">
              Start bidding on auctions to see them here!
            </p>
            <Link
              href="/auctions"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Browse Auctions
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((auctionBid) => {
              const auction = auctionBid.auction;
              const item = getAuctionItem(auction);
              const latestBid = auctionBid.latestBid;
              const bidStatus = getBidStatus(auctionBid);
              const isEnded = new Date(auction.endTime) < new Date();
              const primaryImage = item?.images?.find(img => img.isPrimary)?.url || item?.images?.[0]?.url;
              const myHighestBid = Math.max(...auctionBid.bids.map(b => getBidAmount(b)));

              return (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.id}`}
                  className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={item?.title}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-3xl">🔨</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 hover:text-purple-600">
                            {item?.title || 'Untitled'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bidStatus)}`}>
                              {bidStatus === 'winning' ? 'You\'re Winning!' :
                               bidStatus === 'outbid' ? 'Outbid' :
                               bidStatus === 'won' ? 'You Won!' :
                               bidStatus === 'lost' ? 'Lost' : bidStatus}
                            </span>
                            {!isEnded && (
                              <span className="text-xs text-gray-500">
                                ⏰ <CountdownTimer endTime={auction.endTime} />
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Current Bid</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {auction.currentPrice.toLocaleString()} EGP
                          </p>
                        </div>
                      </div>

                      {/* Bid Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500">Your Highest Bid</p>
                          <p className="font-medium">{myHighestBid.toLocaleString()} EGP</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Your Bids</p>
                          <p className="font-medium">{auctionBid.totalBids}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Seller</p>
                          <p className="font-medium truncate">{item?.seller?.fullName || 'Unknown'}</p>
                        </div>
                        {auction.buyNowPrice && !isEnded && (
                          <div>
                            <p className="text-gray-500">Buy Now</p>
                            <p className="font-medium text-green-600">{auction.buyNowPrice.toLocaleString()} EGP</p>
                          </div>
                        )}
                      </div>

                      {/* Action Hints */}
                      {bidStatus === 'outbid' && !isEnded && (
                        <p className="mt-3 text-sm text-yellow-600 font-medium">
                          Place a higher bid to win this auction!
                        </p>
                      )}
                      {bidStatus === 'won' && (
                        <p className="mt-3 text-sm text-blue-600 font-medium">
                          Check your transactions for payment details
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 self-center">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
