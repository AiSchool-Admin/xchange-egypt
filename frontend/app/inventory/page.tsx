'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getInventory, getInventoryStats, InventoryItem, InventoryStats } from '@/lib/api/inventory';

export default function InventoryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'SUPPLY' | 'DEMAND'>('SUPPLY');
  const [supplyItems, setSupplyItems] = useState<InventoryItem[]>([]);
  const [demandItems, setDemandItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ supply: 0, demand: 0, matched: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadInventory();
    }
  }, [user]);

  const loadInventory = async () => {
    try {
      setIsLoading(true);

      // Fetch inventory items and stats in parallel
      const [inventoryResponse, statsResponse] = await Promise.all([
        getInventory({ limit: 50 }),
        getInventoryStats(),
      ]);

      // Separate supply and demand items
      const items = inventoryResponse.data.items || [];
      setSupplyItems(items.filter(item => item.side === 'SUPPLY'));
      setDemandItems(items.filter(item => item.side === 'DEMAND'));
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      // Set empty arrays on error
      setSupplyItems([]);
      setDemandItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your inventory...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'GOODS': return '📦';
      case 'SERVICES': return '🛠️';
      case 'CASH': return '💰';
      default: return '📋';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>;
      case 'PENDING':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>;
      case 'MATCHED':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Matched!</span>;
      case 'COMPLETED':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Completed</span>;
      default:
        return null;
    }
  };

  const currentItems = activeTab === 'SUPPLY' ? supplyItems : demandItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Inventory</h1>
              <p className="text-purple-100">Manage what you have and what you need</p>
            </div>
            <Link
              href="/inventory/add"
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="text-xl">+</span>
              Add Item
            </Link>
          </div>

          {/* Tab Selector */}
          <div className="flex gap-2 bg-white/10 rounded-xl p-1.5">
            <button
              onClick={() => setActiveTab('SUPPLY')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'SUPPLY'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xl mr-2">📤</span>
              Supply
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-sm">
                {supplyItems.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('DEMAND')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'DEMAND'
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xl mr-2">📥</span>
              Demand
              <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-sm">
                {demandItems.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Empty State */}
        {currentItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">
              {activeTab === 'SUPPLY' ? '📤' : '📥'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {activeTab === 'SUPPLY'
                ? "What do you have to offer?"
                : "What are you looking for?"}
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {activeTab === 'SUPPLY'
                ? "Add goods, services, or even cash you want to sell, auction, or trade."
                : "Tell us what you need and we'll find the best matches for you."}
            </p>

            {/* Quick Add Cards */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Link
                href={`/inventory/add?side=${activeTab.toLowerCase()}&type=goods`}
                className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-purple-300"
              >
                <div className="text-4xl mb-3">📦</div>
                <div className="font-bold text-gray-800">Goods</div>
                <div className="text-sm text-gray-500">Physical items</div>
              </Link>
              <Link
                href={`/inventory/add?side=${activeTab.toLowerCase()}&type=services`}
                className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-indigo-300"
              >
                <div className="text-4xl mb-3">🛠️</div>
                <div className="font-bold text-gray-800">Services</div>
                <div className="text-sm text-gray-500">Skills & work</div>
              </Link>
              <Link
                href={`/inventory/add?side=${activeTab.toLowerCase()}&type=cash`}
                className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-green-300"
              >
                <div className="text-4xl mb-3">💰</div>
                <div className="font-bold text-gray-800">Cash</div>
                <div className="text-sm text-gray-500">Money exchange</div>
              </Link>
            </div>
          </div>
        ) : (
          /* Items Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentItems.map((item) => (
              <Link
                key={item.id}
                href={`/inventory/${item.id}`}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden"
              >
                {item.images && item.images.length > 0 ? (
                  <div className="aspect-video bg-gray-100">
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-5xl">{getTypeIcon(item.type)}</span>
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 line-clamp-1">{item.title}</h3>
                    {getStatusBadge(item.status)}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{getTypeIcon(item.type)} {item.type}</span>
                    <span className="font-bold text-purple-600">EGP {item.estimatedValue.toLocaleString()}</span>
                  </div>
                  {item.matchCount && item.matchCount > 0 && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg text-center">
                      <span className="text-green-600 font-medium text-sm">
                        🎯 {item.matchCount} potential match{item.matchCount > 1 ? 'es' : ''}!
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}

            {/* Add More Card */}
            <Link
              href={`/inventory/add?side=${activeTab.toLowerCase()}`}
              className="bg-white/50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all flex items-center justify-center min-h-[200px]"
            >
              <div className="text-center">
                <div className="text-4xl text-gray-400 mb-2">+</div>
                <div className="font-medium text-gray-500">Add {activeTab === 'SUPPLY' ? 'to Supply' : 'to Demand'}</div>
              </div>
            </Link>
          </div>
        )}

        {/* How It Works Section */}
        <div className="mt-16 bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
            How {activeTab === 'SUPPLY' ? 'Selling' : 'Buying'} Works
          </h2>

          {activeTab === 'SUPPLY' ? (
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏷️</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Direct Sale</h3>
                <p className="text-gray-600 text-sm">Set your price and sell instantly. Buyers purchase at your fixed price.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔨</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Auction</h3>
                <p className="text-gray-600 text-sm">Let buyers bid! Get the best price through competitive bidding.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔄</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Barter</h3>
                <p className="text-gray-600 text-sm">Trade for what you need! Our AI finds perfect exchange matches.</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🛒</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Direct Buy</h3>
                <p className="text-gray-600 text-sm">Tell us what you need and we'll show you available items to purchase.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📢</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Reverse Auction</h3>
                <p className="text-gray-600 text-sm">Post what you need and let sellers compete to offer you the best price!</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-purple-600">{stats.supply}</div>
            <div className="text-sm text-gray-600">Items for Sale</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-indigo-600">{stats.demand}</div>
            <div className="text-sm text-gray-600">Want to Buy</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-green-600">{stats.matched}</div>
            <div className="text-sm text-gray-600">Active Matches</div>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl font-bold text-orange-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
