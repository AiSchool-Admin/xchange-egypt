"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  Clock,
  CheckCircle,
  FileText,
  Upload,
  Camera,
  Phone,
  Mail,
  Smartphone,
  X,
} from "lucide-react";
import {
  MobileDisputeReason,
  MobileDisputeStatus,
  DISPUTE_REASON_AR,
  formatMobilePrice,
} from "@/lib/api/mobile-marketplace";

// Mock disputes
const MOCK_DISPUTES = [
  {
    id: "disp-1",
    status: "UNDER_REVIEW" as MobileDisputeStatus,
    reason: "NOT_AS_DESCRIBED" as MobileDisputeReason,
    transaction: {
      id: "txn-1",
      listing: { title: "iPhone 14 Pro 256GB", priceEgp: 45000 },
      otherUser: { name: "أحمد محمد" },
    },
    description: "البطارية 75% وليست 95% كما ذكر في الإعلان",
    evidenceUrls: ["/evidence1.jpg", "/evidence2.jpg"],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    messages: [
      { from: "system", text: "تم فتح النزاع وإرساله للمراجعة", time: new Date(Date.now() - 1000 * 60 * 60 * 48) },
      { from: "support", text: "جاري مراجعة الأدلة المقدمة", time: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    ],
  },
];

const STATUS_AR: Record<MobileDisputeStatus, { label: string; color: string }> = {
  OPEN: { label: "مفتوح", color: "bg-yellow-100 text-yellow-700" },
  UNDER_REVIEW: { label: "قيد المراجعة", color: "bg-blue-100 text-blue-700" },
  MEDIATION: { label: "وساطة", color: "bg-purple-100 text-purple-700" },
  RESOLVED: { label: "تم الحل", color: "bg-green-100 text-green-700" },
  ESCALATED: { label: "مصعّد", color: "bg-red-100 text-red-700" },
};

export default function MobileDisputesPage() {
  const [showNewDispute, setShowNewDispute] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-red-600 to-rose-700 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/mobile" className="text-white/80 hover:text-white">
                <ArrowRight className="w-6 h-6" />
              </Link>
              <AlertTriangle className="w-6 h-6" />
              <div>
                <h1 className="text-2xl font-bold">النزاعات</h1>
                <p className="text-red-100 text-sm">{MOCK_DISPUTES.length} نزاع</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewDispute(true)}
              className="px-4 py-2 bg-white text-red-600 rounded-xl font-medium hover:bg-red-50"
            >
              فتح نزاع جديد
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Info Box */}
        <div className="bg-amber-50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium mb-1">قبل فتح نزاع:</p>
              <ul className="space-y-1">
                <li>• حاول التواصل مع الطرف الآخر أولاً</li>
                <li>• تأكد من توثيق المشكلة بالصور والفيديو</li>
                <li>• النزاعات تُراجع خلال 5 أيام عمل</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disputes List */}
        {MOCK_DISPUTES.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد نزاعات</h3>
            <p className="text-gray-500">معاملاتك تسير بسلاسة</p>
          </div>
        ) : (
          <div className="space-y-4">
            {MOCK_DISPUTES.map(dispute => (
              <div key={dispute.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_AR[dispute.status].color}`}>
                      {STATUS_AR[dispute.status].label}
                    </span>
                    <span className="text-sm text-gray-500">
                      منذ {Math.round((Date.now() - dispute.createdAt.getTime()) / (1000 * 60 * 60 * 24))} يوم
                    </span>
                  </div>

                  {/* Transaction Info */}
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{dispute.transaction.listing.title}</div>
                      <div className="text-sm text-gray-500">مع {dispute.transaction.otherUser.name}</div>
                    </div>
                    <div className="mr-auto text-left">
                      <div className="font-bold text-gray-800">{formatMobilePrice(dispute.transaction.listing.priceEgp)}</div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-1">سبب النزاع</div>
                    <div className="font-medium text-red-600">{DISPUTE_REASON_AR[dispute.reason]}</div>
                  </div>

                  {/* Description */}
                  <div className="p-3 bg-red-50 rounded-lg mb-4">
                    <p className="text-sm text-red-700">{dispute.description}</p>
                  </div>

                  {/* Evidence */}
                  {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">الأدلة المرفقة ({dispute.evidenceUrls.length})</div>
                      <div className="flex gap-2">
                        {dispute.evidenceUrls.map((_, idx) => (
                          <div key={idx} className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Camera className="w-6 h-6 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-500 mb-3">سجل النزاع</div>
                    <div className="space-y-3">
                      {dispute.messages.map((msg, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            msg.from === "system" ? "bg-gray-100" : "bg-blue-100"
                          }`}>
                            {msg.from === "system" ? (
                              <Clock className="w-4 h-4 text-gray-500" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700">{msg.text}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {msg.time.toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4 pt-4 border-t">
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                      <MessageSquare className="w-4 h-4 inline ml-1" />
                      إضافة رد
                    </button>
                    <button className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                      <Upload className="w-4 h-4 inline ml-1" />
                      رفع دليل
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contact Support */}
        <div className="mt-8 bg-white rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4">تواصل مع الدعم</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="tel:+201234567890"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
            >
              <Phone className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium">اتصل بنا</div>
                <div className="text-sm text-gray-500">متاح 9 ص - 9 م</div>
              </div>
            </a>
            <a
              href="mailto:support@xchange.eg"
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100"
            >
              <Mail className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium">راسلنا</div>
                <div className="text-sm text-gray-500">support@xchange.eg</div>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* New Dispute Modal */}
      {showNewDispute && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold">فتح نزاع جديد</h3>
              <button onClick={() => setShowNewDispute(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Select Transaction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اختر المعاملة</label>
                <select className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">اختر المعاملة</option>
                  <option value="1">iPhone 14 Pro - مع أحمد محمد</option>
                  <option value="2">Samsung S24 - مع محمد علي</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">سبب النزاع</label>
                <select className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">اختر السبب</option>
                  {Object.entries(DISPUTE_REASON_AR).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف المشكلة</label>
                <textarea
                  rows={4}
                  placeholder="اشرح المشكلة بالتفصيل..."
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>

              {/* Evidence Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الأدلة (صور/فيديو)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm mb-2">اسحب الملفات هنا أو</p>
                  <label className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg cursor-pointer hover:bg-red-700">
                    اختر الملفات
                    <input type="file" multiple className="hidden" />
                  </label>
                </div>
              </div>

              {/* Submit */}
              <button className="w-full py-4 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">
                <AlertTriangle className="w-5 h-5 inline ml-2" />
                فتح النزاع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
