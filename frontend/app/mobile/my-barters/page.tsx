"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeftRight,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Smartphone,
} from "lucide-react";
import { formatMobilePrice } from "@/lib/api/mobile-marketplace";

// Mock barter proposals
const MOCK_PROPOSALS = [
  {
    id: "prop-1",
    type: "sent",
    status: "pending",
    myListing: { title: "iPhone 14 Pro 256GB", priceEgp: 45000 },
    theirListing: { title: "Samsung Galaxy S24 256GB", priceEgp: 42000 },
    cashDifference: 3000,
    cashDirection: "i_receive",
    otherUser: { name: "محمد أحمد", avatar: "" },
    message: "مرحباً، جهازي بحالة ممتازة وأرغب في المقايضة مع فرق نقدي",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
  },
  {
    id: "prop-2",
    type: "received",
    status: "pending",
    myListing: { title: "iPhone 15 128GB", priceEgp: 50000 },
    theirListing: { title: "Xiaomi 14 Pro 256GB", priceEgp: 30000 },
    cashDifference: 20000,
    cashDirection: "i_receive",
    otherUser: { name: "أحمد علي", avatar: "" },
    message: "أريد مقايضة جهازي مع دفع الفرق نقداً",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
  },
  {
    id: "prop-3",
    type: "sent",
    status: "accepted",
    myListing: { title: "Samsung Galaxy A54", priceEgp: 12000 },
    theirListing: { title: "OPPO Reno 10", priceEgp: 15000 },
    cashDifference: 3000,
    cashDirection: "i_pay",
    otherUser: { name: "سارة محمود", avatar: "" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

type TabType = "all" | "sent" | "received" | "accepted";

export default function MyBartersPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const filteredProposals = MOCK_PROPOSALS.filter(p => {
    if (activeTab === "all") return true;
    if (activeTab === "accepted") return p.status === "accepted";
    return p.type === activeTab && p.status === "pending";
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs flex items-center gap-1"><Clock className="w-3 h-3" />قيد الانتظار</span>;
      case "accepted":
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" />مقبول</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1"><XCircle className="w-3 h-3" />مرفوض</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-purple-600 to-violet-700 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Link href="/mobile" className="text-white/80 hover:text-white">
              <ArrowRight className="w-6 h-6" />
            </Link>
            <ArrowLeftRight className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-bold">مقايضاتي</h1>
              <p className="text-purple-100 text-sm">{MOCK_PROPOSALS.length} عرض</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: "all", label: "الكل" },
            { key: "received", label: "عروض واردة" },
            { key: "sent", label: "عروض مرسلة" },
            { key: "accepted", label: "مقبولة" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                activeTab === tab.key
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Proposals */}
        {filteredProposals.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <ArrowLeftRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد عروض مقايضة</h3>
            <p className="text-gray-500 mb-6">ابحث عن فرص المقايضة في صفحة المقايضة</p>
            <Link
              href="/mobile/barter"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
            >
              <ArrowLeftRight className="w-5 h-5" />
              استكشف المقايضات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProposals.map(proposal => (
              <div key={proposal.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        proposal.type === "received" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {proposal.type === "received" ? "عرض وارد" : "عرض مرسل"}
                      </span>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <span className="text-sm text-gray-500">
                      منذ {Math.round((Date.now() - proposal.createdAt.getTime()) / (1000 * 60 * 60))} ساعة
                    </span>
                  </div>

                  {/* Exchange */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 p-3 bg-purple-50 rounded-xl">
                      <div className="text-xs text-purple-600 mb-1">
                        {proposal.type === "sent" ? "تقدم" : "يقدم"}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">
                            {proposal.type === "sent" ? proposal.myListing.title : proposal.theirListing.title}
                          </div>
                          <div className="text-purple-600 text-sm">
                            {formatMobilePrice(proposal.type === "sent" ? proposal.myListing.priceEgp : proposal.theirListing.priceEgp)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <ArrowLeftRight className="w-6 h-6 text-gray-300 flex-shrink-0" />

                    <div className="flex-1 p-3 bg-blue-50 rounded-xl">
                      <div className="text-xs text-blue-600 mb-1">
                        {proposal.type === "sent" ? "مقابل" : "مقابل"}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">
                            {proposal.type === "sent" ? proposal.theirListing.title : proposal.myListing.title}
                          </div>
                          <div className="text-blue-600 text-sm">
                            {formatMobilePrice(proposal.type === "sent" ? proposal.theirListing.priceEgp : proposal.myListing.priceEgp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cash Difference */}
                  {proposal.cashDifference > 0 && (
                    <div className={`mt-3 p-2 rounded-lg text-center text-sm ${
                      proposal.cashDirection === "i_receive"
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {proposal.cashDirection === "i_receive"
                        ? `تحصل على ${formatMobilePrice(proposal.cashDifference)}`
                        : `تدفع ${formatMobilePrice(proposal.cashDifference)}`
                      }
                    </div>
                  )}

                  {/* Message */}
                  {proposal.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 inline ml-1" />
                      {proposal.message}
                    </div>
                  )}

                  {/* Actions */}
                  {proposal.status === "pending" && (
                    <div className="flex gap-3 mt-4">
                      {proposal.type === "received" ? (
                        <>
                          <button className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                            قبول
                          </button>
                          <button className="flex-1 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                            رفض
                          </button>
                          <button className="px-4 py-2 border border-purple-200 rounded-lg text-purple-600 hover:bg-purple-50">
                            عرض مضاد
                          </button>
                        </>
                      ) : (
                        <button className="flex-1 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50">
                          إلغاء العرض
                        </button>
                      )}
                    </div>
                  )}

                  {proposal.status === "accepted" && (
                    <div className="mt-4">
                      <Link
                        href={`/mobile/transactions`}
                        className="w-full block py-3 bg-green-600 text-white rounded-lg font-medium text-center hover:bg-green-700"
                      >
                        متابعة المعاملة
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
