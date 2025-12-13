'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Info } from 'lucide-react';

interface TitleTypeBadgeProps {
  titleType: 'REGISTERED' | 'PRELIMINARY' | 'POA';
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const TITLE_TYPE_CONFIG = {
  REGISTERED: {
    label: 'عقد مسجل',
    labelEn: 'Registered Title',
    icon: ShieldCheck,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    tooltip: 'ملكية كاملة موثقة في الشهر العقاري - الأكثر أماناً',
    riskLevel: 'منخفض',
    riskColor: 'text-green-600',
  },
  PRELIMINARY: {
    label: 'عقد ابتدائي',
    labelEn: 'Preliminary Contract',
    icon: AlertTriangle,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    tooltip: 'حقوق تعاقدية فقط - يُنصح بالتحقق من صحة العقد والملكية',
    riskLevel: 'متوسط',
    riskColor: 'text-yellow-600',
  },
  POA: {
    label: 'توكيل',
    labelEn: 'Power of Attorney',
    icon: XCircle,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    tooltip: 'خطر عالي! التوكيل قابل للإلغاء في أي وقت - تحقق جيداً قبل الشراء',
    riskLevel: 'عالي',
    riskColor: 'text-red-600',
  },
};

const SIZE_CLASSES = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'w-3 h-3',
    tooltip: 'text-xs',
  },
  md: {
    badge: 'px-3 py-1 text-sm',
    icon: 'w-4 h-4',
    tooltip: 'text-sm',
  },
  lg: {
    badge: 'px-4 py-1.5 text-base',
    icon: 'w-5 h-5',
    tooltip: 'text-base',
  },
};

export const TitleTypeBadge: React.FC<TitleTypeBadgeProps> = ({
  titleType,
  size = 'md',
  showTooltip = true,
}) => {
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);
  const config = TITLE_TYPE_CONFIG[titleType];
  const sizeClass = SIZE_CLASSES[size];
  const Icon = config.icon;

  return (
    <div className="relative inline-block">
      <div
        className={`
          inline-flex items-center gap-1 rounded-full border
          ${config.bgColor} ${config.borderColor} ${config.color}
          ${sizeClass.badge}
          cursor-help
        `}
        onMouseEnter={() => setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
      >
        <Icon className={`${sizeClass.icon} ${config.iconColor}`} />
        <span className="font-medium">{config.label}</span>
      </div>

      {/* Tooltip */}
      {showTooltip && isTooltipVisible && (
        <div className="absolute z-50 bottom-full right-0 mb-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-gray-900 mb-1">
                نوع الملكية: {config.label}
              </div>
              <p className={`${sizeClass.tooltip} text-gray-600 mb-2`}>
                {config.tooltip}
              </p>
              <div className={`text-sm font-medium ${config.riskColor}`}>
                مستوى المخاطر: {config.riskLevel}
                {titleType === 'REGISTERED' && ' 🟢'}
                {titleType === 'PRELIMINARY' && ' 🟡'}
                {titleType === 'POA' && ' 🔴'}
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div className="absolute top-full right-4 -mt-1">
            <div className="w-2 h-2 bg-white border-b border-r border-gray-200 transform rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
};

// Detailed version for property details page
export const TitleTypeCard: React.FC<{ titleType: 'REGISTERED' | 'PRELIMINARY' | 'POA' }> = ({
  titleType,
}) => {
  const config = TITLE_TYPE_CONFIG[titleType];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border-2 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-full ${config.bgColor}`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <div>
          <h4 className={`font-bold ${config.color}`}>{config.label}</h4>
          <span className="text-xs text-gray-500">{config.labelEn}</span>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{config.tooltip}</p>

      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
        <span>مستوى المخاطر:</span>
        <span className={`font-bold ${config.riskColor}`}>{config.riskLevel}</span>
      </div>

      {/* Recommendations */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">توصياتنا:</h5>
        <ul className="text-sm text-gray-600 space-y-1">
          {titleType === 'REGISTERED' && (
            <>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                تحقق من سند الملكية في الشهر العقاري
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                تأكد من عدم وجود رهن أو حجز
              </li>
            </>
          )}
          {titleType === 'PRELIMINARY' && (
            <>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">!</span>
                اطلب عقد البيع الأصلي للمالك السابق
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">!</span>
                تحقق من تسلسل الملكية
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500">!</span>
                استخدم نظام Escrow للحماية
              </li>
            </>
          )}
          {titleType === 'POA' && (
            <>
              <li className="flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                تأكد من صلاحية التوكيل
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                تحقق من أن التوكيل يسمح بالبيع
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                استشر محامٍ قبل الشراء
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500">⚠</span>
                استخدم Escrow واطلب فحص ميداني
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default TitleTypeBadge;
