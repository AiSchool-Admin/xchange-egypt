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
              All Transactions
            </button>
            <button
              onClick={() => setFilter('buyer')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'buyer'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Purchases
            </button>
            <button
              onClick={() => setFilter('seller')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'seller'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sales
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

              return (
                <div key={transaction.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium px-2 py-1 rounded ${isBuyer ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {isBuyer ? 'Purchase' : 'Sale'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(transaction.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Transaction ID: {transaction.id.slice(0, 8)}...
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {transaction.amount?.toLocaleString()} {transaction.currency}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">{isBuyer ? 'Seller' : 'Buyer'}</p>
                      <p className="font-semibold">{otherParty.fullName}</p>
                      <p className="text-sm text-gray-500">{otherParty.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getStatusColor(transaction.paymentStatus)}`}>
                        {transaction.paymentStatus}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Delivery Status</p>
                      <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${getDeliveryStatusColor(transaction.deliveryStatus)}`}>
                        {transaction.deliveryStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Payment Method: <span className="font-medium">{transaction.paymentMethod?.replace(/_/g, ' ')}</span>
                    </p>
                    <Link
                      href={`/transactions/${transaction.id}`}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                    >
                      View Details →
                    </Link>
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
