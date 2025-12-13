'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getInstallmentPlans,
  getMyInstallmentRequests,
  calculateInstallment,
  InstallmentPlan,
  ProviderPlans,
  InstallmentRequest,
  INSTALLMENT_PROVIDERS,
  INSTALLMENT_STATUSES,
  formatCurrency,
} from '@/lib/api/installment';

// ============================================
// Installment Page - صفحة التقسيط
// ============================================

export default function InstallmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const [amount, setAmount] = useState<number>(10000);
  const [plans, setPlans] = useState<ProviderPlans[]>([]);
  const [myRequests, setMyRequests] = useState<InstallmentRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<{ provider: string; plan: InstallmentPlan } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadMyRequests();
    } else {
      setLoadingRequests(false);
    }
  }, [isAuthenticated]);

  const loadMyRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await getMyInstallmentRequests();
      setMyRequests(response.data.requests || []);
    } catch (err: any) {
      // User might not have any requests
      setMyRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCalculate = async () => {
    if (amount < 1000) {
      setError('الحد الأدنى للتقسيط 1,000 جنيه');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await getInstallmentPlans(amount);
      setPlans(response.data.plans || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في حساب خطط التقسيط');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return INSTALLMENT_STATUSES[status as keyof typeof INSTALLMENT_STATUSES] || {
      label: status,
      color: 'gray',
      icon: '📋',
    };
  };

  const getProviderInfo = (provider: string) => {
    return INSTALLMENT_PROVIDERS[provider as keyof typeof INSTALLMENT_PROVIDERS] || {
      nameAr: provider,
      logo: '💳',
      color: 'gray',
      description: '',
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Default plans for display
  const defaultPlans: ProviderPlans[] = [
    {
      provider: 'VALU',
      providerNameAr: 'فاليو',
      plans: [
        { months: 6, monthlyAmount: Math.round(amount / 6 * 1.05), interestRate: 5, totalAmount: Math.round(amount * 1.05), downPayment: 0, adminFee: 0 },
        { months: 12, monthlyAmount: Math.round(amount / 12 * 1.1), interestRate: 10, totalAmount: Math.round(amount * 1.1), downPayment: 0, adminFee: 0 },
        { months: 24, monthlyAmount: Math.round(amount / 24 * 1.18), interestRate: 18, totalAmount: Math.round(amount * 1.18), downPayment: 0, adminFee: 0 },
      ],
    },
    {
      provider: 'CONTACT',
      providerNameAr: 'كونتكت',
      plans: [
        { months: 6, monthlyAmount: Math.round(amount / 6 * 1.04), interestRate: 4, totalAmount: Math.round(amount * 1.04), downPayment: Math.round(amount * 0.1), adminFee: 0 },
        { months: 12, monthlyAmount: Math.round(amount / 12 * 1.08), interestRate: 8, totalAmount: Math.round(amount * 1.08), downPayment: Math.round(amount * 0.1), adminFee: 0 },
      ],
    },
    {
      provider: 'SOUHOOLA',
      providerNameAr: 'سهولة',
      plans: [
        { months: 3, monthlyAmount: Math.round(amount / 3 * 1.02), interestRate: 2, totalAmount: Math.round(amount * 1.02), downPayment: 0, adminFee: 0 },
        { months: 6, monthlyAmount: Math.round(amount / 6 * 1.04), interestRate: 4, totalAmount: Math.round(amount * 1.04), downPayment: 0, adminFee: 0 },
      ],
    },
  ];

  const displayPlans = plans.length > 0 ? plans : (amount >= 1000 ? defaultPlans : []);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-violet-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">💳 خدمة التقسيط</h1>
          <p className="text-violet-100 mt-1">
            اشترِ الآن وادفع على أقساط مريحة
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Calculator */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📱 احسب القسط الشهري</h2>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المبلغ المطلوب (جنيه)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1000}
                step={1000}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-lg"
                placeholder="أدخل المبلغ"
              />
            </div>
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="px-8 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition disabled:opacity-50"
            >
              {loading ? 'جاري الحساب...' : '🔍 احسب'}
            </button>
          </div>

          {/* Quick amounts */}
          <div className="mt-4 flex gap-2 flex-wrap">
            {[5000, 10000, 20000, 50000, 100000].map((val) => (
              <button
                key={val}
                onClick={() => setAmount(val)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  amount === val
                    ? 'bg-violet-100 text-violet-700 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatCurrency(val)}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Plans */}
        {displayPlans.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 خطط التقسيط المتاحة</h2>
            <div className="space-y-6">
              {displayPlans.map((providerPlan) => {
                const providerInfo = getProviderInfo(providerPlan.provider);
                return (
                  <div key={providerPlan.provider} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Provider Header */}
                    <div className={`bg-${providerInfo.color}-50 p-4 border-b border-gray-100`}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{providerInfo.logo}</span>
                        <div>
                          <h3 className="font-bold text-gray-900">{providerInfo.nameAr}</h3>
                          <p className="text-sm text-gray-600">{providerInfo.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="p-4 grid md:grid-cols-3 gap-4">
                      {providerPlan.plans.map((plan) => (
                        <div
                          key={`${providerPlan.provider}-${plan.months}`}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition ${
                            selectedPlan?.provider === providerPlan.provider && selectedPlan?.plan.months === plan.months
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-violet-300'
                          }`}
                          onClick={() => setSelectedPlan({ provider: providerPlan.provider, plan })}
                        >
                          <div className="text-center">
                            <p className="text-sm text-gray-500">{plan.months} شهر</p>
                            <p className="text-2xl font-bold text-violet-600 mt-1">
                              {formatCurrency(plan.monthlyAmount)}
                            </p>
                            <p className="text-xs text-gray-500">شهرياً</p>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">الإجمالي</span>
                              <span className="font-medium">{formatCurrency(plan.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">نسبة الفائدة</span>
                              <span className="font-medium">{plan.interestRate}%</span>
                            </div>
                            {plan.downPayment > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">مقدم</span>
                                <span className="font-medium">{formatCurrency(plan.downPayment)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* My Requests */}
        {isAuthenticated && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📄 طلباتي</h2>

            {loadingRequests ? (
              <div className="text-center py-8">
                <div className="inline-block w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : myRequests.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-gray-600">لا توجد طلبات تقسيط سابقة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map((request) => {
                  const statusInfo = getStatusInfo(request.status);
                  const providerInfo = getProviderInfo(request.provider);

                  return (
                    <div key={request.id} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{providerInfo.logo}</span>
                          <div>
                            <p className="font-bold text-gray-900">{providerInfo.nameAr}</p>
                            <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}>
                          {statusInfo.icon} {statusInfo.label}
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-xs text-gray-500">المبلغ</p>
                          <p className="font-bold">{formatCurrency(request.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">القسط</p>
                          <p className="font-bold">{formatCurrency(request.installmentAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">المدة</p>
                          <p className="font-bold">{request.numberOfMonths} شهر</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Providers Info */}
        <div className="bg-gradient-to-l from-violet-100 to-purple-100 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🏦 شركاء التقسيط</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(INSTALLMENT_PROVIDERS).map(([key, provider]) => (
              <div key={key} className="bg-white p-4 rounded-xl text-center">
                <div className="text-3xl mb-2">{provider.logo}</div>
                <p className="font-bold text-gray-900">{provider.nameAr}</p>
                <p className="text-xs text-gray-500 mt-1">{provider.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-8 bg-yellow-50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">📋 متطلبات التقسيط</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              بطاقة رقم قومي سارية
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              رقم هاتف مسجل باسمك
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              عمر 21 سنة أو أكثر
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              دخل شهري ثابت
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
