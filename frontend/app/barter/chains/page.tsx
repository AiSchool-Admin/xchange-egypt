'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getMyBarterChains,
  getPendingChainProposals,
  discoverChainOpportunities,
  createSmartProposal,
  respondToChain,
} from '@/lib/api/barter';
import { getMyItems } from '@/lib/api/items';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function BarterChainsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [myChains, setMyChains] = useState<any[]>([]);
  const [pendingProposals, setPendingProposals] = useState<any[]>([]);
  const [myItems, setMyItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [opportunities, setOpportunities] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [chainsRes, proposalsRes, itemsRes] = await Promise.all([
        getMyBarterChains().catch(() => ({ data: { items: [] } })),
        getPendingChainProposals().catch(() => ({ data: { items: [] } })),
        getMyItems(),
      ]);
      setMyChains(chainsRes.data?.items || []);
      setPendingProposals(proposalsRes.data?.items || []);
      setMyItems(itemsRes.data.items.filter((item: any) => item.status === 'ACTIVE'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscover = async () => {
    if (!selectedItem) {
      setError('Please select an item first');
      return;
    }

    try {
      setDiscovering(true);
      setError('');
      const response = await discoverChainOpportunities(selectedItem);
      setOpportunities(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to discover opportunities');
    } finally {
      setDiscovering(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!selectedItem) {
      setError('Please select an item first');
      return;
    }

    try {
      setCreating(true);
      setError('');
      await createSmartProposal(selectedItem);
      await loadData();
      setOpportunities(null);
      setSelectedItem('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create proposal');
    } finally {
      setCreating(false);
    }
  };

  const handleRespond = async (chainId: string, accept: boolean) => {
    try {
      await respondToChain(chainId, accept);
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to respond');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/barter" className="text-indigo-100 hover:text-white flex items-center gap-2 mb-4">
            ← Back to Barter
          </Link>
          <h1 className="text-4xl font-bold">Smart Multi-Party Trades</h1>
          <p className="text-indigo-100 mt-2">
            AI finds circular trades: A→B→C→A where everyone benefits
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Discover Opportunities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Discover Chain Opportunities
              </h2>

              <div className="flex gap-4 mb-4">
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select your item...</option>
                  {myItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} (~{item.estimatedValue?.toLocaleString()} EGP)
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDiscover}
                  disabled={!selectedItem || discovering}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {discovering ? 'Searching...' : 'Find Matches'}
                </button>
              </div>

              {opportunities && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-semibold text-indigo-900 mb-2">
                    Found {opportunities.opportunities?.total || 0} opportunities
                  </h3>

                  {opportunities.opportunities?.cycles?.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-indigo-700 mb-2">
                        Cycles (everyone trades): {opportunities.opportunities.cycles.length}
                      </p>
                      {opportunities.opportunities.cycles.slice(0, 3).map((cycle: any, i: number) => (
                        <div key={i} className="text-xs text-gray-600 mb-1">
                          {cycle.participants} participants • Score: {cycle.matchScore}
                        </div>
                      ))}
                    </div>
                  )}

                  {opportunities.opportunities?.total > 0 && (
                    <button
                      onClick={handleCreateProposal}
                      disabled={creating}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {creating ? 'Creating...' : 'Create Best Proposal'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Pending Proposals */}
            {pendingProposals.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Pending Proposals ({pendingProposals.length})
                </h2>
                <div className="space-y-4">
                  {pendingProposals.map((chain) => (
                    <div key={chain.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {chain.participants?.length || 0}-Party Trade
                          </p>
                          <p className="text-sm text-gray-600">
                            Created: {new Date(chain.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          {chain.status}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleRespond(chain.id, true)}
                          className="px-4 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespond(chain.id, false)}
                          className="px-4 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Chains */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                My Chains ({myChains.length})
              </h2>

              {myChains.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No active chains yet. Discover opportunities above!
                </p>
              ) : (
                <div className="space-y-4">
                  {myChains.map((chain) => (
                    <div key={chain.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {chain.participants?.length || 0}-Party Trade
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(chain.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          chain.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          chain.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {chain.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
