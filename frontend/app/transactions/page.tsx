'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMyTransactions, Transaction } from '@/lib/api/transactions';

export default function TransactionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'buyer' | 'seller'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const response = await getMyTransactions();
      setTransactions(response.data.transactions || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'buyer') return t.buyerId === user?.id;
    if (filter === 'seller') return t.sellerId === user?.id;
    return true;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Transactions</h1>
            <p className="text-gray-600 mt-1">View your purchase and sales history</p>
          </div>
          <Link
            href="/items"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Browse Items
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilter('buyer')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'buyer'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Purchases ({transactions.filter(t => t.buyerId === user.id).length})
            </button>
            <button
              onClick={() => setFilter('seller')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'seller'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sales ({transactions.filter(t => t.sellerId === user.id).length})
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No transactions yet</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'buyer'
                ? "You haven't made any purchases yet."
                : filter === 'seller'
                ? "You haven't sold anything yet."
                : "You don't have any transactions yet."}
            </p>
            <Link
              href="/items"
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const isBuyer = transaction.buyerId === user.id;
              const otherParty = isBuyer ? transaction.seller : transaction.buyer;
              const item = transaction.listing?.item;

              return (
                <Link
                  key={transaction.id}
                  href={`/transactions/${transaction.id}`}
                  className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex gap-4">
                    {/* Item Image */}
                    <div className="flex-shrink-0">
                      {item?.images?.[0] ? (
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
                    </div>

                    {/* Transaction Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate">
                            {item?.title || 'Item'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${isBuyer ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {isBuyer ? 'Purchase' : 'Sale'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-lg font-bold text-purple-600 whitespace-nowrap ml-4">
                          {transaction.amount?.toLocaleString()} {transaction.currency}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <div className="text-sm text-gray-600">
                          {isBuyer ? 'Seller' : 'Buyer'}: <span className="font-medium">{otherParty.fullName}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(transaction.paymentStatus)}`}>
                          Payment: {transaction.paymentStatus}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getDeliveryStatusColor(transaction.deliveryStatus)}`}>
                          Delivery: {transaction.deliveryStatus}
                        </span>
                      </div>

                      {/* Action hint */}
                      {transaction.paymentStatus !== 'REFUNDED' && transaction.deliveryStatus !== 'DELIVERED' && (
                        <p className="text-xs text-purple-600 mt-2">
                          {isBuyer && transaction.deliveryStatus === 'SHIPPED' && 'Click to confirm delivery'}
                          {!isBuyer && transaction.paymentStatus === 'PENDING' && 'Click to confirm payment'}
                          {!isBuyer && transaction.paymentStatus === 'COMPLETED' && transaction.deliveryStatus === 'PENDING' && 'Click to mark as shipped'}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 self-center">
                      <span className="text-gray-400">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
