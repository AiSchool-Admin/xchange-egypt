'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  createBarterChain,
  SmartOpportunity,
} from '@/lib/api/barter';

export default function BarterOpportunitiesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [opportunities, setOpportunities] = useState<SmartOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadOpportunities();
    }
  }, [user]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      // Smart opportunities feature requires selecting specific items
      // For now, show empty state - users can discover opportunities via their items
      setOpportunities([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateChain = async (opportunity: SmartOpportunity) => {
    setActionLoading(opportunity.id);
    setError('');
    setSuccessMessage('');
    try {
      await createBarterChain(opportunity);
      setSuccessMessage('Barter chain initiated! All participants will be notified.');
      await loadOpportunities();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initiate chain');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Finding smart barter opportunities...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/barter"
            className="text-indigo-100 hover:text-white flex items-center gap-2 mb-4"
          >
            ← Back to Barter
          </Link>
          <h1 className="text-4xl font-bold">Smart Barter Opportunities</h1>
          <p className="text-indigo-100 mt-2">
            AI-discovered multi-party trade opportunities where everyone wins
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* How it Works */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-indigo-900 mb-3">How Smart Matching Works</h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔍</span>
              <div>
                <p className="font-medium text-indigo-900">1. We Analyze</p>
                <p className="text-indigo-700">Our AI scans all items and preferences to find matches</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔄</span>
              <div>
                <p className="font-medium text-indigo-900">2. We Connect</p>
                <p className="text-indigo-700">Multiple parties are linked in cycles or chains</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-medium text-indigo-900">3. Everyone Wins</p>
                <p className="text-indigo-700">Each person gives what they have and gets what they want</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}

        {opportunities.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found yet</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Our AI is constantly searching for multi-party barter opportunities.
              Add more items and preferences to increase your chances!
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/items/new"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
              >
                List an Item
              </Link>
              <Link
                href="/barter"
                className="border border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition font-semibold"
              >
                Browse Items
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {opportunities.map((opportunity) => (
              <div key={opportunity.id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Opportunity Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {opportunity.type === 'CYCLE' ? '🔄' : '⛓️'}
                      </span>
                      <h3 className="text-lg font-semibold">
                        {opportunity.type === 'CYCLE' ? 'Barter Cycle' : 'Barter Chain'}
                      </h3>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                        {opportunity.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {opportunity.participants.length} participants • Perfect value alignment
                    </p>
                  </div>
                </div>

                {/* Trade Flow Visualization */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Trade Flow:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {opportunity.participants.map((participant, index) => (
                      <React.Fragment key={participant.id}>
                        <div className={`flex flex-col gap-1 px-3 py-2 rounded-lg ${
                          participant.userId === user.id
                            ? 'bg-purple-100 border-2 border-purple-300'
                            : 'bg-white border border-gray-200'
                        }`}>
                          <p className="font-medium text-sm">
                            {participant.userId === user.id ? 'You' : participant.user.fullName}
                          </p>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex-1">
                              <p className="text-gray-500">Gives:</p>
                              <p className="font-medium truncate max-w-[120px]">
                                {participant.givingItem.title}
                              </p>
                              <p className="text-green-600">{participant.givingItem.estimatedValue?.toLocaleString()} EGP</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="flex-1">
                              <p className="text-gray-500">Gets:</p>
                              <p className="font-medium truncate max-w-[120px]">
                                {participant.receivingItem.title}
                              </p>
                              <p className="text-green-600">{participant.receivingItem.estimatedValue?.toLocaleString()} EGP</p>
                            </div>
                          </div>
                        </div>
                        {index < opportunity.participants.length - 1 && (
                          <span className="text-gray-400 text-xl">→</span>
                        )}
                      </React.Fragment>
                    ))}
                    {opportunity.type === 'CYCLE' && (
                      <span className="text-gray-400 text-xl">↩</span>
                    )}
                  </div>
                </div>

                {/* Value Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Total Value</p>
                    <p className="font-bold text-lg">
                      {opportunity.participants.reduce((sum, p) => sum + (p.givingItem.estimatedValue || 0), 0).toLocaleString()} EGP
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Your Item Value</p>
                    <p className="font-bold text-lg">
                      {opportunity.participants.find(p => p.userId === user.id)?.givingItem.estimatedValue?.toLocaleString() || 0} EGP
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">You'll Receive</p>
                    <p className="font-bold text-lg">
                      {opportunity.participants.find(p => p.userId === user.id)?.receivingItem.estimatedValue?.toLocaleString() || 0} EGP
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-500">Your Benefit</p>
                    <p className="font-bold text-lg text-green-600">
                      +{(
                        (opportunity.participants.find(p => p.userId === user.id)?.receivingItem.estimatedValue || 0) -
                        (opportunity.participants.find(p => p.userId === user.id)?.givingItem.estimatedValue || 0)
                      ).toLocaleString()} EGP
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleInitiateChain(opportunity)}
                    disabled={actionLoading === opportunity.id}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                  >
                    {actionLoading === opportunity.id ? 'Initiating...' : 'Initiate This Trade'}
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Want to see more opportunities? Add items with detailed preferences!
          </p>
          <Link
            href="/barter/chains"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            View My Active Chains →
          </Link>
        </div>
      </div>
    </div>
  );
}
