import { GridLoading, Skeleton, StatsLoading } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />

      <StatsLoading count={4} />

      <div className="mt-8">
        <GridLoading count={6} columns={3} />
      </div>
    </div>
  );
}
