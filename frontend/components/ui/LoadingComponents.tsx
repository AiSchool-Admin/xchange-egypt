'use client';

import React from 'react';

// ============================================
// Base Skeleton Component
// ============================================
export function Skeleton({
  className = '',
  variant = 'rectangular'
}: {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}) {
  const baseClass = 'animate-shimmer bg-gray-200';
  const variantClass = variant === 'circular' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-lg';

  return <div className={`${baseClass} ${variantClass} ${className}`} />;
}

// ============================================
// Page Loading Spinner
// ============================================
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin`} />
    </div>
  );
}

// ============================================
// Full Page Loading
// ============================================
export function PageLoading({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🔄</span>
        </div>
      </div>
      <p className="mt-4 text-gray-500 animate-pulse">{message}</p>
    </div>
  );
}

// ============================================
// Card Skeleton
// ============================================
export function CardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'horizontal' }) {
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <Skeleton className="aspect-square w-full" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex">
        <Skeleton className="w-32 h-32 flex-shrink-0" />
        <div className="flex-1 p-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-5 w-24 mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
          <Skeleton className="w-7 h-7" variant="circular" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Grid Loading
// ============================================
export function GridLoading({
  count = 8,
  columns = 4,
  variant = 'default'
}: {
  count?: number;
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'horizontal';
}) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} variant={variant} />
      ))}
    </div>
  );
}

// ============================================
// List Loading
// ============================================
export function ListLoading({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
          <Skeleton className="w-16 h-16 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="w-20 h-8" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// Table Loading
// ============================================
export function TableLoading({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="px-4 py-3 border-b border-gray-50 flex gap-4 items-center">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Dashboard Stats Loading
// ============================================
export function StatsLoading({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-16 mt-2" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// Form Loading
// ============================================
export function FormLoading({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-24" />
      </div>
    </div>
  );
}

// ============================================
// Detail Page Loading
// ============================================
export function DetailPageLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12" variant="circular" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Chat/Messages Loading
// ============================================
export function MessagesLoading() {
  return (
    <div className="space-y-4 p-4">
      {/* Incoming message */}
      <div className="flex gap-3">
        <Skeleton className="w-10 h-10 flex-shrink-0" variant="circular" />
        <div className="space-y-2 max-w-[60%]">
          <Skeleton className="h-16 w-48 rounded-2xl" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>

      {/* Outgoing message */}
      <div className="flex gap-3 justify-end">
        <div className="space-y-2 max-w-[60%]">
          <Skeleton className="h-12 w-64 rounded-2xl bg-primary-100" />
          <Skeleton className="h-3 w-16 mr-auto" />
        </div>
      </div>

      {/* More incoming */}
      <div className="flex gap-3">
        <Skeleton className="w-10 h-10 flex-shrink-0" variant="circular" />
        <div className="space-y-2 max-w-[60%]">
          <Skeleton className="h-24 w-56 rounded-2xl" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Profile Loading
// ============================================
export function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-6">
          <Skeleton className="w-24 h-24" variant="circular" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <StatsLoading count={4} />

      {/* Content */}
      <div className="mt-6">
        <GridLoading count={4} columns={4} />
      </div>
    </div>
  );
}

// ============================================
// Search Results Loading
// ============================================
export function SearchResultsLoading() {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 flex-shrink-0 rounded-full" />
        ))}
      </div>

      {/* Results Grid */}
      <GridLoading count={12} columns={4} />
    </div>
  );
}

// ============================================
// Checkout Loading
// ============================================
export function CheckoutLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          <FormLoading fields={4} />
          <FormLoading fields={3} />
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

// ============================================
// Auction Loading
// ============================================
export function AuctionLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <Skeleton className="aspect-square w-full rounded-2xl" />

        {/* Details */}
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>

          {/* Current Bid */}
          <div className="bg-primary-50 rounded-xl p-6 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-40" />
            <div className="flex gap-3">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>

          {/* Timer */}
          <div className="flex gap-4 justify-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-12 w-16 rounded-lg" />
                <Skeleton className="h-3 w-12 mt-2 mx-auto" />
              </div>
            ))}
          </div>

          {/* Bid History */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8" variant="circular" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Map Loading
// ============================================
export function MapLoading() {
  return (
    <div className="relative h-[600px] bg-gray-100 rounded-xl overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">جاري تحميل الخريطة...</p>
        </div>
      </div>
      {/* Fake map pins */}
      <div className="absolute top-1/4 left-1/3">
        <Skeleton className="w-8 h-10 rounded-full" />
      </div>
      <div className="absolute top-1/2 right-1/4">
        <Skeleton className="w-8 h-10 rounded-full" />
      </div>
      <div className="absolute bottom-1/3 left-1/2">
        <Skeleton className="w-8 h-10 rounded-full" />
      </div>
    </div>
  );
}

// ============================================
// Wallet/Financial Loading
// ============================================
export function WalletLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
        <Skeleton className="h-4 w-24 bg-white/20 mb-2" />
        <Skeleton className="h-10 w-40 bg-white/20 mb-4" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 bg-white/20" />
          <Skeleton className="h-10 w-24 bg-white/20" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm">
            <Skeleton className="w-12 h-12 mx-auto mb-2" variant="circular" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <Skeleton className="h-5 w-32" />
        </div>
        <ListLoading count={5} />
      </div>
    </div>
  );
}

// ============================================
// Notifications Loading
// ============================================
export function NotificationsLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex gap-4">
          <Skeleton className="w-12 h-12 flex-shrink-0" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// Settings Loading
// ============================================
export function SettingsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="w-20 h-20" variant="circular" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <FormLoading fields={3} />
        </div>

        {/* Settings Groups */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex justify-between items-center py-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default {
  Skeleton,
  LoadingSpinner,
  PageLoading,
  CardSkeleton,
  GridLoading,
  ListLoading,
  TableLoading,
  StatsLoading,
  FormLoading,
  DetailPageLoading,
  MessagesLoading,
  ProfileLoading,
  SearchResultsLoading,
  CheckoutLoading,
  AuctionLoading,
  MapLoading,
  WalletLoading,
  NotificationsLoading,
  SettingsLoading,
};
