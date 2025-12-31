import { GridLoading, Skeleton } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm">
            <Skeleton className="w-12 h-12 mx-auto mb-3" variant="circular" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>

      <GridLoading count={6} columns={3} />
    </div>
  );
}
