'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMyAlerts, createAlert, deleteAlert, toggleAlert, PriceAlert, AlertType } from '@/lib/api/alerts';

function AlertCard({ alert, onToggle, onDelete }: { alert: PriceAlert; onToggle: () => void; onDelete: () => void }) {
  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case 'ITEM': return '📦';
      case 'CATEGORY': return '📁';
      case 'SEARCH': return '🔍';
      case 'SELLER': return '👤';
      default: return '🔔';
    }
  };

  const getTypeLabel = (type: AlertType) => {
    switch (type) {
      case 'ITEM': return 'منتج محدد';
      case 'CATEGORY': return 'فئة';
      case 'SEARCH': return 'بحث';
      case 'SELLER': return 'بائع';
      default: return 'تنبيه';
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${alert.isActive ? 'border-green-200' : 'border-gray-200'} p-4 hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${alert.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
            <span>{getTypeIcon(alert.type)}</span>
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{alert.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${alert.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {getTypeLabel(alert.type)}
            </span>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${alert.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${alert.isActive ? 'right-1' : 'left-1'}`} />
        </button>
      </div>

      {/* Alert Details */}
      <div className="space-y-2 text-sm text-gray-600 mb-3">
        {alert.targetPrice && (
          <div className="flex items-center gap-2">
            <span>&#128176;</span>
            <span>السعر المستهدف: {alert.targetPrice.toLocaleString('ar-EG')} ج.م</span>
          </div>
        )}
        {alert.priceDropPercentage && (
          <div className="flex items-center gap-2">
            <span>&#128201;</span>
            <span>نسبة الانخفاض: {alert.priceDropPercentage}%</span>
          </div>
        )}
        {alert.item && (
          <div className="flex items-center gap-2">
            <span>&#128230;</span>
            <span>{alert.item.title}</span>
          </div>
        )}
        {alert.category && (
          <div className="flex items-center gap-2">
            <span>&#128193;</span>
            <span>{alert.category.nameAr}</span>
          </div>
        )}
        {alert.searchQuery && (
          <div className="flex items-center gap-2">
            <span>&#128269;</span>
            <span>"{alert.searchQuery}"</span>
          </div>
        )}
      </div>

      {/* Notification Channels */}
      <div className="flex items-center gap-2 mb-3">
        {alert.notifyEmail && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">&#128231; بريد</span>}
        {alert.notifyPush && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">&#128276; إشعار</span>}
        {alert.notifySms && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">&#128241; SMS</span>}
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          أُطلق {alert.triggerCount} مرة
        </span>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          حذف
        </button>
      </div>
    </div>
  );
}

function CreateAlertModal({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }) {
  const [type, setType] = useState<AlertType>('CATEGORY');
  const [name, setName] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [priceDropPercentage, setPriceDropPercentage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      name,
      targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
      priceDropPercentage: priceDropPercentage ? parseFloat(priceDropPercentage) : undefined,
      searchQuery: type === 'SEARCH' ? searchQuery : undefined,
      notifyEmail,
      notifyPush,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md" dir="rtl">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold">إنشاء تنبيه جديد</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع التنبيه</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AlertType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="CATEGORY">فئة معينة</option>
              <option value="SEARCH">كلمات بحث</option>
              <option value="ITEM">منتج محدد</option>
              <option value="SELLER">بائع معين</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم التنبيه</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: تنبيه iPhone"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required
            />
          </div>

          {type === 'SEARCH' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمات البحث</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="مثال: iPhone 15 Pro"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السعر المستهدف</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="5000"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نسبة الانخفاض %</label>
              <input
                type="number"
                value={priceDropPercentage}
                onChange={(e) => setPriceDropPercentage(e.target.value)}
                placeholder="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">طريقة الإشعار</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="rounded"
                />
                <span>بريد إلكتروني</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifyPush}
                  onChange={(e) => setNotifyPush(e.target.checked)}
                  className="rounded"
                />
                <span>إشعارات</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
            >
              إنشاء التنبيه
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user) fetchAlerts();
    else setLoading(false);
  }, [user]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await getMyAlerts().catch(() => ({ success: false, data: { alerts: [] } }));
      if (response.success) setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = async (data: any) => {
    try {
      const result = await createAlert(data);
      if (result.success) {
        setShowModal(false);
        fetchAlerts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleAlert(id);
      fetchAlerts();
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التنبيه؟')) return;
    try {
      await deleteAlert(id);
      fetchAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <span className="text-6xl mb-4 block">&#128276;</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">سجّل دخول لإدارة تنبيهاتك</h2>
          <Link href="/login?redirect=/alerts" className="text-emerald-600 hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-amber-500 via-orange-500 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-5xl">&#128276;</span> تنبيهات الأسعار
          </h1>
          <p className="text-xl text-white/90">لا تفوّت أي فرصة - نخبرك عندما ينخفض السعر</p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">تنبيهاتي</h2>
            <p className="text-gray-500">{alerts.length} تنبيه</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
          >
            <span>+</span> تنبيه جديد
          </button>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="grid gap-4">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggle={() => handleToggle(alert.id)}
                onDelete={() => handleDelete(alert.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <span className="text-6xl mb-4 block">&#128276;</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد تنبيهات</h3>
            <p className="text-gray-500 mb-4">أنشئ تنبيهاً ليصلك إشعار عند انخفاض الأسعار</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
            >
              إنشاء أول تنبيه
            </button>
          </div>
        )}
      </section>

      <CreateAlertModal isOpen={showModal} onClose={() => setShowModal(false)} onSubmit={handleCreateAlert} />
    </div>
  );
}
