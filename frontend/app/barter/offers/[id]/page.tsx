'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getBarterOffer,
  acceptBarterOffer,
  rejectBarterOffer,
  cancelBarterOffer,
  completeBarterExchange,
  BarterOffer,
} from '@/lib/api/barter';

export default function BarterOfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [offer, setOffer] = useState<BarterOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      loadOffer(params.id as string);
    }
  }, [user, params.id]);

  const loadOffer = async (id: string) => {
    try {
      setLoading(true);
      const response = await getBarterOffer(id);
      setOffer(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load offer');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!offer) return;
    setActionLoading(true);
    setError('');
    try {
      const response = await acceptBarterOffer(offer.id);
      setOffer(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept offer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!offer) return;
    setActionLoading(true);
    setError('');
    try {
      const response = await rejectBarterOffer(offer.id, rejectReason);
      setOffer(response.data);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject offer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!offer) return;
    setActionLoading(true);
    setError('');
    try {
      const response = await cancelBarterOffer(offer.id);
      setOffer(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel offer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!offer) return;
    setActionLoading(true);
    setError('');
    try {
      const response = await completeBarterExchange(offer.id);
      setOffer(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete exchange');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'REJECTED':
      case 'CANCELLED':
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'COUNTER_OFFERED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading offer...</p>
        </div>
      </div>
    );
  }

  if (!user || !offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Offer not found'}</p>
          <Link href="/barter/my-offers" className="mt-4 text-purple-600 hover:text-purple-700">
            Back to My Offers
          </Link>
        </div>
      </div>
    );
  }

  const isInitiator = offer.initiatorId === user.id;
  const isRecipient = offer.recipientId === user.id || offer.isOpenOffer;
  const otherParty = isInitiator ? offer.recipient : offer.initiator;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/barter/my-offers" className="text-purple-600 hover:text-purple-700">
            ← Back to My Offers
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">Barter Offer</h1>
              <p className="text-gray-600 text-sm mt-1">ID: {offer.id.slice(0, 8)}...</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(offer.status)}`}>
                {offer.status}
              </span>
              <p className="text-sm text-gray-500 mt-1">
                {isInitiator ? 'You sent this offer' : 'You received this offer'}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Items Being Offered */}
          <div className="mb-6">
            <h2 className="font-semibold mb-3 text-lg">
              {isInitiator ? 'Items You Offered' : 'Items Being Offered to You'}
            </h2>
            <div className="border rounded-lg p-4 bg-blue-50">
              {offer.offeredItems && offer.offeredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {offer.offeredItems.map((item) => (
                    <div key={item.id} className="flex gap-3 bg-white p-3 rounded-lg">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xl">📦</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.condition?.replace('_', ' ')}</p>
                        <p className="text-sm font-semibold text-purple-600">
                          {item.estimatedValue?.toLocaleString()} EGP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No items data available</p>
              )}
              <p className="mt-3 text-right font-semibold">
                Total Value: {offer.offeredBundleValue?.toLocaleString()} EGP
              </p>
            </div>
          </div>

          {/* Items Wanted */}
          <div className="mb-6">
            <h2 className="font-semibold mb-3 text-lg">
              {isInitiator ? 'Items You Want' : 'Items They Want From You'}
            </h2>
            <div className="border rounded-lg p-4 bg-green-50">
              {offer.preferenceSets && offer.preferenceSets.length > 0 ? (
                offer.preferenceSets.map((prefSet, index) => (
                  <div key={prefSet.id || index} className="mb-4 last:mb-0">
                    {offer.preferenceSets!.length > 1 && (
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        Option {prefSet.priority}:
                        {prefSet.isBalanced ? ' (Balanced)' : ` (Difference: ${prefSet.valueDifference} EGP)`}
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {prefSet.items?.map((item) => (
                        <div key={item.id} className="flex gap-3 bg-white p-3 rounded-lg">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0].url}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xl">📦</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.title}</p>
                            <p className="text-sm text-gray-600">{item.condition?.replace('_', ' ')}</p>
                            <p className="text-sm font-semibold text-purple-600">
                              {item.estimatedValue?.toLocaleString()} EGP
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-right text-sm">
                      Set Value: {prefSet.totalValue?.toLocaleString()} EGP
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No preference sets available</p>
              )}
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Offer From</p>
              <p className="font-semibold">{offer.initiator.fullName}</p>
              <p className="text-sm text-gray-600">{offer.initiator.email}</p>
              {offer.initiator.phone && (
                <p className="text-sm text-gray-600">{offer.initiator.phone}</p>
              )}
            </div>
            {offer.recipient && (
              <div className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Offer To</p>
                <p className="font-semibold">{offer.recipient.fullName}</p>
                <p className="text-sm text-gray-600">{offer.recipient.email}</p>
                {offer.recipient.phone && (
                  <p className="text-sm text-gray-600">{offer.recipient.phone}</p>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {offer.notes && (
            <div className="border rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Notes</p>
              <p>{offer.notes}</p>
            </div>
          )}

          {/* Dates */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">{formatDate(offer.createdAt)}</p>
              </div>
              {offer.expiresAt && (
                <div>
                  <p className="text-gray-600">Expires</p>
                  <p className="font-medium">{formatDate(offer.expiresAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-6">
            <h2 className="font-semibold mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {/* Recipient can accept/reject pending offers */}
              {!isInitiator && offer.status === 'PENDING' && (
                <>
                  <button
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                  >
                    {actionLoading ? 'Processing...' : 'Accept Offer'}
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                  >
                    Reject Offer
                  </button>
                  <Link
                    href={`/barter/new?counterId=${offer.id}`}
                    className="border border-purple-600 text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 font-medium"
                  >
                    Counter Offer
                  </Link>
                </>
              )}

              {/* Initiator can cancel pending offers */}
              {isInitiator && offer.status === 'PENDING' && (
                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="border border-red-600 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50 font-medium"
                >
                  {actionLoading ? 'Processing...' : 'Cancel Offer'}
                </button>
              )}

              {/* Both parties can complete accepted offers */}
              {offer.status === 'ACCEPTED' && (
                <button
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Exchange Complete'}
                </button>
              )}

              {/* Status messages */}
              {offer.status === 'COMPLETED' && (
                <p className="text-green-600 font-medium py-2">
                  Exchange completed successfully!
                </p>
              )}
              {offer.status === 'REJECTED' && (
                <p className="text-red-600 font-medium py-2">
                  This offer was rejected
                </p>
              )}
              {offer.status === 'CANCELLED' && (
                <p className="text-gray-600 font-medium py-2">
                  This offer was cancelled
                </p>
              )}
              {offer.status === 'EXPIRED' && (
                <p className="text-gray-600 font-medium py-2">
                  This offer has expired
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Offer</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Tell them why you're rejecting..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
