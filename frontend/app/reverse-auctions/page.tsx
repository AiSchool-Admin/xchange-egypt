'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from '@/lib/api/client';

interface ReverseAuction {
  id: string;
  title: string;
  description: string;
  maxBudget: number;
  status: string;
  startDate: string;
  endDate: string;
  category?: {
    id: string;
    nameAr: string;
    nameEn: string;
  };
  _count?: {
    bids: number;
  };
  lowestBid?: number;
  buyer: {
    id: string;
    fullName: string;
    avatar?: string;
    governorate?: string;
  };
}

interface Filters {
  search: string;
  category: string;
  status: string;
  minBudget: string;
  maxBudget: string;
}

const STATUS_CONFIG: Record<string, { color: string; text: string; bgColor: string }> = {
  DRAFT: { color: 'text-gray-800', text: 'مسودة', bgColor: 'bg-gray-100' },
  ACTIVE: { color: 'text-green-800', text: 'نشط', bgColor: 'bg-green-100' },
  ENDED: { color: 'text-blue-800', text: 'منتهي', bgColor: 'bg-blue-100' },
  AWARDED: { color: 'text-purple-800', text: 'تمت الترسية', bgColor: 'bg-purple-100' },
  CANCELLED: { color: 'text-red-800', text: 'ملغي', bgColor: 'bg-red-100' },
  NO_BIDS: { color: 'text-orange-800', text: 'بدون عروض', bgColor: 'bg-orange-100' },
  PUBLISHED: { color: 'text-green-800', text: 'منشورة', bgColor: 'bg-green-100' },
  EVALUATION: { color: 'text-yellow-800', text: 'قيد التقييم', bgColor: 'bg-yellow-100' },
  CLOSED: { color: 'text-gray-800', text: 'مغلقة', bgColor: 'bg-gray-100' },
};

