/**
 * AI Fraud Warning Component
 * Shows fraud detection warnings and risk assessment
 */

import React from 'react';
import { FraudCheckResponse, getRiskLevelColor } from '@/lib/api/ai';

interface FraudWarningProps {
  fraudCheck: FraudCheckResponse | null;
}

export function FraudWarning({ fraudCheck }: FraudWarningProps) {
  if (!fraudCheck || !fraudCheck.success) {
    return null;
  }

  const { fraudScore, riskLevel, flags, recommendation, details } = fraudCheck;

  // Only show warnings for medium or high risk
  if (riskLevel === 'LOW') {
    return null;
  }

  const isHighRisk = riskLevel === 'HIGH';
  const bgColor = isHighRisk ? 'bg-red-50' : 'bg-yellow-50';
  const borderColor = isHighRisk ? 'border-red-300' : 'border-yellow-300';
  const textColor = isHighRisk ? 'text-red-800' : 'text-yellow-800';
  const iconColor = isHighRisk ? 'text-red-600' : 'text-yellow-600';

  return (
    <div className={`mt-4 p-4 ${bgColor} border ${borderColor} rounded-md`}>
      <div className="flex items-start">
        {/* Warning Icon */}
        <svg
          className={`h-6 w-6 ${iconColor} mr-3 mt-0.5 flex-shrink-0`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className={`text-sm font-bold ${textColor}`}>
              {isHighRisk ? '🚨 Suspicious Listing Detected' : '⚠️ Potential Issues Detected'}
            </p>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                isHighRisk
                  ? 'bg-red-200 text-red-800'
                  : 'bg-yellow-200 text-yellow-800'
              }`}
            >
              Risk: {Math.round(fraudScore * 100)}%
            </span>
          </div>

          {/* Risk Level Description */}
          <p className={`mt-2 text-sm ${textColor.replace('800', '700')}`}>
            {isHighRisk
              ? 'This listing has multiple red flags that require attention before publishing.'
              : 'This listing has some issues that might affect trust with potential buyers.'}
          </p>

          {/* Flags List */}
          {flags.length > 0 && (
            <div className="mt-3">
              <p className={`text-xs font-medium ${textColor} mb-1`}>Issues found:</p>
              <ul className="space-y-1">
                {flags.map((flag, index) => (
                  <li
                    key={index}
                    className={`text-sm ${textColor.replace('800', '700')} flex items-start`}
                  >
                    <span className="mr-2">•</span>
                    <span>{formatFlag(flag)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Details */}
          {details && (
            <div className="mt-3 p-2 bg-white rounded border border-gray-200">
              <p className="text-xs font-medium text-gray-700">Details:</p>
              <div className="mt-1 space-y-1 text-xs text-gray-600">
                {details.priceDeviation !== undefined && (
                  <p>
                    • Price is <strong>{Math.abs(details.priceDeviation)}%</strong> below market average
                  </p>
                )}
                {details.suspiciousKeywords && details.suspiciousKeywords.length > 0 && (
                  <p>
                    • Suspicious keywords: <strong>{details.suspiciousKeywords.join(', ')}</strong>
                  </p>
                )}
                {details.imageCount !== undefined && (
                  <p>
                    • Only <strong>{details.imageCount}</strong> image(s) uploaded (recommended: 3+)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="mt-3 p-3 bg-white rounded border border-gray-300">
            <p className="text-sm font-medium text-gray-800">📋 Recommendation:</p>
            <p className="mt-1 text-sm text-gray-700">{getRecommendationMessage(recommendation)}</p>
          </div>

          {/* Action Steps */}
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-700 mb-2">✅ How to improve:</p>
            <ul className="space-y-1 text-xs text-gray-600">
              {flags.includes('price_too_low') && (
                <li>• Review pricing - consider market rates</li>
              )}
              {flags.includes('suspicious_keywords') && (
                <li>• Remove urgency phrases like "LIMITED TIME", "BEST PRICE"</li>
              )}
              {flags.includes('limited_images') && <li>• Add more clear photos (minimum 3)</li>}
              {flags.includes('vague_description') && (
                <li>• Provide detailed description with specifications</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to format flag names
function formatFlag(flag: string): string {
  const flagMap: Record<string, string> = {
    price_too_low: 'Price significantly below market average',
    price_too_high: 'Price significantly above market average',
    suspicious_keywords: 'Contains suspicious or urgent language',
    limited_images: 'Too few images uploaded',
    vague_description: 'Description lacks detail',
    duplicate_content: 'Similar listing detected',
    new_account: 'New seller account (limited history)',
    multiple_violations: 'Multiple policy violations detected',
  };

  return flagMap[flag] || flag.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// Helper function to get recommendation message
function getRecommendationMessage(recommendation: string): string {
  switch (recommendation) {
    case 'APPROVED':
      return 'No issues detected. Your listing looks good to publish!';
    case 'REVIEW_REQUIRED':
      return 'Please review and address the issues above before publishing. This helps build trust with buyers.';
    case 'REJECTED':
      return 'This listing cannot be published in its current state. Please fix all issues and try again.';
    default:
      return 'Please review your listing before publishing.';
  }
}
