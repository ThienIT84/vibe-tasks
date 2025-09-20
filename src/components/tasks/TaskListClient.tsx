'use client';

import { useState, useEffect } from 'react';
import TaskTable from './TaskTable';
import TaskFilters from './TaskFilters';
import TaskListSkeleton from './TaskListSkeleton';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

interface TaskListClientProps {
  initialTasks: Task[];
  totalCount: number;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
  searchParams: {
    q?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    sort?: string;
    dir?: 'asc' | 'desc';
    page?: string;
  };
}

export default function TaskListClient({ 
  initialTasks, 
  totalCount, 
  pagination,
  searchParams 
}: TaskListClientProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.page || '1'));

  // Update tasks when searchParams change (from server-side)
  useEffect(() => {
    console.log('TaskListClient: Updating tasks from server', {
      initialTasksLength: initialTasks.length,
      currentPage: searchParams.page,
      searchParams: searchParams
    });
    setTasks(initialTasks);
    setCurrentPage(parseInt(searchParams.page || '1'));
  }, [initialTasks, searchParams.page]);

  // Reset loading state when tasks change
  useEffect(() => {
    console.log('TaskListClient: Reset loading state', {
      searchParams: searchParams,
      currentPage: searchParams.page
    });
    setIsLoading(false);
  }, [initialTasks, searchParams]);

  const handleSearch = async (newSearchParams: typeof searchParams) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (newSearchParams.q) params.set('q', newSearchParams.q);
      if (newSearchParams.status) params.set('status', newSearchParams.status);
      if (newSearchParams.priority) params.set('priority', newSearchParams.priority);
      if (newSearchParams.sort) params.set('sort', newSearchParams.sort);
      if (newSearchParams.dir) params.set('dir', newSearchParams.dir);
      if (newSearchParams.page) params.set('page', newSearchParams.page);

      // Update URL with new search params
      const url = new URL(window.location.href);
      Object.entries(newSearchParams).forEach(([key, value]) => {
        if (value) {
          url.searchParams.set(key, value);
        } else {
          url.searchParams.delete(key);
        }
      });
      window.history.pushState({}, '', url.toString());
      
      // For now, just show loading state
      // In a real app, you'd make an API call here
      setCurrentPage(parseInt(newSearchParams.page || '1'));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const newSearchParams = { ...searchParams, page: page.toString() };
    handleSearch(newSearchParams);
  };

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <TaskFilters 
        searchParams={searchParams}
      />
      <TaskTable 
        tasks={tasks}
        setTasks={setTasks}
        pagination={pagination}
        totalCount={totalCount}
        searchParams={searchParams}
      />
    </div>
  );
}
