'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBarterOffer } from '@/lib/api/barter';
import { getMyItems } from '@/lib/api/items';
import { getBarterItems } from '@/lib/api/barter';
import { useAuth } from '@/lib/contexts/AuthContext';

interface SelectableItem {
  id: string;
  title: string;
  description: string;
  price?: number;
  estimatedValue?: number;
  images: Array<{ url: string; isPrimary: boolean }>;
  category: { nameEn: string };
  seller?: { id: string; fullName: string };
}

export default function CreateBarterOfferPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Items
  const [myItems, setMyItems] = useState<SelectableItem[]>([]);
  const [availableItems, setAvailableItems] = useState<SelectableItem[]>([]);
  const [loadingMyItems, setLoadingMyItems] = useState(true);
  const [loadingAvailableItems, setLoadingAvailableItems] = useState(true);

  // Selected items
  const [selectedOfferedItems, setSelectedOfferedItems] = useState<string[]>([]);
  const [selectedRequestedItems, setSelectedRequestedItems] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadMyItems();
    loadAvailableItems();
  }, [user]);

  const loadMyItems = async () => {
    try {
      setLoadingMyItems(true);
      const response = await getMyItems();
      const availableItems = response.data.items.filter(
        (item: any) => item.status === 'ACTIVE' // Changed from 'AVAILABLE' to 'ACTIVE' to match database enum
      );
      setMyItems(availableItems);
    } catch (err: any) {
      console.error('Failed to load my items:', err);
      setError('Failed to load your items. Please try again.');
    } finally {
      setLoadingMyItems(false);
    }
  };

  const loadAvailableItems = async () => {
    try {
      setLoadingAvailableItems(true);
      const response = await getBarterItems({ limit: 50 });
      // Filter out my own items
      const filtered = response.data.items.filter(
        (item) => item.seller?.id !== user?.id
      );
      setAvailableItems(filtered);
    } catch (err: any) {
      console.error('Failed to load available items:', err);
    } finally {
      setLoadingAvailableItems(false);
    }
  };

  const toggleOfferedItem = (itemId: string) => {
    setSelectedOfferedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleRequestedItem = (itemId: string) => {
    setSelectedRequestedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedOfferedItems.length === 0) {
      setError('Please select at least one item to offer');
      return;
    }

    if (selectedRequestedItems.length === 0) {
      setError('Please select at least one item you want in exchange');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find recipient from selected items (if all belong to same seller)
      const selectedItems = availableItems.filter((item) =>
        selectedRequestedItems.includes(item.id)
      );
      const sellerIds = [...new Set(selectedItems.map((item) => item.seller?.id).filter(Boolean))];
      const recipientId = sellerIds.length === 1 ? sellerIds[0] : undefined;

      const offerData = {
        offeredItemIds: selectedOfferedItems,
        requestedItemIds: selectedRequestedItems,
        recipientId,
        message: message || undefined,
      };

      const response = await createBarterOffer(offerData);
      router.push('/barter/my-offers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create barter offer');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const selectedOfferedDetails = myItems.filter((item) =>
    selectedOfferedItems.includes(item.id)
  );
  const selectedRequestedDetails = availableItems.filter((item) =>
    selectedRequestedItems.includes(item.id)
  );

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
          <h1 className="text-4xl font-bold">🔄 Make a Barter Offer</h1>
          <p className="text-green-100 mt-2">
            Select items to trade and items you want in exchange
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Items I'm Offering */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📤 Items I'm Offering ({selectedOfferedItems.length})
              </h2>

              {loadingMyItems ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : myItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">You don't have any items available</p>
                  <Link
                    href="/items/new"
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                  >
                    + List an Item
                  </Link>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {myItems.map((item) => {
                    const isSelected = selectedOfferedItems.includes(item.id);
                    const primaryImage =
                      item.images?.find((img) => img.isPrimary)?.url ||
                      item.images?.[0]?.url;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleOfferedItem(item.id)}
                        className={`w-full p-3 rounded-lg border-2 transition text-left ${
                          isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex gap-3">
                          {primaryImage && (
                            <img
                              src={primaryImage}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {item.category.nameEn}
                            </p>
                            {item.price && (
                              <p className="text-sm font-medium text-green-600">
                                {item.price.toLocaleString()} EGP
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 text-green-600">✓</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Items I Want */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                📥 Items I Want ({selectedRequestedItems.length})
              </h2>

              {loadingAvailableItems ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : availableItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No items available for barter yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableItems.map((item) => {
                    const isSelected = selectedRequestedItems.includes(item.id);
                    const primaryImage =
                      item.images?.find((img) => img.isPrimary)?.url ||
                      item.images?.[0]?.url;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleRequestedItem(item.id)}
                        className={`w-full p-3 rounded-lg border-2 transition text-left ${
                          isSelected
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex gap-3">
                          {primaryImage && (
                            <img
                              src={primaryImage}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              {item.category.nameEn} • {item.seller?.fullName}
                            </p>
                            {item.estimatedValue && (
                              <p className="text-sm font-medium text-green-600">
                                ~{item.estimatedValue.toLocaleString()} EGP
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex-shrink-0 text-green-600">✓</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {(selectedOfferedItems.length > 0 || selectedRequestedItems.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Trade Summary</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">You Offer:</h3>
                  {selectedOfferedDetails.length > 0 ? (
                    <ul className="space-y-1 text-sm text-gray-600">
                      {selectedOfferedDetails.map((item) => (
                        <li key={item.id}>• {item.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No items selected</p>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">You Get:</h3>
                  {selectedRequestedDetails.length > 0 ? (
                    <ul className="space-y-1 text-sm text-gray-600">
                      {selectedRequestedDetails.map((item) => (
                        <li key={item.id}>• {item.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No items selected</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="Add a message to your offer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/barter')}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                selectedOfferedItems.length === 0 ||
                selectedRequestedItems.length === 0
              }
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Offer...' : 'Send Barter Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
