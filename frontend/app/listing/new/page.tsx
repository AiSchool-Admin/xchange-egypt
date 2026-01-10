'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import UnifiedListingWizard from '@/components/listing/UnifiedListingWizard';
import { ListingCategory, TransactionType } from '@/types/listing';

function ListingWizardContent() {
  const searchParams = useSearchParams();

  // Get preselected options from URL params
  const category = searchParams.get('category') as ListingCategory | null;
  const transaction = searchParams.get('transaction') as TransactionType | null;
  const backUrl = searchParams.get('back') || '/';

  return (
    <UnifiedListingWizard
      options={{
        preselectedCategory: category || undefined,
        preselectedTransactionType: transaction || undefined,
        backUrl
      }}
    />
  );
}

export default function NewListingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <ListingWizardContent />
    </Suspense>
  );
}
