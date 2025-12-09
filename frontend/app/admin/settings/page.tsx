'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdmin } from '@/lib/contexts/AdminContext';

// API_URL already includes /api/v1 from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface Setting {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string | null;
  isPublic: boolean;
  updatedAt: string;
}

export default function SettingsPage() {
  const { hasPermission } = useAdmin();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('adminAccessToken');
      if (!token) return;

      try {
        const response = await axios.get(`${API_URL}/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setSettings(response.data.data.settings);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async (key: string) => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) return;

    setSaving(key);
    try {
      const value = editedValues[key];
      await axios.put(
        `${API_URL}/admin/settings/${key}`,
        { value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSettings(prev =>
        prev.map(s => (s.key === key ? { ...s, value, updatedAt: new Date().toISOString() } : s))
      );

      // Remove from edited values
      setEditedValues(prev => {
        const newValues = { ...prev };
        delete newValues[key];
        return newValues;
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'فشل في حفظ الإعداد');
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (key: string, value: any) => {
    setEditedValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getValue = (setting: Setting) => {
    return editedValues.hasOwnProperty(setting.key) ? editedValues[setting.key] : setting.value;
  };

  const hasChanges = (key: string) => {
    return editedValues.hasOwnProperty(key);
  };

  const categories = [...new Set(settings.map(s => s.category))];

  const filteredSettings = activeCategory === 'all'
    ? settings
    : settings.filter(s => s.category === activeCategory);

  const categoryLabels: Record<string, string> = {
    general: 'عام',
    listings: 'الإعلانات',
    payments: 'المدفوعات',
    contact: 'التواصل',
    all: 'الكل',
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    general: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    listings: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    payments: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    contact: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const renderSettingInput = (setting: Setting) => {
    const value = getValue(setting);
    const isBoolean = typeof setting.value === 'boolean';
    const isNumber = typeof setting.value === 'number';
    const canEdit = hasPermission('settings:update');

    if (isBoolean) {
      return (
        <button
          onClick={() => canEdit && handleChange(setting.key, !value)}
          disabled={!canEdit}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            value ? 'bg-green-500' : 'bg-gray-600'
          } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
              value ? 'right-0.5' : 'right-7'
            }`}
          />
        </button>
      );
    }

    if (isNumber) {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(setting.key, parseFloat(e.target.value) || 0)}
          disabled={!canEdit}
          className="w-32 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:opacity-50"
        />
      );
    }

    return (
      <input
        type="text"
        value={value}
        onChange={(e) => handleChange(setting.key, e.target.value)}
        disabled={!canEdit}
        className="flex-1 max-w-md px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:opacity-50"
      />
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700/50 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700/50 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">إعدادات المنصة</h1>
        <p className="text-gray-400">تخصيص إعدادات وتهيئة المنصة</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
          }`}
        >
          الكل
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
              activeCategory === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {categoryIcons[category]}
            {categoryLabels[category] || category}
          </button>
        ))}
      </div>

      {/* Settings List */}
      <div className="space-y-4">
        {filteredSettings.map((setting) => (
          <div
            key={setting.key}
            className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium">{setting.key.replace(/_/g, ' ')}</h3>
                  <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                    {categoryLabels[setting.category] || setting.category}
                  </span>
                </div>
                {setting.description && (
                  <p className="text-gray-400 text-sm">{setting.description}</p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  آخر تحديث: {formatDate(setting.updatedAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {renderSettingInput(setting)}

                {hasChanges(setting.key) && hasPermission('settings:update') && (
                  <button
                    onClick={() => handleSave(setting.key)}
                    disabled={saving === setting.key}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {saving === setting.key ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        حفظ...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        حفظ
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredSettings.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>لا توجد إعدادات في هذه الفئة</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-medium mb-1">ملاحظة هامة</h3>
            <p className="text-gray-400 text-sm">
              بعض الإعدادات قد تتطلب إعادة تشغيل الخدمة لتطبيقها بشكل كامل.
              تأكد من اختبار أي تغييرات في بيئة التطوير قبل تطبيقها في الإنتاج.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
