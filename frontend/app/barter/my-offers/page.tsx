'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyBarterOffers, BarterOffer } from '@/lib/api/barter';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function MyBarterOffersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sentOffers, setSentOffers] = useState<BarterOffer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<BarterOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadOffers();
    }
  }, [user]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await getMyBarterOffers();
      setSentOffers(response.data.sent || []);
      setReceivedOffers(response.data.received || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'COUNTER_OFFERED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const allOffers = [...sentOffers, ...receivedOffers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const displayOffers = filter === 'sent'
    ? sentOffers
    : filter === 'received'
    ? receivedOffers
    : allOffers;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/barter"
            className="text-green-100 hover:text-white flex items-center gap-2 mb-4"
          >
            ← Back to Barter
          </Link>
          <h1 className="text-4xl font-bold">My Barter Offers</h1>
          <p className="text-green-100 mt-2">
            Manage your incoming and outgoing trade offers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({allOffers.length})
            </button>
            <button
              onClick={() => setFilter('sent')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'sent'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sent ({sentOffers.length})
            </button>
            <button
              onClick={() => setFilter('received')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'received'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Received ({receivedOffers.length})
            </button>
            <Link
              href="/barter/new"
              className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
            >
              + New Offer
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadOffers}
              className="mt-2 text-red-700 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {displayOffers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-gray-600 text-lg">No barter offers yet</p>
            <p className="text-gray-500 mt-2 mb-6">
              {filter === 'sent'
                ? "You haven't sent any offers yet"
                : filter === 'received'
                ? "You haven't received any offers yet"
                : 'Start making offers to trade your items!'}
            </p>
            <Link
              href="/barter/new"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              + Make an Offer
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {displayOffers.map((offer) => {
              const isSent = sentOffers.some(o => o.id === offer.id);
              const otherParty = isSent ? offer.recipient : offer.initiator;

              return (
                <Link
                  key={offer.id}
                  href={`/barter/offers/${offer.id}`}
                  className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          isSent ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {isSent ? 'Sent' : 'Received'}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isSent ? 'To' : 'From'} {otherParty?.fullName || 'Open Offer'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(offer.status)}`}>
                          {offer.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(offer.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">
                        {offer.offeredBundleValue?.toLocaleString()} EGP
                      </p>
                      <p className="text-xs text-gray-500">Bundle Value</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Offered Items */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {isSent ? 'You Offer:' : 'They Offer:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {offer.offeredItems?.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-2 bg-white px-2 py-1 rounded">
                            {item.images?.[0] && (
                              <img
                                src={item.images[0].url}
                                alt={item.title}
                                className="w-8 h-8 object-cover rounded"
                              />
                            )}
                            <span className="text-sm truncate max-w-[100px]">{item.title}</span>
                          </div>
                        ))}
                        {(offer.offeredItems?.length || 0) > 3 && (
                          <span className="text-sm text-gray-500">
                            +{(offer.offeredItems?.length || 0) - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Wanted Items */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {isSent ? 'You Want:' : 'They Want:'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {offer.preferenceSets?.[0]?.items?.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex items-center gap-2 bg-white px-2 py-1 rounded">
                            {item.images?.[0] && (
                              <img
                                src={item.images[0].url}
                                alt={item.title}
                                className="w-8 h-8 object-cover rounded"
                              />
                            )}
                            <span className="text-sm truncate max-w-[100px]">{item.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action hints */}
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-xs text-purple-600">
                      {!isSent && offer.status === 'PENDING' && 'Click to accept or reject'}
                      {isSent && offer.status === 'PENDING' && 'Waiting for response'}
                      {offer.status === 'ACCEPTED' && 'Click to complete exchange'}
                    </p>
                    <span className="text-gray-400">→</span>
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
