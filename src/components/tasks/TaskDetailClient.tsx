'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskDetail from './TaskDetail';
import TaskDetailSkeleton from './TaskDetailSkeleton';
import { Task } from '@/types/task';

interface TaskDetailClientProps {
  initialTask: Task;
}

export default function TaskDetailClient({ initialTask }: TaskDetailClientProps) {
  const [task, setTask] = useState<Task>(initialTask);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Debug logging
  console.log('TaskDetailClient - initialTask:', initialTask);
  console.log('TaskDetailClient - task state:', task);
  console.log('TaskDetailClient - isMounted:', isMounted);

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const refreshTask = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.task) {
        setTask(data.task);
      }
    } catch (error) {
      console.error('Error refreshing task:', error);
      // Don't update task state on error, keep current data
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskUpdate = () => {
    refreshTask();
  };

  if (!isMounted) {
    return <TaskDetailSkeleton />;
  }

  if (isLoading) {
    return <TaskDetailSkeleton />;
  }

  if (!task) {
    return <TaskDetailSkeleton />;
  }

  return (
    <TaskDetail 
      task={task} 
      onTaskUpdate={handleTaskUpdate}
    />
  );
}
