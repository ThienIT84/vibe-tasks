'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  CheckSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useBroadcastChannel } from '@/lib/hooks/broadcast';

interface TaskTableProps {
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
  totalCount: number;
  searchParams: {
    q?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    sort?: string;
    dir?: 'asc' | 'desc';
    page?: string;
  };
}

export default function TaskTable({ tasks, setTasks, pagination, totalCount, searchParams }: TaskTableProps) {
  const router = useRouter();
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  // Broadcast changes to other tabs
  const { broadcastTaskStatusChanged, broadcastTaskPriorityChanged, broadcastTaskDeleted } = useBroadcastChannel('vibe-tasks-sync');

  // Memoize pagination to prevent unnecessary re-renders
  const memoizedPagination = useMemo(() => pagination, [pagination.page, pagination.pageSize, pagination.totalPages]);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const isDueSoon = (dueDate: string | null) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffInHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 48 && diffInHours >= 0;
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    // Use local timezone to match user's actual date
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    return dueDate < todayStr;
  };

  const isDueToday = (dueDate: string | null) => {
    if (!dueDate) return false;
    // Use local timezone to match user's actual date
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    return dueDate === todayStr;
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return '-';
    return format(new Date(dueDate), 'MMM dd, yyyy');
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleStatusChange = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    try {
      console.log('TaskTable: Updating status', {
        taskId,
        newStatus,
        currentPage: memoizedPagination.page,
        searchParams: searchParams
      });
      
      // Prevent any filter updates during task update
      if (updatingTaskId) {
        console.log('TaskTable: Already updating, skipping');
        return;
      }
      
      setUpdatingTaskId(taskId);
      
      // Find the task to get current data
      const currentTask = tasks.find(t => t.id === taskId);
      if (!currentTask) {
        toast.error('Task not found');
        return;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: currentTask.title,
          description: currentTask.description,
          priority: currentTask.priority,
          status: newStatus,
          due_date: currentTask.due_date,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.task) {
        // Update the task in the local state immediately
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: newStatus, updated_at: data.task.updated_at }
              : task
          );
          console.log('TaskTable: Status updated locally', {
            taskId,
            newStatus,
            currentPage: memoizedPagination.page,
            tasksCount: updatedTasks.length
          });
          return updatedTasks;
        });
        // Broadcast status change to other tabs
        console.log('TaskTable: Broadcasting status change', { taskId, newStatus });
        broadcastTaskStatusChanged(taskId, newStatus);
        // toast.success('Task status updated successfully');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  }, [tasks, memoizedPagination.page, searchParams, setTasks]);

  const handlePriorityChange = useCallback(async (taskId: string, newPriority: TaskPriority) => {
    try {
      console.log('TaskTable: Updating priority', {
        taskId,
        newPriority,
        currentPage: memoizedPagination.page,
        searchParams: searchParams
      });
      
      // Prevent any filter updates during task update
      if (updatingTaskId) {
        console.log('TaskTable: Already updating, skipping');
        return;
      }
      
      setUpdatingTaskId(taskId);
      
      // Find the task to get current data
      const currentTask = tasks.find(t => t.id === taskId);
      if (!currentTask) {
        toast.error('Task not found');
        return;
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: currentTask.title,
          description: currentTask.description,
          priority: newPriority,
          status: currentTask.status,
          due_date: currentTask.due_date,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.task) {
        // Update the task in the local state immediately
        setTasks(prevTasks => {
          const updatedTasks = prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, priority: newPriority, updated_at: data.task.updated_at }
              : task
          );
          console.log('TaskTable: Priority updated locally', {
            taskId,
            newPriority,
            currentPage: pagination.page,
            tasksCount: updatedTasks.length
          });
          return updatedTasks;
        });
        // Broadcast priority change to other tabs
        console.log('TaskTable: Broadcasting priority change', { taskId, newPriority });
        broadcastTaskPriorityChanged(taskId, newPriority);
        // toast.success('Task priority updated successfully');
      }
    } catch (error) {
      console.error('Error updating task priority:', error);
      toast.error('Failed to update task priority');
    } finally {
      setUpdatingTaskId(null);
    }
  }, [tasks, memoizedPagination.page, searchParams, setTasks]);

  const handleDelete = async (taskId: string) => {
    try {
      setDeletingTaskId(taskId);
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        toast.error('Failed to delete task');
        return;
      }

      // Remove task from local state instead of refreshing
      setTasks(prevTasks => {
        const newTasks = prevTasks.filter(task => task.id !== taskId);
        
        // If current page becomes empty and we're not on page 1, go to previous page
        if (newTasks.length === 0 && memoizedPagination.page > 1) {
          const prevPage = memoizedPagination.page - 1;
          updateUrl({ page: prevPage.toString() });
        }
        
        return newTasks;
      });
      // Broadcast task deletion to other tabs
      console.log('TaskTable: Broadcasting task deletion', { taskId });
      broadcastTaskDeleted(taskId);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setDeletingTaskId(null);
    }
  };

  const updateUrl = (newParams: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    
    // Keep existing params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    
    // Update with new params
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    const newUrl = `/tasks?${params.toString()}`;
    router.replace(newUrl); // Use replace instead of push to avoid adding to history
  };

  const goToPage = (page: number) => {
    updateUrl({ page: page.toString() });
  };

  // Prevent page reset when updating tasks
  const preventPageReset = () => {
    // This function can be called to prevent any automatic page resets
    // Currently, all updates are handled locally without page resets
  };

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckSquare className="w-12 h-12 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {searchParams.q || searchParams.status || searchParams.priority 
            ? 'No tasks match your filters' 
            : 'No tasks yet'
          }
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
          {searchParams.q || searchParams.status || searchParams.priority 
            ? 'Try adjusting your search criteria or filters to find what you\'re looking for.' 
            : 'Get started by creating your first task to organize your work and boost productivity.'
          }
        </p>
        {!(searchParams.q || searchParams.status || searchParams.priority) && (
          <Button 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            onClick={() => window.location.href = '/tasks?action=create'}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            Create Your First Task
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Card Grid Layout */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden animate-in fade-in-50 slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Priority Indicator */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${
              task.priority === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600' :
              task.priority === 'high' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
              task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
              'bg-gradient-to-r from-green-500 to-green-600'
            }`} />
            
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
                
                {/* Status Badge */}
                <div className="ml-3 flex-shrink-0">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' :
                    task.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Priority & Due Date */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                  }`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDueDate(task.due_date)}
                  </div>
                  {task.due_date && (
                    <div className="flex justify-end gap-1 mt-1">
                      {isOverdue(task.due_date) && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5">
                          Overdue
                        </Badge>
                      )}
                      {isDueToday(task.due_date) && !isOverdue(task.due_date) && (
                        <Badge className="text-xs px-2 py-0.5 bg-orange-500 hover:bg-orange-600 text-white">
                          Due Today
                        </Badge>
                      )}
                      {isDueSoon(task.due_date) && !isOverdue(task.due_date) && !isDueToday(task.due_date) && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-600 dark:text-orange-300 dark:bg-orange-800/20">
                          Due Soon
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Select
                    value={task.status}
                    onValueChange={(value: TaskStatus) => handleStatusChange(task.id, value)}
                    disabled={updatingTaskId === task.id}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={task.priority}
                    onValueChange={(value: TaskPriority) => handlePriorityChange(task.id, value)}
                    disabled={updatingTaskId === task.id}
                  >
                    <SelectTrigger className="w-20 h-8 text-xs bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-800/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    <Link href={`/tasks/${task.id}`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingTaskId === task.id}
                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-800/30 text-red-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{task.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(task.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Created Date */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Created {format(new Date(task.inserted_at), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {memoizedPagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((memoizedPagination.page - 1) * memoizedPagination.pageSize) + 1} to{' '}
            {Math.min(memoizedPagination.page * memoizedPagination.pageSize, totalCount)} of{' '}
            {totalCount} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(memoizedPagination.page - 1)}
              disabled={memoizedPagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, memoizedPagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={memoizedPagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(memoizedPagination.page + 1)}
              disabled={memoizedPagination.page >= memoizedPagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
