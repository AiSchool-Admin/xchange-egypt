'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { founderFetch } from '@/lib/api/founder';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'loading' | 'idle';
  data: any;
  error?: string;
  timestamp?: Date;
}

// Result Display Modal
const ResultModal = ({
  isOpen,
  onClose,
  result,
}: {
  isOpen: boolean;
  onClose: () => void;
  result: TestResult | null;
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏳'}
              {result.name}
            </h2>
            {result.timestamp && (
              <p className="text-sm text-gray-400">
                {result.timestamp.toLocaleString('ar-EG')}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <span className="text-2xl text-gray-400">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {result.status === 'error' ? (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
              <p className="text-red-400">{result.error}</p>
            </div>
          ) : (
            <pre className="p-4 bg-gray-800 rounded-xl overflow-x-auto text-sm text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

// Agenda Display Component
const AgendaDisplay = ({ agenda }: { agenda: any }) => {
  if (!agenda) return null;

  const priorityColors: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/50',
    HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    LOW: 'bg-green-500/20 text-green-400 border-green-500/50',
  };

  const typeIcons: Record<string, string> = {
    STRATEGIC: '🎯',
    OPERATIONAL: '⚙️',
    INNOVATION: '💡',
    CRISIS: '🚨',
    REVIEW: '📊',
    DECISION: '⚖️',
  };

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
        <h3 className="text-sm font-medium text-cyan-400 mb-2">الملخص التنفيذي</h3>
        <p className="text-white leading-relaxed">{agenda.executiveSummaryAr || agenda.executiveSummary}</p>
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
          <span>⏱️ المدة: {agenda.totalDuration} دقيقة</span>
          <span>📌 البنود: {agenda.items?.length || 0}</span>
          <span>📋 النوع: {agenda.meetingType}</span>
        </div>
      </div>

      {/* Phase Context */}
      {agenda.phaseContext && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <span className="text-sm text-purple-400">🏢 المرحلة: {agenda.phaseContext}</span>
        </div>
      )}

      {/* Agenda Items */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">📝 بنود الأجندة</h3>
        {agenda.items?.map((item: any, index: number) => (
          <div key={item.id || index} className={`p-4 rounded-xl border ${priorityColors[item.priority] || 'border-gray-600'}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{typeIcons[item.type] || '📋'}</span>
                <span className="text-white font-semibold">{index + 1}. {item.titleAr || item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${priorityColors[item.priority]}`}>
                  {item.priority}
                </span>
                <span className="text-xs text-gray-400">⏱️ {item.timeAllocation} د</span>
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-2">{item.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-gray-400">
              <span>👤 المسؤول: <span className="text-white">{item.leadMember}</span></span>
              <span>👥 المشاركون: <span className="text-white">{item.participants?.join(', ')}</span></span>
              {item.requiredDecision && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">⚖️ يتطلب قرار</span>
              )}
            </div>
            {item.relatedKPIs?.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">📊 KPIs:</span>
                {item.relatedKPIs.map((kpi: string) => (
                  <span key={kpi} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{kpi}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Meeting MOM Display Component
const MOMDisplay = ({ mom, meeting }: { mom: any; meeting?: any }) => {
  if (!mom) return null;

  return (
    <div className="space-y-4">
      {/* MOM Header */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">{mom.momNumber || 'MOM'}</h3>
          <span className={`px-3 py-1 rounded-full text-xs ${
            mom.status === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
            mom.status === 'PENDING_REVIEW' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {mom.status}
          </span>
        </div>
        <p className="text-gray-300">{mom.executiveSummaryAr || mom.executiveSummary}</p>
      </div>

      {/* KPI Snapshot */}
      {mom.kpiSnapshot && (
        <div className="p-4 bg-gray-800/50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-400 mb-3">📊 لقطة مؤشرات الأداء</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {mom.kpiSnapshot.slice(0, 8).map((kpi: any, i: number) => (
              <div key={i} className="p-2 bg-gray-900/50 rounded-lg text-center">
                <p className="text-xs text-gray-400">{kpi.code}</p>
                <p className={`font-bold ${
                  kpi.status === 'GREEN' ? 'text-green-400' :
                  kpi.status === 'YELLOW' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {kpi.flag} {typeof kpi.currentValue === 'number' ? kpi.currentValue.toFixed(1) : kpi.currentValue}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discussion */}
      {mom.discussionHighlights && mom.discussionHighlights.length > 0 && (
        <div className="p-4 bg-gray-800/50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-400 mb-3">💬 أبرز المناقشات</h4>
          <ul className="space-y-2">
            {mom.discussionHighlights.map((item: any, i: number) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-blue-400">•</span>
                <span><strong className="text-white">{item.speaker}:</strong> {item.point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Decisions */}
      {mom.decisions && mom.decisions.length > 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <h4 className="text-sm font-medium text-green-400 mb-3">⚖️ القرارات</h4>
          <ul className="space-y-2">
            {mom.decisions.map((decision: any, i: number) => (
              <li key={i} className="text-sm text-gray-300 p-2 bg-gray-900/50 rounded">
                {decision.title || decision.description || decision}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Ideas */}
      {mom.ideas && mom.ideas.length > 0 && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <h4 className="text-sm font-medium text-purple-400 mb-3">💡 الأفكار</h4>
          <ul className="space-y-2">
            {mom.ideas.map((idea: any, i: number) => (
              <li key={i} className="text-sm text-gray-300 p-2 bg-gray-900/50 rounded flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  idea.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                  idea.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>{idea.priority}</span>
                {idea.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Meeting Info */}
      {meeting && (
        <div className="p-4 bg-gray-800/50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-400 mb-2">📅 معلومات الاجتماع</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div><span className="text-gray-500">النوع:</span> <span className="text-white">{meeting.type}</span></div>
            <div><span className="text-gray-500">الحالة:</span> <span className="text-white">{meeting.status}</span></div>
            <div><span className="text-gray-500">المدة:</span> <span className="text-white">{meeting.durationMinutes} د</span></div>
            <div><span className="text-gray-500">الحضور:</span> <span className="text-white">{meeting.attendeesCount}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Report Display Component
const ReportDisplay = ({ report, type }: { report: any; type: string }) => {
  if (!report) return null;

  return (
    <div className="space-y-4">
      {/* Report Header */}
      <div className="p-4 bg-gray-800/50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">{report.reportNumber}</h3>
          <span className="text-sm text-gray-400">{report.memberName}</span>
        </div>
        <p className="text-gray-300">{report.summaryAr || report.summary}</p>
        {report.generatedAt && (
          <p className="text-xs text-gray-500 mt-2">
            تم التوليد: {new Date(report.generatedAt).toLocaleString('ar-EG')}
          </p>
        )}
      </div>

      {/* Content Package Details */}
      {type === 'content' && report.content && (
        <div className="space-y-4">
          {/* Social Posts */}
          {report.content.socialPosts && report.content.socialPosts.length > 0 && (
            <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-xl">
              <h4 className="text-sm font-medium text-pink-400 mb-3">📱 المنشورات الاجتماعية ({report.content.socialPosts.length})</h4>
              <div className="space-y-3">
                {report.content.socialPosts.map((post: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {post.platform === 'facebook' ? '📘' : post.platform === 'instagram' ? '📸' : post.platform === 'twitter' ? '🐦' : '📱'}
                      </span>
                      <span className="text-sm font-medium text-white capitalize">{post.platform}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        post.type === 'promo' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>{post.type}</span>
                      {post.scheduledTime && <span className="text-xs text-gray-500">⏰ {post.scheduledTime}</span>}
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{post.content}</p>
                    {post.hashtags && post.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.hashtags.map((tag: string, j: number) => (
                          <span key={j} className="text-xs text-blue-400">#{tag}</span>
                        ))}
                      </div>
                    )}
                    {post.targetAudience && (
                      <p className="text-xs text-gray-500 mt-1">🎯 الجمهور: {post.targetAudience}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stories */}
          {report.content.stories && report.content.stories.length > 0 && (
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <h4 className="text-sm font-medium text-purple-400 mb-3">📖 القصص ({report.content.stories.length})</h4>
              <div className="grid grid-cols-2 gap-2">
                {report.content.stories.map((story: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-sm font-medium text-white">{story.title}</p>
                    <p className="text-xs text-gray-400">{story.platform} • {story.type}</p>
                    {story.content && <p className="text-xs text-gray-300 mt-1">{story.content}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Campaigns */}
          {report.content.emailCampaigns && report.content.emailCampaigns.length > 0 && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <h4 className="text-sm font-medium text-blue-400 mb-3">📧 حملات البريد ({report.content.emailCampaigns.length})</h4>
              <div className="space-y-2">
                {report.content.emailCampaigns.map((email: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-900/50 rounded-lg">
                    <p className="text-sm font-medium text-white">{email.subject}</p>
                    <p className="text-xs text-gray-400 mt-1">{email.preview}</p>
                    {email.targetSegment && <p className="text-xs text-blue-400 mt-1">🎯 {email.targetSegment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content Calendar */}
          {report.content.contentCalendar && (
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <h4 className="text-sm font-medium text-cyan-400 mb-3">📅 تقويم المحتوى</h4>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(report.content.contentCalendar, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Financial Report Details */}
      {type === 'financial' && (
        <div className="space-y-4">
          {/* Key Metrics */}
          {report.keyMetrics && (
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
              <h4 className="text-sm font-medium text-green-400 mb-3">📊 المقاييس المالية الرئيسية</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(report.keyMetrics).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-900/50 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">{key}</p>
                    <p className="text-lg font-bold text-green-400">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Calculations */}
          {report.calculations && (
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-sm font-medium text-gray-400 mb-3">🧮 تفاصيل الحسابات</h4>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded">
                {JSON.stringify(report.calculations, null, 2)}
              </pre>
            </div>
          )}

          {/* Revenue Breakdown */}
          {report.revenueBreakdown && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <h4 className="text-sm font-medium text-emerald-400 mb-3">💰 تفاصيل الإيرادات</h4>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(report.revenueBreakdown, null, 2)}
              </pre>
            </div>
          )}

          {/* Alerts */}
          {report.alerts && report.alerts.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <h4 className="text-sm font-medium text-red-400 mb-3">🚨 التنبيهات المالية</h4>
              <ul className="space-y-2">
                {report.alerts.map((alert: any, i: number) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-400">⚠️</span>
                    {alert.message || alert}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Operations Report Details */}
      {type === 'operations' && (
        <div className="space-y-4">
          {/* Key Metrics */}
          {report.keyMetrics && (
            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <h4 className="text-sm font-medium text-orange-400 mb-3">📊 مقاييس العمليات</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(report.keyMetrics).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-900/50 rounded-lg text-center">
                    <p className="text-xs text-gray-400 mb-1">{key}</p>
                    <p className="text-lg font-bold text-orange-400">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {report.insights && report.insights.length > 0 && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <h4 className="text-sm font-medium text-yellow-400 mb-3">💡 الرؤى التشغيلية</h4>
              <ul className="space-y-2">
                {report.insights.map((insight: any, i: number) => (
                  <li key={i} className="text-sm text-gray-300 p-2 bg-gray-900/50 rounded flex items-start gap-2">
                    <span className="text-yellow-400">💡</span>
                    <div>
                      <p>{insight.insight || insight}</p>
                      {insight.recommendation && (
                        <p className="text-xs text-gray-400 mt-1">→ {insight.recommendation}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Performance Data */}
          {report.performanceData && (
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <h4 className="text-sm font-medium text-gray-400 mb-3">📈 بيانات الأداء</h4>
              <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-3 rounded">
                {JSON.stringify(report.performanceData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Insights (generic) */}
      {!['content', 'financial', 'operations'].includes(type) && report.insights && report.insights.length > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <h4 className="text-sm font-medium text-yellow-400 mb-3">💡 الرؤى</h4>
          <ul className="space-y-2">
            {report.insights.map((insight: any, i: number) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-yellow-400">•</span>
                {insight.insight || insight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Intelligence Report Display
const IntelligenceDisplay = ({ intelligence }: { intelligence: any }) => {
  if (!intelligence) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white">{intelligence.reportNumber}</h3>
          <span className="text-sm text-gray-400">
            {new Date(intelligence.date).toLocaleDateString('ar-EG')}
          </span>
        </div>
        <p className="text-gray-300">{intelligence.executiveSummaryAr || intelligence.executiveSummary}</p>
      </div>

      {/* KPI Overview */}
      {intelligence.keyInsights && (
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <span className="text-2xl">🟢</span>
            <p className="text-2xl font-bold text-green-400">{intelligence.keyInsights.greenCount}</p>
            <p className="text-xs text-gray-400">مؤشرات سليمة</p>
          </div>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-center">
            <span className="text-2xl">🟡</span>
            <p className="text-2xl font-bold text-yellow-400">{intelligence.keyInsights.yellowCount}</p>
            <p className="text-xs text-gray-400">تحتاج انتباه</p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
            <span className="text-2xl">🔴</span>
            <p className="text-2xl font-bold text-red-400">{intelligence.keyInsights.redCount}</p>
            <p className="text-xs text-gray-400">حرجة</p>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
            <span className="text-2xl">⚠️</span>
            <p className="text-2xl font-bold text-purple-400">{intelligence.keyInsights.anomalyCount}</p>
            <p className="text-xs text-gray-400">شذوذات</p>
          </div>
        </div>
      )}

      {/* KPI Snapshot */}
      {intelligence.kpiSnapshot && intelligence.kpiSnapshot.length > 0 && (
        <div className="p-4 bg-gray-800/50 rounded-xl">
          <h4 className="text-sm font-medium text-gray-400 mb-3">📊 لقطة مؤشرات الأداء ({intelligence.kpiSnapshot.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {intelligence.kpiSnapshot.map((kpi: any, i: number) => (
              <div key={i} className="p-2 bg-gray-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{kpi.code}</span>
                  <span>{kpi.flag}</span>
                </div>
                <p className="text-sm font-bold text-white">
                  {typeof kpi.currentValue === 'number' ? kpi.currentValue.toFixed(2) : kpi.currentValue}
                  <span className="text-xs text-gray-500 mr-1">/ {kpi.targetValue}</span>
                </p>
                <p className={`text-xs ${
                  kpi.changePercent > 0 ? 'text-green-400' : kpi.changePercent < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {kpi.changePercent > 0 ? '↑' : kpi.changePercent < 0 ? '↓' : '→'} {Math.abs(kpi.changePercent || 0).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Sources */}
      {intelligence.dataSources && (
        <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
          <h4 className="text-sm font-medium text-cyan-400 mb-3">🔗 مصادر البيانات</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(intelligence.dataSources).map(([source, data]: [string, any]) => (
              <div key={source} className="p-2 bg-gray-900/50 rounded-lg">
                <p className="text-xs text-cyan-400 font-medium">{source}</p>
                {typeof data === 'object' ? (
                  <p className="text-xs text-gray-300">{Object.keys(data).length} عناصر</p>
                ) : (
                  <p className="text-xs text-gray-300">{String(data)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anomalies */}
      {intelligence.anomalies && intelligence.anomalies.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <h4 className="text-sm font-medium text-red-400 mb-3">⚠️ الشذوذات المكتشفة</h4>
          <ul className="space-y-2">
            {intelligence.anomalies.map((anomaly: any, i: number) => (
              <li key={i} className="text-sm text-gray-300 flex items-start gap-2 p-2 bg-gray-900/50 rounded">
                <span className={anomaly.severity === 'RED' ? 'text-red-400' : 'text-yellow-400'}>
                  {anomaly.severity === 'RED' ? '🔴' : '🟡'}
                </span>
                <div>
                  <p className="font-medium">{anomaly.kpi}</p>
                  <p className="text-xs text-gray-400">{anomaly.explanation}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Opportunities & Threats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {intelligence.opportunities && intelligence.opportunities.length > 0 && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <h4 className="text-sm font-medium text-green-400 mb-3">💡 الفرص</h4>
            <ul className="space-y-2">
              {intelligence.opportunities.map((opp: any, i: number) => (
                <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    opp.priority === 'HIGH' ? 'bg-red-400' : 'bg-green-400'
                  }`}></span>
                  {opp.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {intelligence.threats && intelligence.threats.length > 0 && (
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <h4 className="text-sm font-medium text-orange-400 mb-3">⚡ التهديدات</h4>
            <ul className="space-y-2">
              {intelligence.threats.map((threat: any, i: number) => (
                <li key={i} className="text-sm text-gray-300 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    threat.priority === 'HIGH' ? 'bg-red-400' : 'bg-orange-400'
                  }`}></span>
                  {threat.title}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Raw Data for Debug */}
      <details className="p-4 bg-gray-800/50 rounded-xl">
        <summary className="text-sm font-medium text-gray-400 cursor-pointer">🔧 البيانات الخام (للتشخيص)</summary>
        <pre className="mt-3 text-xs text-gray-300 whitespace-pre-wrap overflow-x-auto">
          {JSON.stringify(intelligence, null, 2)}
        </pre>
      </details>
    </div>
  );
};

// Master Initialization Display
const MasterInitDisplay = ({ data }: { data: any }) => {
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className={`p-4 rounded-xl ${data.success ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {data.success ? '✅' : '⚠️'} نتيجة التهيئة
          </h3>
          <span className="text-sm text-gray-400">{data.summary?.executionTimeMs}ms</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <p className="text-2xl font-bold text-green-400">{data.summary?.totalSuccess || 0}</p>
            <p className="text-xs text-gray-400">نجح</p>
          </div>
          <div className="p-3 bg-red-500/20 rounded-lg">
            <p className="text-2xl font-bold text-red-400">{data.summary?.totalFailed || 0}</p>
            <p className="text-xs text-gray-400">فشل</p>
          </div>
        </div>
      </div>

      {/* Components Status */}
      <div className="p-4 bg-gray-800/50 rounded-xl">
        <h4 className="text-sm font-medium text-gray-400 mb-3">📊 حالة المكونات</h4>
        <div className="space-y-2">
          {/* KPIs */}
          <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <span className="text-sm text-white">📈 مؤشرات الأداء (KPIs)</span>
            <span className={`text-xs px-2 py-1 rounded ${data.components?.kpis?.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {data.components?.kpis?.success ? `✓ ${data.components.kpis.updated} تحديث` : '✗ فشل'}
            </span>
          </div>
          {/* Morning Intelligence */}
          <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <span className="text-sm text-white">🌅 الاستخبارات الصباحية</span>
            <span className={`text-xs px-2 py-1 rounded ${data.components?.morningIntelligence?.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {data.components?.morningIntelligence?.success ? `✓ ${data.components.morningIntelligence.reportNumber || 'OK'}` : '✗ فشل'}
            </span>
          </div>
          {/* Meetings */}
          <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <span className="text-sm text-white">📅 الاجتماعات</span>
            <span className={`text-xs px-2 py-1 rounded ${data.components?.meetings?.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {data.components?.meetings?.success ? `✓ ${data.components.meetings.created} جديد, ${data.components.meetings.existing} موجود` : '✗ فشل'}
            </span>
          </div>
          {/* Agendas */}
          <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <span className="text-sm text-white">📋 الأجندات</span>
            <span className={`text-xs px-2 py-1 rounded ${data.components?.agendas?.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {data.components?.agendas?.success ? `✓ ${data.components.agendas.generated?.join(', ') || 'OK'}` : '✗ فشل'}
            </span>
          </div>
          {/* Reports */}
          <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
            <span className="text-sm text-white">📝 التقارير</span>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-1 rounded ${data.components?.reports?.content?.success ? 'bg-pink-500/20 text-pink-400' : 'bg-gray-500/20 text-gray-400'}`}>
                📣 {data.components?.reports?.content?.success ? '✓' : '✗'}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${data.components?.reports?.financial?.success ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                💰 {data.components?.reports?.financial?.success ? '✓' : '✗'}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${data.components?.reports?.operations?.success ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>
                ⚙️ {data.components?.reports?.operations?.success ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Run */}
      {data.nextScheduledRun && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
          <span className="text-sm text-blue-400">
            ⏰ التشغيل التلقائي التالي: {new Date(data.nextScheduledRun).toLocaleString('ar-EG')}
          </span>
        </div>
      )}
    </div>
  );
};

// Health Display
const HealthDisplay = ({ data }: { data: any }) => {
  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Initialization Status */}
      <div className={`p-4 rounded-xl ${data.initialized ? 'bg-green-500/10 border border-green-500/30' : 'bg-yellow-500/10 border border-yellow-500/30'}`}>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {data.initialized ? '💚 المجلس مهيأ' : '💛 يحتاج تهيئة'}
        </h3>
        {data.lastInitialization && (
          <p className="text-sm text-gray-400 mt-1">
            آخر تهيئة: {new Date(data.lastInitialization).toLocaleString('ar-EG')}
          </p>
        )}
      </div>

      {/* Components Health */}
      <div className="grid grid-cols-2 gap-3">
        {/* KPIs */}
        <div className="p-3 bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span>📊</span>
            <span className="text-sm font-medium text-white">مؤشرات الأداء</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{data.components?.kpis?.count || 0}</p>
          <p className="text-xs text-gray-400">
            آخر تحديث: {data.components?.kpis?.lastUpdate ? new Date(data.components.kpis.lastUpdate).toLocaleTimeString('ar-EG') : 'غير معروف'}
          </p>
        </div>

        {/* Morning Intelligence */}
        <div className="p-3 bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span>🌅</span>
            <span className="text-sm font-medium text-white">استخبارات اليوم</span>
          </div>
          <p className={`text-2xl font-bold ${data.components?.morningIntelligence?.hasToday ? 'text-green-400' : 'text-gray-400'}`}>
            {data.components?.morningIntelligence?.hasToday ? '✓' : '✗'}
          </p>
          <p className="text-xs text-gray-400">
            {data.components?.morningIntelligence?.reportNumber || 'لم يتم التوليد'}
          </p>
        </div>

        {/* Meetings */}
        <div className="p-3 bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span>📅</span>
            <span className="text-sm font-medium text-white">اجتماعات اليوم</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{data.components?.meetings?.todayCount || 0}</p>
          <p className="text-xs text-gray-400">اجتماعات مجدولة</p>
        </div>

        {/* Reports */}
        <div className="p-3 bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <span>📝</span>
            <span className="text-sm font-medium text-white">تقارير اليوم</span>
          </div>
          <div className="flex gap-2 mt-1">
            <span className={`px-2 py-1 rounded text-xs ${data.components?.reports?.contentToday ? 'bg-pink-500/20 text-pink-400' : 'bg-gray-700 text-gray-500'}`}>📣</span>
            <span className={`px-2 py-1 rounded text-xs ${data.components?.reports?.financialToday ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>💰</span>
            <span className={`px-2 py-1 rounded text-xs ${data.components?.reports?.operationsToday ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-700 text-gray-500'}`}>⚙️</span>
          </div>
        </div>
      </div>

      {/* Action Suggestion */}
      {!data.initialized && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
          <p className="text-sm text-yellow-400">
            ⚠️ المجلس يحتاج تهيئة اليوم. اضغط على "التهيئة الشاملة للمجلس" لتفعيل جميع العناصر.
          </p>
        </div>
      )}
    </div>
  );
};

export default function BoardTestingPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null);

  const updateResult = (name: string, result: Partial<TestResult>) => {
    setResults(prev => ({
      ...prev,
      [name]: { ...prev[name], name, ...result } as TestResult,
    }));
  };

  // Test: Morning Agenda
  const testMorningAgenda = async () => {
    const testName = 'أجندة الاجتماع الصباحي';
    setActiveTest(testName);
    updateResult(testName, { status: 'loading', data: null });
    try {
      const response = await founderFetch('/board/autonomous/agenda/generate', {
        method: 'POST',
        body: JSON.stringify({ type: 'MORNING', maxDuration: 45 }),
      });
      updateResult(testName, { status: 'success', data: response.data, timestamp: new Date() });
    } catch (error: any) {
      updateResult(testName, { status: 'error', error: error.message, timestamp: new Date() });
    }
    setActiveTest(null);
  };

  // Test: Evening Agenda
  const testEveningAgenda = async () => {
    const testName = 'أجندة الاجتماع المسائي';
    setActiveTest(testName);
    updateResult(testName, { status: 'loading', data: null });
    try {
      const response = await founderFetch('/board/autonomous/agenda/generate', {
        method: 'POST',
        body: JSON.stringify({ type: 'AFTERNOON', maxDuration: 60 }),
      });
      updateResult(testName, { status: 'success', data: response.data, timestamp: new Date() });
    } catch (error: any) {
      updateResult(testName, { status: 'error', error: error.message, timestamp: new Date() });
    }
    setActiveTest(null);
  };

  // Test: Weekly Strategic Agenda
  const testWeeklyAgenda = async () => {
    const testName = 'أجندة الاجتماع الأسبوعي الاستراتيجي';
    setActiveTest(testName);
    updateResult(testName, { status: 'loading', data: null });
    try {
      const response = await founderFetch('/board/autonomous/agenda/generate', {
        method: 'POST',
        body: JSON.stringify({ type: 'WEEKLY', maxDuration: 90 }),
      });
      updateResult(testName, { status: 'success', data: response.data, timestamp: new Date() });
    } catch (error: any) {
      updateResult(testName, { status: 'error', error: error.message, timestamp: new Date() });
    }
    setActiveTest(null);
  };

  // Test: Run Meeting with MOM
  const testRunMeeting = async () => {
    const testName = 'عقد اجتماع صباحي + محضر';
    setActiveTest(testName);
    updateResult(testName, { status: 'loading', data: null });
    try {
      const response = await founderFetch('/board/autonomous/meetings/run', {
        method: 'POST',
        body: JSON.stringify({ type: 'MORNING' }),
      });
      updateResult(testName, { status: 'success', data: response.data, timestamp: new Date() });
    } catch (error: any) {
      updateResult(testName, { status: 'error', error: error.message, timestamp: new Date() });
    }
    setActiveTest(null);
  };

  // Test: Content Report
  const testContentReport = async () => {
    const testName = 'تقرير المحتوى التسويقي';
    setActiveTest(testName);
    updateResult(testName, { status: 'loading', data: null });
    try {
      // First generate reports
      await founderFetch('/board/reports/generate', { method: 'POST' });
      // Then fetch dashboard to get the content report
      const response = await founderFetch('/board/autonomous/dashboard');
      updateResult(testName, {
        status: 'success',
        data: {
          report: response.data?.contentPackage,
          source: 'dashboard'
        },
        timestamp: new Date()
      });
    } catch (error: any) {
      updateResult(testName, { status: 'error', error: error.message, timestamp: new Date() });
    }
    setActiveTest(null);
  };

  // Test: Financial Report
  const testFinancialReport = async () => {
    const testName = 'التقرير المالي المفصل';
    setActiveTest(testName);
    updateResult(testName, { status: 'loading', data: null });
    try {
      // First generate reports
      await founderFetch('/board/reports/generate', { method: 'POST' });
      // Then fetch dashboard to get the financial report
      const response = await founderFetch('/board/autonomous/dashboard');
      updateResult(testName, {
        status: 'success',
        data: {
          report: response.data?.financialReport,
          source: 'dashboard'
        },
        timestamp: new Date()
      });
    } catch (error: any) {
      updateResult(testName, { status: 'error', error: error.message, timestamp: new Date() });
    }
    setActiveTest(null);
  };

  // Test: Operations Report
  const testOperationsReport = async () => {
    const testName = 'تقرير العمليات التفصيلي';
    setActiveTest(testName);
    updateResult(testName, { status: 'loading', data: null });
    try {
      // First generate reports
      await founderFetch('/board/reports/generate', { method: 'POST' });
      // Then fetch dashboard to get the operations report
      const response = await founderFetch('/board/autonomous/dashboard');
      updateResult(testName, {
        status: 'success',
        data: {
          report: response.data?.operationsReport,
          source: 'dashboard'
        },
        timestamp: new Date()
      });
    } catch (error: any) {
      updateResult(testName, { status: 'error', error: error.message, timestamp: new Date() });
    }
    setActiveTest(null);
  };

  // Test: Morning Intelligence
  const testMorningIntelligence = async () => {
    const testName = 'تقرير الاستخبارات الصباحي';
    setActiveTest(testName);
    updateResult(testName, { status: 'loading', data: null });
    try {
      // First generate intelligence
      await founderFetch('/board/autonomous/morning-intelligence/generate', { method: 'POST' });
      // Then fetch dashboard to get the intelligence
      const response = await founderFetch('/board/autonomous/dashboard');
      updateResult(testName, {
        status: 'success',
        data: {
          intelligence: response.data?.morningIntelligence,
          source: 'dashboard'
        },
        timestamp: new Date()
      });
    } catch (error: any) {
      updateResult(testName, { status: 'error', error: error.message, timestamp: new Date() });
    }
    setActiveTest(null);
  };

  // Test: Master Board Initialization
  const testMasterInitialization = async () => {
    const testName = 'التهيئة الشاملة للمجلس';
    setActiveTest(testName);
    updateResult(testName, { status: 'loading', data: null });
    try {
      const response = await founderFetch('/board/master/initialize', {
        method: 'POST',
        body: JSON.stringify({ forceRefresh: true }),
      });
      updateResult(testName, { status: 'success', data: response.data, timestamp: new Date() });
    } catch (error: any) {
      updateResult(testName, { status: 'error', error: error.message, timestamp: new Date() });
    }
    setActiveTest(null);
  };

  // Test: Board Health Check
  const testBoardHealth = async () => {
    const testName = 'فحص صحة المجلس';
    setActiveTest(testName);
    updateResult(testName, { status: 'loading', data: null });
    try {
      const response = await founderFetch('/board/master/health');
      updateResult(testName, { status: 'success', data: response.data, timestamp: new Date() });
    } catch (error: any) {
      updateResult(testName, { status: 'error', error: error.message, timestamp: new Date() });
    }
    setActiveTest(null);
  };

  const tests = [
    { name: 'التهيئة الشاملة للمجلس', icon: '🚀', color: 'emerald', action: testMasterInitialization, type: 'master' },
    { name: 'فحص صحة المجلس', icon: '💚', color: 'teal', action: testBoardHealth, type: 'health' },
    { name: 'أجندة الاجتماع الصباحي', icon: '🌅', color: 'cyan', action: testMorningAgenda, type: 'agenda' },
    { name: 'أجندة الاجتماع المسائي', icon: '🌆', color: 'orange', action: testEveningAgenda, type: 'agenda' },
    { name: 'أجندة الاجتماع الأسبوعي الاستراتيجي', icon: '📅', color: 'purple', action: testWeeklyAgenda, type: 'agenda' },
    { name: 'عقد اجتماع صباحي + محضر', icon: '☀️', color: 'yellow', action: testRunMeeting, type: 'meeting' },
    { name: 'تقرير المحتوى التسويقي', icon: '📣', color: 'pink', action: testContentReport, type: 'content' },
    { name: 'التقرير المالي المفصل', icon: '💰', color: 'green', action: testFinancialReport, type: 'financial' },
    { name: 'تقرير العمليات التفصيلي', icon: '⚙️', color: 'amber', action: testOperationsReport, type: 'operations' },
    { name: 'تقرير الاستخبارات الصباحي', icon: '🔍', color: 'blue', action: testMorningIntelligence, type: 'intelligence' },
  ];

  const renderResult = (test: typeof tests[0]) => {
    const result = results[test.name];
    if (!result || result.status === 'idle') return null;

    if (result.status === 'loading') {
      return (
        <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-gray-400/30 border-t-white rounded-full animate-spin"></div>
            <span className="text-gray-400">جاري التنفيذ...</span>
          </div>
        </div>
      );
    }

    if (result.status === 'error') {
      return (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl">
          <p className="text-red-400">❌ {result.error}</p>
        </div>
      );
    }

    // Success - render appropriate display based on type
    return (
      <div className="mt-4 p-4 bg-gray-800/50 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-green-400 flex items-center gap-2">
            ✅ نجح التنفيذ
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedResult(result);
                setShowModal(true);
              }}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300"
            >
              عرض JSON
            </button>
          </div>
        </div>

        {/* Render appropriate display */}
        {test.type === 'agenda' && result.data && (
          <AgendaDisplay agenda={result.data} />
        )}
        {test.type === 'meeting' && result.data && (
          <MOMDisplay mom={result.data.mom} meeting={result.data.meeting} />
        )}
        {test.type === 'content' && result.data?.report && (
          <ReportDisplay report={result.data.report} type="content" />
        )}
        {test.type === 'financial' && result.data?.report && (
          <ReportDisplay report={result.data.report} type="financial" />
        )}
        {test.type === 'operations' && result.data?.report && (
          <ReportDisplay report={result.data.report} type="operations" />
        )}
        {test.type === 'intelligence' && result.data?.intelligence && (
          <IntelligenceDisplay intelligence={result.data.intelligence} />
        )}
        {test.type === 'master' && result.data && (
          <MasterInitDisplay data={result.data} />
        )}
        {test.type === 'health' && result.data && (
          <HealthDisplay data={result.data} />
        )}
      </div>
    );
  };

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
            <h1 className="text-3xl font-bold text-white">صفحة اختبارات المجلس</h1>
            <p className="text-gray-400">اختبار جميع وظائف المجلس الذاتي</p>
          </div>
        </div>

        {/* Run All Tests Button */}
        <button
          onClick={async () => {
            for (const test of tests) {
              await test.action();
            }
          }}
          disabled={activeTest !== null}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {activeTest ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              جاري تنفيذ: {activeTest}
            </>
          ) : (
            <>
              <span>🚀</span>
              تشغيل جميع الاختبارات
            </>
          )}
        </button>
      </div>

      {/* Tests Grid */}
      <div className="space-y-6">
        {tests.map((test) => (
          <div
            key={test.name}
            className={`p-6 bg-gradient-to-br from-${test.color}-900/20 to-gray-900/50 rounded-2xl border border-${test.color}-700/30`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-3">
                <span className="text-2xl">{test.icon}</span>
                {test.name}
              </h2>
              <button
                onClick={test.action}
                disabled={activeTest !== null}
                className={`px-4 py-2 bg-${test.color}-600 hover:bg-${test.color}-500 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center gap-2`}
              >
                {activeTest === test.name ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري التنفيذ...
                  </>
                ) : results[test.name]?.status === 'success' ? (
                  <>
                    <span>🔄</span>
                    إعادة الاختبار
                  </>
                ) : (
                  <>
                    <span>▶️</span>
                    تشغيل الاختبار
                  </>
                )}
              </button>
            </div>

            {renderResult(test)}
          </div>
        ))}
      </div>

      {/* JSON Modal */}
      <ResultModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        result={selectedResult}
      />
    </div>
  );
}
