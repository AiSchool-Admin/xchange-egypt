'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOpenBarterOffers, BarterOffer } from '@/lib/api/barter';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function OpenBarterOffersPage() {
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
      const response = await getOpenBarterOffers();
      setOffers(response.data.items || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load open offers');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/barter"
            className="text-purple-100 hover:text-white flex items-center gap-2 mb-4"
          >
            ← Back to Barter
          </Link>
          <h1 className="text-4xl font-bold">Browse Open Offers</h1>
          <p className="text-purple-100 mt-2">
            See what others are looking for and make them an offer
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading open offers...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Open Offers Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to create an offer describing what you need!
            </p>
            <Link
              href="/barter/new"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              + Create an Offer
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
              >
                {/* Offer Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold">
                        {offer.initiator.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {offer.initiator.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    Open Offer
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* What They're Offering */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-700 mb-2">
                      They're Offering:
                    </h4>
                    <p className="text-sm text-gray-700">
                      {offer.offeredItemIds?.length || 0} item(s)
                    </p>
                    {offer.offeredBundleValue && offer.offeredBundleValue > 0 && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Value: EGP {offer.offeredBundleValue.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* What They're Looking For */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-700 mb-2">
                      Looking For:
                    </h4>
                    {offer.itemRequests && offer.itemRequests.length > 0 ? (
                      <div className="space-y-2">
                        {offer.itemRequests.map((req) => (
                          <p key={req.id} className="text-sm text-gray-700">
                            {req.description}
                          </p>
                        ))}
                      </div>
                    ) : offer.preferenceSets && offer.preferenceSets.length > 0 ? (
                      <div className="space-y-2">
                        {offer.preferenceSets.map((prefSet) => (
                          <div key={prefSet.id}>
                            {prefSet.items.map((prefItem) => (
                              <p key={prefItem.id} className="text-sm text-gray-700">
                                {prefItem.item.title}
                              </p>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Any items</p>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t">
                  <Link
                    href={`/barter/respond/${offer.id}`}
                    className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition font-medium text-sm"
                  >
                    Respond to Offer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
