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

  // NEW: Request mode and cash
  const [requestMode, setRequestMode] = useState<'select' | 'describe'>('select');
  const [requestDescription, setRequestDescription] = useState('');
  const [offeredCash, setOfferedCash] = useState(0);
  const [requestedCash, setRequestedCash] = useState(0);

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
        (item: any) => item.status === 'ACTIVE'
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

  // Calculate total values
  const offeredItemsValue = myItems
    .filter((item) => selectedOfferedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.estimatedValue || item.price || 0), 0);

  const requestedItemsValue = availableItems
    .filter((item) => selectedRequestedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.estimatedValue || item.price || 0), 0);

  const totalOfferedValue = offeredItemsValue + offeredCash;
  const totalRequestedValue = requestedItemsValue + requestedCash;
  const valueDifference = totalOfferedValue - totalRequestedValue;
  const isBalanced = Math.abs(valueDifference) <= totalOfferedValue * 0.2; // Within 20%

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedOfferedItems.length === 0 && offeredCash === 0) {
      setError('Please select at least one item to offer or add cash');
      return;
    }

    if (requestMode === 'select' && selectedRequestedItems.length === 0 && requestedCash === 0) {
      setError('Please select at least one item you want or add cash');
      return;
    }

    if (requestMode === 'describe' && !requestDescription.trim()) {
      setError('Please describe what you are looking for');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Find recipient from selected items (if all belong to same seller)
      let recipientId: string | undefined;
      if (requestMode === 'select' && selectedRequestedItems.length > 0) {
        const selectedItems = availableItems.filter((item) =>
          selectedRequestedItems.includes(item.id)
        );
        const sellerIds = [...new Set(selectedItems.map((item) => item.seller?.id).filter(Boolean))];
        recipientId = sellerIds.length === 1 ? sellerIds[0] : undefined;
      }

      const offerData = {
        offeredItemIds: selectedOfferedItems,
        requestedItemIds: requestMode === 'select' ? selectedRequestedItems : [],
        recipientId,
        message: message || undefined,
        offeredCashAmount: offeredCash,
        requestedCashAmount: requestedCash,
        itemRequest: requestMode === 'describe' ? {
          description: requestDescription,
        } : undefined,
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
          <h1 className="text-4xl font-bold">Make a Barter Offer</h1>
          <p className="text-green-100 mt-2">
            Offer items + cash for items or describe what you need
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
            {/* Left: What I'm Offering */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  What I'm Offering
                </h2>

                {/* My Items */}
                <h3 className="font-semibold text-gray-700 mb-3">
                  Items ({selectedOfferedItems.length})
                </h3>
                {loadingMyItems ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : myItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No items available</p>
                    <Link
                      href="/items/new"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      + List an Item
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
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
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate text-sm">
                                {item.title}
                              </h4>
                              <p className="text-xs text-green-600">
                                ~{(item.estimatedValue || item.price || 0).toLocaleString()} EGP
                              </p>
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

                {/* Cash Offered */}
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    + Cash (EGP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={offeredCash || ''}
                    onChange={(e) => setOfferedCash(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Total Offered Value */}
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-semibold text-green-700">
                    Total Offer Value: {totalOfferedValue.toLocaleString()} EGP
                  </p>
                </div>
              </div>
            </div>

            {/* Right: What I Want */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  What I Want
                </h2>

                {/* Request Mode Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setRequestMode('select')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                      requestMode === 'select'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Select Items
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestMode('describe')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition ${
                      requestMode === 'describe'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Describe
                  </button>
                </div>

                {requestMode === 'select' ? (
                  <>
                    {/* Select Specific Items */}
                    {loadingAvailableItems ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : availableItems.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No items available</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
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
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-gray-900 truncate text-sm">
                                    {item.title}
                                  </h4>
                                  <p className="text-xs text-gray-500">
                                    {item.seller?.fullName}
                                  </p>
                                  <p className="text-xs text-green-600">
                                    ~{(item.estimatedValue || 0).toLocaleString()} EGP
                                  </p>
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
                  </>
                ) : (
                  <>
                    {/* Describe What You Want */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Describe what you're looking for
                      </label>
                      <textarea
                        value={requestDescription}
                        onChange={(e) => setRequestDescription(e.target.value)}
                        rows={4}
                        placeholder="Example: Looking for a gaming laptop with RTX 3060 or better, or a high-end smartphone like iPhone 13 or Samsung S22..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        AI will find matching items from available listings
                      </p>
                    </div>
                  </>
                )}

                {/* Cash Requested */}
                <div className="pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    + Cash (EGP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={requestedCash || ''}
                    onChange={(e) => setRequestedCash(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Total Requested Value */}
                {requestMode === 'select' && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-700">
                      Total Request Value: {totalRequestedValue.toLocaleString()} EGP
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fairness Indicator */}
          {requestMode === 'select' && (totalOfferedValue > 0 || totalRequestedValue > 0) && (
            <div className={`p-4 rounded-lg border-2 ${
              isBalanced
                ? 'bg-green-50 border-green-200'
                : valueDifference > 0
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Trade Balance</h3>
                  <p className="text-sm text-gray-600">
                    {isBalanced
                      ? 'This trade is balanced (within 20%)'
                      : valueDifference > 0
                        ? `You're offering ${valueDifference.toLocaleString()} EGP more`
                        : `You're requesting ${Math.abs(valueDifference).toLocaleString()} EGP more`
                    }
                  </p>
                </div>
                <div className={`text-2xl ${
                  isBalanced ? 'text-green-600' : valueDifference > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {isBalanced ? '✓' : valueDifference > 0 ? '↑' : '↓'}
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="bg-white rounded-lg shadow-sm p-6">
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
              disabled={loading}
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
