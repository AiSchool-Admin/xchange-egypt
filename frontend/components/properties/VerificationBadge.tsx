'use client';

import React from 'react';
import { CheckCircle2, Shield, Eye, Building2, HelpCircle } from 'lucide-react';

type VerificationLevel = 'UNVERIFIED' | 'DOCUMENTS_VERIFIED' | 'FIELD_VERIFIED' | 'GOVERNMENT_VERIFIED';

interface VerificationBadgeProps {
  level: VerificationLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const VERIFICATION_CONFIG = {
  UNVERIFIED: {
    label: 'غير موثق',
    labelEn: 'Unverified',
    icon: HelpCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-400',
    description: 'لم يتم التحقق من هذا العقار بعد',
    steps: ['قم برفع المستندات للتحقق'],
  },
  DOCUMENTS_VERIFIED: {
    label: 'مستندات موثقة',
    labelEn: 'Documents Verified',
    icon: CheckCircle2,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    description: 'تم التحقق من المستندات المقدمة',
    steps: ['تم التحقق من المستندات', 'اطلب فحص ميداني للتحقق الكامل'],
  },
  FIELD_VERIFIED: {
    label: 'فحص ميداني',
    labelEn: 'Field Verified',
    icon: Eye,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    description: 'تم فحص العقار ميدانياً بواسطة فريقنا',
    steps: ['تم التحقق من المستندات', 'تم الفحص الميداني', 'يمكنك ربطه بمنصة مصر العقارية'],
  },
  GOVERNMENT_VERIFIED: {
    label: 'موثق حكومياً',
    labelEn: 'Government Verified',
    icon: Building2,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-500',
    description: 'مرتبط بمنصة مصر العقارية الحكومية',
    steps: ['تم التحقق من المستندات', 'تم الفحص الميداني', 'مرتبط بالسجل العقاري الحكومي'],
  },
};

const SIZE_CLASSES = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    badge: 'px-2.5 py-1 text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    badge: 'px-3 py-1.5 text-base',
    icon: 'w-5 h-5',
  },
};

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  level,
  size = 'md',
  showLabel = true,
}) => {
  const config = VERIFICATION_CONFIG[level];
  const sizeClass = SIZE_CLASSES[size];
  const Icon = config.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-1 rounded-full border
        ${config.bgColor} ${config.borderColor} ${config.color}
        ${sizeClass.badge}
      `}
    >
      <Icon className={`${sizeClass.icon} ${config.iconColor}`} />
      {showLabel && <span className="font-medium">{config.label}</span>}
    </div>
  );
};

// Shield icon for verified properties
export const VerificationShield: React.FC<{ level: VerificationLevel; size?: number }> = ({
  level,
  size = 20,
}) => {
  const config = VERIFICATION_CONFIG[level];

  if (level === 'UNVERIFIED') return null;

  return (
    <div className="relative inline-block">
      <Shield className={`${config.iconColor}`} size={size} fill="currentColor" />
      {level === 'GOVERNMENT_VERIFIED' && (
        <CheckCircle2
          className="absolute -bottom-0.5 -right-0.5 text-white bg-purple-500 rounded-full"
          size={size * 0.5}
        />
      )}
    </div>
  );
};

// Detailed verification card for property details page
export const VerificationCard: React.FC<{ level: VerificationLevel }> = ({ level }) => {
  const config = VERIFICATION_CONFIG[level];
  const Icon = config.icon;

  const getProgressPercent = () => {
    switch (level) {
      case 'UNVERIFIED':
        return 0;
      case 'DOCUMENTS_VERIFIED':
        return 33;
      case 'FIELD_VERIFIED':
        return 66;
      case 'GOVERNMENT_VERIFIED':
        return 100;
    }
  };

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

      <p className="text-sm text-gray-700 mb-4">{config.description}</p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>مستوى التحقق</span>
          <span>{getProgressPercent()}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              level === 'UNVERIFIED'
                ? 'bg-gray-400'
                : level === 'DOCUMENTS_VERIFIED'
                ? 'bg-blue-500'
                : level === 'FIELD_VERIFIED'
                ? 'bg-green-500'
                : 'bg-purple-500'
            }`}
            style={{ width: `${getProgressPercent()}%` }}
          />
        </div>
      </div>

      {/* Verification steps */}
      <div className="space-y-2">
        <h5 className="text-sm font-semibold text-gray-700">خطوات التحقق:</h5>
        <ul className="space-y-1">
          {['رفع المستندات', 'الفحص الميداني', 'الربط الحكومي'].map((step, index) => {
            const isCompleted =
              (index === 0 && level !== 'UNVERIFIED') ||
              (index === 1 && (level === 'FIELD_VERIFIED' || level === 'GOVERNMENT_VERIFIED')) ||
              (index === 2 && level === 'GOVERNMENT_VERIFIED');

            const isCurrent =
              (index === 0 && level === 'UNVERIFIED') ||
              (index === 1 && level === 'DOCUMENTS_VERIFIED') ||
              (index === 2 && level === 'FIELD_VERIFIED');

            return (
              <li
                key={step}
                className={`flex items-center gap-2 text-sm ${
                  isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      isCurrent ? 'border-blue-500' : 'border-gray-300'
                    }`}
                  />
                )}
                <span className={isCompleted ? 'line-through' : ''}>{step}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Next step action */}
      {level !== 'GOVERNMENT_VERIFIED' && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <button
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              level === 'UNVERIFIED'
                ? 'bg-blue-600 hover:bg-blue-700'
                : level === 'DOCUMENTS_VERIFIED'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {level === 'UNVERIFIED' && 'رفع المستندات للتحقق'}
            {level === 'DOCUMENTS_VERIFIED' && 'طلب فحص ميداني'}
            {level === 'FIELD_VERIFIED' && 'ربط بمنصة مصر العقارية'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VerificationBadge;
