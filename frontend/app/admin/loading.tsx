import { StatsLoading, TableLoading, Skeleton } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-6" />
      <StatsLoading count={4} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Skeleton className="h-6 w-40 mb-4" />
          <TableLoading rows={5} columns={4} />
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Skeleton className="h-6 w-40 mb-4" />
          <TableLoading rows={5} columns={4} />
        </div>
      </div>
    </div>
  );
}
