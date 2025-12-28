import { TableLoading, StatsLoading, Skeleton } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-40 mb-6" />
      <StatsLoading count={4} />

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-32" />
        </div>
        <TableLoading rows={10} columns={6} />
      </div>
    </div>
  );
}
