'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  TrashIcon,
  PlusIcon,
  ArrowsRightLeftIcon,
  MapPinIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  BellIcon,
  ChevronDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import {
  VEHICLE_MAKE_AR,
  type VehicleMake,
} from '@/lib/api/vehicle-marketplace';

type BarterStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'expired' | 'cancelled';

interface BarterOffer {
  id: string;
  type: 'sent' | 'received';
  status: BarterStatus;
  myVehicle: {
    make: VehicleMake;
    model: string;
    year: number;
    price: number;
    image: string;
  };
  theirVehicle: {
    make: VehicleMake;
    model: string;
    year: number;
    price: number;
    image: string;
  };
  otherParty: {
    name: string;
    avatar?: string;
    rating: number;
    location: string;
  };
  cashDifference: number;
  whoPaysCash: 'me' | 'them' | 'none';
  message?: string;
  createdAt: string;
  expiresAt: string;
  lastActivity: string;
}

// Mock data
const MOCK_BARTERS: BarterOffer[] = [
  {
    id: 'b1',
    type: 'received',
    status: 'pending',
    myVehicle: {
      make: 'TOYOTA',
      model: 'كامري',
      year: 2020,
      price: 850000,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
    },
    theirVehicle: {
      make: 'HYUNDAI',
      model: 'توسان',
      year: 2021,
      price: 920000,
      image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400',
    },
    otherParty: {
      name: 'محمد أحمد',
      rating: 4.8,
      location: 'القاهرة',
    },
    cashDifference: 70000,
    whoPaysCash: 'me',
    message: 'مرحباً، مهتم بسيارتك. سيارتي صيانة وكالة بالكامل ولم تتعرض لأي حوادث.',
    createdAt: '2024-01-10',
    expiresAt: '2024-01-17',
    lastActivity: 'منذ ساعتين',
  },
  {
    id: 'b2',
    type: 'sent',
    status: 'pending',
    myVehicle: {
      make: 'TOYOTA',
      model: 'كامري',
      year: 2020,
      price: 850000,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
    },
    theirVehicle: {
      make: 'NISSAN',
      model: 'سنترا',
      year: 2022,
      price: 780000,
      image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
    },
    otherParty: {
      name: 'أحمد خالد',
      rating: 4.5,
      location: 'الجيزة',
    },
    cashDifference: 70000,
    whoPaysCash: 'them',
    createdAt: '2024-01-08',
    expiresAt: '2024-01-15',
    lastActivity: 'منذ يوم',
  },
  {
    id: 'b3',
    type: 'received',
    status: 'accepted',
    myVehicle: {
      make: 'TOYOTA',
      model: 'كامري',
      year: 2020,
      price: 850000,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
    },
    theirVehicle: {
      make: 'KIA',
      model: 'سبورتاج',
      year: 2020,
      price: 830000,
      image: 'https://images.unsplash.com/photo-1619767886558-efdc259b6e09?w=400',
    },
    otherParty: {
      name: 'سارة محمود',
      rating: 4.9,
      location: 'الإسكندرية',
    },
    cashDifference: 20000,
    whoPaysCash: 'them',
    createdAt: '2024-01-05',
    expiresAt: '2024-01-12',
    lastActivity: 'منذ 3 ساعات',
  },
  {
    id: 'b4',
    type: 'sent',
    status: 'rejected',
    myVehicle: {
      make: 'TOYOTA',
      model: 'كامري',
      year: 2020,
      price: 850000,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
    },
    theirVehicle: {
      make: 'MERCEDES',
      model: 'C-Class',
      year: 2019,
      price: 1200000,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
    },
    otherParty: {
      name: 'علي حسن',
      rating: 4.2,
      location: 'القاهرة',
    },
    cashDifference: 350000,
    whoPaysCash: 'me',
    createdAt: '2024-01-01',
    expiresAt: '2024-01-08',
    lastActivity: 'منذ 5 أيام',
  },
  {
    id: 'b5',
    type: 'received',
    status: 'completed',
    myVehicle: {
      make: 'HONDA',
      model: 'أكورد',
      year: 2019,
      price: 720000,
      image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=400',
    },
    theirVehicle: {
      make: 'TOYOTA',
      model: 'كامري',
      year: 2020,
      price: 850000,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
    },
    otherParty: {
      name: 'كريم عادل',
      rating: 5.0,
      location: 'المنصورة',
    },
    cashDifference: 130000,
    whoPaysCash: 'me',
    createdAt: '2023-12-15',
    expiresAt: '2023-12-22',
    lastActivity: 'مكتملة',
  },
];

