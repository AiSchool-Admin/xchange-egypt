'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createAuction } from '@/lib/api/auctions';
import { getMyItems } from '@/lib/api/items';
import { useAuth } from '@/lib/contexts/AuthContext';

interface MyItem {
  id: string;
  title: string;
  description: string;
  price?: number;
  images: Array<{ url: string; isPrimary: boolean }>;
  category: { name: string };
}

export default function CreateAuctionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myItems, setMyItems] = useState<MyItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const [formData, setFormData] = useState({
    itemId: '',
    startingPrice: '',
    reservePrice: '',
    buyNowPrice: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadMyItems();
  }, [user]);

  const loadMyItems = async () => {
    try {
      setLoadingItems(true);
      const response = await getMyItems();
      // Filter to only show available items (not already in auction)
      const availableItems = response.data.items.filter(
        (item: any) => item.status === 'AVAILABLE'
      );
      setMyItems(availableItems);
    } catch (err: any) {
      console.error('Failed to load items:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate dates
      const now = new Date();
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);

      if (startTime < now) {
        throw new Error('Start time must be in the future');
      }

      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }

      const auctionData = {
        itemId: formData.itemId,
        startingPrice: parseFloat(formData.startingPrice),
        reservePrice: formData.reservePrice
          ? parseFloat(formData.reservePrice)
          : undefined,
        buyNowPrice: formData.buyNowPrice
          ? parseFloat(formData.buyNowPrice)
          : undefined,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      const response = await createAuction(auctionData);
      router.push(`/auctions/${response.data.id}`);
    } catch (err: any) {
      setError(err.message || err.response?.data?.message || 'Failed to create auction');
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = myItems.find((item) => item.id === formData.itemId);

  // Set default dates
  useEffect(() => {
    if (!formData.startTime) {
      const now = new Date();
      now.setHours(now.getHours() + 1); // Start 1 hour from now
      const start = now.toISOString().slice(0, 16);

      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 7); // End 7 days later
      const end = endDate.toISOString().slice(0, 16);

      setFormData((prev) => ({
        ...prev,
        startTime: start,
        endTime: end,
      }));
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/auctions"
            className="text-purple-100 hover:text-white flex items-center gap-2 mb-4"
          >
            ← Back to Auctions
          </Link>
          <h1 className="text-4xl font-bold">🔨 Start an Auction</h1>
          <p className="text-purple-100 mt-2">
            Sell your items through live bidding
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {loadingItems ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Loading your items...</p>
            </div>
          ) : myItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                You don't have any available items to auction
              </p>
              <Link
                href="/items/new"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
              >
                + List an Item First
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Item */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Item to Auction *
                </label>
                <select
                  value={formData.itemId}
                  onChange={(e) =>
                    setFormData({ ...formData, itemId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Choose an item...</option>
                  {myItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.category.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Preview */}
              {selectedItem && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex gap-4">
                    {selectedItem.images && selectedItem.images.length > 0 && (
                      <img
                        src={
                          selectedItem.images.find((img) => img.isPrimary)?.url ||
                          selectedItem.images[0]?.url
                        }
                        alt={selectedItem.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {selectedItem.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {selectedItem.description}
                      </p>
                      {selectedItem.price && (
                        <p className="text-sm text-purple-600 mt-1">
                          Listed at: {selectedItem.price.toLocaleString()} EGP
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Starting Price (EGP) *
                  </label>
                  <input
                    type="number"
                    value={formData.startingPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, startingPrice: e.target.value })
                    }
                    min="1"
                    step="0.01"
                    required
                    placeholder="100.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum bid to start
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reserve Price (EGP)
                  </label>
                  <input
                    type="number"
                    value={formData.reservePrice}
                    onChange={(e) =>
                      setFormData({ ...formData, reservePrice: e.target.value })
                    }
                    min="1"
                    step="0.01"
                    placeholder="500.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional minimum sale price
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buy Now Price (EGP)
                  </label>
                  <input
                    type="number"
                    value={formData.buyNowPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, buyNowPrice: e.target.value })
                    }
                    min="1"
                    step="0.01"
                    placeholder="1000.00"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional instant purchase price
                  </p>
                </div>
              </div>

              {/* Timing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When bidding begins
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    When bidding ends
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Auction Tips
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Set a competitive starting price to attract bidders</li>
                  <li>• Reserve price protects you from selling too low</li>
                  <li>• Buy Now option allows instant sales at your price</li>
                  <li>• Typical auction duration is 3-7 days</li>
                  <li>• You cannot edit or cancel once bidding starts</li>
                </ul>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.push('/auctions')}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Auction...' : 'Start Auction'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
