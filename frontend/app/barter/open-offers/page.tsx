'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMatchingOffers, BarterOffer } from '@/lib/api/barter';

export default function OpenOffersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [offers, setOffers] = useState<BarterOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await getMatchingOffers();
      setOffers(response.data?.offers || response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load open offers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/barter"
            className="text-green-100 hover:text-white flex items-center gap-2 mb-4"
          >
            ← Back to Barter
          </Link>
          <h1 className="text-3xl font-bold">📋 Open Barter Offers</h1>
          <p className="text-green-100 mt-2">
            Browse offers from other users and respond with your items
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No open offers available</p>
            <p className="text-gray-500 mb-6">
              Be the first to create an open barter offer!
            </p>
            <Link
              href="/barter/new"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              + Create Open Offer
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {offer.initiator.fullName} is offering
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(offer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                    Open
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Offering */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-700 mb-2">Offering:</h4>
                    <p className="text-sm text-gray-700">
                      {offer.offeredItemIds.length} item{offer.offeredItemIds.length !== 1 ? 's' : ''}
                    </p>
                    {offer.offeredBundleValue && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        Value: ~{offer.offeredBundleValue.toLocaleString()} EGP
                      </p>
                    )}
                  </div>

                  {/* Looking for */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-2">Looking for:</h4>
                    {offer.itemRequests && offer.itemRequests.length > 0 ? (
                      <div className="space-y-1">
                        {offer.itemRequests.map((req) => (
                          <p key={req.id} className="text-sm text-gray-700">
                            • {req.description}
                          </p>
                        ))}
                      </div>
                    ) : offer.preferenceSets && offer.preferenceSets.length > 0 ? (
                      <div className="space-y-1">
                        {offer.preferenceSets.map((ps) => (
                          <div key={ps.id}>
                            {ps.description && (
                              <p className="text-sm text-gray-700">• {ps.description}</p>
                            )}
                            {ps.items.map((item) => (
                              <p key={item.id} className="text-sm text-gray-700">
                                • {item.item.title}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Any interesting items</p>
                    )}
                  </div>
                </div>

                {user && user.id !== offer.initiator.id && (
                  <Link
                    href={`/barter/respond/${offer.id}`}
                    className="block w-full text-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    Respond to Offer
                  </Link>
                )}

                {!user && (
                  <Link
                    href="/login"
                    className="block w-full text-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                  >
                    Login to Respond
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
