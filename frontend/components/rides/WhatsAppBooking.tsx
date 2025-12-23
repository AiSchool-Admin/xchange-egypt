'use client';

import React, { useState } from 'react';

interface Location {
  name: string;
  nameEn?: string;
  lat: number;
  lng: number;
  address?: string;
}

interface WhatsAppBookingProps {
  provider: {
    id: string;
    name: string;
    nameAr: string;
    emoji: string;
    bgColor: string;
    whatsappNumber?: string;
  };
  pickup: Location;
  dropoff: Location;
  price: number;
  onClose: () => void;
}

// WhatsApp numbers for providers (Egypt)
const PROVIDER_WHATSAPP: Record<string, string> = {
  'indrive': '201000000000',   // Update with real number
  'didi': '201000000000',
  'swvl': '201028888880',
  'halan': '201000000000',
};

export default function WhatsAppBooking({
  provider,
  pickup,
  dropoff,
  price,
  onClose,
}: WhatsAppBookingProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isReady, setIsReady] = useState(false);

  // Generate WhatsApp message
  const generateMessage = (): string => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('ar-EG');

    let message = `🚗 *طلب رحلة جديد*

━━━━━━━━━━━━━━━━

📍 *من:* ${pickup.name}
📍 *إلى:* ${dropoff.name}

🕐 *الوقت:* الآن (${timeStr})
📅 *التاريخ:* ${dateStr}

💰 *السعر التقديري:* ${price} ج.م`;

    if (customerName) {
      message += `

👤 *الاسم:* ${customerName}`;
    }

    if (customerPhone) {
      message += `
📱 *الهاتف:* ${customerPhone}`;
    }

    if (notes) {
      message += `

📝 *ملاحظات:* ${notes}`;
    }

    message += `

━━━━━━━━━━━━━━━━

✅ أرجو تأكيد الطلب
🔗 _عبر Xchange Egypt_`;

    return message;
  };

  // Generate WhatsApp URL
  const generateWhatsAppUrl = (): string => {
    const phone = provider.whatsappNumber || PROVIDER_WHATSAPP[provider.id.toLowerCase()];
    const message = encodeURIComponent(generateMessage());
    return `https://wa.me/${phone}?text=${message}`;
  };

  // Open WhatsApp
  const openWhatsApp = () => {
    const url = generateWhatsAppUrl();
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        {/* Header */}
        <div className={`${provider.bgColor} p-5 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl">{provider.emoji}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">احجز عبر واتساب</h2>
                <p className="text-sm opacity-80">{provider.nameAr}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Trip Summary */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-900 font-medium">{pickup.name}</span>
          </div>
          <div className="flex items-center gap-3 mb-3 mr-1">
            <div className="w-0.5 h-6 bg-gray-300 mr-1"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-900 font-medium">{dropoff.name}</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-gray-500">السعر التقديري</span>
            <span className="text-2xl font-bold text-gray-900">{price} ج.م</span>
          </div>
        </div>

        {/* Optional Info */}
        {!isReady ? (
          <div className="p-5 space-y-4">
            <p className="text-gray-600 text-sm text-center mb-4">
              أضف معلوماتك لتسهيل الحجز (اختياري)
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="أحمد محمد"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ملاحظات
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: أمام البوابة الرئيسية"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
                rows={2}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsReady(true)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
              >
                تخطي
              </button>
              <button
                onClick={() => setIsReady(true)}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-medium text-white transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Message Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-2">معاينة الرسالة:</p>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                {generateMessage()}
              </pre>
            </div>

            {/* WhatsApp Button */}
            <button
              onClick={openWhatsApp}
              className="w-full py-4 bg-green-500 hover:bg-green-600 rounded-xl font-bold text-lg text-white transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>افتح واتساب</span>
            </button>

            <button
              onClick={() => setIsReady(false)}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
            >
              تعديل المعلومات
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            💬 سيتم فتح واتساب برسالة جاهزة للإرسال
          </p>
        </div>
      </div>
    </div>
  );
}
