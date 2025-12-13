'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, Plus, Eye, Edit, Trash2, MoreVertical,
  Smartphone, Shield, RefreshCw, Clock, CheckCircle,
  AlertCircle, TrendingUp, MessageCircle, Heart
} from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: number;
  condition: string;
  status: string;
  images: string[];
  viewCount: number;
  favoriteCount: number;
  imeiVerified: boolean;
  acceptsBarter: boolean;
  createdAt: string;
  inquiriesCount: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  'DRAFT': { label: 'مسودة', color: 'bg-gray-100 text-gray-700', icon: Edit },
  'PENDING': { label: 'قيد المراجعة', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  'ACTIVE': { label: 'نشط', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'SOLD': { label: 'مباع', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  'EXPIRED': { label: 'منتهي', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  'SUSPENDED': { label: 'موقوف', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

export default function MyMobileListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    sold: 0,
    totalViews: 0,
    totalInquiries: 0,
  });

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/my-listings?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setListings(data.data.listings);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/listings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowDeleteModal(null);
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleMarkAsSold = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/listings/${id}/mark-sold`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchListings();
    } catch (error) {
      console.error('Error marking as sold:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                <ArrowRight className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold">إعلاناتي</h1>
            </div>
            <Link
              href="/mobiles/sell"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إعلان جديد
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">إجمالي الإعلانات</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-gray-500">نشط</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.sold}</p>
                <p className="text-sm text-gray-500">مباع</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
                <p className="text-sm text-gray-500">مشاهدات</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalInquiries}</p>
                <p className="text-sm text-gray-500">استفسارات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'ACTIVE', label: 'نشط' },
            { value: 'PENDING', label: 'قيد المراجعة' },
            { value: 'DRAFT', label: 'مسودة' },
            { value: 'SOLD', label: 'مباع' },
            { value: 'EXPIRED', label: 'منتهي' },
          ].map(item => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === item.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد إعلانات</h3>
            <p className="text-gray-500 mb-6">ابدأ ببيع موبايلك الآن</p>
            <Link
              href="/mobiles/sell"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700"
            >
              <Plus className="w-5 h-5" />
              أضف إعلانك الأول
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map(listing => {
              const status = STATUS_LABELS[listing.status] || STATUS_LABELS['DRAFT'];
              const StatusIcon = status.icon;

              return (
                <div key={listing.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative w-full md:w-48 h-48 md:h-auto">
                      <Image
                        src={listing.images[0] || '/images/mobile-placeholder.jpg'}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                      <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${status.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{listing.title}</h3>
                          <p className="text-gray-500 text-sm">{listing.brand} {listing.model}</p>
                        </div>
                        <p className="text-xl font-bold text-indigo-600">
                          {listing.price.toLocaleString('ar-EG')} ج.م
                        </p>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {listing.imeiVerified && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            IMEI موثق
                          </span>
                        )}
                        {listing.acceptsBarter && (
                          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" />
                            يقبل المقايضة
                          </span>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {listing.viewCount} مشاهدة
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {listing.favoriteCount} مفضلة
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {listing.inquiriesCount} استفسار
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(listing.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                        <Link
                          href={`/mobiles/${listing.id}`}
                          className="flex-1 text-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                        >
                          عرض
                        </Link>
                        <Link
                          href={`/mobiles/edit/${listing.id}`}
                          className="flex-1 text-center py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm font-medium"
                        >
                          تعديل
                        </Link>
                        {listing.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleMarkAsSold(listing.id)}
                            className="flex-1 text-center py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium"
                          >
                            تم البيع
                          </button>
                        )}
                        <button
                          onClick={() => setShowDeleteModal(listing.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold mb-2">حذف الإعلان</h3>
            <p className="text-gray-500 mb-6">هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
