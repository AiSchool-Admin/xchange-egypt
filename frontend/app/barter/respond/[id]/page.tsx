'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getBarterOffer, acceptBarterOffer, BarterOffer } from '@/lib/api/barter';
import { getMyItems } from '@/lib/api/items';
import { useAuth } from '@/lib/contexts/AuthContext';

interface SelectableItem {
  id: string;
  title: string;
  estimatedValue?: number;
  price?: number;
  images: Array<{ url: string; isPrimary: boolean }>;
}

export default function RespondToOfferPage() {
  const router = useRouter();
  const params = useParams();
  const offerId = params.id as string;
  const { user } = useAuth();

  const [offer, setOffer] = useState<BarterOffer | null>(null);
  const [myItems, setMyItems] = useState<SelectableItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user, offerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offerResponse, itemsResponse] = await Promise.all([
        getBarterOffer(offerId),
        getMyItems(),
      ]);
      setOffer(offerResponse.data);
      setMyItems(itemsResponse.data.items.filter((item: any) => item.status === 'ACTIVE'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load offer details');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      setError('Please select at least one item to offer');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await acceptBarterOffer(offerId);
      router.push('/barter/my-offers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to respond to offer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading offer...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Offer not found</h2>
          <Link href="/barter/open-offers" className="text-purple-600 hover:underline mt-4 block">
            Back to Open Offers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/barter/open-offers"
            className="text-purple-100 hover:text-white flex items-center gap-2 mb-4"
          >
            ← Back to Open Offers
          </Link>
          <h1 className="text-3xl font-bold">Respond to Offer</h1>
          <p className="text-purple-100 mt-2">
            Select items from your inventory to trade
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Offer Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Offer Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What they're offering */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-700 mb-2">
                {offer.offerer.fullName} is offering:
              </h3>
              <p className="text-sm text-gray-700">
                {offer.offeredItems?.length || 0} item(s)
              </p>
              {offer.offeredBundleValue && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  Value: EGP {offer.offeredBundleValue.toLocaleString()}
                </p>
              )}
            </div>

            {/* What they want */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">
                Looking for:
              </h3>
              {offer.itemRequests && offer.itemRequests.length > 0 ? (
                <div className="space-y-1">
                  {offer.itemRequests.map((req) => (
                    <p key={req.id} className="text-sm text-gray-700">
                      {req.description}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Any items</p>
              )}
            </div>
          </div>
        </div>

        {/* Select Your Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Select Items to Offer ({selectedItems.length})
          </h2>

          {myItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You don't have any items available</p>
              <Link
                href="/items/new"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm"
              >
                + List an Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {myItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                const primaryImage =
                  item.images?.find((img) => img.isPrimary)?.url ||
                  item.images?.[0]?.url;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`p-3 rounded-lg border-2 transition text-left ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-3">
                      {primaryImage && (
                        <img
                          src={primaryImage}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate text-sm">
                          {item.title}
                        </h4>
                        <p className="text-xs text-purple-600">
                          ~{(item.estimatedValue || item.price || 0).toLocaleString()} EGP
                        </p>
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0 text-purple-600">✓</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Chat Button */}
          <button
            type="button"
            onClick={() => router.push(`/messages?userId=${offer.offerer.id}`)}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            💬 Chat with {offer.offerer.fullName} to Negotiate
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/barter/open-offers')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedItems.length === 0}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Sending...' : 'Send Response'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
