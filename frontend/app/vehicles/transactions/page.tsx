"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Phone,
  FileText,
  Download,
  CreditCard,
  Wallet,
  RefreshCw,
  ArrowLeftRight,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronUp,
  Truck,
  Lock,
  Unlock,
} from "lucide-react";
import {
  VEHICLE_MAKE_AR,
  GOVERNORATE_AR,
  MOCK_VEHICLE_LISTINGS,
  formatVehiclePrice,
} from "@/lib/api/vehicle-marketplace";

// Transaction types
type TransactionType = "purchase" | "sale" | "barter";
type TransactionStatus =
  | "pending_payment"
  | "payment_received"
  | "in_escrow"
  | "inspection"
  | "transfer"
  | "completed"
  | "cancelled"
  | "disputed";

interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  vehicle: (typeof MOCK_VEHICLE_LISTINGS)[0];
  barterVehicle?: (typeof MOCK_VEHICLE_LISTINGS)[0];
  amount: number;
  cashDifference?: number;
  escrowFee: number;
  buyer: {
    name: string;
    phone: string;
    governorate: string;
  };
  seller: {
    name: string;
    phone: string;
    governorate: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  timeline: {
    status: TransactionStatus;
    timestamp: string;
    note?: string;
  }[];
}

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; color: string; icon: typeof CheckCircle; description: string }
> = {
  pending_payment: {
    label: "بانتظار الدفع",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: Clock,
    description: "في انتظار إتمام عملية الدفع من المشتري",
  },
  payment_received: {
    label: "تم استلام المبلغ",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    icon: CreditCard,
    description: "تم استلام المبلغ وسيتم تحويله للضمان",
  },
  in_escrow: {
    label: "في الضمان",
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Lock,
    description: "المبلغ محفوظ في حساب الضمان بأمان",
  },
  inspection: {
    label: "مرحلة الفحص",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    icon: Eye,
    description: "فحص السيارة والتحقق من حالتها",
  },
  transfer: {
    label: "نقل الملكية",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    icon: FileText,
    description: "جاري إجراءات نقل ملكية السيارة",
  },
  completed: {
    label: "مكتملة",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: CheckCircle,
    description: "تمت الصفقة بنجاح",
  },
  cancelled: {
    label: "ملغاة",
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: XCircle,
    description: "تم إلغاء الصفقة",
  },
  disputed: {
    label: "نزاع",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertCircle,
    description: "هناك نزاع قيد المراجعة",
  },
};

const TYPE_LABELS: Record<TransactionType, string> = {
  purchase: "شراء",
  sale: "بيع",
  barter: "مقايضة",
};

// Mock transactions
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TRX-001",
    type: "purchase",
    status: "in_escrow",
    vehicle: MOCK_VEHICLE_LISTINGS[0],
    amount: MOCK_VEHICLE_LISTINGS[0].askingPrice,
    escrowFee: 2500,
    buyer: { name: "أحمد محمد", phone: "01012345678", governorate: "cairo" },
    seller: { name: "محمود علي", phone: "01198765432", governorate: "giza" },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { status: "pending_payment", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "payment_received", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "in_escrow", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: "TRX-002",
    type: "sale",
    status: "completed",
    vehicle: MOCK_VEHICLE_LISTINGS[1],
    amount: MOCK_VEHICLE_LISTINGS[1].askingPrice,
    escrowFee: 2500,
    buyer: { name: "كريم حسن", phone: "01234567890", governorate: "alexandria" },
    seller: { name: "أحمد محمد", phone: "01012345678", governorate: "cairo" },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { status: "pending_payment", timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "payment_received", timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "in_escrow", timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "inspection", timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "transfer", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "completed", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: "TRX-003",
    type: "barter",
    status: "inspection",
    vehicle: MOCK_VEHICLE_LISTINGS[2],
    barterVehicle: MOCK_VEHICLE_LISTINGS[3],
    amount: 0,
    cashDifference: 50000,
    escrowFee: 1500,
    buyer: { name: "محمد سعيد", phone: "01111111111", governorate: "cairo" },
    seller: { name: "أحمد محمد", phone: "01012345678", governorate: "giza" },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    timeline: [
      { status: "pending_payment", timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), note: "فرق المقايضة: 50,000 جنيه" },
      { status: "payment_received", timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "in_escrow", timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { status: "inspection", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), note: "فحص السيارتين قيد التنفيذ" },
    ],
  },
];

