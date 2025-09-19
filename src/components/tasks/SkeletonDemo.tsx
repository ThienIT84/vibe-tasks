'use client';

import { useState } from 'react';
import TaskListSkeleton from './TaskListSkeleton';
import TaskDetailSkeleton from './TaskDetailSkeleton';
import { Button } from '@/components/ui/button';

export default function SkeletonDemo() {
  const [showTaskListSkeleton, setShowTaskListSkeleton] = useState(false);
  const [showTaskDetailSkeleton, setShowTaskDetailSkeleton] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Skeleton Loading Demo</h1>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Task List Skeleton</h2>
        <Button 
          onClick={() => setShowTaskListSkeleton(!showTaskListSkeleton)}
        >
          {showTaskListSkeleton ? 'Hide' : 'Show'} Task List Skeleton
        </Button>
        {showTaskListSkeleton && <TaskListSkeleton />}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Task Detail Skeleton</h2>
        <Button 
          onClick={() => setShowTaskDetailSkeleton(!showTaskDetailSkeleton)}
        >
          {showTaskDetailSkeleton ? 'Hide' : 'Show'} Task Detail Skeleton
        </Button>
        {showTaskDetailSkeleton && <TaskDetailSkeleton />}
      </div>
    </div>
  );
}
