'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getActiveGroupBuys, joinGroupBuy, GroupBuy, DiscountTier } from '@/lib/api/group-buy';

// Progress Bar Component
function ProgressBar({ current, target, tiers }: { current: number; target: number; tiers: DiscountTier[] }) {
  const progress = Math.min((current / target) * 100, 100);

  return (
    <div className="relative">
      {/* Tier markers */}
      <div className="flex justify-between mb-1">
        {tiers.map((tier, i) => {
          const position = (tier.minQty / target) * 100;
          const isReached = current >= tier.minQty;
          return (
            <div
              key={i}
              className="text-center"
              style={{ position: 'absolute', left: `${Math.min(position, 95)}%`, transform: 'translateX(-50%)' }}
            >
              <div className={`text-xs font-bold ${isReached ? 'text-green-600' : 'text-gray-400'}`}>
                -{tier.discount}%
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden mt-6 relative">
        <div
          className="h-full bg-gradient-to-l from-green-500 to-emerald-400 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
        {/* Tier markers on bar */}
        {tiers.map((tier, i) => {
          const position = (tier.minQty / target) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 h-full w-0.5 bg-white"
              style={{ left: `${position}%` }}
            />
          );
        })}
      </div>

      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>{current} مشارك</span>
        <span>الهدف: {target}</span>
      </div>
    </div>
  );
}

// Group Buy Card
function GroupBuyCard({ groupBuy, onJoin }: { groupBuy: GroupBuy; onJoin: (id: string) => void }) {
  const savings = groupBuy.originalPrice - groupBuy.currentPrice;
  const savingsPercent = Math.round((savings / groupBuy.originalPrice) * 100);
  const timeLeft = new Date(groupBuy.endsAt).getTime() - Date.now();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
      {/* Header Badge */}
      <div className="bg-gradient-to-l from-green-500 to-emerald-500 text-white py-2 px-4 flex items-center justify-between">
        <span className="font-bold flex items-center gap-2">
          <span className="text-xl">&#128101;</span> شراء جماعي
        </span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
          {groupBuy.participantCount} مشارك
        </span>
      </div>

      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {groupBuy.listing.images?.[0] ? (
          <img
            src={groupBuy.listing.images[0]}
            alt={groupBuy.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
            &#128101;
          </div>
        )}
        {daysLeft > 0 && (
          <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            متبقي {daysLeft} يوم
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{groupBuy.titleAr || groupBuy.title}</h3>

        {/* Price */}
        <div className="flex items-center gap-3 mb-4">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {groupBuy.currentPrice.toLocaleString('ar-EG')} ج.م
            </div>
            <div className="text-gray-400 line-through text-sm">
              {groupBuy.originalPrice.toLocaleString('ar-EG')} ج.م
            </div>
          </div>
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
            وفّر {savingsPercent}%
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <ProgressBar
            current={groupBuy.currentQuantity}
            target={groupBuy.maxQuantity}
            tiers={groupBuy.discountTiers}
          />
        </div>

        {/* Discount Tiers */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="text-sm text-gray-600 mb-2 font-medium">كلما زاد المشاركين، زاد الخصم:</div>
          <div className="flex flex-wrap gap-2">
            {groupBuy.discountTiers.map((tier, i) => (
              <span
                key={i}
                className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  groupBuy.currentQuantity >= tier.minQty
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {tier.minQty}+ = -{tier.discount}%
              </span>
            ))}
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => onJoin(groupBuy.id)}
          className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-l from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all"
        >
          انضم للمجموعة
        </button>
      </div>
    </div>
  );
}

export default function TawfirPage() {
  const { user } = useAuth();
  const [groupBuys, setGroupBuys] = useState<GroupBuy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupBuys();
  }, []);

  const fetchGroupBuys = async () => {
    try {
      setLoading(true);
      const response = await getActiveGroupBuys().catch(() => ({ success: false, data: { groupBuys: [] } }));
      if (response.success) {
        setGroupBuys(response.data.groupBuys);
      }
    } catch (error) {
      console.error('Error fetching group buys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (groupBuyId: string) => {
    if (!user) {
      window.location.href = '/login?redirect=/tawfir';
      return;
    }

    try {
      const result = await joinGroupBuy(groupBuyId);
      if (result.success) {
        alert('تم الانضمام بنجاح! سيتم إخطارك عند اكتمال المجموعة.');
        fetchGroupBuys();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الانضمام');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-green-600 via-emerald-500 to-teal-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">&#128101;</span>
            توفير - الشراء الجماعي
          </h1>
          <p className="text-xl text-white/90">اشتري مع الآخرين ووفّر أكثر - كلما زاد المشاركين زاد الخصم!</p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{groupBuys.length}</div>
            <div className="text-gray-500 text-sm">حملة نشطة</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-3xl font-bold text-blue-600">
              {groupBuys.reduce((sum, g) => sum + g.participantCount, 0)}
            </div>
            <div className="text-gray-500 text-sm">مشارك</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600">70%</div>
            <div className="text-gray-500 text-sm">حد أقصى للخصم</div>
          </div>
        </div>
      </section>

      {/* Active Group Buys */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
            &#127919;
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">حملات الشراء الجماعي</h2>
            <p className="text-gray-500">انضم لمجموعة واحصل على أفضل سعر</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-12 bg-gray-200" />
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : groupBuys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupBuys.map((groupBuy) => (
              <GroupBuyCard key={groupBuy.id} groupBuy={groupBuy} onJoin={handleJoin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <span className="text-6xl mb-4 block">&#128101;</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد حملات نشطة حالياً</h3>
            <p className="text-gray-500 mb-4">كن أول من يبدأ حملة شراء جماعي</p>
            <Link
              href="/tawfir/new"
              className="inline-block px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors"
            >
              ابدأ حملة جديدة
            </Link>
          </div>
        )}
      </section>

      {/* How it Works */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">كيف يعمل الشراء الجماعي؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#128269;
              </div>
              <h3 className="font-bold mb-2">1. اختر المنتج</h3>
              <p className="text-gray-500 text-sm">تصفح الحملات النشطة</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#128101;
              </div>
              <h3 className="font-bold mb-2">2. انضم للمجموعة</h3>
              <p className="text-gray-500 text-sm">سجّل اهتمامك بالشراء</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#128200;
              </div>
              <h3 className="font-bold mb-2">3. راقب التقدم</h3>
              <p className="text-gray-500 text-sm">كلما زاد المشاركين زاد الخصم</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#127881;
              </div>
              <h3 className="font-bold mb-2">4. وفّر أكثر</h3>
              <p className="text-gray-500 text-sm">احصل على أفضل سعر عند الاكتمال</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
