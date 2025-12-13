'use client';

/**
 * My Barter Proposals Page
 * صفحة عروض المقايضة الخاصة بي
 */

import { useState } from 'react';
import Link from 'next/link';

interface BarterProposal {
  id: string;
  type: string;
  status: string;
  requested_car: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    owner: {
      id: string;
      name: string;
    };
  };
  offered_car?: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
  };
  offered_description?: string;
  cash_difference: number;
  cash_direction: 'PAY' | 'RECEIVE' | 'NONE';
  message?: string;
  proposer: {
    id: string;
    name: string;
    phone: string;
  };
  counter_offer?: {
    cash_difference: number;
    message: string;
    created_at: string;
  };
  created_at: string;
  updated_at: string;
  expires_at: string;
}

// بيانات تجريبية لعروض المقايضة
const mockBarterProposals: BarterProposal[] = [
  {
    id: 'BP001',
    type: 'CAR_TO_CAR',
    status: 'PENDING',
    requested_car: {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      price: 850000,
      owner: {
        id: 'user2',
        name: 'محمد علي',
      },
    },
    offered_car: {
      id: 'mycar1',
      make: 'Honda',
      model: 'Civic',
      year: 2021,
      price: 720000,
    },
    cash_difference: 130000,
    cash_direction: 'PAY',
    message: 'مهتم بالمقايضة، السيارة بحالة ممتازة وصيانة وكالة كاملة',
    proposer: {
      id: 'user1',
      name: 'أنت',
      phone: '01098765432',
    },
    created_at: '2024-12-10T10:00:00Z',
    updated_at: '2024-12-10T10:00:00Z',
    expires_at: '2024-12-17T10:00:00Z',
  },
  {
    id: 'BP002',
    type: 'CAR_TO_CAR',
    status: 'COUNTER_OFFERED',
    requested_car: {
      id: '2',
      make: 'BMW',
      model: '320i',
      year: 2021,
      price: 1200000,
      owner: {
        id: 'user3',
        name: 'خالد محمود',
      },
    },
    offered_car: {
      id: 'mycar2',
      make: 'Mercedes-Benz',
      model: 'C180',
      year: 2020,
      price: 1050000,
    },
    cash_difference: 100000,
    cash_direction: 'PAY',
    message: 'سيارتي فل أوبشن وحالتها ممتازة',
    proposer: {
      id: 'user1',
      name: 'أنت',
      phone: '01098765432',
    },
    counter_offer: {
      cash_difference: 150000,
      message: 'أحتاج فرق 150,000 جنيه نظراً لأن سيارتي موديل أحدث',
      created_at: '2024-12-11T14:00:00Z',
    },
    created_at: '2024-12-09T15:00:00Z',
    updated_at: '2024-12-11T14:00:00Z',
    expires_at: '2024-12-16T15:00:00Z',
  },
  {
    id: 'BP003',
    type: 'CAR_TO_CAR',
    status: 'ACCEPTED',
    requested_car: {
      id: '3',
      make: 'Hyundai',
      model: 'Tucson',
      year: 2023,
      price: 950000,
      owner: {
        id: 'user4',
        name: 'أحمد حسن',
      },
    },
    offered_car: {
      id: 'mycar3',
      make: 'Kia',
      model: 'Sportage',
      year: 2022,
      price: 870000,
    },
    cash_difference: 80000,
    cash_direction: 'PAY',
    message: 'عرض مقايضة مع فرق بسيط',
    proposer: {
      id: 'user1',
      name: 'أنت',
      phone: '01098765432',
    },
    created_at: '2024-12-05T11:00:00Z',
    updated_at: '2024-12-07T16:00:00Z',
    expires_at: '2024-12-12T11:00:00Z',
  },
  {
    id: 'BP004',
    type: 'CAR_TO_CAR',
    status: 'PENDING',
    requested_car: {
      id: 'mycar4',
      make: 'Nissan',
      model: 'Sentra',
      year: 2021,
      price: 520000,
      owner: {
        id: 'user1',
        name: 'أنت',
      },
    },
    offered_description: 'شيفروليه أوبترا 2020 - فضي - أوتوماتيك - 45,000 كم',
    cash_difference: 50000,
    cash_direction: 'RECEIVE',
    message: 'سيارتي بحالة ممتازة وأقدم لك فرق 50,000 جنيه',
    proposer: {
      id: 'user5',
      name: 'سامي إبراهيم',
      phone: '01111222333',
    },
    created_at: '2024-12-11T09:00:00Z',
    updated_at: '2024-12-11T09:00:00Z',
    expires_at: '2024-12-18T09:00:00Z',
  },
  {
    id: 'BP005',
    type: 'CAR_TO_CAR',
    status: 'REJECTED',
    requested_car: {
      id: 'mycar5',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      price: 750000,
      owner: {
        id: 'user1',
        name: 'أنت',
      },
    },
    offered_description: 'هيونداي أكسنت 2019 - أبيض - 70,000 كم',
    cash_difference: 200000,
    cash_direction: 'RECEIVE',
    message: 'مستعد لدفع فرق 200,000 جنيه',
    proposer: {
      id: 'user6',
      name: 'معرض النجم',
      phone: '01000111222',
    },
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-02T14:00:00Z',
    expires_at: '2024-12-08T10:00:00Z',
  },
  {
    id: 'BP006',
    type: 'CAR_TO_CAR',
    status: 'EXPIRED',
    requested_car: {
      id: '6',
      make: 'Kia',
      model: 'Cerato',
      year: 2021,
      price: 620000,
      owner: {
        id: 'user7',
        name: 'محمد سعيد',
      },
    },
    offered_car: {
      id: 'mycar6',
      make: 'Hyundai',
      model: 'Elantra',
      year: 2020,
      price: 580000,
    },
    cash_difference: 40000,
    cash_direction: 'PAY',
    message: 'مقايضة + فرق بسيط',
    proposer: {
      id: 'user1',
      name: 'أنت',
      phone: '01098765432',
    },
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2024-11-20T10:00:00Z',
    expires_at: '2024-11-27T10:00:00Z',
  },
];

