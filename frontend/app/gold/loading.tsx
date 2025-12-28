import { GridLoading, Skeleton, StatsLoading } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-56 mb-6" />

      {/* Price Stats */}
      <StatsLoading count={4} />

      <div className="mt-8">
        <Skeleton className="h-6 w-40 mb-4" />
        <GridLoading count={8} columns={4} />
      </div>
    </div>
  );
}
