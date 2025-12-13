'use client';

import React from 'react';
import {
  Shield,
  Lock,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Wallet,
  FileText,
  HelpCircle,
} from 'lucide-react';

type DepositStatus =
  | 'PENDING'
  | 'PROTECTED'
  | 'RETURN_REQUESTED'
  | 'RELEASED'
  | 'DISPUTED'
  | 'PARTIALLY_RELEASED';

interface DepositProtectionProps {
  status: DepositStatus;
  amount: number;
  currency?: string;
  protectedAt?: Date;
  releaseDate?: Date;
  landlordName?: string;
  tenantName?: string;
  contractId?: string;
  isLandlord?: boolean;
  onProtectDeposit?: () => void;
  onRequestReturn?: () => void;
  onReleaseDeposit?: () => void;
  onDispute?: () => void;
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'في انتظار الحماية',
    labelEn: 'Pending Protection',
    icon: Clock,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    description: 'التأمين غير محمي بعد. قم بتحويله للحماية.',
  },
  PROTECTED: {
    label: 'محمي في Escrow',
    labelEn: 'Protected in Escrow',
    icon: Shield,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    description: 'التأمين محمي بالكامل ولن يُصرف إلا بموافقة الطرفين.',
  },
  RETURN_REQUESTED: {
    label: 'طلب استرداد',
    labelEn: 'Return Requested',
    icon: ArrowRight,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    description: 'المستأجر طلب استرداد التأمين. في انتظار موافقة المالك.',
  },
  RELEASED: {
    label: 'تم الإفراج',
    labelEn: 'Released',
    icon: CheckCircle2,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-500',
    description: 'تم إفراج التأمين بالكامل.',
  },
  DISPUTED: {
    label: 'متنازع عليه',
    labelEn: 'Disputed',
    icon: AlertTriangle,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    description: 'هناك نزاع على التأمين. سيتم البت فيه من قبل فريق XChange.',
  },
  PARTIALLY_RELEASED: {
    label: 'إفراج جزئي',
    labelEn: 'Partially Released',
    icon: Wallet,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-500',
    description: 'تم إفراج جزء من التأمين.',
  },
};

export const DepositProtection: React.FC<DepositProtectionProps> = ({
  status,
  amount,
  currency = 'EGP',
  protectedAt,
  releaseDate,
  landlordName,
  tenantName,
  contractId,
  isLandlord = false,
  onProtectDeposit,
  onRequestReturn,
  onReleaseDeposit,
  onDispute,
}) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className={`rounded-xl border-2 ${config.borderColor} ${config.bgColor} overflow-hidden`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className={`font-bold ${config.color}`}>{config.label}</h3>
              <span className="text-xs text-gray-500">{config.labelEn}</span>
            </div>
          </div>
          <div className="text-left">
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</div>
            <div className="text-xs text-gray-500">قيمة التأمين</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-700">{config.description}</p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {protectedAt && (
            <div>
              <span className="text-gray-500">تاريخ الحماية:</span>
              <div className="font-medium text-gray-900">{formatDate(protectedAt)}</div>
            </div>
          )}
          {releaseDate && (
            <div>
              <span className="text-gray-500">تاريخ الإفراج:</span>
              <div className="font-medium text-gray-900">{formatDate(releaseDate)}</div>
            </div>
          )}
          {landlordName && (
            <div>
              <span className="text-gray-500">المالك:</span>
              <div className="font-medium text-gray-900">{landlordName}</div>
            </div>
          )}
          {tenantName && (
            <div>
              <span className="text-gray-500">المستأجر:</span>
              <div className="font-medium text-gray-900">{tenantName}</div>
            </div>
          )}
        </div>

        {/* Contract reference */}
        {contractId && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileText className="w-4 h-4" />
            <span>رقم العقد: {contractId}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          {status === 'PENDING' && !isLandlord && onProtectDeposit && (
            <button
              onClick={onProtectDeposit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Lock className="w-4 h-4" />
              حماية التأمين
            </button>
          )}

          {status === 'PROTECTED' && !isLandlord && onRequestReturn && (
            <button
              onClick={onRequestReturn}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              طلب استرداد
            </button>
          )}

          {status === 'RETURN_REQUESTED' && isLandlord && onReleaseDeposit && (
            <button
              onClick={onReleaseDeposit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              الموافقة على الإفراج
            </button>
          )}

          {(status === 'PROTECTED' || status === 'RETURN_REQUESTED') && onDispute && (
            <button
              onClick={onDispute}
              className="flex items-center justify-center gap-2 py-2.5 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              فتح نزاع
            </button>
          )}
        </div>
      </div>

      {/* Info footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            التأمين محمي بنظام Escrow الخاص بـ XChange. لن يتم صرفه إلا بموافقة الطرفين أو بقرار من
            فريق حل النزاعات في حالة الخلاف.
          </p>
        </div>
      </div>
    </div>
  );
};

// Compact version for lists
export const DepositProtectionBadge: React.FC<{
  status: DepositStatus;
  amount: number;
}> = ({ status, amount }) => {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bgColor} ${config.borderColor}`}
    >
      <Icon className={`w-4 h-4 ${config.iconColor}`} />
      <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      <span className="text-sm text-gray-600">({formatCurrency(amount)})</span>
    </div>
  );
};

// Timeline for deposit history
export const DepositTimeline: React.FC<{
  events: Array<{
    type: string;
    date: Date;
    description: string;
    amount?: number;
  }>;
}> = ({ events }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PROTECTED':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'RETURN_REQUESTED':
        return <ArrowRight className="w-4 h-4 text-blue-500" />;
      case 'RELEASED':
        return <CheckCircle2 className="w-4 h-4 text-gray-500" />;
      case 'DISPUTED':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">سجل التأمين</h4>
      <div className="relative">
        {events.map((event, index) => (
          <div key={index} className="flex gap-3 pb-4 relative">
            {/* Line */}
            {index < events.length - 1 && (
              <div className="absolute right-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
            )}
            {/* Icon */}
            <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center z-10">
              {getEventIcon(event.type)}
            </div>
            {/* Content */}
            <div className="flex-1">
              <p className="text-sm text-gray-900">{event.description}</p>
              <p className="text-xs text-gray-500 mt-0.5">{formatDate(event.date)}</p>
              {event.amount && (
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: 'EGP',
                    minimumFractionDigits: 0,
                  }).format(event.amount)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepositProtection;
