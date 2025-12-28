import { GridLoading, Skeleton } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />

      {/* Brand Filters */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-16 flex-shrink-0 rounded-xl" />
        ))}
      </div>

      <GridLoading count={12} columns={4} />
    </div>
  );
}
