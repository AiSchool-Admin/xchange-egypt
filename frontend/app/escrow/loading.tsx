import { ListLoading, StatsLoading, Skeleton } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <StatsLoading count={4} />

      <div className="mt-8">
        <Skeleton className="h-6 w-40 mb-4" />
        <ListLoading count={5} />
      </div>
    </div>
  );
}
