/**
 * AI Price Warning Component
 * Shows price validation warnings and suggestions
 */

import React from 'react';
import { PriceEstimationResponse } from '@/lib/api/ai';

interface PriceWarningProps {
  estimation: PriceEstimationResponse | null;
  enteredPrice: number;
  loading?: boolean;
}

export function PriceWarning({ estimation, enteredPrice, loading }: PriceWarningProps) {
  if (loading) {
    return (
      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex items-center text-sm text-blue-800">
          <svg
            className="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Checking price with AI...
        </div>
      </div>
    );
  }

  if (!estimation || !estimation.success) {
    return null;
  }

  const { estimatedPrice, priceRange, confidence, comparableItems } = estimation.estimation;
  const deviation = ((enteredPrice - estimatedPrice) / estimatedPrice) * 100;

  // Price is too low
  if (enteredPrice < priceRange.min) {
    return (
      <div className="mt-2 p-3 bg-yellow-50 border border-yellow-300 rounded-md">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-yellow-600 mr-2 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800">⚠️ Price seems too low</p>
            <p className="mt-1 text-sm text-yellow-700">
              Similar items are typically priced between{' '}
              <strong>
                {priceRange.min.toLocaleString()} - {priceRange.max.toLocaleString()} EGP
              </strong>
            </p>
            <p className="mt-1 text-xs text-yellow-600">
              Based on {comparableItems} similar items • Market average: {estimatedPrice.toLocaleString()} EGP
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Price is too high
  if (enteredPrice > priceRange.max) {
    return (
      <div className="mt-2 p-3 bg-orange-50 border border-orange-300 rounded-md">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-orange-600 mr-2 mt-0.5"
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
            <p className="text-sm font-medium text-orange-800">⚠️ Price seems too high</p>
            <p className="mt-1 text-sm text-orange-700">
              Similar items are typically priced between{' '}
              <strong>
                {priceRange.min.toLocaleString()} - {priceRange.max.toLocaleString()} EGP
              </strong>
            </p>
            <p className="mt-1 text-xs text-orange-600">
              Based on {comparableItems} similar items • Market average: {estimatedPrice.toLocaleString()} EGP
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Price is reasonable but let's show info
  if (Math.abs(deviation) < 15) {
    return (
      <div className="mt-2 p-3 bg-green-50 border border-green-300 rounded-md">
        <div className="flex items-start">
          <svg
            className="h-5 w-5 text-green-600 mr-2 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">✅ Price looks good!</p>
            <p className="mt-1 text-sm text-green-700">
              Your price is within the typical range:{' '}
              <strong>
                {priceRange.min.toLocaleString()} - {priceRange.max.toLocaleString()} EGP
              </strong>
            </p>
            <p className="mt-1 text-xs text-green-600">
              Market confidence: {Math.round(confidence * 100)}% • Based on {comparableItems} similar items
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Price is acceptable but slightly off
  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-start">
        <svg
          className="h-5 w-5 text-blue-600 mr-2 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800">💡 Price suggestion</p>
          <p className="mt-1 text-sm text-blue-700">
            Typical range: <strong>{priceRange.min.toLocaleString()} - {priceRange.max.toLocaleString()} EGP</strong>
          </p>
          <p className="mt-1 text-xs text-blue-600">
            Market average: {estimatedPrice.toLocaleString()} EGP • Based on {comparableItems} similar items
          </p>
        </div>
      </div>
    </div>
  );
}
