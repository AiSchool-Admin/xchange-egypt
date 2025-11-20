'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMyAuctions, cancelAuction, Auction, getAuctionItem, getAuctionBidCount } from '@/lib/api/auctions';

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

export default function MyAuctionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled' | 'completed' | 'ended'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadAuctions();
    }
  }, [user]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const response = await getMyAuctions();
      setAuctions(response.data.auctions || response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (auctionId: string) => {
    if (!confirm('Are you sure you want to cancel this auction?')) return;

    setActionLoading(auctionId);
    try {
      await cancelAuction(auctionId);
      await loadAuctions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel auction');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAuctions = auctions.filter((auction) => {
    if (filter === 'all') return true;
    return auction.status.toLowerCase() === filter;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading your auctions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <Link
                href="/auctions"
                className="text-purple-100 hover:text-white flex items-center gap-2 mb-4"
              >
                ← Back to Auctions
              </Link>
              <h1 className="text-4xl font-bold">My Auctions</h1>
              <p className="text-purple-100 mt-2">Manage your auction listings</p>
            </div>
            <Link
              href="/auctions/new"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition font-semibold"
            >
              + New Auction
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            {(['all', 'active', 'scheduled', 'completed', 'ended'] as const).map((status) => (
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
                  ? auctions.length
                  : auctions.filter(a => a.status.toLowerCase() === status).length})
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {filteredAuctions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">🔨</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all' ? 'No auctions yet' : `No ${filter} auctions`}
            </h2>
            <p className="text-gray-500 mb-6">
              Start your first auction and let bidders compete for your items!
            </p>
            <Link
              href="/auctions/new"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Create Auction
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAuctions.map((auction) => {
              const item = getAuctionItem(auction);
              const bidCount = getAuctionBidCount(auction);
              const isEnded = new Date(auction.endTime) < new Date();
              const hasStarted = new Date(auction.startTime) < new Date();
              const canCancel = !isEnded && bidCount === 0;
              const primaryImage = item?.images?.find(img => img.isPrimary)?.url || item?.images?.[0]?.url;

              return (
                <div key={auction.id} className="bg-white rounded-lg shadow-sm p-6">
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
                          <Link
                            href={`/auctions/${auction.id}`}
                            className="font-semibold text-lg text-gray-900 hover:text-purple-600"
                          >
                            {item?.title || 'Untitled'}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(auction.status)}`}>
                              {auction.status}
                            </span>
                            {item?.category && (
                              <span className="text-xs text-gray-500">
                                {item.category.nameEn}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-purple-600">
                            {auction.currentPrice.toLocaleString()} EGP
                          </p>
                          <p className="text-sm text-gray-500">
                            {bidCount} bid{bidCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                        <div>
                          <p className="text-gray-500">Starting Price</p>
                          <p className="font-medium">{auction.startingPrice.toLocaleString()} EGP</p>
                        </div>
                        {auction.buyNowPrice && (
                          <div>
                            <p className="text-gray-500">Buy Now</p>
                            <p className="font-medium text-green-600">{auction.buyNowPrice.toLocaleString()} EGP</p>
                          </div>
                        )}
                        <div>
                          <p className="text-gray-500">Time Left</p>
                          <p className="font-medium">
                            {isEnded ? 'Ended' : !hasStarted ? 'Not started' : <CountdownTimer endTime={auction.endTime} />}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Views</p>
                          <p className="font-medium">{auction.views || 0}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-4">
                        <Link
                          href={`/auctions/${auction.id}`}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(auction.id)}
                            disabled={actionLoading === auction.id}
                            className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 text-sm font-medium disabled:opacity-50"
                          >
                            {actionLoading === auction.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                        {auction.status === 'COMPLETED' && auction.winnerId && (
                          <Link
                            href={`/transactions`}
                            className="border border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 text-sm font-medium"
                          >
                            View Transaction
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
