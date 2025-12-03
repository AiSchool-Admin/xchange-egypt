'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMyWarranties, fileClaim, Warranty, WarrantyClaim } from '@/lib/api/warranty';

const WARRANTY_TYPE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  SELLER: { label: 'ضمان البائع', icon: '&#128100;', color: 'bg-blue-100 text-blue-700' },
  PLATFORM: { label: 'ضمان المنصة', icon: '&#128737;', color: 'bg-green-100 text-green-700' },
  EXTENDED: { label: 'ضمان ممتد', icon: '&#128176;', color: 'bg-purple-100 text-purple-700' },
  INSURANCE: { label: 'تأمين شامل', icon: '&#127919;', color: 'bg-amber-100 text-amber-700' },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'ساري', color: 'bg-green-500' },
  EXPIRED: { label: 'منتهي', color: 'bg-gray-500' },
  CLAIMED: { label: 'تمت المطالبة', color: 'bg-amber-500' },
  VOID: { label: 'ملغي', color: 'bg-red-500' },
};

function WarrantyCard({ warranty, onFileClaim }: { warranty: Warranty; onFileClaim: (id: string) => void }) {
  const typeInfo = WARRANTY_TYPE_LABELS[warranty.warrantyType] || WARRANTY_TYPE_LABELS.SELLER;
  const statusInfo = STATUS_LABELS[warranty.status] || STATUS_LABELS.ACTIVE;
  const daysLeft = Math.ceil((new Date(warranty.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 7;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${typeInfo.color}`}>
            <span dangerouslySetInnerHTML={{ __html: typeInfo.icon }} /> {typeInfo.label}
          </span>
          <span className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
          <span className="text-sm text-gray-500">{statusInfo.label}</span>
        </div>
        {isExpiringSoon && warranty.status === 'ACTIVE' && (
          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full animate-pulse">
            ينتهي قريباً!
          </span>
        )}
      </div>

      {/* Item Info */}
      <div className="p-4 flex gap-4">
        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
          {warranty.item.images?.[0] ? (
            <img src={warranty.item.images[0]} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">&#128230;</div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-1">{warranty.item.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{warranty.description}</p>
        </div>
      </div>

      {/* Coverage Details */}
      <div className="px-4 pb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-sm text-gray-600 mb-2 font-medium">التغطية:</div>
          <div className="flex flex-wrap gap-2">
            {warranty.coverageDetails.defects && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">&#10003; عيوب التصنيع</span>
            )}
            {warranty.coverageDetails.malfunctions && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">&#10003; الأعطال</span>
            )}
            {warranty.coverageDetails.accidentalDamage && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">&#10003; الأضرار العرضية</span>
            )}
            {warranty.coverageDetails.theft && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">&#10003; السرقة</span>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 border-t border-gray-100">
        <div className="p-3 text-center border-l border-gray-100">
          <div className="text-lg font-bold text-gray-800">{warranty.durationMonths}</div>
          <div className="text-xs text-gray-500">شهر</div>
        </div>
        <div className="p-3 text-center border-l border-gray-100">
          <div className="text-lg font-bold text-emerald-600">{warranty.maxClaimValue.toLocaleString('ar-EG')}</div>
          <div className="text-xs text-gray-500">حد أقصى ج.م</div>
        </div>
        <div className="p-3 text-center">
          <div className={`text-lg font-bold ${daysLeft > 0 ? 'text-gray-800' : 'text-red-600'}`}>
            {daysLeft > 0 ? daysLeft : 'منتهي'}
          </div>
          <div className="text-xs text-gray-500">يوم متبقي</div>
        </div>
      </div>

      {/* Actions */}
      {warranty.status === 'ACTIVE' && (
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => onFileClaim(warranty.id)}
            className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
          >
            تقديم مطالبة
          </button>
        </div>
      )}

      {/* Claims */}
      {warranty.claims.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="text-sm font-bold text-gray-700 mb-2">المطالبات ({warranty.claims.length})</div>
          {warranty.claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-lg p-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{claim.issueType}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  claim.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  claim.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  claim.status === 'RESOLVED' ? 'bg-blue-100 text-blue-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {claim.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WarrantyPage() {
  const { user } = useAuth();
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    if (user) fetchWarranties();
    else setLoading(false);
  }, [user]);

  const fetchWarranties = async () => {
    try {
      setLoading(true);
      const response = await getMyWarranties().catch(() => ({ success: false, data: { warranties: [] } }));
      if (response.success) setWarranties(response.data.warranties);
    } catch (error) {
      console.error('Error fetching warranties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileClaim = async (warrantyId: string) => {
    // In a real app, this would open a modal to collect claim details
    const issueDescription = prompt('صف المشكلة بالتفصيل:');
    if (!issueDescription) return;

    try {
      await fileClaim(warrantyId, {
        issueType: 'DEFECT',
        issueDescription,
        evidenceUrls: [],
      });
      alert('تم تقديم المطالبة بنجاح! سنراجعها وتواصل معك قريباً.');
      fetchWarranties();
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const filteredWarranties = warranties.filter((w) => {
    if (activeFilter === 'active') return w.status === 'ACTIVE';
    if (activeFilter === 'expired') return w.status === 'EXPIRED';
    return true;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <span className="text-6xl mb-4 block">&#128737;</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">سجّل دخول لعرض ضماناتك</h2>
          <Link href="/login?redirect=/warranty" className="text-emerald-600 hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-green-600 via-emerald-500 to-teal-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-5xl">&#128737;</span> ضماناتي
          </h1>
          <p className="text-xl text-white/90">جميع ضمانات مشترياتك في مكان واحد</p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">{warranties.filter(w => w.status === 'ACTIVE').length}</div>
            <div className="text-gray-500 text-sm">ضمان ساري</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-3xl font-bold text-amber-600">{warranties.reduce((sum, w) => sum + w.claims.length, 0)}</div>
            <div className="text-gray-500 text-sm">مطالبة</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{warranties.length}</div>
            <div className="text-gray-500 text-sm">إجمالي الضمانات</div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex gap-2">
          {(['all', 'active', 'expired'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter === 'all' ? 'الكل' : filter === 'active' ? 'ساري' : 'منتهي'}
            </button>
          ))}
        </div>
      </section>

      {/* Warranties List */}
      <section className="max-w-4xl mx-auto px-4 pb-10">
        {loading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredWarranties.length > 0 ? (
          <div className="space-y-4">
            {filteredWarranties.map((warranty) => (
              <WarrantyCard key={warranty.id} warranty={warranty} onFileClaim={handleFileClaim} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <span className="text-6xl mb-4 block">&#128737;</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد ضمانات</h3>
            <p className="text-gray-500 mb-4">عند شراء منتج، ستظهر ضماناته هنا</p>
            <Link
              href="/items"
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors inline-block"
            >
              تصفح المنتجات
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
