'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuctions, Auction } from '@/lib/api/auctions';
import { getCategories, Category } from '@/lib/api/categories';

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
        const seconds = Math.floor((difference / 1000) % 60);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
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

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [page, selectedStatus, selectedCategory, minPrice, maxPrice]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const response = await getAuctions({
        page,
        limit: 12,
        status: selectedStatus || undefined,
        categoryId: selectedCategory || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      });

      setAuctions(response.data.auctions);
      setTotalPages(response.data.pagination.totalPages || response.data.pagination.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedStatus('ACTIVE');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">🔨 Live Auctions</h1>
              <p className="text-purple-100 mt-2">Bid on items and win great deals!</p>
            </div>
            <Link
              href="/auctions/new"
              className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition font-semibold shadow-lg"
            >
              + Start Auction
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Clear All
                </button>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Starting Soon</option>
                  <option value="ENDED">Ended</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Price (EGP)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Auctions Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">Loading auctions...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadAuctions}
                  className="mt-4 text-purple-600 hover:text-purple-700"
                >
                  Try Again
                </button>
              </div>
            ) : auctions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">No auctions found</p>
                <p className="text-gray-500 mt-2">Be the first to start an auction!</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {auctions.map((auction) => {
                    const item = auction.listing?.item || auction.item;
                    const primaryImage = item?.images?.find((img) => img.isPrimary)?.url ||
                                       item?.images?.[0]?.url;
                    const isEnded = new Date(auction.endTime) < new Date();
                    const hasStarted = new Date(auction.startTime) < new Date();

                    return (
                      <Link
                        key={auction.id}
                        href={`/auctions/${auction.id}`}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group"
                      >
                        {/* Image */}
                        <div className="relative h-48 bg-gray-200">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={item?.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-4xl">🔨</span>
                            </div>
                          )}

                          {/* Status Badge */}
                          <div className="absolute top-2 right-2">
                            {isEnded ? (
                              <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                Ended
                              </span>
                            ) : !hasStarted ? (
                              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                Starting Soon
                              </span>
                            ) : (
                              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                                • Live
                              </span>
                            )}
                          </div>

                          {/* Countdown */}
                          {!isEnded && hasStarted && (
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-semibold">
                              ⏰ <CountdownTimer endTime={auction.endTime} />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition">
                            {item?.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                            {item?.description}
                          </p>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Current Bid:</span>
                              <span className="text-lg font-bold text-purple-600">
                                {auction.currentPrice.toLocaleString()} EGP
                              </span>
                            </div>

                            {auction.buyNowPrice && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Buy Now:</span>
                                <span className="font-semibold text-green-600">
                                  {auction.buyNowPrice.toLocaleString()} EGP
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>{(auction.totalBids || auction.bidCount || 0)} bid{(auction.totalBids || auction.bidCount || 0) !== 1 ? 's' : ''}</span>
                              <span>{item?.category?.nameEn}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2 rounded-lg ${
                              page === pageNum
                                ? 'bg-purple-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