export default function TransactionsPage() {
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((t) => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: transactions.length,
    active: transactions.filter((t) => !["completed", "cancelled"].includes(t.status)).length,
    completed: transactions.filter((t) => t.status === "completed").length,
    totalValue: transactions.reduce((sum, t) => sum + t.amount + (t.cashDifference || 0), 0),
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProgressPercentage = (status: TransactionStatus) => {
    const statuses: TransactionStatus[] = [
      "pending_payment",
      "payment_received",
      "in_escrow",
      "inspection",
      "transfer",
      "completed",
    ];
    const index = statuses.indexOf(status);
    if (index === -1) return 0;
    return ((index + 1) / statuses.length) * 100;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/vehicles"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة للسوق</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              المعاملات والضمان
            </h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Escrow Info */}
        <div className="bg-gradient-to-l from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">نظام الضمان الآمن</h2>
              <p className="text-blue-100 mb-4">
                جميع المعاملات محمية بنظام الضمان (Escrow) الذي يحفظ أموالك حتى إتمام الصفقة بنجاح.
                المبلغ يُحفظ في حساب وسيط آمن ولا يُحوّل للبائع إلا بعد استلامك للسيارة وموافقتك.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  <span>حماية 100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  <span>استرداد كامل</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>توثيق رسمي</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">إجمالي المعاملات</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-600">معاملات نشطة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-sm text-gray-600">مكتملة</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatVehiclePrice(stats.totalValue)}
                </p>
                <p className="text-sm text-gray-600">إجمالي القيمة</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TransactionType | "all")}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الأنواع</option>
              <option value="purchase">شراء</option>
              <option value="sale">بيع</option>
              <option value="barter">مقايضة</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TransactionStatus | "all")}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending_payment">بانتظار الدفع</option>
              <option value="in_escrow">في الضمان</option>
              <option value="inspection">مرحلة الفحص</option>
              <option value="transfer">نقل الملكية</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => {
              const StatusIcon = STATUS_CONFIG[transaction.status].icon;
              const isExpanded = expandedId === transaction.id;

              return (
                <div
                  key={transaction.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Main Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_CONFIG[transaction.status].color}`}
                        >
                          <StatusIcon className="w-4 h-4 inline ml-1" />
                          {STATUS_CONFIG[transaction.status].label}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            transaction.type === "barter"
                              ? "bg-green-100 text-green-700"
                              : transaction.type === "purchase"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {TYPE_LABELS[transaction.type]}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{transaction.id}</span>
                    </div>

                    {/* Progress Bar */}
                    {!["cancelled", "disputed"].includes(transaction.status) && (
                      <div className="mb-4">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-l from-green-500 to-blue-500 transition-all duration-500"
                            style={{ width: `${getProgressPercentage(transaction.status)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {STATUS_CONFIG[transaction.status].description}
                        </p>
                      </div>
                    )}

                    {/* Vehicle Info */}
                    <div className="flex gap-4">
                      <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={transaction.vehicle.images[0]?.url || "/images/placeholder-car.jpg"}
                          alt={`${VEHICLE_MAKE_AR[transaction.vehicle.make]} ${transaction.vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {VEHICLE_MAKE_AR[transaction.vehicle.make]} {transaction.vehicle.model}{" "}
                          {transaction.vehicle.year}
                        </h3>
                        <div className="flex items-center gap-4 mt-2">
                          {transaction.type === "barter" ? (
                            <>
                              <span className="text-gray-600">فرق المقايضة:</span>
                              <span className="text-xl font-bold text-green-600">
                                {formatVehiclePrice(transaction.cashDifference || 0)}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-600">المبلغ:</span>
                              <span className="text-xl font-bold text-blue-600">
                                {formatVehiclePrice(transaction.amount)}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(transaction.createdAt)}</span>
                        </div>
                      </div>

                      {/* Barter Vehicle */}
                      {transaction.barterVehicle && (
                        <>
                          <div className="flex items-center">
                            <ArrowLeftRight className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={transaction.barterVehicle.images[0]?.url || "/images/placeholder-car.jpg"}
                              alt={`${VEHICLE_MAKE_AR[transaction.barterVehicle.make]} ${transaction.barterVehicle.model}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : transaction.id)}
                    className="w-full py-3 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50"
                  >
                    <span>{isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Buyer/Seller Info */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">أطراف المعاملة</h4>
                          <div className="space-y-3">
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-sm text-gray-500 mb-1">المشتري</p>
                              <p className="font-bold">{transaction.buyer.name}</p>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin className="w-4 h-4" />
                                {GOVERNORATE_AR[transaction.buyer.governorate as keyof typeof GOVERNORATE_AR]}
                              </p>
                            </div>
                            <div className="bg-white p-3 rounded-lg">
                              <p className="text-sm text-gray-500 mb-1">البائع</p>
                              <p className="font-bold">{transaction.seller.name}</p>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <MapPin className="w-4 h-4" />
                                {GOVERNORATE_AR[transaction.seller.governorate as keyof typeof GOVERNORATE_AR]}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Timeline */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-3">سجل المعاملة</h4>
                          <div className="space-y-3">
                            {transaction.timeline.map((event, index) => {
                              const EventIcon = STATUS_CONFIG[event.status].icon;
                              return (
                                <div key={index} className="flex gap-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                      index === transaction.timeline.length - 1
                                        ? "bg-blue-100 text-blue-600"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    <EventIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {STATUS_CONFIG[event.status].label}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {formatDate(event.timestamp)}
                                    </p>
                                    {event.note && (
                                      <p className="text-sm text-blue-600 mt-1">{event.note}</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Financial Summary */}
                      <div className="mt-6 p-4 bg-white rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-3">الملخص المالي</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              {transaction.type === "barter" ? "فرق المقايضة" : "سعر السيارة"}
                            </span>
                            <span className="font-bold">
                              {formatVehiclePrice(
                                transaction.type === "barter"
                                  ? transaction.cashDifference || 0
                                  : transaction.amount
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">رسوم الضمان</span>
                            <span className="font-bold">
                              {formatVehiclePrice(transaction.escrowFee)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="font-bold text-gray-900">الإجمالي</span>
                            <span className="font-bold text-blue-600">
                              {formatVehiclePrice(
                                (transaction.type === "barter"
                                  ? transaction.cashDifference || 0
                                  : transaction.amount) + transaction.escrowFee
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-6">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                          <Download className="w-4 h-4" />
                          تحميل الفاتورة
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          <MessageSquare className="w-4 h-4" />
                          الدعم الفني
                        </button>
                        {transaction.status === "in_escrow" && (
                          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <CheckCircle className="w-4 h-4" />
                            تأكيد الاستلام
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد معاملات</h3>
            <p className="text-gray-600 mb-6">ابدأ بشراء أو بيع سيارة لتظهر معاملاتك هنا</p>
            <Link
              href="/vehicles/listings"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 inline-block"
            >
              تصفح السيارات
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
