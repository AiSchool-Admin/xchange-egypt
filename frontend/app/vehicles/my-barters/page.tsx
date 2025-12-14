"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  RefreshCw,
  ArrowLeftRight,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Phone,
  MapPin,
  MoreVertical,
  ChevronDown,
  Send,
  Inbox,
  Filter,
  Search,
} from "lucide-react";
import {
  VEHICLE_MAKE_AR,
  CONDITION_AR,
  GOVERNORATE_AR,
  MOCK_VEHICLE_LISTINGS,
  formatVehiclePrice,
  formatMileage,
} from "@/lib/api/vehicle-marketplace";

// Barter offer status
type BarterStatus = "pending" | "accepted" | "rejected" | "countered" | "expired";

interface BarterOffer {
  id: string;
  type: "sent" | "received";
  status: BarterStatus;
  myVehicle: (typeof MOCK_VEHICLE_LISTINGS)[0];
  theirVehicle: (typeof MOCK_VEHICLE_LISTINGS)[0];
  cashDifference: number; // positive = I pay, negative = they pay
  message?: string;
  createdAt: string;
  expiresAt: string;
  counterOffer?: {
    cashDifference: number;
    message: string;
  };
}

const STATUS_CONFIG: Record<
  BarterStatus,
  { label: string; color: string; icon: typeof CheckCircle }
