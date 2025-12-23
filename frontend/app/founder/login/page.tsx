'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginFounder, logoutFounder, getFounderToken } from '@/lib/api/founder';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if we should clear existing session (for fresh login)
  useEffect(() => {
    const checkAuth = async () => {
      // If logout param is present, clear session
      if (searchParams.get('logout') === 'true') {
        await logoutFounder();
        setCheckingAuth(false);
        return;
      }

      // If there's a token, verify it's actually valid by checking if we can access the API
      const token = getFounderToken();
      if (token) {
        try {
          // Try to verify the token by calling the profile endpoint
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/founder/profile`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (res.ok) {
            // Token is valid, redirect to board
            router.push('/board');
            return;
          } else {
            // Token is invalid, clear it
            await logoutFounder();
          }
        } catch (e) {
          // API error, clear tokens to be safe
          await logoutFounder();
        }
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginFounder(email, password);
      router.push('/board');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-2xl animate-pulse">
          <span className="text-4xl">🏛️</span>
        </div>
        <p className="text-purple-200">جاري التحقق...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo & Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-2xl">
          <span className="text-4xl">🏛️</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">بوابة المؤسس</h1>
        <p className="text-purple-200">مجلس إدارة AI - XChange Egypt</p>
      </div>

      {/* Login Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@xchange.eg"
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300">
                📧
              </span>
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition"
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري تسجيل الدخول...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                دخول مجلس الإدارة
                <span>🚀</span>
              </span>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-start gap-3 text-sm text-purple-200/70">
            <span className="text-xl">🔐</span>
            <p>
              هذه البوابة مخصصة للمؤسس ورئيس مجلس الإدارة فقط.
              جميع محاولات الدخول مسجلة ومراقبة.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-purple-300/50 text-sm">
        <p>© {new Date().getFullYear()} XChange Egypt - جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-2xl animate-pulse">
        <span className="text-4xl">🏛️</span>
      </div>
      <p className="text-purple-200">جاري التحميل...</p>
    </div>
  );
}

export default function FounderLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <Suspense fallback={<LoadingFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
