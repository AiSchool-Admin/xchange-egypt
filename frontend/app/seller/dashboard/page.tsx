'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
interface OverviewMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalSales: number;
  salesChange: number;
  averageOrderValue: number;
  aovChange: number;
  conversionRate: number;
  activeListings: number;
  pendingOrders: number;
  rating: number;
  responseTime: number;
}

interface SalesPerformance {
  byPeriod: { period: string; revenue: number; sales: number }[];
  byCategory: { categoryName: string; revenue: number; sales: number; percentage: number }[];
  byDayOfWeek: { day: string; sales: number; revenue: number }[];
  bestSellingHours: string[];
  bestSellingDays: string[];
  topItems: { title: string; sales: number; revenue: number }[];
}

interface InventoryHealth {
  totalItems: number;
  activeItems: number;
  soldItems: number;
  staleItems: number;
  staleness: number;
  avgDaysToSell: number;
  turnoverRate: number;
  relistingSuggestions: { title: string; daysListed: number; views: number; suggestionAr: string }[];
}

interface Recommendation {
  id: string;
  type: string;
  priority: string;
  titleAr: string;
  descriptionAr: string;
  potentialImpactAr: string;
  actionAr: string;
  estimatedRevenueLift?: number;
}

interface RevenueForecast {
  nextWeek: number;
  nextMonth: number;
  nextQuarter: number;
  confidence: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

interface SellerDashboard {
  overview: OverviewMetrics;
  salesPerformance: SalesPerformance;
  inventoryHealth: InventoryHealth;
  recommendations: Recommendation[];
  forecast: RevenueForecast;
}

// Mock data generator
function generateMockDashboard(): SellerDashboard {
  return {
    overview: {
      totalRevenue: 125000,
      revenueChange: 15.5,
      totalSales: 47,
      salesChange: 12,
      averageOrderValue: 2659,
      aovChange: 3.2,
      conversionRate: 4.8,
      activeListings: 23,
      pendingOrders: 5,
      rating: 4.7,
      responseTime: 1.5,
    },
    salesPerformance: {
      byPeriod: [
        { period: '2024-01-01', revenue: 15000, sales: 5 },
        { period: '2024-01-08', revenue: 22000, sales: 8 },
        { period: '2024-01-15', revenue: 18000, sales: 6 },
        { period: '2024-01-22', revenue: 35000, sales: 12 },
        { period: '2024-01-29', revenue: 35000, sales: 16 },
      ],
      byCategory: [
        { categoryName: 'موبايلات', revenue: 65000, sales: 22, percentage: 52 },
        { categoryName: 'إلكترونيات', revenue: 35000, sales: 15, percentage: 28 },
        { categoryName: 'ملابس', revenue: 25000, sales: 10, percentage: 20 },
      ],
      byDayOfWeek: [
        { day: 'الأحد', sales: 5, revenue: 12000 },
        { day: 'الإثنين', sales: 8, revenue: 18000 },
        { day: 'الثلاثاء', sales: 6, revenue: 15000 },
        { day: 'الأربعاء', sales: 9, revenue: 22000 },
        { day: 'الخميس', sales: 12, revenue: 32000 },
        { day: 'الجمعة', sales: 4, revenue: 14000 },
        { day: 'السبت', sales: 3, revenue: 12000 },
      ],
      bestSellingHours: ['18:00', '20:00', '21:00'],
      bestSellingDays: ['الخميس', 'الأربعاء', 'الإثنين'],
      topItems: [
        { title: 'iPhone 14 Pro Max 256GB', sales: 8, revenue: 45000 },
        { title: 'Samsung Galaxy S23 Ultra', sales: 6, revenue: 32000 },
        { title: 'MacBook Pro M2', sales: 3, revenue: 28000 },
      ],
    },
    inventoryHealth: {
      totalItems: 45,
      activeItems: 23,
      soldItems: 22,
      staleItems: 5,
      staleness: 21.7,
      avgDaysToSell: 8,
      turnoverRate: 48.8,
      relistingSuggestions: [
        { title: 'كاميرا Canon EOS R5', daysListed: 32, views: 45, suggestionAr: 'خفض السعر 10%' },
        { title: 'iPad Pro 12.9"', daysListed: 28, views: 120, suggestionAr: 'أضف صور أفضل' },
      ],
    },
    recommendations: [
      {
        id: '1',
        type: 'PRICING',
        priority: 'HIGH',
        titleAr: 'خفض أسعار المنتجات الراكدة',
        descriptionAr: 'لديك 5 منتجات لم تُباع منذ 30+ يوم',
        potentialImpactAr: 'زيادة محتملة 15% في المبيعات',
        actionAr: 'راجع المنتجات الراكدة وخفض الأسعار 10-15%',
        estimatedRevenueLift: 8000,
      },
      {
        id: '2',
        type: 'TIMING',
        priority: 'MEDIUM',
        titleAr: 'انشر في الأوقات المثالية',
        descriptionAr: 'أفضل أوقاتك للبيع: 6-9 مساءً',
        potentialImpactAr: 'رؤية أكثر = مبيعات أكثر',
        actionAr: 'جدول إعلاناتك الجديدة مساءً',
      },
      {
        id: '3',
        type: 'QUALITY',
        priority: 'MEDIUM',
        titleAr: 'حسّن جودة الصور',
        descriptionAr: '30% من إعلاناتك بصور منخفضة الجودة',
        potentialImpactAr: 'الصور الجيدة تزيد المبيعات 40%',
        actionAr: 'أعد تصوير المنتجات بإضاءة أفضل',
      },
    ],
    forecast: {
      nextWeek: 32000,
      nextMonth: 140000,
      nextQuarter: 450000,
      confidence: 78,
      trend: 'UP',
    },
  };
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  change,
  suffix = ''
}: {
  icon: string;
  label: string;
  value: string | number;
  change?: number;
  suffix?: string;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {change !== undefined && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
        {suffix && <span className="text-lg text-gray-500 mr-1">{suffix}</span>}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export default function SellerDashboardPage() {
  const [dashboard, setDashboard] = useState<SellerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'WEEK' | 'MONTH' | 'QUARTER'>('MONTH');

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/ai-advanced/seller/dashboard?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setDashboard(data.data);
      } else {
        setDashboard(generateMockDashboard());
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
      setDashboard(generateMockDashboard());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-64" />
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl" />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 rounded-xl" />
              <div className="h-80 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { overview, salesPerformance, inventoryHealth, recommendations, forecast } = dashboard;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-gray-600">
                ← العودة
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>📊</span>
                  لوحة ذكاء البائع
                </h1>
                <p className="text-sm text-gray-500">تحليلات ذكية لتحسين أدائك</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="bg-gray-100 rounded-lg px-4 py-2 text-sm font-medium"
              >
                <option value="WEEK">آخر أسبوع</option>
                <option value="MONTH">آخر شهر</option>
                <option value="QUARTER">آخر 3 أشهر</option>
              </select>
              <button className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 transition-colors">
                + إضافة منتج
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon="💰"
            label="إجمالي الإيرادات"
            value={overview.totalRevenue}
            change={overview.revenueChange}
            suffix="ج.م"
          />
          <StatCard
            icon="🛒"
            label="إجمالي المبيعات"
            value={overview.totalSales}
            change={overview.salesChange}
          />
          <StatCard
            icon="📊"
            label="متوسط قيمة الطلب"
            value={overview.averageOrderValue}
            change={overview.aovChange}
            suffix="ج.م"
          />
          <StatCard
            icon="⭐"
            label="التقييم"
            value={overview.rating}
            suffix="/5"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-xl">📦</div>
            <div>
              <div className="text-xl font-bold text-gray-900">{overview.activeListings}</div>
              <div className="text-sm text-gray-500">إعلانات نشطة</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">⏳</div>
            <div>
              <div className="text-xl font-bold text-gray-900">{overview.pendingOrders}</div>
              <div className="text-sm text-gray-500">طلبات معلقة</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">📈</div>
            <div>
              <div className="text-xl font-bold text-gray-900">{overview.conversionRate}%</div>
              <div className="text-sm text-gray-500">نسبة التحويل</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">⚡</div>
            <div>
              <div className="text-xl font-bold text-gray-900">{overview.responseTime}س</div>
              <div className="text-sm text-gray-500">متوسط وقت الرد</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📈</span>
              الإيرادات حسب الفترة
            </h3>
            <div className="h-64 flex items-end gap-2">
              {salesPerformance.byPeriod.map((item, index) => {
                const maxRevenue = Math.max(...salesPerformance.byPeriod.map(p => p.revenue));
                const height = (item.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-xs text-gray-400">
                      {new Date(item.period).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue Forecast */}
          <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span>🔮</span>
              توقعات الإيرادات
            </h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm opacity-80">الأسبوع القادم</div>
                <div className="text-2xl font-bold">{forecast.nextWeek.toLocaleString('ar-EG')} ج.م</div>
              </div>
              <div>
                <div className="text-sm opacity-80">الشهر القادم</div>
                <div className="text-3xl font-bold">{forecast.nextMonth.toLocaleString('ar-EG')} ج.م</div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-1 rounded-full ${
                  forecast.trend === 'UP' ? 'bg-white/20' : 'bg-red-500/20'
                }`}>
                  {forecast.trend === 'UP' ? '📈 صاعد' : forecast.trend === 'DOWN' ? '📉 هابط' : '➡️ مستقر'}
                </span>
                <span className="opacity-70">ثقة {forecast.confidence}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Category Performance */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏷️</span>
              الأداء حسب الفئة
            </h3>
            <div className="space-y-4">
              {salesPerformance.byCategory.map((cat, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-gray-900">{cat.categoryName}</span>
                    <span className="text-sm text-gray-500">{cat.percentage.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-emerald-500' :
                        index === 1 ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-400">
                    <span>{cat.sales} مبيعات</span>
                    <span>{cat.revenue.toLocaleString('ar-EG')} ج.م</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Selling Times */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⏰</span>
              أفضل أوقات البيع
            </h3>
            <div className="grid grid-cols-7 gap-2 mb-6">
              {salesPerformance.byDayOfWeek.map((day, index) => {
                const maxSales = Math.max(...salesPerformance.byDayOfWeek.map(d => d.sales));
                const intensity = day.sales / maxSales;
                return (
                  <div key={index} className="text-center">
                    <div
                      className="h-16 rounded-lg mb-1 transition-colors"
                      style={{ backgroundColor: `rgba(16, 185, 129, ${intensity})` }}
                    />
                    <div className="text-xs text-gray-500">{day.day.slice(0, 3)}</div>
                    <div className="text-xs font-medium">{day.sales}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">أفضل الأيام:</span>
              {salesPerformance.bestSellingDays.map((day, i) => (
                <span key={i} className="bg-emerald-100 text-emerald-700 text-sm px-2 py-1 rounded-full">
                  {day}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-sm text-gray-500">أفضل الساعات:</span>
              {salesPerformance.bestSellingHours.map((hour, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full">
                  {hour}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Inventory Health */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📦</span>
              صحة المخزون
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{inventoryHealth.activeItems}</div>
                <div className="text-xs text-gray-500">منتجات نشطة</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{inventoryHealth.soldItems}</div>
                <div className="text-xs text-gray-500">منتجات مباعة</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{inventoryHealth.staleItems}</div>
                <div className="text-xs text-gray-500">منتجات راكدة</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{inventoryHealth.avgDaysToSell}</div>
                <div className="text-xs text-gray-500">متوسط أيام البيع</div>
              </div>
            </div>

            {inventoryHealth.relistingSuggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">اقتراحات التحسين</h4>
                <div className="space-y-2">
                  {inventoryHealth.relistingSuggestions.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                      <div className="text-sm text-gray-700 truncate flex-1">{item.title}</div>
                      <div className="text-xs text-amber-600 font-medium">{item.suggestionAr}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🤖</span>
              توصيات ذكية
            </h3>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`p-4 rounded-lg border ${
                    rec.priority === 'HIGH'
                      ? 'bg-red-50 border-red-200'
                      : rec.priority === 'MEDIUM'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      rec.priority === 'HIGH'
                        ? 'bg-red-500 text-white'
                        : rec.priority === 'MEDIUM'
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-500 text-white'
                    }`}>
                      {rec.priority === 'HIGH' ? 'مهم' : rec.priority === 'MEDIUM' ? 'متوسط' : 'منخفض'}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{rec.titleAr}</h4>
                      <p className="text-sm text-gray-600 mt-1">{rec.descriptionAr}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{rec.potentialImpactAr}</span>
                        {rec.estimatedRevenueLift && (
                          <span className="text-xs text-emerald-600 font-medium">
                            +{rec.estimatedRevenueLift.toLocaleString('ar-EG')} ج.م
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🏆</span>
            أفضل المنتجات مبيعاً
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-right text-sm text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">المنتج</th>
                  <th className="pb-3 font-medium">المبيعات</th>
                  <th className="pb-3 font-medium">الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {salesPerformance.topItems.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50">
                    <td className="py-3 text-gray-400">{index + 1}</td>
                    <td className="py-3 font-medium text-gray-900">{item.title}</td>
                    <td className="py-3 text-gray-600">{item.sales}</td>
                    <td className="py-3 text-emerald-600 font-medium">
                      {item.revenue.toLocaleString('ar-EG')} ج.م
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
