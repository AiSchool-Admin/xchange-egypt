'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { founderFetch } from '@/lib/api/founder';

interface BoardAlert {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
  category: string;
  source: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<BoardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await founderFetch('/board/alerts');
        setAlerts(response.data || []);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    try {
      await founderFetch(`/board/alerts/${alertId}/acknowledge`, { method: 'POST' });
      setAlerts(prev => prev.map(a =>
        a.id === alertId ? { ...a, status: 'ACKNOWLEDGED', acknowledgedAt: new Date().toISOString() } : a
      ));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await founderFetch(`/board/alerts/${alertId}/resolve`, { method: 'POST' });
      setAlerts(prev => prev.map(a =>
        a.id === alertId ? { ...a, status: 'RESOLVED', resolvedAt: new Date().toISOString() } : a
      ));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const getSeverityStyle = (severity: string) => {
    const styles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
      INFO: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: 'ℹ️' },
      WARNING: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', icon: '⚠️' },
      CRITICAL: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: '🔴' },
      EMERGENCY: { bg: 'bg-red-600/20', border: 'border-red-600/50', text: 'text-red-500', icon: '🚨' },
    };
    return styles[severity] || styles.INFO;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      ACTIVE: { label: 'نشط', color: 'bg-red-500/20 text-red-400' },
      ACKNOWLEDGED: { label: 'تم الاطلاع', color: 'bg-yellow-500/20 text-yellow-400' },
      RESOLVED: { label: 'تم الحل', color: 'bg-green-500/20 text-green-400' },
      DISMISSED: { label: 'مرفوض', color: 'bg-gray-500/20 text-gray-400' },
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };
    return <span className={`px-2 py-1 rounded-full text-xs ${s.color}`}>{s.label}</span>;
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'active') return a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED';
    if (filter === 'resolved') return a.status === 'RESOLVED';
    return true;
  });

  // Summary stats
  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'ACTIVE').length,
    emergency: alerts.filter(a => a.severity === 'EMERGENCY' && a.status === 'ACTIVE').length,
    critical: alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length,
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/board" className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">التنبيهات</h1>
            <p className="text-gray-400">مراقبة وإدارة تنبيهات النظام</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
          <p className="text-sm text-gray-400">إجمالي التنبيهات</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
          <p className="text-sm text-yellow-400">نشطة</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.active}</p>
        </div>
        <div className="p-4 bg-red-600/10 rounded-xl border border-red-600/30">
          <p className="text-sm text-red-500">طوارئ</p>
          <p className="text-2xl font-bold text-red-500">{stats.emergency}</p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/30">
          <p className="text-sm text-red-400">حرجة</p>
          <p className="text-2xl font-bold text-red-400">{stats.critical}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'resolved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {f === 'all' ? 'الكل' : f === 'active' ? 'نشطة' : 'محلولة'}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <div className="p-12 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
          <span className="text-5xl mb-4 block">🔔</span>
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد تنبيهات</h3>
          <p className="text-gray-400">النظام يعمل بشكل طبيعي</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            return (
              <div
                key={alert.id}
                className={`p-6 rounded-xl border ${style.bg} ${style.border} ${
                  alert.severity === 'EMERGENCY' && alert.status === 'ACTIVE' ? 'animate-pulse' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{style.icon}</span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${style.text}`}>{alert.titleAr || alert.title}</h3>
                        {getStatusBadge(alert.status)}
                      </div>
                      <p className="text-gray-300">{alert.descriptionAr || alert.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>المصدر: {alert.source}</span>
                        <span>الفئة: {alert.category}</span>
                        <span>{new Date(alert.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {alert.status === 'ACTIVE' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1.5 text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors"
                      >
                        تم الاطلاع
                      </button>
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1.5 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                      >
                        تم الحل
                      </button>
                    </div>
                  )}
                  {alert.status === 'ACKNOWLEDGED' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1.5 text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                    >
                      تم الحل
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