const STATUS_CONFIG: Record<BarterStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircleIcon }> = {
  pending: { label: 'في الانتظار', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: ClockIcon },
  accepted: { label: 'مقبول', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon },
  rejected: { label: 'مرفوض', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircleIcon },
  completed: { label: 'مكتمل', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircleIcon },
  expired: { label: 'منتهي', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: ClockIcon },
  cancelled: { label: 'ملغي', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: XCircleIcon },
};

export default function MyBartersPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'sent' | 'received'>('all');
  const [statusFilter, setStatusFilter] = useState<BarterStatus | 'all'>('all');
  const [selectedBarter, setSelectedBarter] = useState<string | null>(null);

  const filteredBarters = MOCK_BARTERS.filter(barter => {
    if (activeTab !== 'all' && barter.type !== activeTab) return false;
    if (statusFilter !== 'all' && barter.status !== statusFilter) return false;
    return true;
  });

  const pendingReceived = MOCK_BARTERS.filter(b => b.type === 'received' && b.status === 'pending').length;
  const pendingSent = MOCK_BARTERS.filter(b => b.type === 'sent' && b.status === 'pending').length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const handleAccept = (id: string) => {
    console.log('Accept barter:', id);
  };

  const handleReject = (id: string) => {
    console.log('Reject barter:', id);
  };

  const handleCancel = (id: string) => {
    console.log('Cancel barter:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/vehicles" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">مقايضاتي</h1>
                <p className="text-sm text-gray-500">إدارة عروض المقايضة المرسلة والمستلمة</p>
              </div>
            </div>
            <Link
              href="/vehicles/barter"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              مقايضة جديدة
            </Link>
          </div>
        </div>
      </header>

      {/* Notifications Banner */}
      {pendingReceived > 0 && (
        <div className="bg-purple-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BellIcon className="w-5 h-5" />
                <span>لديك {pendingReceived} عرض مقايضة جديد في انتظار ردك</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('received');
                  setStatusFilter('pending');
                }}
                className="text-sm underline hover:no-underline"
              >
                عرض الآن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'إجمالي المقايضات', value: MOCK_BARTERS.length, color: 'bg-gray-100 text-gray-700' },
            { label: 'في الانتظار', value: pendingReceived + pendingSent, color: 'bg-amber-100 text-amber-700' },
            { label: 'مقبولة', value: MOCK_BARTERS.filter(b => b.status === 'accepted').length, color: 'bg-green-100 text-green-700' },
            { label: 'مكتملة', value: MOCK_BARTERS.filter(b => b.status === 'completed').length, color: 'bg-blue-100 text-blue-700' },
          ].map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-xl p-4`}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm opacity-80">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'received', label: `مستلمة ${pendingReceived > 0 ? `(${pendingReceived})` : ''}` },
              { id: 'sent', label: `مرسلة ${pendingSent > 0 ? `(${pendingSent})` : ''}` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'all' | 'sent' | 'received')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BarterStatus | 'all')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">في الانتظار</option>
              <option value="accepted">مقبولة</option>
              <option value="rejected">مرفوضة</option>
              <option value="completed">مكتملة</option>
              <option value="expired">منتهية</option>
            </select>
          </div>
        </div>

        {/* Barters List */}
        {filteredBarters.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowsRightLeftIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد مقايضات</h3>
            <p className="text-gray-500 mb-6">لم تقم بأي عروض مقايضة بعد. ابدأ الآن!</p>
            <Link
              href="/vehicles/barter"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              ابحث عن مقايضة
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBarters.map((barter) => {
              const statusConfig = STATUS_CONFIG[barter.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={barter.id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all ${
                    selectedBarter === barter.id ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3 inline ml-1" />
                        {statusConfig.label}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        barter.type === 'received' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {barter.type === 'received' ? 'عرض مستلم' : 'عرض مرسل'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">{barter.lastActivity}</div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* My Vehicle */}
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-2">سيارتي</div>
                        <div className="flex items-center gap-3">
                          <img
                            src={barter.myVehicle.image}
                            alt={barter.myVehicle.model}
                            className="w-20 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {VEHICLE_MAKE_AR[barter.myVehicle.make]} {barter.myVehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">{barter.myVehicle.year}</div>
                            <div className="text-sm font-medium text-purple-600">
                              {formatPrice(barter.myVehicle.price)} جنيه
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex flex-col items-center px-4">
                        <ArrowsRightLeftIcon className="w-8 h-8 text-purple-400" />
                        <div className={`text-sm font-bold mt-1 ${
                          barter.whoPaysCash === 'me' ? 'text-red-600' :
                          barter.whoPaysCash === 'them' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                          {barter.whoPaysCash === 'none' ? (
                            'متوازن'
                          ) : barter.whoPaysCash === 'me' ? (
                            <>+{formatPrice(barter.cashDifference)}</>
                          ) : (
                            <>-{formatPrice(barter.cashDifference)}</>
                          )}
                        </div>
                      </div>

                      {/* Their Vehicle */}
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-2">سيارة الطرف الآخر</div>
                        <div className="flex items-center gap-3">
                          <img
                            src={barter.theirVehicle.image}
                            alt={barter.theirVehicle.model}
                            className="w-20 h-16 rounded-lg object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {VEHICLE_MAKE_AR[barter.theirVehicle.make]} {barter.theirVehicle.model}
                            </div>
                            <div className="text-sm text-gray-500">{barter.theirVehicle.year}</div>
                            <div className="text-sm font-medium text-purple-600">
                              {formatPrice(barter.theirVehicle.price)} جنيه
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Other Party */}
                      <div className="w-40 border-r border-gray-200 pr-4">
                        <div className="text-xs text-gray-500 mb-2">الطرف الآخر</div>
                        <div className="font-medium text-gray-900">{barter.otherParty.name}</div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPinIcon className="w-3 h-3" />
                          {barter.otherParty.location}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-amber-500">
                          {'★'.repeat(Math.floor(barter.otherParty.rating))}
                          <span className="text-gray-500">{barter.otherParty.rating}</span>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    {barter.message && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">رسالة:</div>
                        <p className="text-sm text-gray-700">{barter.message}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4 inline ml-1" />
                        تاريخ الإنشاء: {barter.createdAt}
                      </div>

                      <div className="flex items-center gap-2">
                        {barter.status === 'pending' && barter.type === 'received' && (
                          <>
                            <button
                              onClick={() => handleReject(barter.id)}
                              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                            >
                              <XCircleIcon className="w-4 h-4 inline ml-1" />
                              رفض
                            </button>
                            <button
                              onClick={() => handleAccept(barter.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4 inline ml-1" />
                              قبول
                            </button>
                          </>
                        )}

                        {barter.status === 'pending' && barter.type === 'sent' && (
                          <button
                            onClick={() => handleCancel(barter.id)}
                            className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                          >
                            <XCircleIcon className="w-4 h-4 inline ml-1" />
                            إلغاء العرض
                          </button>
                        )}

                        {barter.status === 'accepted' && (
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 inline ml-1" />
                            متابعة وإتمام الصفقة
                          </button>
                        )}

                        <button className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                          <EyeIcon className="w-4 h-4 inline ml-1" />
                          التفاصيل
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

      {/* Tips Section */}
      <div className="bg-white border-t border-gray-200 py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">نصائح للمقايضة الناجحة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'رد بسرعة', desc: 'العروض المعلقة تنتهي بعد 7 أيام' },
              { title: 'تواصل بوضوح', desc: 'اشرح حالة سيارتك بالتفصيل' },
              { title: 'استخدم الضمان', desc: 'أتم الصفقة عبر نظام الضمان' },
            ].map((tip, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-bold">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{tip.title}</div>
                  <div className="text-sm text-gray-600">{tip.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
