'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  BellIcon,
  BellAlertIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { BellAlertIcon as BellAlertIconSolid } from '@heroicons/react/24/solid';

// Provider logos and colors
const PROVIDERS = {
  UBER: { name: 'Uber', nameAr: 'أوبر', color: 'bg-black', textColor: 'text-white', logo: '🚗' },
  CAREEM: { name: 'Careem', nameAr: 'كريم', color: 'bg-green-600', textColor: 'text-white', logo: '🚕' },
  BOLT: { name: 'Bolt', nameAr: 'بولت', color: 'bg-[#34D186]', textColor: 'text-white', logo: '⚡' },
  INDRIVE: { name: 'inDrive', nameAr: 'إن درايف', color: 'bg-[#C8F026]', textColor: 'text-black', logo: '🤝' },
  DIDI: { name: 'DiDi', nameAr: 'ديدي', color: 'bg-orange-500', textColor: 'text-white', logo: '🔶' },
  SWVL: { name: 'Swvl', nameAr: 'سويفل', color: 'bg-red-600', textColor: 'text-white', logo: '🚌' },
  HALAN: { name: 'Halan', nameAr: 'هلان', color: 'bg-yellow-500', textColor: 'text-black', logo: '🛵' },
};

interface PriceAlert {
  id: string;
  pickupAddress: string;
  pickupAddressAr: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffAddressAr: string;
  dropoffLat: number;
  dropoffLng: number;
  targetPrice: number;
  currentPrice?: number;
  lowestPrice?: number;
  provider?: keyof typeof PROVIDERS;
  vehicleType?: string;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  triggeredPrice?: number;
  notifyPush: boolean;
  notifyEmail: boolean;
  notifySms: boolean;
  priceHistory: { price: number; timestamp: string }[];
  createdAt: string;
  expiresAt: string;
}

