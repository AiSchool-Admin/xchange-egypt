import { StatsLoading, GridLoading, Skeleton } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <StatsLoading count={4} />

      <div className="mt-8">
        <Skeleton className="h-6 w-32 mb-4" />
        <GridLoading count={4} columns={4} />
      </div>

      <div className="mt-8">
        <Skeleton className="h-6 w-40 mb-4" />
        <GridLoading count={4} columns={4} />
      </div>
    </div>
  );
}
