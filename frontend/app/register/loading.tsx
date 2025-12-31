import { FormLoading, Skeleton } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Skeleton className="h-12 w-32 mx-auto mb-4" />
          <Skeleton className="h-6 w-56 mx-auto" />
        </div>
        <FormLoading fields={4} />
      </div>
    </div>
  );
}
