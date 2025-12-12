'use client';

/**
 * My Car Transactions Page
 * صفحة معاملاتي للسيارات
 */

import { useState } from 'react';
import Link from 'next/link';

interface CarTransaction {
  id: string;
  transaction_type: string;
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
  };
  buyer: {
    id: string;
    name: string;
    phone: string;
  };
  seller: {
    id: string;
    name: string;
    phone: string;
  };
  agreed_price: number;
  platform_fee_buyer: number;
  platform_fee_seller: number;
  escrow_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;
}

// بيانات تجريبية للمعاملات
const mockTransactions: CarTransaction[] = [
  {
    id: 'TXN001',
    transaction_type: 'DIRECT_SALE',
    car: {
      id: '1',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      price: 850000,
    },
    buyer: {
      id: 'user2',
      name: 'محمد علي',
      phone: '01012345678',
    },
    seller: {
      id: 'user1',
      name: 'أنت',
      phone: '01098765432',
    },
    agreed_price: 840000,
    platform_fee_buyer: 12600,
    platform_fee_seller: 12600,
    escrow_amount: 852600,
    status: 'COMPLETED',
    payment_method: 'BANK_TRANSFER',
    created_at: '2024-12-01T10:00:00Z',
    updated_at: '2024-12-05T15:30:00Z',
    completed_at: '2024-12-05T15:30:00Z',
  },
  {
    id: 'TXN002',
    transaction_type: 'DIRECT_SALE',
    car: {
      id: '2',
      make: 'BMW',
      model: '320i',
      year: 2021,
      price: 1200000,
    },
    buyer: {
      id: 'user1',
      name: 'أنت',
      phone: '01098765432',
    },
    seller: {
      id: 'user3',
      name: 'خالد محمود',
      phone: '01123456789',
    },
    agreed_price: 1180000,
    platform_fee_buyer: 17700,
    platform_fee_seller: 17700,
    escrow_amount: 1197700,
    status: 'IN_ESCROW',
    payment_method: 'ESCROW',
    created_at: '2024-12-08T14:00:00Z',
    updated_at: '2024-12-09T10:00:00Z',
    notes: 'في انتظار فحص السيارة',
  },
  {
    id: 'TXN003',
    transaction_type: 'BARTER',
    car: {
      id: '3',
      make: 'Mercedes-Benz',
      model: 'C200',
      year: 2020,
      price: 1400000,
    },
    buyer: {
      id: 'user4',
      name: 'أحمد حسن',
      phone: '01234567890',
    },
    seller: {
      id: 'user1',
      name: 'أنت',
      phone: '01098765432',
    },
    agreed_price: 1350000,
    platform_fee_buyer: 20250,
    platform_fee_seller: 20250,
    escrow_amount: 100000,
    status: 'PENDING_INSPECTION',
    payment_method: 'ESCROW',
    created_at: '2024-12-10T09:00:00Z',
    updated_at: '2024-12-10T09:00:00Z',
    notes: 'مقايضة + فرق 100,000 جنيه',
  },
  {
    id: 'TXN004',
    transaction_type: 'DIRECT_SALE',
    car: {
      id: '4',
      make: 'Hyundai',
      model: 'Tucson',
      year: 2023,
      price: 950000,
    },
    buyer: {
      id: 'user5',
      name: 'سامي إبراهيم',
      phone: '01111222333',
    },
    seller: {
      id: 'user1',
      name: 'أنت',
      phone: '01098765432',
    },
    agreed_price: 920000,
    platform_fee_buyer: 13800,
    platform_fee_seller: 13800,
    escrow_amount: 0,
    status: 'CANCELLED',
    payment_method: 'CASH',
    created_at: '2024-11-28T11:00:00Z',
    updated_at: '2024-11-30T16:00:00Z',
    notes: 'تم الإلغاء بناءً على طلب المشتري',
  },
  {
    id: 'TXN005',
    transaction_type: 'DIRECT_SALE',
    car: {
      id: '5',
      make: 'Kia',
      model: 'Sportage',
      year: 2022,
      price: 780000,
    },
    buyer: {
      id: 'user1',
      name: 'أنت',
      phone: '01098765432',
    },
    seller: {
      id: 'user6',
      name: 'معرض النجم',
      phone: '01000111222',
    },
    agreed_price: 760000,
    platform_fee_buyer: 11400,
    platform_fee_seller: 11400,
    escrow_amount: 771400,
    status: 'PENDING_PAYMENT',
    payment_method: 'ESCROW',
    created_at: '2024-12-11T08:00:00Z',
    updated_at: '2024-12-11T08:00:00Z',
  },
];

const statusFilters = [
  { value: '', label: 'جميع الحالات' },
  { value: 'PENDING_PAYMENT', label: 'في انتظار الدفع' },
  { value: 'IN_ESCROW', label: 'في الضمان' },
  { value: 'PENDING_INSPECTION', label: 'في انتظار الفحص' },
  { value: 'COMPLETED', label: 'مكتملة' },
  { value: 'CANCELLED', label: 'ملغاة' },
  { value: 'DISPUTED', label: 'متنازع عليها' },
];

