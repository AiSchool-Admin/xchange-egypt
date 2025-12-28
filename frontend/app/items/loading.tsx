import { GridLoading } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-6" />
      <GridLoading count={12} columns={4} />
    </div>
  );
}
