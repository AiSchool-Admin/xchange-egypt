"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  MessageSquare,
  Smartphone,
  Shield,
  CreditCard,
  MapPin,
} from "lucide-react";
import {
  MobileTransactionStatus,
  TRANSACTION_STATUS_AR,
  formatMobilePrice,
} from "@/lib/api/mobile-marketplace";

// Mock transactions
const MOCK_TRANSACTIONS = [
  {
    id: "txn-1",
    type: "SALE",
    role: "seller",
    status: "INSPECTION" as MobileTransactionStatus,
    listing: {
      title: "iPhone 14 Pro 256GB",
      priceEgp: 45000,
    },
    otherUser: { name: "أحمد محمد", avatar: "" },
    agreedPrice: 44000,
    platformFee: 2200,
    sellerPayout: 41800,
    paymentMethod: "ESCROW",
    deliveryMethod: "BOSTA",
    trackingNumber: "BOSTA123456",
    inspectionEndsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: "txn-2",
    type: "BARTER",
    role: "buyer",
    status: "SHIPPING" as MobileTransactionStatus,
    listing: {
      title: "Samsung Galaxy S24",
      priceEgp: 42000,
    },
    barterListing: {
      title: "iPhone 13",
      priceEgp: 35000,
    },
    cashDifference: 7000,
    otherUser: { name: "محمد علي", avatar: "" },
    deliveryMethod: "MEETUP",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
  },
  {
    id: "txn-3",
    type: "SALE",
    role: "buyer",
    status: "COMPLETED" as MobileTransactionStatus,
    listing: {
      title: "Xiaomi 13 Pro",
      priceEgp: 28000,
    },
    otherUser: { name: "سارة أحمد", avatar: "" },
    agreedPrice: 27500,
    paymentMethod: "COD",
    deliveryMethod: "ARAMEX",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
  },
];

const getStatusStep = (status: MobileTransactionStatus) => {
  const steps = ["INITIATED", "PAYMENT_HELD", "SHIPPING", "DELIVERED", "INSPECTION", "COMPLETED"];
  return steps.indexOf(status);
};

export default function MobileTransactionsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed">("all");

  const filteredTransactions = MOCK_TRANSACTIONS.filter(t => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return !["COMPLETED", "CANCELLED", "REFUNDED"].includes(t.status);
    if (activeTab === "completed") return t.status === "COMPLETED";
    return true;
  });

  const getStatusColor = (status: MobileTransactionStatus) => {
    if (["COMPLETED"].includes(status)) return "text-green-600";
    if (["CANCELLED", "REFUNDED", "DISPUTED"].includes(status)) return "text-red-600";
    return "text-blue-600";
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-green-600 to-emerald-700 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Link href="/mobile" className="text-white/80 hover:text-white">
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Package className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-bold">معاملاتي</h1>
              <p className="text-green-100 text-sm">{MOCK_TRANSACTIONS.length} معاملة</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "all", label: "الكل" },
            { key: "active", label: "نشطة" },
            { key: "completed", label: "مكتملة" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-full transition ${
                activeTab === tab.key
                  ? "bg-green-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد معاملات</h3>
            <p className="text-gray-500">ستظهر معاملاتك هنا عند الشراء أو البيع</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map(txn => (
              <div key={txn.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        txn.role === "seller" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {txn.role === "seller" ? "بائع" : "مشتري"}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        txn.type === "BARTER" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {txn.type === "BARTER" ? "مقايضة" : "بيع"}
                      </span>
                    </div>
                    <span className={`font-medium ${getStatusColor(txn.status)}`}>
                      {TRANSACTION_STATUS_AR[txn.status]}
                    </span>
                  </div>

                  {/* Listing Info */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800">{txn.listing.title}</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatMobilePrice(txn.agreedPrice || txn.listing.priceEgp)}
                      </div>
                      <div className="text-sm text-gray-500">
                        مع {txn.otherUser.name}
                      </div>
                    </div>
                  </div>

                  {/* Progress Steps for Active Transactions */}
                  {!["COMPLETED", "CANCELLED", "REFUNDED"].includes(txn.status) && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        {["الدفع", "الشحن", "التسليم", "الفحص", "مكتمل"].map((step, idx) => (
                          <div key={idx} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                              idx <= getStatusStep(txn.status)
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-500"
                            }`}>
                              {idx <= getStatusStep(txn.status) ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className="text-xs text-gray-500 mt-1">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inspection Timer */}
                  {txn.status === "INSPECTION" && txn.inspectionEndsAt && (
                    <div className="p-3 bg-amber-50 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-amber-700">
                        <Clock className="w-5 h-5" />
                        <span className="font-medium">فترة الفحص</span>
                      </div>
                      <p className="text-sm text-amber-600 mt-1">
                        متبقي {Math.round((txn.inspectionEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} أيام للفحص وتأكيد الاستلام
                      </p>
                    </div>
                  )}

                  {/* Tracking */}
                  {txn.trackingNumber && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-4">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        رقم التتبع: <span className="font-mono">{txn.trackingNumber}</span>
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/mobile/listing/${txn.id}`}
                      className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 text-center hover:bg-gray-50"
                    >
                      <Eye className="w-4 h-4 inline ml-1" />
                      التفاصيل
                    </Link>
                    <button className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                      <MessageSquare className="w-4 h-4 inline ml-1" />
                      محادثة
                    </button>
                    {txn.status === "INSPECTION" && txn.role === "buyer" && (
                      <button className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                        تأكيد الاستلام
                      </button>
                    )}
                    {!["COMPLETED", "CANCELLED"].includes(txn.status) && (
                      <Link
                        href="/mobile/disputes"
                        className="px-4 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <AlertTriangle className="w-4 h-4 inline ml-1" />
                        مشكلة
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Platform Guarantee Info */}
        <div className="mt-8 p-4 bg-green-50 rounded-xl">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-green-800 mb-1">ضمان المنصة</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• يتم حجز المبلغ حتى تأكيد الاستلام</li>
                <li>• 5 أيام لفحص الجهاز</li>
                <li>• استرداد كامل في حالة عدم المطابقة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
