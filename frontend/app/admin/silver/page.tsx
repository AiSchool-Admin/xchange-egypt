'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api';

type Tab = 'listings' | 'kyc' | 'valuations' | 'tradeins' | 'disputes';

export default function SilverAdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pendingKYC, setPendingKYC] = useState<any[]>([]);
  const [pendingValuations, setPendingValuations] = useState<any[]>([]);
  const [pendingTradeIns, setPendingTradeIns] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes] = await Promise.all([
        apiClient.get('/silver/statistics'),
      ]);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'listings', name: 'الإعلانات', icon: '📦' },
    { id: 'kyc', name: 'التحقق من الهوية', icon: '🪪' },
    { id: 'valuations', name: 'التقييمات', icon: '🔬' },
    { id: 'tradeins', name: 'الاستبدال', icon: '🔄' },
    { id: 'disputes', name: 'النزاعات', icon: '⚠️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">لوحة تحكم سوق الفضة</h1>
          <Link href="/admin" className="text-gray-300 hover:text-white">
            العودة للوحة الرئيسية
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">إجمالي القطع</p>
            <p className="text-2xl font-bold">{stats?.totalItems || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">قطع نشطة</p>
            <p className="text-2xl font-bold text-green-600">{stats?.activeItems || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">إجمالي المعاملات</p>
            <p className="text-2xl font-bold">{stats?.totalTransactions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">معاملات مكتملة</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.completedTransactions || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-gray-500 text-sm">قيمة المعاملات</p>
            <p className="text-2xl font-bold text-gray-600">
              {stats?.totalTransactionValue?.toLocaleString() || 0} ج.م
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-gray-600 border-b-2 border-gray-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Listings Tab */}
            {activeTab === 'listings' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">إدارة الإعلانات</h2>
                  <div className="flex gap-2">
                    <input
                      type="search"
                      placeholder="بحث..."
                      className="p-2 border rounded-lg"
                    />
                    <select className="p-2 border rounded-lg">
                      <option value="">كل الحالات</option>
                      <option value="ACTIVE">نشط</option>
                      <option value="PENDING">قيد المراجعة</option>
                      <option value="REJECTED">مرفوض</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gray-50 p-8 rounded-lg text-center">
                  <p className="text-gray-500">جدول الإعلانات سيظهر هنا</p>
                  <p className="text-sm text-gray-400">مع خيارات: مراجعة، قبول، رفض، تعديل</p>
                </div>
              </div>
            )}

            {/* KYC Tab */}
            {activeTab === 'kyc' && (
              <div>
                <h2 className="text-lg font-bold mb-4">طلبات التحقق من الهوية</h2>

                <div className="space-y-4">
                  {pendingKYC.length === 0 ? (
                    <div className="bg-green-50 p-6 rounded-lg text-center">
                      <span className="text-4xl">✓</span>
                      <p className="text-green-700 mt-2">لا توجد طلبات معلقة</p>
                    </div>
                  ) : (
                    pendingKYC.map((kyc: any) => (
                      <div key={kyc.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{kyc.documents?.fullName}</p>
                            <p className="text-sm text-gray-500">
                              رقم الهوية: {kyc.idNumber}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                              قبول
                            </button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
                              رفض
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">إرشادات المراجعة</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ تأكد من وضوح صورة الهوية</li>
                    <li>✓ تحقق من تطابق الاسم مع صورة السيلفي</li>
                    <li>✓ تأكد من صلاحية الهوية</li>
                    <li>✓ تحقق من رقم الهوية المصري (14 رقم)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Valuations Tab */}
            {activeTab === 'valuations' && (
              <div>
                <h2 className="text-lg font-bold mb-4">طلبات التقييم الاحترافي</h2>

                <div className="grid gap-4">
                  {pendingValuations.length === 0 ? (
                    <div className="bg-blue-50 p-6 rounded-lg text-center">
                      <span className="text-4xl">📋</span>
                      <p className="text-blue-700 mt-2">لا توجد طلبات تقييم معلقة</p>
                    </div>
                  ) : (
                    pendingValuations.map((v: any) => (
                      <div key={v.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{v.levelDetails?.nameAr}</p>
                            <p className="text-sm text-gray-500">
                              الموعد: {v.appointmentDate} - {v.appointmentTime}
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg">
                            إدخال النتائج
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Trade-ins Tab */}
            {activeTab === 'tradeins' && (
              <div>
                <h2 className="text-lg font-bold mb-4">طلبات الاستبدال</h2>

                <div className="grid gap-4">
                  {pendingTradeIns.length === 0 ? (
                    <div className="bg-yellow-50 p-6 rounded-lg text-center">
                      <span className="text-4xl">🔄</span>
                      <p className="text-yellow-700 mt-2">لا توجد طلبات استبدال معلقة</p>
                    </div>
                  ) : (
                    pendingTradeIns.map((t: any) => (
                      <div key={t.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{t.oldItemDescription}</p>
                            <p className="text-sm text-gray-500">
                              التقدير: {t.estimatedCredit} ج.م
                            </p>
                          </div>
                          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg">
                            تقديم عرض
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Disputes Tab */}
            {activeTab === 'disputes' && (
              <div>
                <h2 className="text-lg font-bold mb-4">النزاعات المفتوحة</h2>

                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <span className="text-4xl">✓</span>
                  <p className="text-gray-600 mt-2">لا توجد نزاعات مفتوحة</p>
                </div>

                <div className="mt-6">
                  <h3 className="font-bold mb-2">إجراءات حل النزاعات</h3>
                  <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                    <li>مراجعة تفاصيل المعاملة والأدلة المقدمة</li>
                    <li>التواصل مع الطرفين لفهم الموقف</li>
                    <li>اتخاذ قرار: استرداد كامل / جزئي / رفض</li>
                    <li>توثيق القرار وإخطار الطرفين</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <button className="bg-white rounded-lg shadow p-4 text-right hover:shadow-md transition-shadow">
            <span className="text-2xl">💰</span>
            <h3 className="font-bold mt-2">تحديث الأسعار</h3>
            <p className="text-sm text-gray-500">تحديث أسعار الفضة يدوياً</p>
          </button>
          <button className="bg-white rounded-lg shadow p-4 text-right hover:shadow-md transition-shadow">
            <span className="text-2xl">📊</span>
            <h3 className="font-bold mt-2">التقارير</h3>
            <p className="text-sm text-gray-500">تقارير المبيعات والأداء</p>
          </button>
          <button className="bg-white rounded-lg shadow p-4 text-right hover:shadow-md transition-shadow">
            <span className="text-2xl">🏪</span>
            <h3 className="font-bold mt-2">إدارة الشركاء</h3>
            <p className="text-sm text-gray-500">محلات الفضة الشريكة</p>
          </button>
        </div>
      </div>
    </div>
  );
}
