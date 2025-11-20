'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getTransaction,
  confirmPayment,
  markAsShipped,
  markAsDelivered,
  cancelTransaction,
  Transaction,
} from '@/lib/api/transactions';

export default function TransactionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && params.id) {
      loadTransaction(params.id as string);
    }
  }, [user, params.id]);

  const loadTransaction = async (id: string) => {
    try {
      setLoading(true);
      const response = await getTransaction(id);
      setTransaction(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!transaction) return;
    setActionLoading(true);
    try {
      const response = await confirmPayment(transaction.id);
      setTransaction(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsShipped = async () => {
    if (!transaction) return;
    setActionLoading(true);
    try {
      const response = await markAsShipped(transaction.id, trackingNumber || undefined);
      setTransaction(response.data);
      setShowShipModal(false);
      setTrackingNumber('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as shipped');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!transaction) return;
    setActionLoading(true);
    try {
      const response = await markAsDelivered(transaction.id);
      setTransaction(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to confirm delivery');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!transaction || !cancelReason) return;
    setActionLoading(true);
    try {
      const response = await cancelTransaction(transaction.id, cancelReason);
      setTransaction(response.data);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel transaction');
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
      case 'FAILED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'RETURNED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (!user || !transaction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Transaction not found'}</p>
          <Link href="/transactions" className="mt-4 text-purple-600 hover:text-purple-700">
            Back to Transactions
          </Link>
        </div>
      </div>
    );
  }

  const isBuyer = transaction.buyerId === user.id;
  const isSeller = transaction.sellerId === user.id;
  const item = transaction.listing?.item;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/transactions" className="text-purple-600 hover:text-purple-700">
            ← Back to Transactions
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">Transaction Details</h1>
              <p className="text-gray-600 text-sm mt-1">ID: {transaction.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isBuyer ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
              {isBuyer ? 'Purchase' : 'Sale'}
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Item Info */}
          {item && (
            <div className="border rounded-lg p-4 mb-6">
              <h2 className="font-semibold mb-3">Item</h2>
              <div className="flex gap-4">
                {item.images?.[0] ? (
                  <img
                    src={item.images[0].url}
                    alt={item.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-gray-600">Condition: {item.condition?.replace('_', ' ')}</p>
                  <p className="text-xl font-bold text-purple-600 mt-1">
                    {transaction.amount?.toLocaleString()} {transaction.currency}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Payment Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.paymentStatus)}`}>
                {transaction.paymentStatus}
              </span>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Delivery Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDeliveryStatusColor(transaction.deliveryStatus)}`}>
                {transaction.deliveryStatus}
              </span>
              {transaction.trackingNumber && (
                <p className="text-sm text-gray-600 mt-2">
                  Tracking: <span className="font-medium">{transaction.trackingNumber}</span>
                </p>
              )}
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Buyer</p>
              <p className="font-semibold">{transaction.buyer.fullName}</p>
              <p className="text-sm text-gray-600">{transaction.buyer.email}</p>
              {transaction.buyer.phone && (
                <p className="text-sm text-gray-600">{transaction.buyer.phone}</p>
              )}
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Seller</p>
              <p className="font-semibold">{transaction.seller.fullName}</p>
              <p className="text-sm text-gray-600">{transaction.seller.email}</p>
              {transaction.seller.phone && (
                <p className="text-sm text-gray-600">{transaction.seller.phone}</p>
              )}
            </div>
          </div>

          {/* Shipping Details (visible to seller) */}
          {isSeller && (transaction.shippingAddress || transaction.phoneNumber) && (
            <div className="border rounded-lg p-4 mb-6 bg-blue-50">
              <h2 className="font-semibold mb-3">Shipping Details</h2>
              {transaction.phoneNumber && (
                <p className="text-sm mb-2">
                  <span className="text-gray-600">Phone:</span>{' '}
                  <span className="font-medium">{transaction.phoneNumber}</span>
                </p>
              )}
              {transaction.shippingAddress && (
                <p className="text-sm mb-2">
                  <span className="text-gray-600">Address:</span>{' '}
                  <span className="font-medium">{transaction.shippingAddress}</span>
                </p>
              )}
              {transaction.notes && (
                <p className="text-sm">
                  <span className="text-gray-600">Notes:</span>{' '}
                  <span className="font-medium">{transaction.notes}</span>
                </p>
              )}
            </div>
          )}

          {/* Payment Method & Dates */}
          <div className="border rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Payment Method</p>
                <p className="font-medium">{transaction.paymentMethod?.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-gray-600">Order Date</p>
                <p className="font-medium">{formatDate(transaction.createdAt)}</p>
              </div>
              {transaction.completedAt && (
                <div className="col-span-2">
                  <p className="text-gray-600">Completed Date</p>
                  <p className="font-medium">{formatDate(transaction.completedAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-6">
            <h2 className="font-semibold mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {/* Seller Actions */}
              {isSeller && transaction.paymentStatus === 'PENDING' && (
                <button
                  onClick={handleConfirmPayment}
                  disabled={actionLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Payment Received'}
                </button>
              )}

              {isSeller && transaction.paymentStatus === 'COMPLETED' && transaction.deliveryStatus === 'PENDING' && (
                <button
                  onClick={() => setShowShipModal(true)}
                  disabled={actionLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Mark as Shipped
                </button>
              )}

              {/* Buyer Actions */}
              {isBuyer && transaction.deliveryStatus === 'SHIPPED' && (
                <button
                  onClick={handleConfirmDelivery}
                  disabled={actionLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Delivery'}
                </button>
              )}

              {/* Cancel (both can cancel if pending) */}
              {transaction.paymentStatus !== 'REFUNDED' &&
               transaction.deliveryStatus === 'PENDING' && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={actionLoading}
                  className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                >
                  Cancel Transaction
                </button>
              )}

              {transaction.deliveryStatus === 'DELIVERED' && (
                <p className="text-green-600 font-medium">Transaction completed successfully!</p>
              )}

              {transaction.paymentStatus === 'REFUNDED' && (
                <p className="text-red-600 font-medium">Transaction was cancelled</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ship Modal */}
      {showShipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Mark as Shipped</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Number (Optional)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleMarkAsShipped}
                disabled={actionLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Shipment'}
              </button>
              <button
                onClick={() => setShowShipModal(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Cancel Transaction</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={actionLoading || !cancelReason}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Cancellation'}
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Keep Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
