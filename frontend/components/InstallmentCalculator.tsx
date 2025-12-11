'use client';

import React, { useState, useEffect } from 'react';
import {
  getInstallmentPlans,
  calculateInstallment,
  createInstallmentRequest,
  checkItemEligibility,
  INSTALLMENT_PROVIDERS,
  formatCurrency,
  ProviderPlans,
  InstallmentPlan,
} from '@/lib/api/installment';
import { useAuth } from '@/lib/contexts/AuthContext';

// ============================================
// Installment Calculator Component
// مكون حاسبة التقسيط
// ============================================

interface InstallmentCalculatorProps {
  itemId?: string;
  amount: number;
  onRequestSubmit?: () => void;
}

export default function InstallmentCalculator({
  itemId,
  amount,
  onRequestSubmit,
}: InstallmentCalculatorProps) {
  const { user, isAuthenticated } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [providerPlans, setProviderPlans] = useState<ProviderPlans[]>([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<number | null>(null);
  const [customDownPayment, setCustomDownPayment] = useState('');
  const [calculatedPlan, setCalculatedPlan] = useState<InstallmentPlan | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Eligibility
  const [eligibility, setEligibility] = useState<{
    eligible: boolean;
    reason?: string;
    availableProviders: string[];
  } | null>(null);

  // Load plans on mount
  useEffect(() => {
    if (amount > 0) {
      loadPlans();
    }
  }, [amount]);

  // Check eligibility if itemId provided
  useEffect(() => {
    if (itemId) {
      checkEligibility();
    }
  }, [itemId]);

  // Recalculate when selection changes
  useEffect(() => {
    if (selectedProvider && selectedMonths) {
      recalculate();
    }
  }, [selectedProvider, selectedMonths, customDownPayment]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getInstallmentPlans(amount);
      setProviderPlans(response.data.plans);

      if (response.data.plans.length > 0) {
        setSelectedProvider(response.data.plans[0].provider);
        setSelectedMonths(response.data.plans[0].plans[0]?.months || null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل خطط التقسيط');
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async () => {
    if (!itemId) return;
    try {
      const response = await checkItemEligibility(itemId);
      setEligibility(response.data);
    } catch (err) {
      // Ignore eligibility check errors
    }
  };

  const recalculate = async () => {
    if (!selectedProvider || !selectedMonths) return;

    try {
      setCalculating(true);

      const response = await calculateInstallment({
        amount,
        provider: selectedProvider,
        months: selectedMonths,
        downPayment: customDownPayment ? parseFloat(customDownPayment) : undefined,
      });

      setCalculatedPlan(response.data.plan);
    } catch (err: any) {
      // Use default from loaded plans
      const provider = providerPlans.find((p) => p.provider === selectedProvider);
      const plan = provider?.plans.find((p) => p.months === selectedMonths);
      setCalculatedPlan(plan || null);
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!itemId || !selectedProvider || !selectedMonths || !calculatedPlan) return;

    try {
      setSubmitting(true);
      setError('');

      await createInstallmentRequest({
        itemId,
        provider: selectedProvider,
        totalAmount: amount,
        downPayment: calculatedPlan.downPayment,
        numberOfMonths: selectedMonths,
        phoneNumber,
        nationalId: nationalId || undefined,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
        employerName: employerName || undefined,
      });

      setSubmitSuccess(true);
      onRequestSubmit?.();
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProviderPlans = providerPlans.find((p) => p.provider === selectedProvider);
  const providerInfo = INSTALLMENT_PROVIDERS[selectedProvider as keyof typeof INSTALLMENT_PROVIDERS];

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mr-3 text-gray-600">جاري تحميل خطط التقسيط...</span>
        </div>
      </div>
    );
  }

  if (eligibility && !eligibility.eligible) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm">
        <div className="text-center py-4">
          <div className="text-4xl mb-3">😔</div>
          <p className="text-gray-600">{eligibility.reason || 'هذا المنتج غير مؤهل للتقسيط'}</p>
        </div>
      </div>
    );
  }

  if (providerPlans.length === 0) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm">
        <div className="text-center py-4">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-gray-600">لا توجد خطط تقسيط متاحة لهذا المبلغ</p>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="p-6 bg-white rounded-2xl shadow-sm">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">تم إرسال طلبك بنجاح!</h3>
          <p className="text-gray-600">سيتم التواصل معك خلال 24 ساعة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-3xl">💳</span>
        <h2 className="text-xl font-bold text-gray-900">حاسبة التقسيط</h2>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
      )}

      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">اختر مزود التقسيط</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {providerPlans.map((provider) => {
            const info = INSTALLMENT_PROVIDERS[provider.provider as keyof typeof INSTALLMENT_PROVIDERS];
            return (
              <button
                key={provider.provider}
                onClick={() => {
                  setSelectedProvider(provider.provider);
                  setSelectedMonths(provider.plans[0]?.months || null);
                }}
                className={`p-4 rounded-xl border-2 transition text-center ${
                  selectedProvider === provider.provider
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{info?.logo || '💳'}</div>
                <div className="font-medium text-gray-900">{provider.providerNameAr}</div>
                <div className="text-xs text-gray-500">{info?.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Months Selection */}
      {selectedProviderPlans && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">عدد الأشهر</label>
          <div className="flex flex-wrap gap-2">
            {selectedProviderPlans.plans.map((plan) => (
              <button
                key={plan.months}
                onClick={() => setSelectedMonths(plan.months)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedMonths === plan.months
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {plan.months} شهر
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Down Payment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          المقدم (اختياري)
        </label>
        <input
          type="number"
          value={customDownPayment}
          onChange={(e) => setCustomDownPayment(e.target.value)}
          placeholder={`الحد الأدنى: ${formatCurrency(calculatedPlan?.downPayment || 0)}`}
          min="0"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Calculated Plan Display */}
      {calculatedPlan && (
        <div className="bg-gradient-to-l from-primary-50 to-teal-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">ملخص التقسيط</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-sm text-gray-500">القسط الشهري</div>
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(calculatedPlan.monthlyAmount)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-sm text-gray-500">المقدم</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(calculatedPlan.downPayment)}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-sm text-gray-500">نسبة الفائدة</div>
              <div className="text-xl font-bold text-gray-900">
                {calculatedPlan.interestRate}%
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <div className="text-sm text-gray-500">المبلغ الإجمالي</div>
              <div className="text-xl font-bold text-gray-900">
                {formatCurrency(calculatedPlan.totalAmount)}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            * رسوم إدارية: {formatCurrency(calculatedPlan.adminFee)}
          </p>
        </div>
      )}

      {/* Request Form */}
      {itemId && isAuthenticated && !showRequestForm && (
        <button
          onClick={() => setShowRequestForm(true)}
          className="w-full py-3 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition"
        >
          تقديم طلب التقسيط
        </button>
      )}

      {showRequestForm && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="font-bold text-gray-900">بيانات طلب التقسيط</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الرقم القومي
            </label>
            <input
              type="text"
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="14 رقم"
              maxLength={14}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الدخل الشهري
              </label>
              <input
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="بالجنيه"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                جهة العمل
              </label>
              <input
                type="text"
                value={employerName}
                onChange={(e) => setEmployerName(e.target.value)}
                placeholder="اسم الشركة"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            onClick={handleSubmitRequest}
            disabled={submitting || !phoneNumber}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '⏳ جاري الإرسال...' : '✅ إرسال الطلب'}
          </button>
        </div>
      )}

      {!isAuthenticated && itemId && (
        <p className="text-center text-gray-500 text-sm">
          يجب تسجيل الدخول لتقديم طلب التقسيط
        </p>
      )}
    </div>
  );
}
