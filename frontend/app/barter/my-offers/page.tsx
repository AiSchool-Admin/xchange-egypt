'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyBarterOffers, BarterOffer } from '@/lib/api/barter';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function MyBarterOffersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [offers, setOffers] = useState<BarterOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadOffers();
  }, [user]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await getMyBarterOffers();
      setOffers(response.data.items || []);
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
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null;
  }

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
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading offers...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadOffers}
              className="mt-4 text-green-600 hover:text-green-700"
            >
              Try Again
            </button>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">No barter offers yet</p>
            <p className="text-gray-500 mt-2 mb-6">
              Start making offers to trade your items!
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
            {offers.map((offer) => {
              const isInitiator = offer.initiatorId === user.id;
              const otherParty = isInitiator ? offer.recipient : offer.initiator;

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {isInitiator ? 'Offer to' : 'Offer from'} {otherParty?.fullName || 'Open Offer'}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            offer.status
                          )}`}
                        >
                          {offer.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Offered Items */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        {isInitiator ? 'You Offer:' : 'They Offer:'}
                      </h4>
                      <div className="p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-700">
                          {offer.offeredItemIds?.length || 0} item(s) offered
                        </p>
                        {offer.offeredBundleValue && (
                          <p className="text-xs text-gray-500 mt-1">
                            Value: EGP {offer.offeredBundleValue.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Requested Items / Preferences */}
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">
                        {isInitiator ? 'Looking For:' : 'They Want:'}
                      </h4>
                      <div className="space-y-2">
                        {offer.preferenceSets && offer.preferenceSets.length > 0 ? (
                          offer.preferenceSets.map((prefSet) => (
                            <div key={prefSet.id} className="p-2 bg-gray-50 rounded">
                              {prefSet.items.map((prefItem) => (
                                <div key={prefItem.id} className="flex gap-3 items-center">
                                  {prefItem.item.images && prefItem.item.images.length > 0 && (
                                    <img
                                      src={prefItem.item.images[0]?.url}
                                      alt={prefItem.item.title}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  )}
                                  <p className="text-sm text-gray-900 truncate">
                                    {prefItem.item.title}
                                  </p>
                                </div>
                              ))}
                              {prefSet.description && (
                                <p className="text-xs text-gray-500 mt-1">{prefSet.description}</p>
                              )}
                            </div>
                          ))
                        ) : offer.itemRequests && offer.itemRequests.length > 0 ? (
                          offer.itemRequests.map((req) => (
                            <div key={req.id} className="p-2 bg-gray-50 rounded">
                              <p className="text-sm text-gray-700">
                                Category: {req.category.nameEn}
                              </p>
                            </div>
                          ))
                        ) : offer.isOpenOffer ? (
                          <div className="p-2 bg-yellow-50 rounded">
                            <p className="text-sm text-yellow-700">
                              Open offer - accepting any items
                            </p>
                          </div>
                        ) : (
                          <div className="p-2 bg-gray-50 rounded">
                            <p className="text-sm text-gray-500">No specific preferences</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {offer.message && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-gray-700">{offer.message}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