const statusFilters = [
  { value: '', label: 'جميع الحالات' },
  { value: 'PENDING', label: 'في الانتظار' },
  { value: 'COUNTER_OFFERED', label: 'عرض مقابل' },
  { value: 'ACCEPTED', label: 'مقبول' },
  { value: 'REJECTED', label: 'مرفوض' },
  { value: 'EXPIRED', label: 'منتهي' },
];

const directionFilters = [
  { value: '', label: 'الكل' },
  { value: 'sent', label: 'عروض أرسلتها' },
  { value: 'received', label: 'عروض استلمتها' },
];

export default function MyBarterPage() {
  const [proposals, setProposals] = useState<BarterProposal[]>(mockBarterProposals);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDirection, setSelectedDirection] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<BarterProposal | null>(null);
  const [counterOfferAmount, setCounterOfferAmount] = useState(0);
  const [counterOfferMessage, setCounterOfferMessage] = useState('');

  const currentUserId = 'user1';

  const filteredProposals = proposals.filter(p => {
    if (selectedStatus && p.status !== selectedStatus) return false;
    if (selectedDirection === 'sent' && p.proposer.id !== currentUserId) return false;
    if (selectedDirection === 'received' && p.requested_car.owner.id !== currentUserId) return false;
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; color: string; bg: string }> = {
      'PENDING': { label: 'في الانتظار', color: 'text-yellow-800', bg: 'bg-yellow-100' },
      'COUNTER_OFFERED': { label: 'عرض مقابل', color: 'text-blue-800', bg: 'bg-blue-100' },
      'ACCEPTED': { label: 'مقبول', color: 'text-green-800', bg: 'bg-green-100' },
      'REJECTED': { label: 'مرفوض', color: 'text-red-800', bg: 'bg-red-100' },
      'EXPIRED': { label: 'منتهي', color: 'text-gray-800', bg: 'bg-gray-100' },
      'CANCELLED': { label: 'ملغي', color: 'text-gray-800', bg: 'bg-gray-100' },
    };
    return statuses[status] || { label: status, color: 'text-gray-800', bg: 'bg-gray-100' };
  };

  const isMyProposal = (proposal: BarterProposal) => proposal.proposer.id === currentUserId;
  const isReceivedProposal = (proposal: BarterProposal) => proposal.requested_car.owner.id === currentUserId;

  const handleAccept = (proposal: BarterProposal) => {
    setProposals(proposals.map(p =>
      p.id === proposal.id ? { ...p, status: 'ACCEPTED', updated_at: new Date().toISOString() } : p
    ));
    alert('تم قبول العرض! سيتم إنشاء معاملة جديدة.');
  };

  const handleReject = (proposal: BarterProposal) => {
    setProposals(proposals.map(p =>
      p.id === proposal.id ? { ...p, status: 'REJECTED', updated_at: new Date().toISOString() } : p
    ));
    alert('تم رفض العرض');
  };

  const openCounterModal = (proposal: BarterProposal) => {
    setSelectedProposal(proposal);
    setCounterOfferAmount(proposal.cash_difference);
    setCounterOfferMessage('');
    setShowCounterModal(true);
  };

  const submitCounterOffer = () => {
    if (!selectedProposal) return;
    setProposals(proposals.map(p =>
      p.id === selectedProposal.id
        ? {
            ...p,
            status: 'COUNTER_OFFERED',
            counter_offer: {
              cash_difference: counterOfferAmount,
              message: counterOfferMessage,
              created_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          }
        : p
    ));
    setShowCounterModal(false);
    alert('تم إرسال العرض المقابل');
  };

  const acceptCounterOffer = (proposal: BarterProposal) => {
    setProposals(proposals.map(p =>
      p.id === proposal.id
        ? {
            ...p,
            status: 'ACCEPTED',
            cash_difference: proposal.counter_offer?.cash_difference || proposal.cash_difference,
            updated_at: new Date().toISOString(),
          }
        : p
    ));
    alert('تم قبول العرض المقابل! سيتم إنشاء معاملة جديدة.');
  };

  const handleCancel = (proposal: BarterProposal) => {
    setProposals(proposals.map(p =>
      p.id === proposal.id ? { ...p, status: 'CANCELLED', updated_at: new Date().toISOString() } : p
    ));
    alert('تم إلغاء العرض');
  };

  // Statistics
  const stats = {
    total: proposals.length,
    pending: proposals.filter(p => p.status === 'PENDING' || p.status === 'COUNTER_OFFERED').length,
    accepted: proposals.filter(p => p.status === 'ACCEPTED').length,
    sent: proposals.filter(p => p.proposer.id === currentUserId).length,
    received: proposals.filter(p => p.requested_car.owner.id === currentUserId).length,
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">عروض المقايضة</h1>
              <p className="text-gray-600">إدارة عروض التبادل الخاصة بك</p>
            </div>
            <Link
              href="/cars/barter"
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              تصفح سوق المقايضة
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">إجمالي العروض</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">في الانتظار</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-500">مقبولة</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            <div className="text-sm text-gray-500">عروض أرسلتها</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{stats.received}</div>
            <div className="text-sm text-gray-500">عروض استلمتها</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-700">الحالة:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2"
              >
                {statusFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-700">النوع:</span>
              <div className="flex gap-2">
                {directionFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedDirection(filter.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedDirection === filter.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Proposals List */}
        {filteredProposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد عروض مقايضة</h3>
            <p className="text-gray-600 mb-4">ابدأ بتصفح السيارات المتاحة للمقايضة</p>
            <Link
              href="/cars/barter"
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              تصفح سوق المقايضة
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map((proposal) => {
              const statusInfo = getStatusInfo(proposal.status);
              const isSent = isMyProposal(proposal);
              const isReceived = isReceivedProposal(proposal);

              return (
                <div key={proposal.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSent ? 'bg-blue-100' : 'bg-purple-100'
                        }`}>
                          <svg className={`w-6 h-6 ${isSent ? 'text-blue-600' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-500">#{proposal.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isSent ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {isSent ? 'عرض أرسلته' : 'عرض استلمته'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDate(proposal.created_at)}
                            {proposal.expires_at && new Date(proposal.expires_at) > new Date() && (
                              <span className="mr-2 text-orange-600">
                                • ينتهي {formatDate(proposal.expires_at)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cars Exchange */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      {/* Requested Car */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs text-gray-500 mb-2">
                          {isSent ? 'السيارة المطلوبة' : 'سيارتك'}
                        </p>
                        <h3 className="font-bold text-lg mb-1">
                          {proposal.requested_car.make} {proposal.requested_car.model} {proposal.requested_car.year}
                        </h3>
                        <p className="text-purple-600 font-semibold">
                          {formatPrice(proposal.requested_car.price)} جنيه
                        </p>
                        {!isSent && (
                          <p className="text-sm text-gray-500 mt-1">
                            من: {proposal.proposer.name}
                          </p>
                        )}
                      </div>

                      {/* Offered Car */}
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-xs text-purple-600 mb-2">
                          {isSent ? 'سيارتك المعروضة' : 'السيارة المعروضة'}
                        </p>
                        {proposal.offered_car ? (
                          <>
                            <h3 className="font-bold text-lg mb-1">
                              {proposal.offered_car.make} {proposal.offered_car.model} {proposal.offered_car.year}
                            </h3>
                            <p className="text-purple-600 font-semibold">
                              {formatPrice(proposal.offered_car.price)} جنيه
                            </p>
                          </>
                        ) : (
                          <p className="text-gray-700">{proposal.offered_description}</p>
                        )}
                      </div>
                    </div>

                    {/* Cash Difference */}
                    {proposal.cash_difference > 0 && (
                      <div className={`rounded-lg p-3 mb-4 ${
                        (isSent && proposal.cash_direction === 'PAY') || (!isSent && proposal.cash_direction === 'RECEIVE')
                          ? 'bg-red-50 border border-red-200'
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <svg className={`w-5 h-5 ${
                            (isSent && proposal.cash_direction === 'PAY') || (!isSent && proposal.cash_direction === 'RECEIVE')
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium">
                            فرق السعر: {formatPrice(proposal.cash_difference)} جنيه
                          </span>
                          <span className={`text-sm ${
                            (isSent && proposal.cash_direction === 'PAY') || (!isSent && proposal.cash_direction === 'RECEIVE')
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                            ({(isSent && proposal.cash_direction === 'PAY') || (!isSent && proposal.cash_direction === 'RECEIVE')
                              ? 'تدفع'
                              : 'تستلم'})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    {proposal.message && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">الرسالة: </span>
                          {proposal.message}
                        </p>
                      </div>
                    )}

                    {/* Counter Offer */}
                    {proposal.counter_offer && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-medium text-blue-800 mb-2">عرض مقابل</h4>
                        <p className="text-sm text-blue-700 mb-1">
                          فرق السعر المطلوب: <span className="font-bold">{formatPrice(proposal.counter_offer.cash_difference)} جنيه</span>
                        </p>
                        {proposal.counter_offer.message && (
                          <p className="text-sm text-blue-700">
                            {proposal.counter_offer.message}
                          </p>
                        )}
                        <p className="text-xs text-blue-500 mt-2">
                          {formatDate(proposal.counter_offer.created_at)}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t">
                      <Link
                        href={`/cars/${proposal.requested_car.id}`}
                        className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        عرض السيارة
                      </Link>

                      {/* Actions for received proposals */}
                      {isReceived && proposal.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAccept(proposal)}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            قبول
                          </button>
                          <button
                            onClick={() => openCounterModal(proposal)}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            عرض مقابل
                          </button>
                          <button
                            onClick={() => handleReject(proposal)}
                            className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            رفض
                          </button>
                        </>
                      )}

                      {/* Actions for sent proposals with counter offer */}
                      {isSent && proposal.status === 'COUNTER_OFFERED' && proposal.counter_offer && (
                        <>
                          <button
                            onClick={() => acceptCounterOffer(proposal)}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            قبول العرض المقابل
                          </button>
                          <button
                            onClick={() => handleReject(proposal)}
                            className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            رفض
                          </button>
                        </>
                      )}

                      {/* Cancel for pending sent proposals */}
                      {isSent && proposal.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(proposal)}
                          className="px-4 py-2 text-sm border border-gray-500 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          إلغاء العرض
                        </button>
                      )}

                      {/* View transaction for accepted proposals */}
                      {proposal.status === 'ACCEPTED' && (
                        <Link
                          href="/cars/my-transactions"
                          className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          عرض المعاملة
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <Link href="/cars/my-listings" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">إعلاناتي</h3>
              <p className="text-sm text-gray-500">إدارة سياراتك المعروضة</p>
            </div>
          </Link>
          <Link href="/cars/my-transactions" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">معاملاتي</h3>
              <p className="text-sm text-gray-500">تتبع عمليات البيع والشراء</p>
            </div>
          </Link>
          <Link href="/cars/sell" className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold">إضافة سيارة</h3>
              <p className="text-sm text-gray-500">أضف سيارتك للبيع أو المقايضة</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Counter Offer Modal */}
      {showCounterModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">عرض مقابل</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">العرض الأصلي</p>
              <p className="font-medium">
                {selectedProposal.offered_car
                  ? `${selectedProposal.offered_car.make} ${selectedProposal.offered_car.model}`
                  : selectedProposal.offered_description
                }
              </p>
              <p className="text-sm text-gray-500">
                + {formatPrice(selectedProposal.cash_difference)} جنيه
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                فرق السعر المطلوب (جنيه)
              </label>
              <input
                type="number"
                value={counterOfferAmount}
                onChange={(e) => setCounterOfferAmount(parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رسالة (اختياري)
              </label>
              <textarea
                value={counterOfferMessage}
                onChange={(e) => setCounterOfferMessage(e.target.value)}
                placeholder="اشرح سبب العرض المقابل..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 h-24 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCounterModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={submitCounterOffer}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                إرسال العرض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
