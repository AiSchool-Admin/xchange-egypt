'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getWallet,
  getTransactions,
  claimDailyReward,
  getEarningOpportunities,
  getLeaderboard,
  Wallet,
  WalletTransaction,
  EarningOpportunity,
  LeaderboardEntry,
} from '@/lib/api/wallet';

const TRANSACTION_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  REWARD_SIGNUP: { label: 'مكافأة التسجيل', color: 'text-green-600', icon: '🎁' },
  REWARD_FIRST_DEAL: { label: 'أول صفقة', color: 'text-green-600', icon: '🎉' },
  REWARD_REFERRAL: { label: 'إحالة صديق', color: 'text-green-600', icon: '👥' },
  REWARD_REVIEW: { label: 'مكافأة تقييم', color: 'text-green-600', icon: '⭐' },
  REWARD_DAILY_LOGIN: { label: 'دخول يومي', color: 'text-green-600', icon: '📅' },
  REWARD_ACHIEVEMENT: { label: 'إنجاز', color: 'text-green-600', icon: '🏆' },
  TRANSFER_SENT: { label: 'تحويل صادر', color: 'text-red-600', icon: '📤' },
  TRANSFER_RECEIVED: { label: 'تحويل وارد', color: 'text-green-600', icon: '📥' },
  REDEEM_DISCOUNT: { label: 'خصم', color: 'text-blue-600', icon: '🏷️' },
  PURCHASE: { label: 'شراء', color: 'text-red-600', icon: '🛒' },
  REFUND: { label: 'استرداد', color: 'text-green-600', icon: '↩️' },
};

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const info = TRANSACTION_LABELS[transaction.type] || {
    label: transaction.type,
    color: 'text-gray-600',
    icon: '💰',
  };
  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
          {info.icon}
        </div>
        <div>
          <p className="font-bold text-gray-800">{info.label}</p>
          <p className="text-sm text-gray-500">
            {new Date(transaction.createdAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <div className={`font-bold text-lg ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}
        {transaction.amount.toLocaleString('ar-EG')}
        <span className="text-xs mr-1">XC</span>
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: EarningOpportunity }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{opportunity.icon}</span>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800">{opportunity.title}</h4>
          <p className="text-sm text-gray-500">{opportunity.description}</p>
        </div>
        <div className="text-left">
          <p className="font-bold text-emerald-600 text-lg">+{opportunity.reward}</p>
          <p className="text-xs text-gray-500">XCoin</p>
        </div>
      </div>
    </div>
  );
}

function LeaderboardRow({
  entry,
  currentUserId,
}: {
  entry: LeaderboardEntry;
  currentUserId?: string;
}) {
  const isCurrentUser = entry.userId === currentUserId;
  const rankColors: Record<number, string> = {
    1: 'bg-yellow-400 text-white',
    2: 'bg-gray-300 text-gray-700',
    3: 'bg-orange-400 text-white',
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl ${
        isCurrentUser ? 'bg-emerald-50 border border-emerald-200' : ''
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
          rankColors[entry.rank] || 'bg-gray-100 text-gray-600'
        }`}
      >
        {entry.rank}
      </div>
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
        {entry.fullName?.charAt(0) || '?'}
      </div>
      <div className="flex-1">
        <p className="font-bold text-gray-800">
          {entry.fullName}
          {isCurrentUser && <span className="text-emerald-600 text-sm mr-2">(أنت)</span>}
        </p>
      </div>
      <div className="text-left">
        <p className="font-bold text-emerald-600">{entry.lifetimeEarned.toLocaleString('ar-EG')}</p>
        <p className="text-xs text-gray-500">XCoin</p>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [opportunities, setOpportunities] = useState<EarningOpportunity[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [tab, setTab] = useState<'overview' | 'transactions' | 'earn' | 'leaderboard'>('overview');

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, transactionsRes, opportunitiesRes, leaderboardRes] = await Promise.all([
        getWallet(),
        getTransactions(1, 10),
        getEarningOpportunities(),
        getLeaderboard(10),
      ]);

      setWallet(walletRes.data?.wallet || null);
      setTransactions(transactionsRes.data?.transactions || []);
      setOpportunities(opportunitiesRes.data?.opportunities || []);
      setLeaderboard(leaderboardRes.data?.leaderboard || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimDaily = async () => {
    setClaiming(true);
    try {
      const response = await claimDailyReward();
      alert(response.message || 'تم الحصول على المكافأة اليومية!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'تم المطالبة بالمكافأة مسبقاً');
    } finally {
      setClaiming(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <span className="text-6xl mb-4 block">💰</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">محفظة XCoin</h2>
          <p className="text-gray-600 mb-4">سجل دخول لعرض محفظتك</p>
          <a
            href="/login"
            className="inline-block bg-gradient-to-l from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero with Balance */}
      <section className="bg-gradient-to-l from-amber-500 via-yellow-500 to-orange-500 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">💰</span>
                محفظة XCoin
              </h1>
              <p className="text-white/80 mt-1">اكسب واستخدم نقاط XCoin</p>
            </div>
            <button
              onClick={handleClaimDaily}
              disabled={claiming}
              className="px-4 py-2 bg-white/20 rounded-lg font-bold hover:bg-white/30 disabled:opacity-50 flex items-center gap-2"
            >
              <span>📅</span>
              {claiming ? 'جاري...' : 'المكافأة اليومية'}
            </button>
          </div>

          {/* Balance Cards */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-white/80">الرصيد المتاح</p>
              <p className="text-3xl font-bold">
                {wallet?.availableBalance?.toLocaleString('ar-EG') || 0}
              </p>
              <p className="text-sm text-white/60">XCoin</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-white/80">الرصيد المجمد</p>
              <p className="text-3xl font-bold">
                {wallet?.frozenBalance?.toLocaleString('ar-EG') || 0}
              </p>
              <p className="text-sm text-white/60">XCoin</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-sm text-white/80">إجمالي المكتسب</p>
              <p className="text-3xl font-bold">
                {wallet?.lifetimeEarned?.toLocaleString('ar-EG') || 0}
              </p>
              <p className="text-sm text-white/60">XCoin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: '📊' },
            { id: 'transactions', label: 'المعاملات', icon: '📜' },
            { id: 'earn', label: 'اكسب المزيد', icon: '🎯' },
            { id: 'leaderboard', label: 'المتصدرين', icon: '🏆' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex-1 px-4 py-2 rounded-lg font-bold transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-l from-amber-500 to-yellow-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="ml-1">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'الرصيد', value: wallet?.balance || 0, icon: '💰' },
                    { label: 'المجمد', value: wallet?.frozenBalance || 0, icon: '🔒' },
                    { label: 'المكتسب', value: wallet?.lifetimeEarned || 0, icon: '📈' },
                    { label: 'المصروف', value: wallet?.lifetimeSpent || 0, icon: '📉' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{stat.icon}</span>
                        <span className="text-sm text-gray-500">{stat.label}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-800">
                        {stat.value.toLocaleString('ar-EG')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm p-4">
                  <h3 className="font-bold text-lg mb-4">آخر المعاملات</h3>
                  {transactions.length > 0 ? (
                    transactions.slice(0, 5).map((tx) => (
                      <TransactionRow key={tx.id} transaction={tx} />
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">لا توجد معاملات</p>
                  )}
                </div>

                {/* XCoin Value */}
                <div className="bg-gradient-to-l from-amber-100 to-yellow-100 rounded-xl p-6">
                  <h3 className="font-bold text-lg mb-4">💎 قيمة XCoin</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-amber-600">100 XC</p>
                      <p className="text-sm text-gray-600">= 10 ج.م خصم</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-amber-600">500 XC</p>
                      <p className="text-sm text-gray-600">= شحن مجاني</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-amber-600">1000 XC</p>
                      <p className="text-sm text-gray-600">= ترقية VIP أسبوع</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'transactions' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-lg mb-4">سجل المعاملات</h3>
                {transactions.length > 0 ? (
                  transactions.map((tx) => <TransactionRow key={tx.id} transaction={tx} />)
                ) : (
                  <p className="text-gray-500 text-center py-8">لا توجد معاملات</p>
                )}
              </div>
            )}

            {tab === 'earn' && (
              <div className="space-y-4">
                <h3 className="font-bold text-lg">🎯 فرص كسب XCoin</h3>
                {opportunities.map((opp) => (
                  <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
              </div>
            )}

            {tab === 'leaderboard' && (
              <div className="bg-white rounded-xl shadow-sm p-4">
                <h3 className="font-bold text-lg mb-4">🏆 المتصدرين</h3>
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <LeaderboardRow
                      key={entry.userId}
                      entry={entry}
                      currentUserId={user?.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
