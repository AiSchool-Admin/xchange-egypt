'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

export default function SilverSavingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [createForm, setCreateForm] = useState({
    accountName: '',
    targetGoal: '',
    autoInvestAmount: '',
  });

  const [depositForm, setDepositForm] = useState({
    amount: '',
    paymentMethod: 'CARD',
  });

  const [withdrawForm, setWithdrawForm] = useState({
    type: 'CASH',
    grams: '',
    deliveryAddress: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login?redirect=/silver/savings');
        return;
      }

      const [accountRes, priceRes] = await Promise.all([
        apiClient.get('/silver/savings/my').catch(() => ({ data: { data: null } })),
        apiClient.get('/silver/savings/price-history?days=30'),
      ]);

      setAccount(accountRes.data.data);
      setPriceHistory(priceRes.data.data || []);

      if (accountRes.data.data?.id) {
        const historyRes = await apiClient.get(`/silver/savings/${accountRes.data.data.id}/history`);
        setHistory(historyRes.data.data?.transactions || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    setSubmitting(true);
    try {
      await apiClient.post('/silver/savings/create', {
        accountName: createForm.accountName,
        targetGoal: createForm.targetGoal ? parseFloat(createForm.targetGoal) : undefined,
        autoInvestAmount: createForm.autoInvestAmount ? parseFloat(createForm.autoInvestAmount) : undefined,
      });
      await fetchData();
      setShowCreateModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeposit = async () => {
    if (!account?.id) return;

    setSubmitting(true);
    try {
      await apiClient.post(`/silver/savings/${account.id}/deposit`, {
        amount: parseFloat(depositForm.amount),
        paymentMethod: depositForm.paymentMethod,
      });
      await fetchData();
      setShowDepositModal(false);
      setDepositForm({ amount: '', paymentMethod: 'CARD' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!account?.id) return;

    setSubmitting(true);
    try {
      await apiClient.post(`/silver/savings/${account.id}/withdraw`, {
        type: withdrawForm.type,
        grams: withdrawForm.grams ? parseFloat(withdrawForm.grams) : undefined,
        deliveryAddress: withdrawForm.deliveryAddress,
      });
      await fetchData();
      setShowWithdrawModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  // No account - show create option
  if (!account) {
    return (
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">🪙</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">حساب التوفير بالفضة</h1>
              <p className="text-gray-600">ادخر بالفضة واحمِ أموالك من التضخم</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { icon: '📈', title: 'حماية من التضخم', desc: 'الفضة تحتفظ بقيمتها على المدى الطويل' },
                { icon: '💰', title: 'ابدأ من 100 ج.م', desc: 'حد أدنى منخفض للإيداع' },
                { icon: '🔄', title: 'سحب في أي وقت', desc: 'نقداً أو فضة فعلية' },
              ].map((f, i) => (
                <div key={i} className="text-center p-4">
                  <span className="text-4xl">{f.icon}</span>
                  <h3 className="font-bold mt-2">{f.title}</h3>
                  <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full py-4 bg-gray-600 text-white text-lg rounded-lg hover:bg-gray-700"
            >
              افتح حساب التوفير الآن
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">فتح حساب توفير جديد</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم الحساب</label>
                  <input
                    type="text"
                    value={createForm.accountName}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, accountName: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="مثال: توفير الزواج"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">الهدف (بالجرام) - اختياري</label>
                  <input
                    type="number"
                    value={createForm.targetGoal}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, targetGoal: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">استثمار شهري تلقائي (ج.م) - اختياري</label>
                  <input
                    type="number"
                    value={createForm.autoInvestAmount}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, autoInvestAmount: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="500"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreateAccount}
                  disabled={!createForm.accountName || submitting}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg disabled:bg-gray-300"
                >
                  {submitting ? '...' : 'إنشاء'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Has account - show dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{account.accountName}</h1>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm">الرصيد بالجرام</p>
            <p className="text-3xl font-bold text-gray-900">
              {account.balanceGrams?.toFixed(3)} <span className="text-lg">جرام</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm">القيمة الحالية</p>
            <p className="text-3xl font-bold text-gray-600">
              {account.currentValue?.toLocaleString()} <span className="text-lg">ج.م</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm">الربح/الخسارة</p>
            <p className={`text-3xl font-bold ${account.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {account.profitLoss >= 0 ? '+' : ''}{account.profitLoss?.toLocaleString()} <span className="text-lg">ج.م</span>
            </p>
            <p className={`text-sm ${account.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ({account.profitLossPercent}%)
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-500 text-sm">سعر الجرام الحالي</p>
            <p className="text-3xl font-bold text-gray-900">
              {account.currentPricePerGram} <span className="text-lg">ج.م</span>
            </p>
          </div>
        </div>

        {/* Goal Progress */}
        {account.targetGoalGrams && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">تقدم الهدف</h3>
              <span>{account.balanceGrams?.toFixed(1)} / {account.targetGoalGrams} جرام</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gray-600 h-4 rounded-full"
                style={{ width: `${Math.min(account.goalProgress || 0, 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">{account.goalProgress?.toFixed(1)}% مكتمل</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex-1 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-lg"
          >
            💰 إيداع
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex-1 py-4 border-2 border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50 text-lg"
          >
            💸 سحب
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold text-lg mb-4">سجل العمليات</h3>
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد عمليات بعد</p>
          ) : (
            <div className="space-y-3">
              {history.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl ${tx.type === 'DEPOSIT' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'DEPOSIT' ? '↓' : '↑'}
                    </span>
                    <div>
                      <p className="font-semibold">
                        {tx.type === 'DEPOSIT' ? 'إيداع' : 'سحب'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amountEGP} ج.م
                    </p>
                    <p className="text-sm text-gray-500">{tx.amountGrams?.toFixed(3)} جرام</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deposit Modal */}
        {showDepositModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">إيداع في حساب التوفير</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">المبلغ (ج.م)</label>
                  <input
                    type="number"
                    value={depositForm.amount}
                    onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                    placeholder="الحد الأدنى 100 ج.م"
                    min="100"
                  />
                  {depositForm.amount && account.currentPricePerGram && (
                    <p className="text-sm text-gray-500 mt-1">
                      ≈ {(parseFloat(depositForm.amount) / account.currentPricePerGram).toFixed(3)} جرام
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">طريقة الدفع</label>
                  <select
                    value={depositForm.paymentMethod}
                    onChange={(e) => setDepositForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="CARD">بطاقة ائتمان</option>
                    <option value="FAWRY">فوري</option>
                    <option value="INSTAPAY">انستاباي</option>
                    <option value="BANK_TRANSFER">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!depositForm.amount || parseFloat(depositForm.amount) < 100 || submitting}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg disabled:bg-gray-300"
                >
                  {submitting ? '...' : 'إيداع'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">سحب من حساب التوفير</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">نوع السحب</label>
                  <select
                    value={withdrawForm.type}
                    onChange={(e) => setWithdrawForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="CASH">نقداً (تحويل بنكي)</option>
                    <option value="PHYSICAL">فضة فعلية (توصيل)</option>
                    <option value="PARTIAL">سحب جزئي</option>
                  </select>
                </div>

                {withdrawForm.type === 'PARTIAL' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">الكمية (جرام)</label>
                    <input
                      type="number"
                      value={withdrawForm.grams}
                      onChange={(e) => setWithdrawForm(prev => ({ ...prev, grams: e.target.value }))}
                      className="w-full p-3 border rounded-lg"
                      max={account.balanceGrams}
                      step="0.001"
                    />
                  </div>
                )}

                {withdrawForm.type === 'PHYSICAL' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">عنوان التوصيل</label>
                    <textarea
                      value={withdrawForm.deliveryAddress}
                      onChange={(e) => setWithdrawForm(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      className="w-full p-3 border rounded-lg"
                      rows={2}
                    />
                  </div>
                )}

                <div className="bg-yellow-50 p-3 rounded-lg text-sm text-yellow-800">
                  رسوم السحب: 1% | المعالجة: 1-3 أيام عمل
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={submitting}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg disabled:bg-gray-300"
                >
                  {submitting ? '...' : 'سحب'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
