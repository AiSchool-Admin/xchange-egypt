'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, RefreshCw, ArrowLeftRight, Check, X,
  Smartphone, Clock, CheckCircle, AlertCircle, MessageCircle,
  Star, MapPin, Shield, Users, Zap, Eye
} from 'lucide-react';

interface BarterMatch {
  id: string;
  matchType: 'DIRECT' | 'THREE_WAY' | 'CHAIN';
  matchScore: number;
  status: string;
  valueDifference: number;
  myListing: {
    id: string;
    title: string;
    brand: string;
    model: string;
    price: number;
    condition: string;
    images: string[];
  };
  otherListing: {
    id: string;
    title: string;
    brand: string;
    model: string;
    price: number;
    condition: string;
    images: string[];
    seller: {
      id: string;
      name: string;
      rating: number;
      completedTrades: number;
    };
  };
  intermediary?: {
    listing: any;
    seller: any;
  };
  createdAt: string;
}

interface BarterProposal {
  id: string;
  status: string;
  message: string;
  proposedCashDifference: number;
  myListing: any;
  targetListing: any;
  createdAt: string;
  isOutgoing: boolean;
}

const MATCH_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  'DIRECT': { label: 'مقايضة مباشرة', icon: ArrowLeftRight, color: 'bg-green-100 text-green-700' },
  'THREE_WAY': { label: 'مقايضة ثلاثية', icon: Users, color: 'bg-purple-100 text-purple-700' },
  'CHAIN': { label: 'سلسلة مقايضة', icon: Zap, color: 'bg-orange-100 text-orange-700' },
};

