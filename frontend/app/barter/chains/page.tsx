'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getMyBarterChains,
  getPendingChainProposals,
  respondToChainProposal,
  executeBarterChain,
  BarterChain,
} from '@/lib/api/barter';

export default function BarterChainsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [myChains, setMyChains] = useState<BarterChain[]>([]);
  const [pendingProposals, setPendingProposals] = useState<BarterChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadChains();
    }
  }, [user]);

  const loadChains = async () => {
    try {
      setLoading(true);
      const [chainsRes, proposalsRes] = await Promise.all([
        getMyBarterChains(),
        getPendingChainProposals(),
      ]);
      setMyChains(chainsRes.data.chains || []);
      setPendingProposals(proposalsRes.data.chains || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load chains');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (chainId: string, accept: boolean) => {
    setActionLoading(chainId);
    setError('');
    try {
      await respondToChainProposal(chainId, accept);
      await loadChains();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to respond');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecute = async (chainId: string) => {
    setActionLoading(chainId);
    setError('');
    try {
      await executeBarterChain(chainId);
      await loadChains();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to execute chain');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROPOSED':
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading chains...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const allChains = [...myChains, ...pendingProposals].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const displayChains = filter === 'pending'
    ? pendingProposals
    : filter === 'active'
    ? myChains.filter(c => ['PENDING', 'ACCEPTED'].includes(c.status))
    : allChains;

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
          <h1 className="text-4xl font-bold">Smart Barter Chains</h1>
          <p className="text-purple-100 mt-2">
            Multi-party barter exchanges where everyone gets what they want
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Card */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-purple-900 mb-2">How Smart Barter Works</h2>
          <p className="text-sm text-purple-800 mb-3">
            Our system automatically finds multi-party trade opportunities where everyone benefits.
            For example: You have A and want B, someone has B and wants C, and another has C and wants A.
            We connect all three for a perfect trade!
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="text-purple-600">🔄</span> Cycle: Circular trades (A→B→C→A)
            </span>
            <span className="flex items-center gap-1">
              <span className="text-indigo-600">⛓️</span> Chain: Linear trades (A→B→C→D)
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({allChains.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Needs Response ({pendingProposals.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'active'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {displayChains.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">⛓️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No barter chains yet</h2>
            <p className="text-gray-500 mb-6">
              {filter === 'pending'
                ? 'No proposals waiting for your response'
                : 'Smart barter opportunities will appear here when matches are found'}
            </p>
            <Link
              href="/barter"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              Browse Barter Items
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayChains.map((chain) => {
              const myParticipation = chain.participants.find(p => p.userId === user.id);
              const needsResponse = pendingProposals.some(p => p.id === chain.id);
              const allAccepted = chain.participants.every(p => p.status === 'ACCEPTED');

              return (
                <div key={chain.id} className="bg-white rounded-lg shadow-sm p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {chain.chainType === 'CYCLE' ? '🔄' : '⛓️'}
                        </span>
                        <h3 className="text-lg font-semibold">
                          {chain.chainType === 'CYCLE' ? 'Barter Cycle' : 'Barter Chain'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(chain.status)}`}>
                          {chain.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {chain.participantCount} participants • Score: {chain.matchScore}%
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Expires: {formatDate(chain.expiresAt)}
                    </p>
                  </div>

                  {/* Participants Flow */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Trade Flow:</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {chain.participants.map((participant, index) => (
                        <React.Fragment key={participant.id}>
                          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            participant.userId === user.id
                              ? 'bg-purple-100 border-2 border-purple-300'
                              : 'bg-white border border-gray-200'
                          }`}>
                            <div className="text-sm">
                              <p className="font-medium">
                                {participant.userId === user.id ? 'You' : participant.user.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Gives: {participant.givingItem?.title?.slice(0, 20)}...
                              </p>
                              <p className="text-xs text-gray-500">
                                Gets: {participant.receivingItem?.title?.slice(0, 20)}...
                              </p>
                              <span className={`text-xs px-1 rounded ${
                                participant.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                participant.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {participant.status}
                              </span>
                            </div>
                          </div>
                          {index < chain.participants.length - 1 && (
                            <span className="text-gray-400 text-xl">→</span>
                          )}
                        </React.Fragment>
                      ))}
                      {chain.chainType === 'CYCLE' && (
                        <span className="text-gray-400 text-xl">↩</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {needsResponse && myParticipation?.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleRespond(chain.id, true)}
                          disabled={actionLoading === chain.id}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                        >
                          {actionLoading === chain.id ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleRespond(chain.id, false)}
                          disabled={actionLoading === chain.id}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {allAccepted && chain.status === 'ACCEPTED' && (
                      <button
                        onClick={() => handleExecute(chain.id)}
                        disabled={actionLoading === chain.id}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                      >
                        {actionLoading === chain.id ? 'Processing...' : 'Execute Trade'}
                      </button>
                    )}

                    {chain.status === 'COMPLETED' && (
                      <p className="text-green-600 font-medium py-2">
                        Trade completed successfully!
                      </p>
                    )}

                    {myParticipation?.status === 'ACCEPTED' && !allAccepted && (
                      <p className="text-yellow-600 text-sm py-2">
                        Waiting for other participants to accept...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
