'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMyItems } from '@/lib/api/items';
import { discoverChainOpportunities, createChainProposal, getChainProposals } from '@/lib/api/barter';

interface Item {
  id: string;
  title: string;
  estimatedValue?: number;
  images: Array<{ url: string; isPrimary: boolean }>;
}

interface ChainOpportunity {
  opportunityId: string;
  type: string;
  participantCount: number;
  participants: string[];
  participantNames: string[];
  exchangeSequence: Array<{
    from: string;
    fromName: string;
    to: string;
    toName: string;
    itemOffered: string;
    itemOfferedTitle: string;
    itemValue: number;
  }>;
  totalAggregateMatchScore: number;
  averageMatchScore: number;
  requiredCashDifferential: number;
  isOptimal: boolean;
}

interface ChainProposal {
  id: string;
  status: string;
  participants: Array<{
    userId: string;
    itemId: string;
    status: string;
    user: { fullName: string };
    item: { title: string };
  }>;
  createdAt: string;
}

export default function ChainsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [opportunities, setOpportunities] = useState<ChainOpportunity[]>([]);
  const [proposals, setProposals] = useState<ChainProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

      // Load items first
      const itemsResponse = await getMyItems();
      const items = itemsResponse?.data?.items || [];
      setMyItems(items.filter((item: any) => item.status === 'ACTIVE'));

      // Try to load proposals (may not exist yet)
      try {
        const proposalsResponse = await getChainProposals();
        // Handle different response structures
        const proposalsData = proposalsResponse?.data?.chains ||
                             proposalsResponse?.data?.proposals ||
                             proposalsResponse?.data ||
                             [];
        setProposals(Array.isArray(proposalsData) ? proposalsData : []);
      } catch (proposalErr) {
        // Proposals endpoint may not exist, that's ok
        console.log('Chain proposals not available yet');
        setProposals([]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load items');
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
      setOpportunities([]);
      const response = await discoverChainOpportunities(selectedItem);
      // Handle different response structures
      const opportunitiesData = response?.data?.opportunities ||
                               response?.data?.cycles ||
                               response?.data ||
                               [];
      let opps = Array.isArray(opportunitiesData) ? opportunitiesData : [];

      // Filter and rank opportunities
      opps = opps
        // Filter: Only show high-quality matches (>= 50% score)
        .filter(opp => (opp.averageMatchScore || 0) >= 0.50)
        // Filter: Value-balanced cycles (cash differential < 30% of average value)
        .filter(opp => {
          if (!opp.exchangeSequence || opp.exchangeSequence.length === 0) return false;
          const avgValue = opp.exchangeSequence.reduce((sum: number, e) => sum + e.itemValue, 0) / opp.exchangeSequence.length;
          return opp.requiredCashDifferential < (avgValue * 0.3);
        })
        // Sort by match score (highest first)
        .sort((a, b) => (b.averageMatchScore || 0) - (a.averageMatchScore || 0))
        // Limit to top 5 opportunities
        .slice(0, 5);

      setOpportunities(opps);
      if (opps.length === 0) {
        setError('No high-quality chain opportunities found. Try specifying your barter preferences when creating items.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to discover opportunities');
    } finally {
      setDiscovering(false);
    }
  };

  const handleCreateProposal = async (opportunity: ChainOpportunity) => {
    try {
      setCreating(true);
      setError('');
      await createChainProposal({
        participantItemIds: opportunity.exchangeSequence?.map(e => e.itemOffered) || [],
      });
      setSuccess('Proposal created! Participants have been notified.');
      setOpportunities([]);
      loadData();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create proposal');
    } finally {
      setCreating(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
            href="/barter"
            className="text-purple-100 hover:text-white flex items-center gap-2 mb-4"
          >
            ← Back to Barter
          </Link>
          <h1 className="text-3xl font-bold">🔗 Smart Multi-Party Trades</h1>
          <p className="text-purple-100 mt-2">
            Discover chain opportunities where A→B→C→...→A can trade in a cycle
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Discover Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Discover Chain Opportunities</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select one of your items to find matching chains
            </label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Select an item...</option>
              {myItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} (~{item.estimatedValue?.toLocaleString() || 0} EGP)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDiscover}
            disabled={!selectedItem || discovering}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {discovering ? 'Searching...' : '🔍 Find Chain Opportunities'}
          </button>
        </div>

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Found {opportunities.length} Opportunities
            </h2>

            <div className="space-y-4">
              {opportunities.map((opp, index) => (
                <div key={opp.opportunityId || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {opp.type || `${opp.participantCount}-Party Chain`}
                    </h3>
                    <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                      {Math.round((opp.averageMatchScore || 0) * 100)}% match
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {(opp.exchangeSequence || []).map((exchange, i) => (
                        <React.Fragment key={exchange.itemOffered || i}>
                          <div className="bg-gray-100 px-3 py-2 rounded text-sm">
                            <p className="font-medium">{exchange.fromName || 'Unknown'}</p>
                            <p className="text-gray-600 text-xs">{exchange.itemOfferedTitle || 'Item'}</p>
                            <p className="text-purple-600 text-xs">{(exchange.itemValue || 0).toLocaleString()} EGP</p>
                          </div>
                          {i < (opp.exchangeSequence?.length || 0) - 1 && (
                            <span className="text-purple-600">→</span>
                          )}
                        </React.Fragment>
                      ))}
                      <span className="text-purple-600">→</span>
                      <span className="text-sm text-gray-500">(back to first)</span>
                    </div>
                  </div>

                  {opp.requiredCashDifferential > 0 && (
                    <p className="text-sm text-orange-600 mb-3">
                      💰 Cash differential: {opp.requiredCashDifferential.toLocaleString()} EGP
                    </p>
                  )}

                  <button
                    onClick={() => handleCreateProposal(opp)}
                    disabled={creating}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
                  >
                    {creating ? 'Creating...' : '✅ Create Proposal & Notify All'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Proposals */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Chain Proposals</h2>

          {proposals.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No chain proposals yet. Discover opportunities above!
            </p>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {(proposal.participants?.length || 0)}-Party Chain
                      </h3>
                      <p className="text-sm text-gray-600">
                        Created {new Date(proposal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded ${
                      proposal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      proposal.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                      proposal.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {(proposal.participants || []).map((p) => (
                      <div key={p.userId} className="flex items-center justify-between text-sm">
                        <span>{p.user?.fullName || 'Unknown'}: {p.item?.title || 'Item'}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          p.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                          p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {p.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