> = {
  pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  accepted: { label: "مقبول", color: "bg-green-100 text-green-700", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-700", icon: XCircle },
  countered: { label: "عرض مضاد", color: "bg-blue-100 text-blue-700", icon: ArrowLeftRight },
  expired: { label: "منتهي", color: "bg-gray-100 text-gray-700", icon: Clock },
};

// Generate mock barter offers
const MOCK_BARTERS: BarterOffer[] = [
  {
    id: "barter-1",
    type: "received",
    status: "pending",
    myVehicle: MOCK_VEHICLE_LISTINGS[0],
    theirVehicle: MOCK_VEHICLE_LISTINGS[2],
    cashDifference: -50000,
    message: "سيارتي بحالة ممتازة ومفحوصة، أود المقايضة مع دفع الفرق نقداً",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "barter-2",
    type: "sent",
    status: "countered",
    myVehicle: MOCK_VEHICLE_LISTINGS[1],
    theirVehicle: MOCK_VEHICLE_LISTINGS[3],
    cashDifference: 30000,
    message: "مهتم بالمقايضة، السيارة صيانة وكالة",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    counterOffer: {
      cashDifference: 50000,
      message: "أوافق على المقايضة لكن الفرق يجب أن يكون 50,000 جنيه",
    },
  },
  {
    id: "barter-3",
    type: "received",
    status: "accepted",
    myVehicle: MOCK_VEHICLE_LISTINGS[2],
    theirVehicle: MOCK_VEHICLE_LISTINGS[4],
    cashDifference: 0,
    message: "مقايضة مباشرة بدون فرق",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "barter-4",
    type: "sent",
    status: "rejected",
    myVehicle: MOCK_VEHICLE_LISTINGS[0],
    theirVehicle: MOCK_VEHICLE_LISTINGS[5],
    cashDifference: -20000,
    message: "أريد المقايضة",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function MyBartersPage() {
  const [barters, setBarters] = useState<BarterOffer[]>(MOCK_BARTERS);
  const [activeTab, setActiveTab] = useState<"all" | "sent" | "received">("all");
  const [filterStatus, setFilterStatus] = useState<BarterStatus | "all">("all");
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showResponseModal, setShowResponseModal] = useState<BarterOffer | null>(null);
  const [responseType, setResponseType] = useState<"accept" | "reject" | "counter">("accept");
  const [counterAmount, setCounterAmount] = useState(0);
  const [counterMessage, setCounterMessage] = useState("");

  const filteredBarters = barters.filter((barter) => {
    if (activeTab !== "all" && barter.type !== activeTab) return false;
    if (filterStatus !== "all" && barter.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: barters.length,
    pending: barters.filter((b) => b.status === "pending").length,
    received: barters.filter((b) => b.type === "received").length,
    sent: barters.filter((b) => b.type === "sent").length,
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (hours < 1) return "منذ دقائق";
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} أيام`;
    return date.toLocaleDateString("ar-EG");
  };

  const handleResponse = (offer: BarterOffer, type: "accept" | "reject" | "counter") => {
    if (type === "accept") {
      setBarters((prev) =>
        prev.map((b) => (b.id === offer.id ? { ...b, status: "accepted" as BarterStatus } : b))
      );
    } else if (type === "reject") {
      setBarters((prev) =>
        prev.map((b) => (b.id === offer.id ? { ...b, status: "rejected" as BarterStatus } : b))
      );
    } else if (type === "counter") {
      setBarters((prev) =>
        prev.map((b) =>
          b.id === offer.id
            ? {
                ...b,
                status: "countered" as BarterStatus,
                counterOffer: { cashDifference: counterAmount, message: counterMessage },
              }
            : b
        )
      );
    }
    setShowResponseModal(null);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-green-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/vehicles"
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة للسوق</span>
            </Link>
            <Link
              href="/vehicles/barter"
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              سوق المقايضة
            </Link>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <RefreshCw className="w-8 h-8" />
              <h1 className="text-2xl md:text-3xl font-bold">عروض المقايضة</h1>
            </div>
            <p className="text-green-100">إدارة عروض المقايضة المرسلة والمستلمة</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">إجمالي العروض</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">بانتظار الرد</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Inbox className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.received}</p>
                <p className="text-sm text-gray-600">عروض مستلمة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                <p className="text-sm text-gray-600">عروض مرسلة</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "all"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setActiveTab("received")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "received"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Inbox className="w-4 h-4" />
                المستلمة
                {stats.received > 0 && (
                  <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {barters.filter((b) => b.type === "received" && b.status === "pending").length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("sent")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "sent"
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Send className="w-4 h-4" />
                المرسلة
              </button>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BarterStatus | "all")}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="accepted">مقبول</option>
              <option value="rejected">مرفوض</option>
              <option value="countered">عرض مضاد</option>
            </select>
          </div>
        </div>

        {/* Barter Offers */}
        {filteredBarters.length > 0 ? (
          <div className="space-y-4">
            {filteredBarters.map((barter) => {
              const StatusIcon = STATUS_CONFIG[barter.status].icon;

              return (
                <div key={barter.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${STATUS_CONFIG[barter.status].color}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        {STATUS_CONFIG[barter.status].label}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(barter.createdAt)}</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        barter.type === "received" ? "text-blue-600" : "text-purple-600"
                      }`}
                    >
                      {barter.type === "received" ? "عرض مستلم" : "عرض مرسل"}
                    </span>
                  </div>

                  {/* Vehicles Comparison */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      {/* My Vehicle */}
                      <div className="md:col-span-2 flex gap-3">
                        <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={barter.myVehicle.images[0]}
                            alt="سيارتي"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">سيارتي</p>
                          <h4 className="font-bold text-gray-900">
                            {VEHICLE_MAKE_AR[barter.myVehicle.make]} {barter.myVehicle.model}
                          </h4>
                          <p className="text-sm text-gray-500">{barter.myVehicle.year}</p>
                          <p className="text-blue-600 font-bold">
                            {formatVehiclePrice(barter.myVehicle.askingPrice)}
                          </p>
                        </div>
                      </div>

                      {/* Exchange Icon */}
                      <div className="flex justify-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <ArrowLeftRight className="w-6 h-6 text-green-600" />
                        </div>
                      </div>

                      {/* Their Vehicle */}
                      <div className="md:col-span-2 flex gap-3">
                        <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={barter.theirVehicle.images[0]}
                            alt="سيارتهم"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            {barter.type === "received" ? "سيارة المرسل" : "السيارة المطلوبة"}
                          </p>
                          <h4 className="font-bold text-gray-900">
                            {VEHICLE_MAKE_AR[barter.theirVehicle.make]} {barter.theirVehicle.model}
                          </h4>
                          <p className="text-sm text-gray-500">{barter.theirVehicle.year}</p>
                          <p className="text-blue-600 font-bold">
                            {formatVehiclePrice(barter.theirVehicle.askingPrice)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Cash Difference */}
                    {barter.cashDifference !== 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">فرق نقدي:</span>
                          <span
                            className={`font-bold ${
                              barter.cashDifference > 0 ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {barter.cashDifference > 0 ? "أدفع " : "أستلم "}
                            {formatVehiclePrice(Math.abs(barter.cashDifference))}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    {barter.message && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{barter.message}</p>
                      </div>
                    )}

                    {/* Counter Offer */}
                    {barter.counterOffer && (
                      <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h5 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                          <ArrowLeftRight className="w-4 h-4" />
                          عرض مضاد
                        </h5>
                        <p className="text-amber-700 text-sm mb-2">
                          {barter.counterOffer.message}
                        </p>
                        <p className="font-bold text-amber-800">
                          الفرق المطلوب: {formatVehiclePrice(barter.counterOffer.cashDifference)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100">
                    <Link
                      href={`/vehicles/${barter.theirVehicle.id}`}
                      className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                      عرض السيارة
                    </Link>

                    {barter.type === "received" && barter.status === "pending" && (
                      <>
                        <button
                          onClick={() => {
                            setShowResponseModal(barter);
                            setResponseType("reject");
                          }}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          رفض
                        </button>
                        <button
                          onClick={() => {
                            setShowResponseModal(barter);
                            setResponseType("counter");
                            setCounterAmount(barter.cashDifference);
                          }}
                          className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          عرض مضاد
                        </button>
                        <button
                          onClick={() => {
                            setShowResponseModal(barter);
                            setResponseType("accept");
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          قبول
                        </button>
                      </>
                    )}

                    {barter.status === "accepted" && (
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        تواصل مع البائع
                      </button>
                    )}

                    {barter.type === "sent" && barter.status === "countered" && (
                      <>
                        <button
                          onClick={() => handleResponse(barter, "reject")}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          رفض
                        </button>
                        <button
                          onClick={() => handleResponse(barter, "accept")}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          قبول العرض المضاد
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عروض مقايضة</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === "sent"
                ? "لم ترسل أي عروض مقايضة بعد"
                : activeTab === "received"
                ? "لم تستلم أي عروض مقايضة بعد"
                : "ابدأ بتصفح السيارات وقدم عروض المقايضة"}
            </p>
            <Link
              href="/vehicles/barter"
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 inline-flex items-center gap-2"
            >
              <ArrowLeftRight className="w-5 h-5" />
              تصفح سوق المقايضة
            </Link>
          </div>
        )}
      </main>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {responseType === "accept" && "تأكيد قبول العرض"}
              {responseType === "reject" && "تأكيد رفض العرض"}
              {responseType === "counter" && "تقديم عرض مضاد"}
            </h3>

            {responseType === "accept" && (
              <p className="text-gray-600 mb-6">
                هل أنت متأكد من قبول هذا العرض؟ سيتم إعلام الطرف الآخر وستتمكنان من التواصل.
              </p>
            )}

            {responseType === "reject" && (
              <p className="text-gray-600 mb-6">
                هل أنت متأكد من رفض هذا العرض؟ لن تتمكن من التراجع عن هذا القرار.
              </p>
            )}

            {responseType === "counter" && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفرق النقدي المطلوب
                  </label>
                  <input
                    type="number"
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(parseInt(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رسالة (اختياري)
                  </label>
                  <textarea
                    value={counterMessage}
                    onChange={(e) => setCounterMessage(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    placeholder="أضف رسالة توضيحية..."
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowResponseModal(null)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleResponse(showResponseModal, responseType)}
                className={`flex-1 px-4 py-3 rounded-xl text-white ${
                  responseType === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {responseType === "accept" && "تأكيد القبول"}
                {responseType === "reject" && "تأكيد الرفض"}
                {responseType === "counter" && "إرسال العرض"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
