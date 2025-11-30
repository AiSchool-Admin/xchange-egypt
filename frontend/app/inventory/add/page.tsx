'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { ImageUpload } from '@/components/ui/ImageUpload';

type ItemSide = 'supply' | 'demand';
type ItemType = 'goods' | 'services' | 'cash';
type ListingType = 'direct_sale' | 'auction' | 'barter' | 'direct_buy' | 'reverse_auction';

interface FormData {
  side: ItemSide;
  type: ItemType;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  value: string;
  listingType: ListingType;
  images: string[];
  // Auction specific
  startingBid: string;
  auctionDuration: string;
  // Barter specific
  desiredCategory: string;
  desiredKeywords: string;
  // Location
  governorate: string;
  city: string;
}

function AddInventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    side: (searchParams.get('side') as ItemSide) || 'supply',
    type: (searchParams.get('type') as ItemType) || 'goods',
    title: '',
    description: '',
    category: '',
    subcategory: '',
    value: '',
    listingType: 'direct_sale',
    images: [],
    startingBid: '',
    auctionDuration: '7',
    desiredCategory: '',
    desiredKeywords: '',
    governorate: '',
    city: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Submit to API
      console.log('Submitting:', formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      router.push('/inventory');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getListingOptions = (): { value: ListingType; label: string; icon: string; desc: string }[] => {
    if (formData.side === 'supply') {
      return [
        { value: 'direct_sale', label: 'Direct Sale', icon: '🏷️', desc: 'Set your price, sell instantly' },
        { value: 'auction', label: 'Auction', icon: '🔨', desc: 'Let buyers bid for the best price' },
        { value: 'barter', label: 'Barter', icon: '🔄', desc: 'Trade for something you need' },
      ];
    } else {
      return [
        { value: 'direct_buy', label: 'Direct Buy', icon: '🛒', desc: 'Find and purchase available items' },
        { value: 'reverse_auction', label: 'Reverse Auction', icon: '📢', desc: 'Post your need, sellers compete' },
      ];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const totalSteps = formData.side === 'supply' ? 5 : 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/inventory" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <div className="text-sm text-gray-500">
              Step {step} of {totalSteps}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step 1: Choose Side */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              What would you like to do?
            </h1>
            <p className="text-gray-600 mb-8">
              Choose whether you're offering something or looking for something
            </p>

            <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, side: 'supply', listingType: 'direct_sale' }));
                  setStep(2);
                }}
                className={`p-8 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  formData.side === 'supply'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="text-5xl mb-4">📤</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">I Have</h2>
                <p className="text-gray-600 text-sm">Something to sell, auction, or trade</p>
              </button>

              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, side: 'demand', listingType: 'direct_buy' }));
                  setStep(2);
                }}
                className={`p-8 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  formData.side === 'demand'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-5xl mb-4">📥</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">I Need</h2>
                <p className="text-gray-600 text-sm">Looking for goods, services, or cash</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Type */}
        {step === 2 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              What type of item?
            </h1>
            <p className="text-gray-600 mb-8">
              {formData.side === 'supply'
                ? "What are you offering?"
                : "What are you looking for?"}
            </p>

            <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, type: 'goods' }));
                  setStep(3);
                }}
                className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  formData.type === 'goods'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-bold text-gray-800 mb-1">Goods</h3>
                <p className="text-gray-500 text-xs">Physical items, products</p>
              </button>

              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, type: 'services' }));
                  setStep(3);
                }}
                className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  formData.type === 'services'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-4xl mb-3">🛠️</div>
                <h3 className="font-bold text-gray-800 mb-1">Services</h3>
                <p className="text-gray-500 text-xs">Skills, work, expertise</p>
              </button>

              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, type: 'cash' }));
                  setStep(3);
                }}
                className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  formData.type === 'cash'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-bold text-gray-800 mb-1">Cash</h3>
                <p className="text-gray-500 text-xs">Money exchange</p>
              </button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="mt-8 text-gray-500 hover:text-gray-700"
            >
              ← Go back
            </button>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
              Tell us about it
            </h1>
            <p className="text-gray-600 mb-8 text-center">
              Add details to help others find your listing
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={formData.type === 'goods' ? "e.g., iPhone 13 Pro, 256GB" : formData.type === 'services' ? "e.g., Professional Photography" : "e.g., 5000 EGP Cash"}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your item in detail..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Value (EGP) *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Images */}
              {formData.type !== 'cash' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Photos {formData.side === 'supply' && '(recommended)'}
                  </label>
                  <ImageUpload
                    multiple={true}
                    category="items"
                    onUploadComplete={handleImageUpload}
                    maxFiles={5}
                  />
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Governorate
                  </label>
                  <select
                    name="governorate"
                    value={formData.governorate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select...</option>
                    <option value="cairo">Cairo</option>
                    <option value="giza">Giza</option>
                    <option value="alexandria">Alexandria</option>
                    <option value="dakahlia">Dakahlia</option>
                    <option value="sharqia">Sharqia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City/Area
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g., Nasr City"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!formData.title || !formData.description || !formData.value}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Listing Type */}
        {step === 4 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              How do you want to {formData.side === 'supply' ? 'sell' : 'get'} it?
            </h1>
            <p className="text-gray-600 mb-8">
              Choose the best method for your needs
            </p>

            <div className="space-y-4 max-w-xl mx-auto">
              {getListingOptions().map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, listingType: option.value }))}
                  className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                    formData.listingType === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="text-4xl">{option.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-800">{option.label}</h3>
                    <p className="text-gray-500 text-sm">{option.desc}</p>
                  </div>
                  {formData.listingType === option.value && (
                    <div className="ml-auto text-purple-600 text-2xl">✓</div>
                  )}
                </button>
              ))}
            </div>

            {/* Additional fields for specific listing types */}
            {formData.listingType === 'auction' && (
              <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg max-w-xl mx-auto">
                <h3 className="font-bold text-gray-800 mb-4">Auction Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Starting Bid (EGP)
                    </label>
                    <input
                      type="number"
                      name="startingBid"
                      value={formData.startingBid}
                      onChange={handleChange}
                      placeholder="e.g., 1000"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (days)
                    </label>
                    <select
                      name="auctionDuration"
                      value={formData.auctionDuration}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="1">1 day</option>
                      <option value="3">3 days</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {formData.listingType === 'barter' && (
              <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg max-w-xl mx-auto">
                <h3 className="font-bold text-gray-800 mb-4">What do you want in exchange?</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Desired Category
                    </label>
                    <select
                      name="desiredCategory"
                      value={formData.desiredCategory}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="">Any category</option>
                      <option value="electronics">Electronics</option>
                      <option value="vehicles">Vehicles</option>
                      <option value="fashion">Fashion</option>
                      <option value="home">Home & Garden</option>
                      <option value="services">Services</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Keywords (what you're looking for)
                    </label>
                    <input
                      type="text"
                      name="desiredKeywords"
                      value={formData.desiredKeywords}
                      onChange={handleChange}
                      placeholder="e.g., laptop, MacBook, iPhone"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={() => formData.side === 'supply' ? setStep(5) : handleSubmit()}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                {formData.side === 'supply' ? 'Continue →' : 'Create Listing'}
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit (Supply only) */}
        {step === 5 && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
              Review Your Listing
            </h1>
            <p className="text-gray-600 mb-8 text-center">
              Make sure everything looks good before publishing
            </p>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Preview Image */}
              {formData.images.length > 0 ? (
                <div className="aspect-video bg-gray-100">
                  <img src={formData.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-6xl">
                    {formData.type === 'goods' ? '📦' : formData.type === 'services' ? '🛠️' : '💰'}
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.listingType === 'direct_sale' ? 'bg-purple-100 text-purple-700' :
                    formData.listingType === 'auction' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {formData.listingType === 'direct_sale' ? '🏷️ Direct Sale' :
                     formData.listingType === 'auction' ? '🔨 Auction' :
                     '🔄 Barter'}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">{formData.title}</h2>
                <p className="text-gray-600 mb-4">{formData.description}</p>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-sm text-gray-500">Value</div>
                    <div className="text-2xl font-bold text-purple-600">
                      EGP {parseInt(formData.value).toLocaleString()}
                    </div>
                  </div>
                  {formData.governorate && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Location</div>
                      <div className="text-gray-800">{formData.city}, {formData.governorate}</div>
                    </div>
                  )}
                </div>

                {formData.listingType === 'barter' && formData.desiredKeywords && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl">
                    <div className="text-sm text-green-700 font-medium mb-1">Looking for:</div>
                    <div className="text-green-800">{formData.desiredKeywords}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Publishing...
                  </span>
                ) : (
                  'Publish Listing 🚀'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddInventoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <AddInventoryContent />
    </Suspense>
  );
}
