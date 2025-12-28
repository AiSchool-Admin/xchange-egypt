import { MessagesLoading, Skeleton } from '@/components/ui/LoadingComponents';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2 p-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg">
                <Skeleton className="w-12 h-12 flex-shrink-0" variant="circular" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <Skeleton className="w-10 h-10" variant="circular" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <MessagesLoading />
          </div>
          <div className="p-4 border-t border-gray-100">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
