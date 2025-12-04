'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function FloatingAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Show tooltip on first visit
  useEffect(() => {
    if (user) {
      const hasSeenTooltip = localStorage.getItem('assistant-tooltip-seen');
      if (!hasSeenTooltip) {
        setTimeout(() => setShowTooltip(true), 2000);
        setTimeout(() => {
          setShowTooltip(false);
          localStorage.setItem('assistant-tooltip-seen', 'true');
        }, 8000);
      }
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50" dir="rtl">
      {/* Quick Actions Menu */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 mb-2 animate-bounce-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-64">
            <div className="p-4 bg-gradient-to-l from-emerald-500 to-teal-500 text-white">
              <h3 className="font-bold">كيف يمكنني مساعدتك؟</h3>
              <p className="text-sm text-emerald-100">اختر أحد الخيارات</p>
            </div>
            <div className="p-2">
              <Link
                href="/assistant"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">
                  💬
                </div>
                <div>
                  <div className="font-semibold text-gray-800">المساعد الذكي</div>
                  <div className="text-xs text-gray-500">تحدث مع مساعدنا الذكي</div>
                </div>
              </Link>
              <Link
                href="/sell-ai"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">
                  ✨
                </div>
                <div>
                  <div className="font-semibold text-gray-800">بيع بالـ AI</div>
                  <div className="text-xs text-gray-500">أنشئ إعلان بذكاء</div>
                </div>
              </Link>
              <Link
                href="/saved-searches"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">
                  🔔
                </div>
                <div>
                  <div className="font-semibold text-gray-800">تنبيهاتي</div>
                  <div className="text-xs text-gray-500">إدارة التنبيهات المحفوظة</div>
                </div>
              </Link>
              <Link
                href="/exchange-points"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">
                  📍
                </div>
                <div>
                  <div className="font-semibold text-gray-800">نقاط التبادل</div>
                  <div className="text-xs text-gray-500">أماكن آمنة للقاء</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && !isOpen && (
        <div className="absolute bottom-16 left-0 mb-2 animate-bounce-in">
          <div className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm whitespace-nowrap">
            جرب المساعد الذكي الجديد! 🤖
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-gray-900 transform rotate-45"></div>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all transform hover:scale-110 ${
          isOpen
            ? 'bg-gray-700 text-white rotate-45'
            : 'bg-gradient-to-br from-purple-500 to-purple-600 text-white animate-float'
        }`}
      >
        {isOpen ? '✕' : '🤖'}
      </button>
    </div>
  );
}