const roleFilters = [
  { value: '', label: 'الكل' },
  { value: 'buyer', label: 'كمشتري' },
  { value: 'seller', label: 'كبائع' },
];

export default function MyTransactionsPage() {
  const [transactions] = useState<CarTransaction[]>(mockTransactions);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const currentUserId = 'user1'; // افتراضي للمستخدم الحالي

  const filteredTransactions = transactions.filter(t => {
    if (selectedStatus && t.status !== selectedStatus) return false;
    if (selectedRole === 'buyer' && t.buyer.id !== currentUserId) return false;
    if (selectedRole === 'seller' && t.seller.id !== currentUserId) return false;
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; color: string; bg: string; icon: string }> = {
      'PENDING_PAYMENT': {
        label: 'في انتظار الدفع',
        color: 'text-yellow-800',
        bg: 'bg-yellow-100',
        icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      'IN_ESCROW': {
        label: 'في الضمان',
        color: 'text-blue-800',
        bg: 'bg-blue-100',
        icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
      },
      'PENDING_INSPECTION': {
        label: 'في انتظار الفحص',
        color: 'text-orange-800',
        bg: 'bg-orange-100',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
      },
      'COMPLETED': {
        label: 'مكتملة',
        color: 'text-green-800',
        bg: 'bg-green-100',
        icon: 'M5 13l4 4L19 7'
      },
      'CANCELLED': {
        label: 'ملغاة',
        color: 'text-red-800',
        bg: 'bg-red-100',
        icon: 'M6 18L18 6M6 6l12 12'
      },
      'DISPUTED': {
        label: 'متنازع عليها',
        color: 'text-purple-800',
        bg: 'bg-purple-100',
        icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
      },
    };
    return statuses[status] || { label: status, color: 'text-gray-800', bg: 'bg-gray-100', icon: '' };
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'DIRECT_SALE': 'بيع مباشر',
      'BARTER': 'مقايضة',
      'AUCTION': 'مزاد',
    };
    return types[type] || type;
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      'CASH': 'نقدي',
      'BANK_TRANSFER': 'تحويل بنكي',
      'ESCROW': 'نظام الضمان',
      'INSTALLMENTS': 'تقسيط',
    };
    return methods[method] || method;
  };

  const getUserRole = (transaction: CarTransaction) => {
    if (transaction.buyer.id === currentUserId) return 'buyer';
    if (transaction.seller.id === currentUserId) return 'seller';
    return null;
  };

  // Statistics
  const stats = {
    total: transactions.length,
    completed: transactions.filter(t => t.status === 'COMPLETED').length,
    inProgress: transactions.filter(t => ['PENDING_PAYMENT', 'IN_ESCROW', 'PENDING_INSPECTION'].includes(t.status)).length,
    totalValue: transactions
      .filter(t => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.agreed_price, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">معاملاتي</h1>
              <p className="text-gray-600">تتبع عمليات البيع والشراء الخاصة بك</p>
            </div>
            <Link
              href="/cars"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              تصفح السيارات
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">إجمالي المعاملات</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">معاملات مكتملة</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            <div className="text-sm text-gray-500">قيد التنفيذ</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{formatPrice(stats.totalValue)}</div>
            <div className="text-sm text-gray-500">إجمالي القيمة (جنيه)</div>
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
              <span className="text-gray-700">دورك:</span>
              <div className="flex gap-2">
                {roleFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setSelectedRole(filter.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedRole === filter.value
                        ? 'bg-blue-600 text-white'
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

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد معاملات</h3>
            <p className="text-gray-600 mb-4">لم تقم بأي معاملات بعد</p>
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              تصفح السيارات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const statusInfo = getStatusInfo(transaction.status);
              const userRole = getUserRole(transaction);
              const otherParty = userRole === 'buyer' ? transaction.seller : transaction.buyer;

              return (
                <div key={transaction.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4 md:p-6">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className={`w-12 h-12 rounded-full ${statusInfo.bg} flex items-center justify-center flex-shrink-0`}>
                          <svg className={`w-6 h-6 ${statusInfo.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={statusInfo.icon} />
                          </svg>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-gray-500">#{transaction.id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              userRole === 'buyer' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {userRole === 'buyer' ? 'مشتري' : 'بائع'}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold">
                            {transaction.car.make} {transaction.car.model} {transaction.car.year}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {getTransactionTypeLabel(transaction.transaction_type)} • {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatPrice(transaction.agreed_price)} جنيه
                        </div>
                        <p className="text-sm text-gray-500">
                          السعر المتفق عليه
                        </p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      {/* Other Party */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">
                          {userRole === 'buyer' ? 'البائع' : 'المشتري'}
                        </p>
                        <p className="font-medium">{otherParty.name}</p>
                        <p className="text-sm text-gray-600">{otherParty.phone}</p>
                      </div>

                      {/* Payment Info */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">طريقة الدفع</p>
                        <p className="font-medium">{getPaymentMethodLabel(transaction.payment_method)}</p>
                        {transaction.escrow_amount > 0 && (
                          <p className="text-sm text-gray-600">
                            في الضمان: {formatPrice(transaction.escrow_amount)} جنيه
                          </p>
                        )}
                      </div>

                      {/* Fees */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">العمولة (1.5%)</p>
                        <p className="font-medium">
                          {formatPrice(userRole === 'buyer' ? transaction.platform_fee_buyer : transaction.platform_fee_seller)} جنيه
                        </p>
                        <p className="text-sm text-gray-600">
                          {userRole === 'buyer' ? 'عمولة المشتري' : 'عمولة البائع'}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {transaction.notes && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">ملاحظة: </span>
                          {transaction.notes}
                        </p>
                      </div>
                    )}

                    {/* Timeline for in-progress transactions */}
                    {['PENDING_PAYMENT', 'IN_ESCROW', 'PENDING_INSPECTION'].includes(transaction.status) && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-3">مراحل المعاملة</h4>
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center ${transaction.status !== 'PENDING_PAYMENT' ? 'text-green-600' : 'text-blue-600'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              transaction.status !== 'PENDING_PAYMENT' ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                              {transaction.status !== 'PENDING_PAYMENT' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <span className="text-xs font-bold">1</span>
                              )}
                            </div>
                            <span className="mr-2 text-xs">الدفع</span>
                          </div>
                          <div className={`flex-1 h-0.5 ${transaction.status !== 'PENDING_PAYMENT' ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                          <div className={`flex items-center ${
                            transaction.status === 'PENDING_INSPECTION' || transaction.status === 'COMPLETED'
                              ? 'text-green-600'
                              : transaction.status === 'IN_ESCROW'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              transaction.status === 'PENDING_INSPECTION' || transaction.status === 'COMPLETED'
                                ? 'bg-green-100'
                                : transaction.status === 'IN_ESCROW'
                                ? 'bg-blue-100'
                                : 'bg-gray-100'
                            }`}>
                              {transaction.status === 'PENDING_INSPECTION' || transaction.status === 'COMPLETED' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <span className="text-xs font-bold">2</span>
                              )}
                            </div>
                            <span className="mr-2 text-xs">الضمان</span>
                          </div>
                          <div className={`flex-1 h-0.5 ${
                            transaction.status === 'COMPLETED' ? 'bg-green-400' : 'bg-gray-200'
                          }`}></div>
                          <div className={`flex items-center ${
                            transaction.status === 'COMPLETED'
                              ? 'text-green-600'
                              : transaction.status === 'PENDING_INSPECTION'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              transaction.status === 'COMPLETED'
                                ? 'bg-green-100'
                                : transaction.status === 'PENDING_INSPECTION'
                                ? 'bg-blue-100'
                                : 'bg-gray-100'
                            }`}>
                              {transaction.status === 'COMPLETED' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <span className="text-xs font-bold">3</span>
                              )}
                            </div>
                            <span className="mr-2 text-xs">الفحص</span>
                          </div>
                          <div className={`flex-1 h-0.5 ${transaction.status === 'COMPLETED' ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                          <div className={`flex items-center ${transaction.status === 'COMPLETED' ? 'text-green-600' : 'text-gray-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              transaction.status === 'COMPLETED' ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {transaction.status === 'COMPLETED' ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <span className="text-xs font-bold">4</span>
                              )}
                            </div>
                            <span className="mr-2 text-xs">اكتمال</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                      <Link
                        href={`/cars/${transaction.car.id}`}
                        className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        عرض السيارة
                      </Link>
                      {transaction.status === 'PENDING_PAYMENT' && userRole === 'buyer' && (
                        <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          إتمام الدفع
                        </button>
                      )}
                      {transaction.status === 'IN_ESCROW' && (
                        <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          جدولة الفحص
                        </button>
                      )}
                      {['PENDING_PAYMENT', 'IN_ESCROW'].includes(transaction.status) && (
                        <button className="px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                          إلغاء المعاملة
                        </button>
                      )}
                      {transaction.status === 'IN_ESCROW' && (
                        <button className="px-4 py-2 text-sm border border-purple-500 text-purple-500 rounded-lg hover:bg-purple-50 transition-colors">
                          فتح نزاع
                        </button>
                      )}
                      <button className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        تواصل مع الدعم
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h2 className="text-lg font-bold text-blue-900 mb-4">كيف يعمل نظام الضمان؟</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-blue-600">1</span>
              </div>
              <p className="text-sm text-blue-800">يدفع المشتري في حساب الضمان</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-blue-600">2</span>
              </div>
              <p className="text-sm text-blue-800">يتم فحص السيارة في مركز معتمد</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-blue-600">3</span>
              </div>
              <p className="text-sm text-blue-800">يوافق المشتري على الاستلام</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-blue-600">4</span>
              </div>
              <p className="text-sm text-blue-800">يتم تحويل المبلغ للبائع</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
