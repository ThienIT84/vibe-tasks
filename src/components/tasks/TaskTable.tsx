'use client';

import React, { useState } from 'react';
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
  MoreHorizontal 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface TaskTableProps {
  tasks: Task[];
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

export default function TaskTable({ tasks, pagination, searchParams }: TaskTableProps) {
  const router = useRouter();
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

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

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      setUpdatingTaskId(taskId);
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        toast.error('Failed to update task status');
        return;
      }

      toast.success('Task status updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handlePriorityChange = async (taskId: string, newPriority: TaskPriority) => {
    try {
      setUpdatingTaskId(taskId);
      const { error } = await supabase
        .from('tasks')
        .update({ priority: newPriority })
        .eq('id', taskId);

      if (error) {
        toast.error('Failed to update task priority');
        return;
      }

      toast.success('Task priority updated successfully');
      router.refresh();
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setUpdatingTaskId(null);
    }
  };

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

      toast.success('Task deleted successfully');
      router.refresh();
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
    router.push(newUrl);
  };

  const goToPage = (page: number) => {
    updateUrl({ page: page.toString() });
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">No tasks found</div>
        <p className="text-gray-400">
          {searchParams.q || searchParams.status || searchParams.priority 
            ? 'Try adjusting your filters' 
            : 'Create your first task to get started'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="py-3 pr-4 font-medium">Title</th>
              <th className="py-3 pr-4 font-medium">Description</th>
              <th className="py-3 pr-4 font-medium">Priority</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Due Date</th>
              <th className="py-3 pr-4 font-medium">Created</th>
              <th className="py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="py-3 pr-4">
                  <div className="font-medium text-gray-900 max-w-[200px] truncate">
                    {task.title}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="text-gray-600 max-w-[300px] truncate">
                    {task.description || '-'}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <Select
                    value={task.priority}
                    onValueChange={(value: TaskPriority) => handlePriorityChange(task.id, value)}
                    disabled={updatingTaskId === task.id}
                  >
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-3 pr-4">
                  <Select
                    value={task.status}
                    onValueChange={(value: TaskStatus) => handleStatusChange(task.id, value)}
                    disabled={updatingTaskId === task.id}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  {task.due_date ? format(new Date(task.due_date), 'MMM dd, yyyy') : '-'}
                </td>
                <td className="py-3 pr-4 text-gray-600">
                  {format(new Date(task.inserted_at), 'MMM dd, yyyy')}
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/tasks/${task.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={updatingTaskId === task.id}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={deletingTaskId === task.id}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.page * pagination.pageSize, tasks.length)} of{' '}
            {pagination.totalPages * pagination.pageSize} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
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
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
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