export default function ReverseAuctionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'applied'>('all');
  const [reverseAuctions, setReverseAuctions] = useState<ReverseAuction[]>([]);
  const [myAuctions, setMyAuctions] = useState<ReverseAuction[]>([]);
  const [appliedAuctions, setAppliedAuctions] = useState<ReverseAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<{ id: string; nameAr: string }[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    status: '',
    minBudget: '',
    maxBudget: '',
  });

  useEffect(() => {
    loadCategories();
    loadData();
  }, [user]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      const data = response.data.data || response.data || [];
      setCategories(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load all active reverse auctions
      const allResponse = await apiClient.get('/reverse-auctions?status=ACTIVE');
      const allData = allResponse.data.data || allResponse.data || {};
      setReverseAuctions(allData.items || allData.reverseAuctions || []);

      // Load user's auctions
      if (user) {
        const myResponse = await apiClient.get(`/reverse-auctions?buyerId=${user.id}`);
        const myData = myResponse.data.data || myResponse.data || {};
        setMyAuctions(myData.items || myData.reverseAuctions || []);

        // Load auctions user has bid on
        try {
          const appliedResponse = await apiClient.get('/reverse-auctions/applied');
          const appliedData = appliedResponse.data.data || appliedResponse.data || {};
          setAppliedAuctions(appliedData.items || appliedData.reverseAuctions || []);
        } catch {
          // API might not exist yet
          setAppliedAuctions([]);
        }
      }
    } catch (err: any) {
      console.error('Error loading reverse auctions:', err);
      setError('فشل في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      minBudget: '',
      maxBudget: '',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || { color: 'text-gray-800', text: status, bgColor: 'bg-gray-100' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRemainingTime = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return { text: 'انتهى', urgent: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 3) return { text: `${days} يوم`, urgent: false };
    if (days > 0) return { text: `${days} يوم و ${hours} ساعة`, urgent: true };
    return { text: `${hours} ساعة`, urgent: true };
  };

  const formatBudget = (budget: number) => {
    if (budget >= 1000000) return `${(budget / 1000000).toFixed(1)} مليون ج.م`;
    if (budget >= 1000) return `${(budget / 1000).toFixed(0)} ألف ج.م`;
    return `${budget.toLocaleString()} ج.م`;
  };

  const getCurrentAuctions = () => {
    let auctions: ReverseAuction[] = [];
    switch (activeTab) {
      case 'my':
        auctions = myAuctions;
        break;
      case 'applied':
        auctions = appliedAuctions;
        break;
      default:
        auctions = reverseAuctions;
    }

    // Apply filters
    return auctions.filter(auction => {
      if (filters.search && !auction.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.category && auction.category?.id !== filters.category) {
        return false;
      }
      if (filters.status && auction.status !== filters.status) {
        return false;
      }
      if (filters.minBudget && auction.maxBudget < parseFloat(filters.minBudget)) {
        return false;
      }
      if (filters.maxBudget && auction.maxBudget > parseFloat(filters.maxBudget)) {
        return false;
      }
      return true;
    });
  };

  const filteredAuctions = getCurrentAuctions();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المناقصات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-l from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">سوق المناقصات</h1>
              <p className="text-purple-100 text-lg">
                أنشئ طلب شراء ودع البائعين يتنافسون على تقديم أفضل سعر لك
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {reverseAuctions.length} مناقصة نشطة
                </span>
                <span>|</span>
                <span>تحديث مباشر</span>
              </div>
            </div>
            <Link
              href="/items/new?type=REVERSE_AUCTION"
              className="bg-white text-purple-700 px-6 py-3 rounded-xl hover:bg-purple-50 transition flex items-center gap-2 font-semibold shadow-lg"
            >
              <span className="text-xl">+</span>
              <span>إنشاء طلب شراء جديد</span>
            </Link>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="ابحث عن مناقصة..."
                  className="w-full px-6 py-4 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 text-lg"
                />
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  بحث
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-3 rounded-xl transition flex items-center gap-2 ${
                  showFilters ? 'bg-white text-purple-700' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                فلترة
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">جميع التصنيفات</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">جميع الحالات</option>
                  <option value="ACTIVE">نشط</option>
                  <option value="ENDED">منتهي</option>
                  <option value="AWARDED">تمت الترسية</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الميزانية من</label>
                <input
                  type="number"
                  value={filters.minBudget}
                  onChange={(e) => setFilters(prev => ({ ...prev, minBudget: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الميزانية إلى</label>
                <input
                  type="number"
                  value={filters.maxBudget}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxBudget: e.target.value }))}
                  placeholder="بدون حد"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={resetFilters} className="text-gray-600 hover:text-gray-800 text-sm">
                إعادة تعيين الفلاتر
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-4 font-medium transition border-b-2 ${
                activeTab === 'all'
                  ? 'text-purple-600 border-purple-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              طلبات متاحة للتقديم
              <span className="mr-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                {reverseAuctions.length}
              </span>
            </button>
            {user && (
              <>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-6 py-4 font-medium transition border-b-2 ${
                    activeTab === 'my'
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  طلباتي
                  <span className="mr-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {myAuctions.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('applied')}
                  className={`px-6 py-4 font-medium transition border-b-2 ${
                    activeTab === 'applied'
                      ? 'text-purple-600 border-purple-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  عروضي
                  <span className="mr-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                    {appliedAuctions.length}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>
        )}

        {filteredAuctions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">
              {activeTab === 'all' ? '🔍' : activeTab === 'my' ? '📋' : '📝'}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'all' && 'لا توجد طلبات متاحة حالياً'}
              {activeTab === 'my' && 'لم تقم بإنشاء أي طلبات شراء بعد'}
              {activeTab === 'applied' && 'لم تقدم على أي طلب بعد'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all' && 'تحقق لاحقاً للعثور على طلبات شراء جديدة'}
              {activeTab === 'my' && 'أنشئ طلب شراء جديد ودع البائعين يتنافسون'}
              {activeTab === 'applied' && 'تصفح الطلبات المتاحة وقدم عرضك'}
            </p>
            {activeTab === 'my' && (
              <Link
                href="/items/new?type=REVERSE_AUCTION"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
              >
                إنشاء طلب شراء
              </Link>
            )}
            {activeTab === 'applied' && (
              <button
                onClick={() => setActiveTab('all')}
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
              >
                تصفح الطلبات
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAuctions.map((auction) => {
              const remaining = getRemainingTime(auction.endDate);
              const isOwner = user?.id === auction.buyer?.id;

              return (
                <Link
                  key={auction.id}
                  href={`/reverse-auctions/${auction.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition group overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(auction.status)}
                          {remaining.urgent && auction.status === 'ACTIVE' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium animate-pulse">
                              عاجل
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition line-clamp-2">
                          {auction.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {auction.description}
                    </p>

                    {/* Buyer Info */}
                    <div className="flex items-center gap-2 py-2 border-t border-b">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {auction.buyer?.avatar ? (
                          <img src={auction.buyer.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-sm">👤</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {isOwner ? 'أنت' : auction.buyer?.fullName || 'مستخدم'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {auction.buyer?.governorate || 'مصر'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="px-5 py-3 bg-gray-50">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div>
                        <p className="text-gray-500">الميزانية</p>
                        <p className="font-bold text-purple-600">{formatBudget(auction.maxBudget)}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-gray-500">الوقت المتبقي</p>
                        <p className={`font-medium ${remaining.urgent ? 'text-red-600' : 'text-gray-900'}`}>
                          {remaining.text}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {auction._count?.bids || 0} عرض
                      </span>
                      {auction.lowestBid && (
                        <span className="text-green-600 font-medium">
                          أقل عرض: {auction.lowestBid.toLocaleString()} ج.م
                        </span>
                      )}
                    </div>

                    {/* Action Button */}
                    {!isOwner && auction.status === 'ACTIVE' && (
                      <button className="w-full mt-3 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition">
                        قدم عرضك الآن
                      </button>
                    )}
                    {isOwner && (
                      <div className="mt-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-center text-sm font-medium">
                        هذا طلبك
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-l from-purple-800 to-indigo-900 text-white py-12 mt-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">لماذا سوق المناقصات؟</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-purple-300">20%</p>
              <p className="text-purple-200">توفير في التكاليف</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-300">1000+</p>
              <p className="text-purple-200">بائع مسجل</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-300">24 ساعة</p>
              <p className="text-purple-200">متوسط وقت الاستجابة</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-300">100%</p>
              <p className="text-purple-200">ضمان الأمان</p>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">كيف يعمل سوق المناقصات؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">أنشئ طلبك</h3>
              <p className="text-gray-600 text-sm">حدد ما تريد شراءه والميزانية والمواصفات</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">استقبل العروض</h3>
              <p className="text-gray-600 text-sm">البائعون يتنافسون لتقديم أفضل سعر</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">قارن واختر</h3>
              <p className="text-gray-600 text-sm">راجع العروض واختر الأنسب لك</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-gray-900 mb-2">أتمم الصفقة</h3>
              <p className="text-gray-600 text-sm">ادفع بأمان عبر نظام الضمان</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
