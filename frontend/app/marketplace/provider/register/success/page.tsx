'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegistrationSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>

        <h1 className="text-2xl font-bold mb-2">تم إرسال طلبك بنجاح!</h1>
        <p className="text-gray-600 mb-6">
          شكراً لتسجيلك كمزود خدمة في منصة Xchange.
          سيتم مراجعة طلبك وإعلامك بالنتيجة خلال 24-48 ساعة.
        </p>

        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-right">
          <h3 className="font-medium text-blue-800 mb-2">الخطوات التالية:</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start gap-2">
              <span>1.</span>
              <span>سيتم مراجعة بياناتك ومستنداتك</span>
            </li>
            <li className="flex items-start gap-2">
              <span>2.</span>
              <span>ستتلقى إشعاراً عند تفعيل حسابك</span>
            </li>
            <li className="flex items-start gap-2">
              <span>3.</span>
              <span>يمكنك البدء في تصفح واستلام الطلبات</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href="/marketplace"
            className="block w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
          >
            العودة للسوق
          </Link>
          <Link
            href="/"
            className="block w-full py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
          >
            الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
