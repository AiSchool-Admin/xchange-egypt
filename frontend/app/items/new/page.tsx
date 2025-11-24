'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createItem } from '@/lib/api/items';
import { getCategories, Category } from '@/lib/api/categories';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function NewItemPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    parentCategoryId: '',
    categoryId: '',
    condition: 'GOOD',
    price: '',
    location: '',
    governorate: '',
  });

  // Filter parent categories and sub-categories
  const parentCategories = categories.filter(cat => !cat.parentId);
  const subCategories = categories.filter(cat => cat.parentId === formData.parentCategoryId);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadCategories();
  }, [user, router]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Reset sub-category when parent category changes
    if (name === 'parentCategoryId') {
      setFormData({
        ...formData,
        parentCategoryId: value,
        categoryId: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleUploadComplete = (urls: string[]) => {
    setUploadedImages((prev) => [...prev, ...urls]);
    setError('');
  };

  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const removeImage = (url: string) => {
    setUploadedImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Detailed validation with specific error messages
    if (!formData.title || formData.title.length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      setError('Description must be at least 10 characters long');
      return;
    }

    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    if (!formData.governorate) {
      setError('Please select a governorate');
      return;
    }

    if (!formData.location || formData.location.length < 3) {
      setError('Location must be at least 3 characters long');
      return;
    }

    try {
      setLoading(true);
      await createItem({
        titleAr: formData.title,
        titleEn: formData.title,
        descriptionAr: formData.description,
        descriptionEn: formData.description,
        categoryId: formData.categoryId,
        condition: formData.condition,
        estimatedValue: formData.price ? parseFloat(formData.price) : 0,
        location: formData.location,
        governorate: formData.governorate,
        imageUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
      });

      router.push('/items?success=true');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create item. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">List an Item</h1>
            <p className="text-gray-600 mt-1">Fill in the details below to list your item</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Requirements Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 text-sm mb-2">📋 Required Information</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Title: Minimum 3 characters, maximum 200</li>
              <li>• Description: Minimum 10 characters (be detailed!)</li>
              <li>• Category: Select from dropdown</li>
              <li>• Condition: Choose item condition</li>
              <li>• Estimated Value: Optional (helps with barter matching)</li>
              <li>• Governorate: Select your governorate</li>
              <li>• Location: Area/neighborhood (minimum 3 characters)</li>
              <li>• Photos: Optional but recommended</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={200}
                placeholder="e.g., iPhone 12 Pro Max 256GB"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={formData.title.length < 3 ? 'text-red-500' : 'text-gray-500'}>
                  Minimum 3 characters
                </span>
                <span className="text-gray-500">{formData.title.length}/200 characters</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                placeholder="Describe your item in detail (minimum 10 characters)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={formData.description.length < 10 ? 'text-red-500 font-medium' : 'text-gray-500'}>
                  {formData.description.length < 10
                    ? `Need ${10 - formData.description.length} more characters (minimum 10)`
                    : 'Minimum requirement met ✓'}
                </span>
                <span className="text-gray-500">{formData.description.length}/5000 characters</span>
              </div>
            </div>

            {/* Category and Sub-Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="parentCategoryId"
                  value={formData.parentCategoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {parentCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sub-Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  disabled={!formData.parentCategoryId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {formData.parentCategoryId ? 'Select a sub-category' : 'Select category first'}
                  </option>
                  {subCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>

            {/* Price/Estimated Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Value (EGP)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="e.g., 15000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Optional - estimated value of the item</p>
            </div>

            {/* Location and Governorate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Governorate <span className="text-red-500">*</span>
                </label>
                <select
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select governorate</option>
                  <option value="Cairo">Cairo</option>
                  <option value="Giza">Giza</option>
                  <option value="Alexandria">Alexandria</option>
                  <option value="Dakahlia">Dakahlia</option>
                  <option value="Red Sea">Red Sea</option>
                  <option value="Beheira">Beheira</option>
                  <option value="Fayoum">Fayoum</option>
                  <option value="Gharbiya">Gharbiya</option>
                  <option value="Ismailia">Ismailia</option>
                  <option value="Menofia">Menofia</option>
                  <option value="Minya">Minya</option>
                  <option value="Qaliubiya">Qaliubiya</option>
                  <option value="New Valley">New Valley</option>
                  <option value="Suez">Suez</option>
                  <option value="Aswan">Aswan</option>
                  <option value="Assiut">Assiut</option>
                  <option value="Beni Suef">Beni Suef</option>
                  <option value="Port Said">Port Said</option>
                  <option value="Damietta">Damietta</option>
                  <option value="Sharkia">Sharkia</option>
                  <option value="South Sinai">South Sinai</option>
                  <option value="Kafr El Sheikh">Kafr El Sheikh</option>
                  <option value="Matrouh">Matrouh</option>
                  <option value="Luxor">Luxor</option>
                  <option value="Qena">Qena</option>
                  <option value="North Sinai">North Sinai</option>
                  <option value="Sohag">Sohag</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={200}
                  placeholder="e.g., Nasr City, Downtown"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className={`text-xs mt-1 ${formData.location.length > 0 && formData.location.length < 3 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.location.length > 0 && formData.location.length < 3
                    ? `Need ${3 - formData.location.length} more characters (minimum 3)`
                    : 'Area or neighborhood (minimum 3 characters)'}
                </p>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
              <ImageUpload onUploadComplete={handleUploadComplete} onUploadError={handleUploadError} />

              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'List Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
