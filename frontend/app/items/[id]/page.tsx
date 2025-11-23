'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getItem, Item } from '@/lib/api/items';
import { buyItem } from '@/lib/api/transactions';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  // Buy Now Modal State
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyForm, setBuyForm] = useState({
    paymentMethod: 'CASH_ON_DELIVERY' as const,
    shippingAddress: '',
    phoneNumber: '',
    notes: '',
  });

  // Add to Cart State
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    if (params.id) {
      loadItem(params.id as string);
    }
  }, [params.id]);

  const loadItem = async (id: string) => {
    try {
      setLoading(true);
      const response = await getItem(id);
      setItem(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowBuyModal(true);
    setBuyError('');
    setBuySuccess(false);
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;

    setBuyLoading(true);
    setBuyError('');

    try {
      await buyItem({
        itemId: item.id,
        paymentMethod: buyForm.paymentMethod,
        shippingAddress: buyForm.shippingAddress,
        phoneNumber: buyForm.phoneNumber,
        notes: buyForm.notes || undefined,
      });

      setBuySuccess(true);
      // Update item status locally
      setItem({ ...item, status: 'SOLD' });
    } catch (err: any) {
      setBuyError(err.response?.data?.message || 'Failed to complete purchase. Please try again.');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!item) return;

    setAddingToCart(true);
    setCartMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId: item.id,
          quantity: 1,
        }),
      });

      if (response.ok) {
        setCartMessage('Added to cart!');
        setTimeout(() => setCartMessage(''), 3000);
      } else {
        const data = await response.json();
        setCartMessage(data.message || 'Failed to add to cart');
      }
    } catch (err) {
      setCartMessage('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Item not found'}</p>
          <button
            onClick={() => router.push('/items')}
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            ← Back to Items
          </button>
        </div>
      </div>
    );
  }

  const images = item.images && item.images.length > 0 ? item.images : [];
  const isOwner = user?.id === item.seller.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <Link href="/items" className="hover:text-purple-600">
            Items
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{item.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Main Image */}
              <div className="aspect-video bg-gray-200 relative">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.url}
                    alt={item.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-6xl">📦</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index ? 'border-purple-600' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img src={img.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
            </div>

            {/* Item Details */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Item Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Condition</p>
                  <p className="font-semibold">{item.condition.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-semibold">{item.category.nameEn}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold">
                    {item.status === 'ACTIVE' ? (
                      <span className="text-green-600">Available</span>
                    ) : item.status === 'SOLD' ? (
                      <span className="text-gray-600">Sold</span>
                    ) : item.status === 'TRADED' ? (
                      <span className="text-blue-600">Traded</span>
                    ) : item.status === 'ARCHIVED' ? (
                      <span className="text-gray-500">Archived</span>
                    ) : (
                      <span className="text-yellow-600">Draft</span>
                    )}
                  </p>
                </div>
                {item.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold">{item.location}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Listed on</p>
                  <p className="font-semibold">{formatDate(item.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Price & Seller */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="mb-6">
                {item.estimatedValue ? (
                  <>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-4xl font-bold text-purple-600">{item.estimatedValue.toLocaleString()} EGP</p>
                  </>
                ) : (
                  <p className="text-xl text-gray-700">Contact seller for price</p>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwner && item.status === 'ACTIVE' && (
                <div className="space-y-3">
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition"
                  >
                    🛒 Buy Now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-semibold transition disabled:opacity-50"
                  >
                    {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
                  </button>
                  {cartMessage && (
                    <p className={`text-center text-sm ${cartMessage.includes('Added') ? 'text-green-600' : 'text-red-600'}`}>
                      {cartMessage}
                    </p>
                  )}
                  <button
                    onClick={() => {
                      if (!user) {
                        router.push('/login');
                        return;
                      }
                      router.push(`/messages?userId=${item.seller.id}&itemId=${item.id}`);
                    }}
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold transition"
                  >
                    💬 Contact Seller
                  </button>
                  <button className="w-full border border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 font-semibold transition">
                    🔁 Make Barter Offer
                  </button>
                </div>
              )}

              {item.status === 'SOLD' && !isOwner && (
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="text-gray-600 font-semibold">This item has been sold</p>
                </div>
              )}

              {isOwner && (
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/items/${item.id}/edit`)}
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold transition"
                  >
                    ✏️ Edit Item
                  </button>
                  <button className="w-full border border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 font-semibold transition">
                    🗑️ Delete Item
                  </button>
                </div>
              )}

              {/* Seller Info */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Seller Information</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-lg">
                    {item.seller.fullName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.seller.fullName}</p>
                    <p className="text-sm text-gray-600">
                      {item.seller.userType === 'BUSINESS' ? 'Business' : 'Individual'}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/users/${item.seller.id}`}
                  className="mt-3 block text-center text-purple-600 hover:text-purple-700 font-semibold"
                >
                  View Profile →
                </Link>
              </div>

              {/* Safety Tips */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3 text-sm">⚠️ Safety Tips</h3>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li>• Meet in a safe, public place</li>
                  <li>• Check the item before payment</li>
                  <li>• Pay only after receiving the item</li>
                  <li>• Report suspicious activity</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items Section (Coming Soon) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Similar Items</h2>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
            Similar items will appear here
          </div>
        </div>
      </div>

      {/* Buy Now Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {buySuccess ? (
                // Success State
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-green-600 mb-2">Purchase Successful!</h2>
                  <p className="text-gray-600 mb-6">
                    Your order has been placed. The seller will contact you shortly to arrange delivery.
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                    <p className="text-sm text-gray-600">Order Summary:</p>
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xl font-bold text-purple-600">{item.estimatedValue?.toLocaleString()} EGP</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBuyModal(false);
                      router.push('/items');
                    }}
                    className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                // Purchase Form
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Complete Purchase</h2>
                    <button
                      onClick={() => setShowBuyModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Item Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-2xl font-bold text-purple-600">{item.estimatedValue?.toLocaleString()} EGP</p>
                  </div>

                  {buyError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{buyError}</p>
                    </div>
                  )}

                  <form onSubmit={handlePurchase} className="space-y-4">
                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={buyForm.paymentMethod}
                        onChange={(e) => setBuyForm({ ...buyForm, paymentMethod: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
                        <option value="BANK_TRANSFER">Bank Transfer</option>
                        <option value="INSTAPAY">InstaPay</option>
                        <option value="VODAFONE_CASH">Vodafone Cash</option>
                      </select>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={buyForm.phoneNumber}
                        onChange={(e) => setBuyForm({ ...buyForm, phoneNumber: e.target.value })}
                        placeholder="e.g., 01012345678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                        minLength={10}
                      />
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shipping Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={buyForm.shippingAddress}
                        onChange={(e) => setBuyForm({ ...buyForm, shippingAddress: e.target.value })}
                        placeholder="Enter your full address for delivery"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                        minLength={10}
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={buyForm.notes}
                        onChange={(e) => setBuyForm({ ...buyForm, notes: e.target.value })}
                        placeholder="Any special instructions for the seller"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={buyLoading}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {buyLoading ? 'Processing...' : `Confirm Purchase - ${item.estimatedValue?.toLocaleString()} EGP`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
