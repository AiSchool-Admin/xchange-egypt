import { GridLoading, Skeleton } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />

      {/* Categories */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 flex-shrink-0 rounded-full" />
        ))}
      </div>

      <GridLoading count={8} columns={4} />
    </div>
  );
}
