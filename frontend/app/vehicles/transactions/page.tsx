'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  VEHICLE_MAKE_AR,
  type VehicleMake,
} from '@/lib/api/vehicle-marketplace';

type TransactionStatus = 'pending' | 'escrow' | 'inspection' | 'completed' | 'cancelled' | 'disputed';
type TransactionType = 'sale' | 'purchase' | 'barter';

interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  vehicle: {
    make: VehicleMake;
    model: string;
    year: number;
    image: string;
  };
  price: number;
  otherParty: {
    name: string;
    phone?: string;
    rating: number;
    location: string;
  };
  escrowAmount: number;
  createdAt: string;
  updatedAt: string;
  steps: {
    name: string;
    completed: boolean;
    date?: string;
  }[];
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    type: 'sale',
    status: 'escrow',
    vehicle: {
      make: 'TOYOTA',
      model: 'كامري',
      year: 2020,
      image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
    },
    price: 850000,
    otherParty: {
      name: 'محمد أحمد',
      phone: '01012345678',
      rating: 4.8,
      location: 'القاهرة - مدينة نصر',
    },
    escrowAmount: 85000,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-10',
    steps: [
      { name: 'تأكيد الطلب', completed: true, date: '2024-01-08' },
      { name: 'دفع العربون', completed: true, date: '2024-01-09' },
      { name: 'الفحص والمعاينة', completed: false },
      { name: 'إتمام الدفع', completed: false },
      { name: 'نقل الملكية', completed: false },
    ],
  },
  {
    id: 'tx2',
    type: 'purchase',
    status: 'inspection',
    vehicle: {
      make: 'HYUNDAI',
      model: 'توسان',
      year: 2021,
      image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=400',
    },
    price: 920000,
    otherParty: {
      name: 'أحمد خالد',
      phone: '01123456789',
      rating: 4.5,
      location: 'الجيزة - الدقي',
    },
    escrowAmount: 92000,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-10',
    steps: [
      { name: 'تأكيد الطلب', completed: true, date: '2024-01-05' },
      { name: 'دفع العربون', completed: true, date: '2024-01-06' },
      { name: 'الفحص والمعاينة', completed: true, date: '2024-01-09' },
      { name: 'إتمام الدفع', completed: false },
      { name: 'نقل الملكية', completed: false },
    ],
  },
  {
    id: 'tx3',
    type: 'barter',
    status: 'pending',
    vehicle: {
      make: 'KIA',
      model: 'سبورتاج',
      year: 2020,
      image: 'https://images.unsplash.com/photo-1619767886558-efdc259b6e09?w=400',
    },
    price: 830000,
    otherParty: {
      name: 'سارة محمود',
      rating: 4.9,
      location: 'الإسكندرية',
    },
    escrowAmount: 0,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    steps: [
      { name: 'قبول المقايضة', completed: true, date: '2024-01-10' },
      { name: 'تحديد موعد المعاينة', completed: false },
      { name: 'معاينة السيارتين', completed: false },
      { name: 'توقيع العقد', completed: false },
      { name: 'نقل الملكية', completed: false },
    ],
  },
  {
    id: 'tx4',
    type: 'sale',
    status: 'completed',
    vehicle: {
      make: 'NISSAN',
      model: 'سنترا',
      year: 2019,
      image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400',
    },
    price: 580000,
    otherParty: {
      name: 'علي حسن',
      phone: '01234567890',
      rating: 5.0,
      location: 'القاهرة - المعادي',
    },
    escrowAmount: 58000,
    createdAt: '2023-12-15',
    updatedAt: '2023-12-28',
    steps: [
      { name: 'تأكيد الطلب', completed: true, date: '2023-12-15' },
      { name: 'دفع العربون', completed: true, date: '2023-12-16' },
      { name: 'الفحص والمعاينة', completed: true, date: '2023-12-20' },
      { name: 'إتمام الدفع', completed: true, date: '2023-12-25' },
      { name: 'نقل الملكية', completed: true, date: '2023-12-28' },
    ],
  },
  {
    id: 'tx5',
    type: 'purchase',
    status: 'cancelled',
    vehicle: {
      make: 'MERCEDES',
      model: 'C-Class',
      year: 2018,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400',
    },
    price: 1100000,
    otherParty: {
      name: 'كريم عادل',
      rating: 3.5,
      location: 'القاهرة - التجمع',
    },
    escrowAmount: 110000,
    createdAt: '2023-12-01',
    updatedAt: '2023-12-10',
    steps: [
      { name: 'تأكيد الطلب', completed: true, date: '2023-12-01' },
      { name: 'دفع العربون', completed: true, date: '2023-12-02' },
      { name: 'الفحص والمعاينة', completed: false },
      { name: 'إتمام الدفع', completed: false },
      { name: 'نقل الملكية', completed: false },
    ],
  },
];

