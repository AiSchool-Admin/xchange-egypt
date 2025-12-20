'use client';

import { useEffect, useState } from 'react';

export default function DownloadPage() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect device
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
    setIsAndroid(/Android/.test(ua));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700">
      {/* Header */}
      <div className="pt-12 pb-8 px-6 text-center text-white">
        <div className="w-24 h-24 mx-auto bg-white rounded-3xl shadow-2xl flex items-center justify-center mb-6">
          <svg className="w-14 h-14 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 8L12 12L7 16" />
            <path d="M17 8L12 12L17 16" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">Xchange Egypt</h1>
        <p className="text-emerald-100 text-lg">منصة التبادل والمقايضة الأولى في مصر</p>
      </div>

      {/* Main Card */}
      <div className="px-4 pb-8">
        <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto">

          {isInstalled ? (
            // Already Installed
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">التطبيق مثبت! ✅</h2>
              <p className="text-gray-600">يمكنك فتحه من الشاشة الرئيسية</p>
            </div>
          ) : isIOS ? (
            // iOS Instructions
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">تثبيت التطبيق على iPhone</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                  <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</span>
                  <div>
                    <p className="font-medium text-gray-900">اضغط على زر المشاركة</p>
                    <div className="flex items-center gap-2 mt-1">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-gray-500 text-sm">في أسفل الشاشة</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                  <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</span>
                  <div>
                    <p className="font-medium text-gray-900">اختر &quot;إضافة إلى الشاشة الرئيسية&quot;</p>
                    <p className="text-gray-500 text-sm mt-1">Add to Home Screen</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                  <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</span>
                  <div>
                    <p className="font-medium text-gray-900">اضغط &quot;إضافة&quot;</p>
                    <p className="text-gray-500 text-sm mt-1">وستجد التطبيق على شاشتك!</p>
                  </div>
                </div>
              </div>
            </div>
          ) : isAndroid ? (
            // Android Instructions
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">تثبيت التطبيق على Android</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                  <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">1</span>
                  <div>
                    <p className="font-medium text-gray-900">اضغط على القائمة</p>
                    <div className="flex items-center gap-2 mt-1">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                      <span className="text-gray-500 text-sm">النقاط الثلاث في الأعلى</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                  <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">2</span>
                  <div>
                    <p className="font-medium text-gray-900">اختر &quot;تثبيت التطبيق&quot;</p>
                    <p className="text-gray-500 text-sm mt-1">Install App أو Add to Home Screen</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                  <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold flex-shrink-0">3</span>
                  <div>
                    <p className="font-medium text-gray-900">اضغط &quot;تثبيت&quot;</p>
                    <p className="text-gray-500 text-sm mt-1">وستجد التطبيق على شاشتك!</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-500 text-sm mt-4">
                💡 أو انتظر ظهور شريط التثبيت التلقائي
              </p>
            </div>
          ) : (
            // Desktop - Show QR Code
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">افتح على موبايلك</h2>
              <p className="text-gray-600 mb-6">امسح الـ QR Code بكاميرا موبايلك</p>

              {/* QR Code Placeholder */}
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <p className="text-sm text-gray-500">QR Code</p>
                </div>
              </div>

              <p className="text-gray-500 text-sm mt-4">أو أرسل الرابط لنفسك:</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={typeof window !== 'undefined' ? window.location.origin : ''}
                  readOnly
                  className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm text-gray-600"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    alert('تم نسخ الرابط! ✅');
                  }}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                >
                  نسخ
                </button>
              </div>
            </div>
          )}

          {/* Features */}
          {!isInstalled && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-center">مميزات التطبيق</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>يعمل بدون إنترنت</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>إشعارات فورية</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>سريع وخفيف</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>لا يحتاج متجر</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-emerald-100 text-sm">
        <p>© 2024 Xchange Egypt. جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}
