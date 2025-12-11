'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Translations
const translations = {
  ar: {
    title: 'Xchange',
    subtitle: 'استعادة كلمة المرور',
    description: 'أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور.',
    email: 'البريد الإلكتروني',
    submit: 'إرسال رابط الاستعادة',
    submitting: 'جاري الإرسال...',
    backToLogin: '← العودة لتسجيل الدخول',
    successTitle: 'تم الإرسال!',
    successMessage: 'إذا كان بريدك الإلكتروني مسجلاً لدينا، ستتلقى رابطًا لإعادة تعيين كلمة المرور.',
    errorMessage: 'حدث خطأ. حاول مرة أخرى.',
    devNote: 'رابط إعادة التعيين (للتطوير):',
  },
  en: {
    title: 'Xchange',
    subtitle: 'Forgot Password',
    description: 'Enter your email address and we\'ll send you a link to reset your password.',
    email: 'Email',
    submit: 'Send Reset Link',
    submitting: 'Sending...',
    backToLogin: '→ Back to Login',
    successTitle: 'Email Sent!',
    successMessage: 'If your email is registered, you will receive a password reset link.',
    errorMessage: 'An error occurred. Please try again.',
    devNote: 'Reset link (for development):',
  },
};

type Language = 'ar' | 'en';

export default function ForgotPasswordPage() {
  const [lang, setLang] = useState<Language>('ar');
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);
    setResetUrl(null);

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        // In development, show the reset URL for testing
        if (result.data?.resetUrl) {
          setResetUrl(result.data.resetUrl);
        }
      } else {
        setError(result.error?.message || t.errorMessage);
      }
    } catch (err) {
      setError(t.errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">{lang === 'ar' ? '🇬🇧' : '🇪🇬'}</span>
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {success ? (
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{t.successTitle}</h2>
              <p className="text-gray-600 mb-4">{t.successMessage}</p>

              {/* Development mode: show reset URL */}
              {resetUrl && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                  <p className="text-sm text-yellow-800 font-medium mb-2">{t.devNote}</p>
                  <a
                    href={resetUrl}
                    className="text-sm text-primary-600 hover:text-primary-700 break-all underline"
                  >
                    {resetUrl}
                  </a>
                </div>
              )}

              <Link
                href="/login"
                className="inline-block mt-6 text-primary-600 hover:text-primary-700 font-semibold"
              >
                {t.backToLogin}
              </Link>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-center mb-6">{t.description}</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="example@email.com"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? t.submitting : t.submit}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-800">
            {t.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}