const STATUS_CONFIG: Record<TransactionStatus, { label: string; color: string; bgColor: string; icon: typeof CheckCircleIcon }> = {
  pending: { label: 'في الانتظار', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: ClockIcon },
  escrow: { label: 'في الضمان', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: ShieldCheckIcon },
  inspection: { label: 'مرحلة الفحص', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: EyeIcon },
  completed: { label: 'مكتملة', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon },
  cancelled: { label: 'ملغية', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircleIcon },
  disputed: { label: 'نزاع', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: ExclamationTriangleIcon },
};

const TYPE_CONFIG: Record<TransactionType, { label: string; color: string; icon: typeof BanknotesIcon }> = {
  sale: { label: 'بيع', color: 'text-green-600', icon: BanknotesIcon },
  purchase: { label: 'شراء', color: 'text-blue-600', icon: TruckIcon },
  barter: { label: 'مقايضة', color: 'text-purple-600', icon: ArrowPathIcon },
};

export default function TransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null);

  const filteredTransactions = MOCK_TRANSACTIONS.filter(tx => {
    if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const activeTransactions = MOCK_TRANSACTIONS.filter(tx => ['pending', 'escrow', 'inspection'].includes(tx.status)).length;
  const completedTransactions = MOCK_TRANSACTIONS.filter(tx => tx.status === 'completed').length;
  const totalValue = MOCK_TRANSACTIONS.filter(tx => tx.status === 'completed').reduce((sum, tx) => sum + tx.price, 0);

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
                <h1 className="text-xl font-bold text-gray-900">معاملاتي</h1>
                <p className="text-sm text-gray-500">تتبع عمليات البيع والشراء والمقايضة</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              <ArrowDownTrayIcon className="w-5 h-5" />
              تصدير التقرير
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeTransactions}</div>
                <div className="text-sm text-gray-500">جارية</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{completedTransactions}</div>
                <div className="text-sm text-gray-500">مكتملة</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatPrice(totalValue)}</div>
                <div className="text-sm text-gray-500">قيمة المبيعات</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{MOCK_TRANSACTIONS.filter(tx => tx.type === 'barter').length}</div>
                <div className="text-sm text-gray-500">مقايضات</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'pending', label: 'في الانتظار' },
              { id: 'escrow', label: 'في الضمان' },
              { id: 'inspection', label: 'الفحص' },
              { id: 'completed', label: 'مكتملة' },
              { id: 'cancelled', label: 'ملغية' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id as TransactionStatus | 'all')}
                className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${
                  statusFilter === filter.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">جميع الأنواع</option>
              <option value="sale">بيع</option>
              <option value="purchase">شراء</option>
              <option value="barter">مقايضة</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DocumentTextIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد معاملات</h3>
            <p className="text-gray-500 mb-6">لم تقم بأي عمليات بيع أو شراء بعد</p>
            <Link
              href="/vehicles/listings"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              تصفح السيارات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => {
              const statusConfig = STATUS_CONFIG[tx.status];
              const typeConfig = TYPE_CONFIG[tx.type];
              const StatusIcon = statusConfig.icon;
              const TypeIcon = typeConfig.icon;
              const isExpanded = expandedTransaction === tx.id;
              const completedSteps = tx.steps.filter(s => s.completed).length;
              const totalSteps = tx.steps.length;

              return (
                <div
                  key={tx.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Main Content */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedTransaction(isExpanded ? null : tx.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Vehicle Image */}
                      <img
                        src={tx.vehicle.image}
                        alt={tx.vehicle.model}
                        className="w-20 h-16 rounded-lg object-cover"
                      />

                      {/* Vehicle Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          <span className={`flex items-center gap-1 text-xs ${typeConfig.color}`}>
                            <TypeIcon className="w-3 h-3" />
                            {typeConfig.label}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900">
                          {VEHICLE_MAKE_AR[tx.vehicle.make]} {tx.vehicle.model} {tx.vehicle.year}
                        </h3>
                        <div className="text-sm text-gray-500 mt-1">
                          {tx.type === 'sale' ? 'المشتري:' : tx.type === 'purchase' ? 'البائع:' : 'الطرف الآخر:'} {tx.otherParty.name}
                        </div>
                      </div>

                      {/* Price & Progress */}
                      <div className="text-left">
                        <div className="text-xl font-bold text-primary-600">
                          {formatPrice(tx.price)} جنيه
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {completedSteps}/{totalSteps} خطوات
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            tx.status === 'completed' ? 'bg-green-500' :
                            tx.status === 'cancelled' ? 'bg-red-500' :
                            'bg-primary-500'
                          }`}
                          style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      {/* Steps */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">مراحل المعاملة</h4>
                        <div className="flex items-center justify-between">
                          {tx.steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center relative">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                              }`}>
                                {step.completed ? (
                                  <CheckCircleIcon className="w-5 h-5" />
                                ) : (
                                  <span className="text-sm">{index + 1}</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-600 mt-2 text-center max-w-20">{step.name}</div>
                              {step.date && (
                                <div className="text-xs text-gray-400">{step.date}</div>
                              )}
                              {index < tx.steps.length - 1 && (
                                <div className={`absolute top-4 right-8 w-full h-0.5 ${
                                  step.completed ? 'bg-green-500' : 'bg-gray-200'
                                }`} style={{ width: 'calc(100% - 2rem)', left: '100%' }} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Other Party Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">
                            {tx.type === 'sale' ? 'بيانات المشتري' : 'بيانات البائع'}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <UserCircleIcon className="w-5 h-5 text-gray-400" />
                              <span>{tx.otherParty.name}</span>
                            </div>
                            {tx.otherParty.phone && (
                              <div className="flex items-center gap-2">
                                <PhoneIcon className="w-5 h-5 text-gray-400" />
                                <span dir="ltr">{tx.otherParty.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <MapPinIcon className="w-5 h-5 text-gray-400" />
                              <span>{tx.otherParty.location}</span>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500">
                              {'★'.repeat(Math.floor(tx.otherParty.rating))}
                              <span className="text-gray-500 mr-1">{tx.otherParty.rating}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">تفاصيل المعاملة</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">رقم المعاملة:</span>
                              <span className="font-medium">#{tx.id.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">تاريخ البدء:</span>
                              <span>{tx.createdAt}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">آخر تحديث:</span>
                              <span>{tx.updatedAt}</span>
                            </div>
                            {tx.escrowAmount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">مبلغ الضمان:</span>
                                <span className="text-green-600 font-medium">{formatPrice(tx.escrowAmount)} جنيه</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-2">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1">
                          <DocumentTextIcon className="w-4 h-4" />
                          عرض العقد
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          تواصل
                        </button>
                        {['pending', 'escrow', 'inspection'].includes(tx.status) && (
                          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                            متابعة الإجراءات
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Escrow Info */}
        <div className="mt-8 bg-gradient-to-l from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheckIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">نظام الضمان الآمن</h3>
              <p className="text-white/80 mb-4">
                جميع المعاملات محمية بنظام ضمان Xchange. نحتفظ بالأموال حتى يتم التحقق من السيارة وإتمام جميع الإجراءات بنجاح.
              </p>
              <Link href="#" className="text-white underline hover:no-underline">
                تعرف على المزيد عن نظام الضمان
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