// Sample alerts
const SAMPLE_ALERTS: PriceAlert[] = [
  {
    id: '1',
    pickupAddress: '25 Ahmed Orabi St, Mohandessin',
    pickupAddressAr: '25 شارع أحمد عرابي، المهندسين',
    pickupLat: 30.0561,
    pickupLng: 31.2017,
    dropoffAddress: 'Smart Village, 6th October',
    dropoffAddressAr: 'القرية الذكية، السادس من أكتوبر',
    dropoffLat: 30.0708,
    dropoffLng: 31.0169,
    targetPrice: 85,
    currentPrice: 95,
    lowestPrice: 78,
    isActive: true,
    isTriggered: false,
    notifyPush: true,
    notifyEmail: true,
    notifySms: false,
    priceHistory: [
      { price: 110, timestamp: '2024-01-18T06:00:00Z' },
      { price: 105, timestamp: '2024-01-18T08:00:00Z' },
      { price: 120, timestamp: '2024-01-18T09:00:00Z' },
      { price: 95, timestamp: '2024-01-18T12:00:00Z' },
      { price: 88, timestamp: '2024-01-18T14:00:00Z' },
      { price: 95, timestamp: '2024-01-18T16:00:00Z' },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    expiresAt: '2024-01-25T10:00:00Z'
  },
  {
    id: '2',
    pickupAddress: 'Cairo Festival City Mall',
    pickupAddressAr: 'مول كايرو فيستيفال سيتي',
    pickupLat: 30.0285,
    pickupLng: 31.4085,
    dropoffAddress: 'Cairo Airport Terminal 2',
    dropoffAddressAr: 'مطار القاهرة صالة 2',
    dropoffLat: 30.1219,
    dropoffLng: 31.4056,
    targetPrice: 60,
    currentPrice: 55,
    lowestPrice: 52,
    provider: 'CAREEM',
    isActive: true,
    isTriggered: true,
    triggeredAt: '2024-01-17T15:30:00Z',
    triggeredPrice: 55,
    notifyPush: true,
    notifyEmail: false,
    notifySms: true,
    priceHistory: [
      { price: 75, timestamp: '2024-01-17T10:00:00Z' },
      { price: 68, timestamp: '2024-01-17T12:00:00Z' },
      { price: 62, timestamp: '2024-01-17T14:00:00Z' },
      { price: 55, timestamp: '2024-01-17T15:30:00Z' },
    ],
    createdAt: '2024-01-16T08:00:00Z',
    expiresAt: '2024-01-20T08:00:00Z'
  },
  {
    id: '3',
    pickupAddress: 'Tahrir Square',
    pickupAddressAr: 'ميدان التحرير',
    pickupLat: 30.0444,
    pickupLng: 31.2357,
    dropoffAddress: 'Maadi Grand Mall',
    dropoffAddressAr: 'مول المعادي جراند',
    dropoffLat: 29.9602,
    dropoffLng: 31.2569,
    targetPrice: 45,
    currentPrice: 52,
    lowestPrice: 48,
    vehicleType: 'ECONOMY',
    isActive: false,
    isTriggered: false,
    notifyPush: true,
    notifyEmail: true,
    notifySms: false,
    priceHistory: [
      { price: 55, timestamp: '2024-01-17T08:00:00Z' },
      { price: 58, timestamp: '2024-01-17T10:00:00Z' },
      { price: 52, timestamp: '2024-01-17T14:00:00Z' },
    ],
    createdAt: '2024-01-14T12:00:00Z',
    expiresAt: '2024-01-24T12:00:00Z'
  }
];

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered' | 'paused'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load alerts
  useEffect(() => {
    const stored = localStorage.getItem('xchange_price_alerts');
    if (stored) {
      setAlerts(JSON.parse(stored));
    } else {
      setAlerts(SAMPLE_ALERTS);
      localStorage.setItem('xchange_price_alerts', JSON.stringify(SAMPLE_ALERTS));
    }
  }, []);

  const saveAlerts = (newAlerts: PriceAlert[]) => {
    setAlerts(newAlerts);
    localStorage.setItem('xchange_price_alerts', JSON.stringify(newAlerts));
  };

  // Toggle alert active status
  const toggleAlert = (id: string) => {
    const updated = alerts.map(a =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    saveAlerts(updated);
  };

  // Delete alert
  const deleteAlert = (id: string) => {
    const updated = alerts.filter(a => a.id !== id);
    saveAlerts(updated);
    setDeleteConfirm(null);
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return alert.isActive && !alert.isTriggered;
    if (filter === 'triggered') return alert.isTriggered;
    if (filter === 'paused') return !alert.isActive;
    return true;
  });

  // Stats
  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.isActive && !a.isTriggered).length,
    triggered: alerts.filter(a => a.isTriggered).length,
    savings: alerts.filter(a => a.isTriggered && a.triggeredPrice && a.targetPrice)
      .reduce((sum, a) => sum + ((a.priceHistory[0]?.price || a.targetPrice + 20) - (a.triggeredPrice || 0)), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link href="/rides" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowRightIcon className="w-5 h-5" />
              <span>العودة للنقل الذكي</span>
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BellAlertIconSolid className="w-10 h-10" />
                  <h1 className="text-3xl font-bold">تنبيهات الأسعار</h1>
                </div>
                <p className="text-white/80">احصل على إشعار فوري عندما ينخفض السعر لمستواك المطلوب</p>
              </div>
              <Link
                href="/rides/alerts/new"
                className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all flex items-center gap-2 shadow-lg"
              >
                <PlusIcon className="w-5 h-5" />
                تنبيه جديد
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <BellIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">إجمالي التنبيهات</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-500">نشط الآن</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.triggered}</p>
                <p className="text-sm text-gray-500">تم تفعيله</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ArrowTrendingDownIcon className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.savings} ج.م</p>
                <p className="text-sm text-gray-500">وفرت</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all' as const, label: 'الكل', icon: BellIcon },
            { id: 'active' as const, label: 'نشط', icon: PlayIcon },
            { id: 'triggered' as const, label: 'تم تفعيله', icon: CheckCircleIcon },
            { id: 'paused' as const, label: 'متوقف', icon: PauseIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Alerts List */}
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
            <BellIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد تنبيهات</h3>
            <p className="text-gray-500 mb-6">أنشئ تنبيه سعر ليتم إخطارك عندما ينخفض السعر</p>
            <Link
              href="/rides/alerts/new"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-all"
            >
              <PlusIcon className="w-5 h-5" />
              إنشاء تنبيه
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggle={() => toggleAlert(alert.id)}
                onDelete={() => deleteConfirm === alert.id ? deleteAlert(alert.id) : setDeleteConfirm(alert.id)}
                deleteConfirm={deleteConfirm === alert.id}
                onCancelDelete={() => setDeleteConfirm(null)}
              />
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <h3 className="text-lg font-bold text-amber-900 mb-4">💡 نصائح لتنبيهات الأسعار</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4">
              <div className="text-2xl mb-2">⏰</div>
              <h4 className="font-bold text-gray-900 mb-1">أفضل الأوقات</h4>
              <p className="text-sm text-gray-600">الأسعار تنخفض عادة بين 10 صباحاً و 2 ظهراً</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-bold text-gray-900 mb-1">أسعار واقعية</h4>
              <p className="text-sm text-gray-600">ضع سعراً مستهدفاً أقل 15-20% من المتوسط</p>
            </div>
            <div className="bg-white rounded-xl p-4">
              <div className="text-2xl mb-2">📱</div>
              <h4 className="font-bold text-gray-900 mb-1">فعّل الإشعارات</h4>
              <p className="text-sm text-gray-600">تأكد من تفعيل إشعارات التطبيق للحصول على التنبيهات</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Alert Card Component
