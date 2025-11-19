'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getItem, Item } from '@/lib/api/items';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

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
                {item.price ? (
                  <>
                    <p className="text-sm text-gray-600 mb-1">Price</p>
                    <p className="text-4xl font-bold text-purple-600">{item.price.toLocaleString()} EGP</p>
                  </>
                ) : (
                  <p className="text-xl text-gray-700">Contact seller for price</p>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwner && item.status === 'ACTIVE' && (
                <div className="space-y-3">
                  <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-semibold transition">
                    💬 Contact Seller
                  </button>
                  <button className="w-full border border-purple-600 text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 font-semibold transition">
                    🔁 Make Barter Offer
                  </button>
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
    </div>
  );
}