export default function MobileBarterPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'matches' | 'proposals' | 'received'>('matches');
  const [matches, setMatches] = useState<BarterMatch[]>([]);
  const [proposals, setProposals] = useState<BarterProposal[]>([]);
  const [receivedProposals, setReceivedProposals] = useState<BarterProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<BarterMatch | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      if (activeTab === 'matches') {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/barter/matches`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setMatches(data.data || []);
      } else if (activeTab === 'proposals') {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/barter/proposals`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setProposals(data.data || []);
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/barter/proposals/received`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setReceivedProposals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/barter/matches/${matchId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/barter/matches/${matchId}/reject`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      setSelectedMatch(null);
    } catch (error) {
      console.error('Error rejecting match:', error);
    }
  };

  const handleRespondToProposal = async (proposalId: string, accept: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mobiles/barter/proposals/${proposalId}/respond`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ accept })
      });
      fetchData();
    } catch (error) {
      console.error('Error responding to proposal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => router.back()} className="text-white/80 hover:text-white">
              <ArrowRight className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">نظام المقايضة الذكي</h1>
          </div>
          <p className="text-white/80">استبدل جهازك بجهاز آخر بسهولة وأمان</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { key: 'matches', label: 'المطابقات الذكية', icon: Zap },
              { key: 'proposals', label: 'عروضي', icon: ArrowLeftRight },
              { key: 'received', label: 'العروض الواردة', icon: MessageCircle },
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-4 font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Smart Matches Tab */}
            {activeTab === 'matches' && (
              <div className="space-y-6">
                {/* Info Banner */}
                <div className="bg-gradient-to-l from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Zap className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-900 mb-2">كيف يعمل نظام المقايضة الذكي؟</h3>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• نبحث تلقائياً عن أجهزة تناسب تفضيلاتك</li>
                        <li>• نقترح مقايضات مباشرة أو ثلاثية أو سلسلة مقايضات</li>
                        <li>• نحسب فرق القيمة ونقترح تسويات عادلة</li>
                        <li>• جميع المعاملات محمية عبر نظام Escrow</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {matches.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مطابقات حالياً</h3>
                    <p className="text-gray-500 mb-6">أضف إعلاناً مع تفعيل خيار المقايضة للحصول على مطابقات</p>
                    <Link
                      href="/mobiles/sell"
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700"
                    >
                      <Smartphone className="w-5 h-5" />
                      أضف جهازك
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matches.map(match => {
                      const matchType = MATCH_TYPE_LABELS[match.matchType];
                      const MatchIcon = matchType.icon;

                      return (
                        <div key={match.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                          {/* Match Header */}
                          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${matchType.color}`}>
                                <MatchIcon className="w-4 h-4" />
                                {matchType.label}
                              </span>
                              <span className="text-sm text-gray-500">
                                نسبة التطابق: <strong className="text-indigo-600">{match.matchScore}%</strong>
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(match.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>

                          {/* Match Content */}
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* My Listing */}
                              <div className="border rounded-xl p-4">
                                <p className="text-sm text-gray-500 mb-3">جهازك</p>
                                <div className="flex gap-4">
                                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                                    <Image
                                      src={match.myListing.images[0] || '/images/mobile-placeholder.jpg'}
                                      alt=""
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-bold">{match.myListing.title}</h4>
                                    <p className="text-sm text-gray-500">{match.myListing.brand} {match.myListing.model}</p>
                                    <p className="text-indigo-600 font-bold mt-1">
                                      {match.myListing.price.toLocaleString('ar-EG')} ج.م
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Arrow */}
                              <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                  <ArrowLeftRight className="w-6 h-6 text-purple-600" />
                                </div>
                              </div>

                              {/* Other Listing */}
                              <div className="border rounded-xl p-4">
                                <p className="text-sm text-gray-500 mb-3">الجهاز المقترح</p>
                                <div className="flex gap-4">
                                  <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                                    <Image
                                      src={match.otherListing.images[0] || '/images/mobile-placeholder.jpg'}
                                      alt=""
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-bold">{match.otherListing.title}</h4>
                                    <p className="text-sm text-gray-500">{match.otherListing.brand} {match.otherListing.model}</p>
                                    <p className="text-indigo-600 font-bold mt-1">
                                      {match.otherListing.price.toLocaleString('ar-EG')} ج.م
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-3 pt-3 border-t flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1 text-gray-500">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    {match.otherListing.seller.rating.toFixed(1)}
                                  </span>
                                  <span className="text-gray-500">
                                    {match.otherListing.seller.completedTrades} صفقة
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Value Difference */}
                            {match.valueDifference !== 0 && (
                              <div className={`mt-4 p-4 rounded-lg ${match.valueDifference > 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                                <p className={match.valueDifference > 0 ? 'text-green-700' : 'text-orange-700'}>
                                  {match.valueDifference > 0 ? (
                                    <>ستحصل على <strong>{match.valueDifference.toLocaleString('ar-EG')} ج.م</strong> إضافية</>
                                  ) : (
                                    <>ستدفع <strong>{Math.abs(match.valueDifference).toLocaleString('ar-EG')} ج.م</strong> فرق</>
                                  )}
                                </p>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                              <button
                                onClick={() => setSelectedMatch(match)}
                                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"
                              >
                                <Eye className="w-5 h-5" />
                                عرض التفاصيل
                              </button>
                              <button
                                onClick={() => handleAcceptMatch(match.id)}
                                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2"
                              >
                                <Check className="w-5 h-5" />
                                قبول المقايضة
                              </button>
                              <button
                                onClick={() => handleRejectMatch(match.id)}
                                className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
                              >
                                <X className="w-5 h-5 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* My Proposals Tab */}
            {activeTab === 'proposals' && (
              <div className="space-y-4">
                {proposals.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <ArrowLeftRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">لم ترسل أي عروض مقايضة</h3>
                    <p className="text-gray-500 mb-6">تصفح الإعلانات واقترح مقايضات</p>
                    <Link
                      href="/mobiles"
                      className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700"
                    >
                      تصفح الإعلانات
                    </Link>
                  </div>
                ) : (
                  proposals.map(proposal => (
                    <div key={proposal.id} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          proposal.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          proposal.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {proposal.status === 'PENDING' ? 'قيد الانتظار' :
                           proposal.status === 'ACCEPTED' ? 'مقبول' : 'مرفوض'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(proposal.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-2">جهازك</p>
                          <p className="font-medium">{proposal.myListing.title}</p>
                          <p className="text-indigo-600 text-sm">{proposal.myListing.price?.toLocaleString('ar-EG')} ج.م</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-2">الجهاز المطلوب</p>
                          <p className="font-medium">{proposal.targetListing.title}</p>
                          <p className="text-indigo-600 text-sm">{proposal.targetListing.price?.toLocaleString('ar-EG')} ج.م</p>
                        </div>
                      </div>

                      {proposal.message && (
                        <p className="mt-4 text-gray-600 text-sm">{proposal.message}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Received Proposals Tab */}
            {activeTab === 'received' && (
              <div className="space-y-4">
                {receivedProposals.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد عروض واردة</h3>
                    <p className="text-gray-500">ستظهر هنا عروض المقايضة التي يرسلها الآخرون</p>
                  </div>
                ) : (
                  receivedProposals.map(proposal => (
                    <div key={proposal.id} className="bg-white rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          عرض جديد
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(proposal.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-2">جهازك</p>
                          <p className="font-medium">{proposal.targetListing.title}</p>
                          <p className="text-indigo-600 text-sm">{proposal.targetListing.price?.toLocaleString('ar-EG')} ج.م</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 mb-2">الجهاز المعروض</p>
                          <p className="font-medium">{proposal.myListing.title}</p>
                          <p className="text-indigo-600 text-sm">{proposal.myListing.price?.toLocaleString('ar-EG')} ج.م</p>
                        </div>
                      </div>

                      {proposal.message && (
                        <p className="mt-4 text-gray-600 text-sm bg-blue-50 p-3 rounded-lg">{proposal.message}</p>
                      )}

                      {proposal.status === 'PENDING' && (
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleRespondToProposal(proposal.id, true)}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                          >
                            <Check className="w-5 h-5" />
                            قبول
                          </button>
                          <button
                            onClick={() => handleRespondToProposal(proposal.id, false)}
                            className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 flex items-center justify-center gap-2"
                          >
                            <X className="w-5 h-5" />
                            رفض
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">تفاصيل المقايضة</h3>
                <button onClick={() => setSelectedMatch(null)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Match Score */}
              <div className="text-center">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-3xl font-bold text-indigo-600">{selectedMatch.matchScore}%</span>
                </div>
                <p className="text-gray-500">نسبة التطابق</p>
              </div>

              {/* Listings Comparison */}
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <Image
                    src={selectedMatch.myListing.images[0] || '/images/mobile-placeholder.jpg'}
                    alt=""
                    width={150}
                    height={150}
                    className="rounded-xl mx-auto mb-3 object-cover"
                  />
                  <h4 className="font-bold">{selectedMatch.myListing.title}</h4>
                  <p className="text-gray-500 text-sm">{selectedMatch.myListing.brand} {selectedMatch.myListing.model}</p>
                  <p className="text-xl font-bold text-indigo-600 mt-2">
                    {selectedMatch.myListing.price.toLocaleString('ar-EG')} ج.م
                  </p>
                </div>

                <div className="text-center">
                  <Image
                    src={selectedMatch.otherListing.images[0] || '/images/mobile-placeholder.jpg'}
                    alt=""
                    width={150}
                    height={150}
                    className="rounded-xl mx-auto mb-3 object-cover"
                  />
                  <h4 className="font-bold">{selectedMatch.otherListing.title}</h4>
                  <p className="text-gray-500 text-sm">{selectedMatch.otherListing.brand} {selectedMatch.otherListing.model}</p>
                  <p className="text-xl font-bold text-indigo-600 mt-2">
                    {selectedMatch.otherListing.price.toLocaleString('ar-EG')} ج.م
                  </p>
                </div>
              </div>

              {/* Seller Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-medium mb-3">معلومات البائع</h4>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-medium">{selectedMatch.otherListing.seller.name}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {selectedMatch.otherListing.seller.rating.toFixed(1)}
                      </span>
                      <span>{selectedMatch.otherListing.seller.completedTrades} صفقة مكتملة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Difference */}
              {selectedMatch.valueDifference !== 0 && (
                <div className={`p-4 rounded-xl ${selectedMatch.valueDifference > 0 ? 'bg-green-50' : 'bg-orange-50'}`}>
                  <p className={`text-lg font-medium ${selectedMatch.valueDifference > 0 ? 'text-green-700' : 'text-orange-700'}`}>
                    {selectedMatch.valueDifference > 0 ? (
                      <>ستحصل على <strong>{selectedMatch.valueDifference.toLocaleString('ar-EG')} ج.م</strong> إضافية</>
                    ) : (
                      <>ستدفع <strong>{Math.abs(selectedMatch.valueDifference).toLocaleString('ar-EG')} ج.م</strong> كفرق قيمة</>
                    )}
                  </p>
                </div>
              )}

              {/* Protection Notice */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">معاملة محمية</span>
                </div>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• الأجهزة محفوظة حتى اكتمال المقايضة</li>
                  <li>• 5 أيام لفحص الجهاز بعد الاستلام</li>
                  <li>• دعم فني متاح لحل أي مشاكل</li>
                </ul>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setSelectedMatch(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleAcceptMatch(selectedMatch.id)}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                قبول المقايضة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
