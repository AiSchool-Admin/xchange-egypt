'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getBoardMembers,
  BoardMember,
  getRoleDisplayName,
} from '@/lib/api/board';

export default function MembersPage() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getBoardMembers();
        setMembers(data);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const roleColors: Record<string, string> = {
    CEO: 'from-purple-500 to-purple-600',
    CTO: 'from-blue-500 to-blue-600',
    CFO: 'from-green-500 to-green-600',
    CMO: 'from-orange-500 to-orange-600',
    COO: 'from-yellow-500 to-yellow-600',
    CLO: 'from-red-500 to-red-600',
  };

  const roleDescriptions: Record<string, string> = {
    CEO: 'يقود الشركة ويحدد الاستراتيجية العامة ويتخذ القرارات الكبرى',
    CTO: 'يدير التقنية والهندسة ويقيّم الجدوى التقنية للمشاريع',
    CFO: 'يدير الشؤون المالية ويحلل الميزانيات والاستثمارات',
    CMO: 'يقود التسويق والنمو واكتساب العملاء',
    COO: 'يدير العمليات اليومية واللوجستيات والجودة',
    CLO: 'يتعامل مع الشؤون القانونية والامتثال والعقود',
  };

  const roleExpertise: Record<string, string[]> = {
    CEO: ['الاستراتيجية', 'القيادة', 'التمويل', 'الشراكات'],
    CTO: ['البرمجة', 'الهندسة المعمارية', 'الأمن', 'البنية التحتية'],
    CFO: ['المالية', 'الاستثمار', 'التحليل', 'الميزانيات'],
    CMO: ['التسويق', 'النمو', 'العلامة التجارية', 'الإعلانات'],
    COO: ['العمليات', 'اللوجستيات', 'الجودة', 'خدمة العملاء'],
    CLO: ['القانون', 'العقود', 'الامتثال', 'الخصوصية'],
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
        <h1 className="text-3xl font-bold text-white">أعضاء مجلس الإدارة</h1>
        <p className="text-gray-400 mt-1">تعرف على فريقك التنفيذي من الذكاء الاصطناعي</p>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-gray-800/50 rounded-2xl border border-gray-700/50 overflow-hidden hover:border-gray-600 transition-all group"
          >
            {/* Header */}
            <div className={`p-6 bg-gradient-to-br ${roleColors[member.role]} relative`}>
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative flex items-center gap-4">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.nameAr}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{member.nameAr.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-white">{member.nameAr}</h3>
                  <p className="text-white/80">{getRoleDisplayName(member.role)}</p>
                </div>
              </div>
              <div className={`absolute top-4 left-4 w-3 h-3 rounded-full ${
                member.status === 'ACTIVE' ? 'bg-green-400' : 'bg-gray-400'
              }`}></div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-400 mb-4">{roleDescriptions[member.role]}</p>

              {/* Model Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-gray-500">النموذج:</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  member.model === 'OPUS'
                    ? 'bg-purple-500/20 text-purple-400'
                    : member.model === 'SONNET'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  Claude {member.model}
                </span>
              </div>

              {/* Expertise Tags */}
              <div className="mb-4">
                <span className="text-xs text-gray-500 block mb-2">مجالات الخبرة:</span>
                <div className="flex flex-wrap gap-2">
                  {roleExpertise[member.role]?.map((exp) => (
                    <span
                      key={exp}
                      className="px-2 py-1 bg-gray-700/50 rounded-lg text-xs text-gray-300"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/board/chat?member=${member.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700/50 hover:bg-gray-700 rounded-xl text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                تحدث مع {member.nameAr}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-12 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
        <h2 className="text-xl font-bold text-white mb-4">💡 كيف يعمل المجلس؟</h2>
        <div className="grid md:grid-cols-3 gap-6 text-gray-400">
          <div>
            <h3 className="font-semibold text-white mb-2">🎯 التوجيه التلقائي</h3>
            <p className="text-sm">
              عند طرح سؤال، يتم توجيهه تلقائياً للأعضاء المناسبين بناءً على محتوى السؤال
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">🤝 التعاون</h3>
            <p className="text-sm">
              يمكن لعدة أعضاء الرد على نفس السؤال، كل من منظوره وخبرته الخاصة
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">⚡ CEO Mode</h3>
            <p className="text-sm">
              كريم (CEO) يمتلك 3 أوضاع مختلفة: القائد، الاستراتيجي، وصاحب الرؤية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