function AlertCard({
  alert,
  onToggle,
  onDelete,
  deleteConfirm,
  onCancelDelete
}: {
  alert: PriceAlert;
  onToggle: () => void;
  onDelete: () => void;
  deleteConfirm: boolean;
  onCancelDelete: () => void;
}) {
  // Calculate price trend
  const priceTrend = alert.priceHistory.length >= 2
    ? alert.priceHistory[alert.priceHistory.length - 1].price - alert.priceHistory[0].price
    : 0;

  // Progress to target
  const progress = alert.currentPrice && alert.priceHistory.length > 0
    ? Math.min(100, Math.max(0, ((alert.priceHistory[0].price - alert.currentPrice) / (alert.priceHistory[0].price - alert.targetPrice)) * 100))
    : 0;

  // Days remaining
  const daysRemaining = Math.ceil((new Date(alert.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all overflow-hidden ${
      alert.isTriggered
        ? 'border-green-500 shadow-lg shadow-green-100'
        : alert.isActive
          ? 'border-gray-100 hover:border-orange-200'
          : 'border-gray-100 opacity-60'
    }`}>
      {/* Triggered Banner */}
      {alert.isTriggered && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-bold">تم تفعيل التنبيه!</span>
            <span className="text-sm text-white/80">
              السعر وصل إلى {alert.triggeredPrice} ج.م
            </span>
          </div>
          <Link
            href={`/rides?pickup=${alert.pickupLat},${alert.pickupLng}&dropoff=${alert.dropoffLat},${alert.dropoffLng}`}
            className="bg-white text-green-600 px-4 py-1 rounded-lg font-bold text-sm hover:bg-green-50"
          >
            احجز الآن
          </Link>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Route */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {/* Route Visualization */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="w-0.5 h-8 bg-gray-300"></div>
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="mb-2">
                  <p className="text-sm text-gray-500">من</p>
                  <p className="font-medium text-gray-900">{alert.pickupAddressAr}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">إلى</p>
                  <p className="font-medium text-gray-900">{alert.dropoffAddressAr}</p>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {alert.provider && (
                <span className={`text-xs px-2 py-1 rounded-lg ${PROVIDERS[alert.provider].color} ${PROVIDERS[alert.provider].textColor}`}>
                  {PROVIDERS[alert.provider].logo} {PROVIDERS[alert.provider].nameAr} فقط
                </span>
              )}
              {alert.vehicleType && (
                <span className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-700">
                  {alert.vehicleType === 'ECONOMY' ? '💰 اقتصادي' : alert.vehicleType === 'COMFORT' ? '🚗 مريح' : '✨ فاخر'}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-lg ${
                daysRemaining > 3 ? 'bg-green-100 text-green-700' : daysRemaining > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                <ClockIcon className="w-3 h-3 inline ml-1" />
                {daysRemaining > 0 ? `${daysRemaining} يوم متبقي` : 'منتهي'}
              </span>
            </div>
          </div>

          {/* Price Info */}
          <div className="text-left min-w-[140px]">
            <div className="mb-2">
              <p className="text-sm text-gray-500">السعر المستهدف</p>
              <p className="text-2xl font-bold text-orange-600">{alert.targetPrice} ج.م</p>
            </div>
            {alert.currentPrice && (
              <div className="mb-2">
                <p className="text-sm text-gray-500">السعر الحالي</p>
                <p className={`text-lg font-bold ${alert.currentPrice <= alert.targetPrice ? 'text-green-600' : 'text-gray-900'}`}>
                  {alert.currentPrice} ج.م
                  {priceTrend !== 0 && (
                    <span className={`text-sm mr-1 ${priceTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {priceTrend > 0 ? '↑' : '↓'} {Math.abs(priceTrend)}
                    </span>
                  )}
                </p>
              </div>
            )}
            {alert.lowestPrice && (
              <p className="text-xs text-gray-500">
                أقل سعر: <span className="text-green-600 font-medium">{alert.lowestPrice} ج.م</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onToggle}
              className={`p-2 rounded-lg transition-colors ${
                alert.isActive
                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title={alert.isActive ? 'إيقاف' : 'تفعيل'}
            >
              {alert.isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
            </button>
            {deleteConfirm ? (
              <div className="flex flex-col gap-1">
                <button
                  onClick={onDelete}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  ✓
                </button>
                <button
                  onClick={onCancelDelete}
                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={onDelete}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                title="حذف"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {!alert.isTriggered && alert.currentPrice && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">التقدم نحو السعر المستهدف</span>
              <span className="font-medium text-orange-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Mini Price Chart */}
        {alert.priceHistory.length > 2 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <ChartBarIcon className="w-4 h-4" />
              <span>تاريخ الأسعار</span>
            </div>
            <div className="flex items-end gap-1 h-12">
              {alert.priceHistory.map((point, i) => {
                const max = Math.max(...alert.priceHistory.map(p => p.price));
                const min = Math.min(...alert.priceHistory.map(p => p.price));
                const height = ((point.price - min) / (max - min || 1)) * 100;
                const isLast = i === alert.priceHistory.length - 1;

                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all ${
                      point.price <= alert.targetPrice
                        ? 'bg-green-500'
                        : isLast
                          ? 'bg-orange-500'
                          : 'bg-gray-300'
                    }`}
                    style={{ height: `${Math.max(20, height)}%` }}
                    title={`${point.price} ج.م`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>منذ {alert.priceHistory.length} ساعات</span>
              <span>الآن</span>
            </div>
          </div>
        )}

        {/* Notification Settings */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className={alert.notifyPush ? 'text-green-600' : 'text-gray-400'}>📱</span>
            إشعارات
          </span>
          <span className="flex items-center gap-1">
            <span className={alert.notifyEmail ? 'text-green-600' : 'text-gray-400'}>📧</span>
            بريد
          </span>
          <span className="flex items-center gap-1">
            <span className={alert.notifySms ? 'text-green-600' : 'text-gray-400'}>💬</span>
            SMS
          </span>
        </div>
      </div>
    </div>
  );
}
