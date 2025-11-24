'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSocket } from '@/lib/contexts/SocketContext';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const { connected, sendMessage, onMessage, offMessage } = useSocket();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Listen for incoming messages
    const handleNewMessage = (message: any) => {
      console.log('New message received:', message);
    };

    onMessage(handleNewMessage);

    return () => {
      offMessage(handleNewMessage);
    };
  }, [onMessage, offMessage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleUploadComplete = (urls: string[]) => {
    setUploadedImages((prev) => [...prev, ...urls]);
    setUploadError('');
    console.log('Images uploaded:', urls);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    console.error('Upload error:', error);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">Xchange Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user.fullName}! 👋</h2>
          <p className="text-gray-600 mb-4">{user.email}</p>

          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                WebSocket: {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {user.userType}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">📸 Image Upload</h3>
            <p className="text-gray-600 mb-4">
              Upload images to test the image upload functionality
            </p>

            <ImageUpload
              multiple={true}
              category="items"
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              maxFiles={5}
              className="mb-4"
            />

            {uploadError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {uploadError}
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Uploaded Images:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* WebSocket Chat Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">💬 Real-time Chat</h3>
            <p className="text-gray-600 mb-4">
              WebSocket connection is {connected ? 'active' : 'inactive'}
            </p>

            {connected ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm">
                    ✅ Connected to WebSocket server
                  </p>
                  <p className="text-green-700 text-xs mt-1">
                    You can now send and receive real-time messages
                  </p>
                </div>

                <button
                  onClick={() => sendMessage('test-conversation-id', 'Hello from frontend!')}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Send Test Message
                </button>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ⚠️ WebSocket not connected
                </p>
                <p className="text-yellow-700 text-xs mt-1">
                  Check your network connection and backend server
                </p>
              </div>
            )}
          </div>
        </div>

        {/* API Status Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">🔌 API Connection</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Backend URL:</span>
              <code className="text-sm text-primary-600">
                {process.env.NEXT_PUBLIC_API_URL}
              </code>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">WebSocket URL:</span>
              <code className="text-sm text-primary-600">
                {process.env.NEXT_PUBLIC_WS_URL}
              </code>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Authentication:</span>
              <span className="text-green-600 font-medium">✅ Active</span>
            </div>
          </div>
        </div>

        {/* Platform Features */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold mb-6">🚀 Platform Features</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/items"
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all text-center border-2 border-purple-200"
            >
              <div className="text-3xl mb-3">📦</div>
              <div className="font-bold text-purple-900 text-lg mb-1">Items Marketplace</div>
              <div className="text-sm text-purple-700 mb-3">Buy & sell used goods</div>
              <div className="flex gap-2 justify-center text-xs">
                <Link
                  href="/items"
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  Browse
                </Link>
                <Link
                  href="/items/new"
                  className="px-3 py-1 bg-white text-purple-600 border border-purple-600 rounded hover:bg-purple-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  List Item
                </Link>
              </div>
            </Link>

            <Link
              href="/auctions"
              className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg hover:shadow-md transition-all text-center border-2 border-indigo-200"
            >
              <div className="text-3xl mb-3">🔨</div>
              <div className="font-bold text-indigo-900 text-lg mb-1">Live Auctions</div>
              <div className="text-sm text-indigo-700 mb-3">Bid & win great deals</div>
              <div className="flex gap-2 justify-center text-xs">
                <Link
                  href="/auctions"
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  Browse
                </Link>
                <Link
                  href="/auctions/new"
                  className="px-3 py-1 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  Start Auction
                </Link>
              </div>
            </Link>

            <Link
              href="/barter"
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all text-center border-2 border-green-200"
            >
              <div className="text-3xl mb-3">🔄</div>
              <div className="font-bold text-green-900 text-lg mb-1">Barter & Exchange</div>
              <div className="text-sm text-green-700 mb-3">Trade without money</div>
              <div className="flex gap-2 justify-center text-xs">
                <Link
                  href="/barter"
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  Browse
                </Link>
                <Link
                  href="/barter/new"
                  className="px-3 py-1 bg-white text-green-600 border border-green-600 rounded hover:bg-green-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  Make Offer
                </Link>
              </div>
            </Link>
          </div>
        </div>

        {/* Shopping */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">🛍️ Shopping</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/cart"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all"
            >
              <div className="text-2xl mb-2">🛒</div>
              <div className="font-semibold text-gray-900">My Cart</div>
              <div className="text-xs text-gray-600">View cart and checkout</div>
            </Link>
            <Link
              href="/dashboard/orders"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold text-gray-900">My Orders</div>
              <div className="text-xs text-gray-600">Track your orders</div>
            </Link>
          </div>
        </div>

        {/* My Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">📊 My Activity</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link
              href="/items?user=me"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="font-semibold text-gray-900">My Items</div>
              <div className="text-xs text-gray-600">View your listings</div>
            </Link>
            <Link
              href="/auctions?user=me"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <div className="text-2xl mb-2">🔨</div>
              <div className="font-semibold text-gray-900">My Auctions</div>
              <div className="text-xs text-gray-600">Manage your auctions</div>
            </Link>
            <Link
              href="/barter/my-offers"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold text-gray-900">My Barter Offers</div>
              <div className="text-xs text-gray-600">Track your trades</div>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">🔧 System Status</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href={`${process.env.NEXT_PUBLIC_WS_URL}/health`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">🏥</div>
                <div>
                  <div className="font-semibold text-blue-900">Backend Health</div>
                  <div className="text-xs text-blue-700">Check server status</div>
                </div>
              </div>
            </a>
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">📚</div>
                <div>
                  <div className="font-semibold text-blue-900">API Documentation</div>
                  <div className="text-xs text-blue-700">View API endpoints</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
