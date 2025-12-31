import { GridLoading, Skeleton } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner Skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl mb-8" />

      <Skeleton className="h-8 w-40 mb-6" />
      <GridLoading count={8} columns={4} />
    </div>
  );
}
