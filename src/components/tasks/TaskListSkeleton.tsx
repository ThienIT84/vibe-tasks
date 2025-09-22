import { Skeleton } from '@/components/ui/skeleton';
import { CheckSquare } from 'lucide-react';

export default function TaskListSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-12 w-32" />
      </div>

      {/* Cards Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Priority Indicator Skeleton */}
            <Skeleton className="h-1 w-full" />
            
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>

              {/* Priority & Due Date */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded-full" />
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>

              {/* Created Date */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <CheckSquare className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading tasks...</span>
        </div>
      </div>
    </div>
  );
}
