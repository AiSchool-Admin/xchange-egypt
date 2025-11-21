'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { getCategories, Category } from '@/lib/api/categories';
import {
  getWishList,
  addToWishList,
  removeFromWishList,
  findWishListMatches,
  WishListItem,
  WishListMatch,
} from '@/lib/api/wishlist';

export default function WishListPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [wishList, setWishList] = useState<WishListItem[]>([]);
  const [matches, setMatches] = useState<WishListMatch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    categoryId: '',
    maxPrice: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [wishListRes, matchesRes, categoriesRes] = await Promise.all([
        getWishList(),
        findWishListMatches(),
        getCategories({ includeChildren: true }),
      ]);
      setWishList(wishListRes.data.items || []);
      setMatches(matchesRes.data.matches || []);
      const parentCategories = categoriesRes.data.filter(cat => !cat.parentId);
      setCategories(parentCategories);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load wish list');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;

    try {
      await addToWishList({
        description: formData.description,
        categoryId: formData.categoryId || undefined,
        maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : undefined,
      });
      setFormData({ description: '', categoryId: '', maxPrice: '' });
      setShowAddForm(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add item');
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await removeFromWishList(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove item');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('قائمة الرغبات', 'Wish List')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('احصل على إشعارات عند توفر العناصر المطلوبة', 'Get notified when desired items become available')}
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              {showAddForm ? t('إلغاء', 'Cancel') : t('+ إضافة رغبة', '+ Add Wish')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">{t('أضف عنصرا جديدا', 'Add New Wish')}</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ماذا تريد؟', 'What are you looking for?')} *
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('مثال: آيفون 13 برو ماكس', 'e.g., iPhone 13 Pro Max')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('الفئة', 'Category')}
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">{t('أي فئة', 'Any Category')}</option>
                    {categories.map((cat) => (
                      <React.Fragment key={cat.id}>
                        <option value={cat.id}>
                          {language === 'ar' ? cat.nameAr : cat.nameEn}
                        </option>
                        {cat.children && cat.children.map((child) => (
                          <option key={child.id} value={child.id}>
                            &nbsp;&nbsp;↳ {language === 'ar' ? child.nameAr : child.nameEn}
                          </option>
                        ))}
                      </React.Fragment>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('الحد الأقصى للسعر', 'Maximum Price')} (EGP)
                  </label>
                  <input
                    type="number"
                    value={formData.maxPrice}
                    onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                    placeholder={t('اختياري', 'Optional')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                {t('إضافة للقائمة', 'Add to List')}
              </button>
            </form>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Wish List */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {t('قائمة رغباتك', 'Your Wishes')} ({wishList.length})
              </h2>
              {wishList.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-600">{t('لا توجد عناصر في قائمة الرغبات', 'No items in wish list')}</p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t('أضف أول رغبة', 'Add your first wish')}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishList.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.description}</h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {item.category && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {language === 'ar' ? item.category.nameAr : item.category.nameEn}
                              </span>
                            )}
                            {item.maxPrice && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {t('الحد الأقصى', 'Max')}: {item.maxPrice.toLocaleString()} EGP
                              </span>
                            )}
                          </div>
                          {item.keywords.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              {t('كلمات البحث', 'Keywords')}: {item.keywords.join(', ')}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 ml-4"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Matches */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {t('العناصر المتطابقة', 'Matching Items')} ({matches.reduce((sum, m) => sum + m.matchingItems.length, 0)})
              </h2>
              {matches.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-600">{t('لا توجد مطابقات حالياً', 'No matches found yet')}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {t('سنخطرك عند توفر عناصر مطابقة', "We'll notify you when matching items appear")}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {matches.map((match) => (
                    <div key={match.wishListItem.id} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm text-gray-600">
                          {t('مطابقات لـ', 'Matches for')}: "{match.wishListItem.description}"
                        </h4>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {match.matchScore}% {t('تطابق', 'match')}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {match.matchingItems.slice(0, 3).map((item: any) => (
                          <Link
                            key={item.id}
                            href={`/items/${item.id}`}
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
                          >
                            {item.images?.[0] && (
                              <img
                                src={item.images[0]}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">
                                {item.title}
                              </div>
                              <div className="text-xs text-green-600">
                                {item.estimatedValue?.toLocaleString()} EGP
                              </div>
                            </div>
                          </Link>
                        ))}
                        {match.matchingItems.length > 3 && (
                          <p className="text-xs text-gray-500 text-center">
                            +{match.matchingItems.length - 3} {t('عناصر أخرى', 'more items')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
