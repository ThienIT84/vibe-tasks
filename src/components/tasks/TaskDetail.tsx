'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Calendar, 
  Clock, 
  Flag, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Play, 
  CheckCircle,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import TaskForm from './TaskForm';
import TaskDetailSkeleton from './TaskDetailSkeleton';
import { TaskFormData } from '@/lib/schemas/task';

interface TaskDetailProps {
  task: Task;
  onTaskUpdate?: () => void;
}

export default function TaskDetail({ task, onTaskUpdate }: TaskDetailProps) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug logging
  console.log('TaskDetail - task:', task);
  console.log('TaskDetail - isMounted:', isMounted);

  // Early return if task is not available
  if (!task) {
    console.log('TaskDetail - No task, showing skeleton');
    return <TaskDetailSkeleton />;
  }

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-800/30 dark:text-red-300 dark:border-red-600';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-800/30 dark:text-orange-300 dark:border-orange-600';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-800/30 dark:text-yellow-300 dark:border-yellow-600';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-800/30 dark:text-green-300 dark:border-green-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-800/30 dark:text-green-300 dark:border-green-600';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-800/30 dark:text-blue-300 dark:border-blue-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-800/30 dark:text-yellow-300 dark:border-yellow-600';
      case 'archived':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700/50 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    if (!isMounted) return 'Loading...';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const isDueSoon = (dueDate: string | null) => {
    if (!dueDate || !isMounted) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffInHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 48 && diffInHours >= 0;
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate || !isMounted) return false;
    // Use local timezone to match user's actual date
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    return dueDate < todayStr;
  };

  const isDueToday = (dueDate: string | null) => {
    if (!dueDate || !isMounted) return false;
    // Use local timezone to match user's actual date
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    return dueDate === todayStr;
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: newStatus,
          due_date: task.due_date,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.task) {
        toast.success('Task status updated successfully');
        onTaskUpdate?.();
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = async (data: TaskFormData) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title.trim(),
          description: data.description?.trim() || null,
          priority: data.priority,
          status: data.status,
          due_date: data.due_date ? data.due_date : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.task) {
        toast.success('Task updated successfully');
        setIsEditDialogOpen(false);
        onTaskUpdate?.();
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) {
        toast.error('Failed to delete task');
        return;
      }

      toast.success('Task deleted successfully');
      router.push('/tasks');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in-50 duration-500">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Link href="/tasks">
          <Button variant="outline" size="sm" className="group hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 border-gray-300 dark:border-gray-600">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Tasks
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge 
            className={`${getPriorityColor(task.priority)} border shadow-sm`}
          >
            <Flag className="w-3 h-3 mr-1" />
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          <Badge 
            className={`${getStatusColor(task.status)} border shadow-sm`}
          >
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Main Task Card */}
      <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800">
        {/* Priority Indicator */}
        <div className={`h-2 ${
          task.priority === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600' :
          task.priority === 'high' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
          task.priority === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
          'bg-gradient-to-r from-green-500 to-green-600'
        }`} />
        
        <CardHeader className="pb-6">
          <div className="space-y-6">
            {/* Title Section */}
            <div className="space-y-4">
              <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {task.title}
              </CardTitle>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Due:</span>
                  <span className={isOverdue(task.due_date) ? 'text-red-600 font-semibold' : ''}>
                    {formatDate(task.due_date)}
                  </span>
                  {task.due_date && (
                    <div className="flex gap-2 ml-2">
                      {isOverdue(task.due_date) && (
                        <Badge variant="destructive" className="text-xs px-2 py-1 animate-pulse">
                          Overdue
                        </Badge>
                      )}
                      {isDueToday(task.due_date) && !isOverdue(task.due_date) && (
                        <Badge className="text-xs px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white animate-pulse">
                          Due Today
                        </Badge>
                      )}
                      {isDueSoon(task.due_date) && !isOverdue(task.due_date) && !isDueToday(task.due_date) && (
                        <Badge variant="outline" className="text-xs px-2 py-1 border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:bg-orange-900/20">
                          Due Soon
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Created:</span>
                  <span>{isMounted ? format(new Date(task.inserted_at), 'MMM dd, yyyy') : 'Loading...'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Description */}
          {task.description && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Description
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              {task.status === 'pending' && (
                <Button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Task
                </Button>
              )}
              
              {task.status === 'in_progress' && (
                <Button
                  onClick={() => handleStatusChange('done')}
                  disabled={isUpdating}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(true)}
                disabled={isUpdating || isDeleting}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isUpdating || isDeleting}
                    className="hover:bg-red-700 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Task
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">Delete Task</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
                      Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{task.title}"</span>? 
                      <br />
                      <span className="text-red-600 dark:text-red-400 font-medium">This action cannot be undone.</span>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-3">
                    <AlertDialogCancel className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 transition-all duration-200"
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <div className="flex items-center">
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deleting...
                        </div>
                      ) : (
                        'Delete Task'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Edit Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            initialData={{
              title: task.title,
              description: task.description || '',
              due_date: task.due_date || '',
              priority: task.priority,
              status: task.status,
            }}
            onSubmit={handleEdit}
            onCancel={() => setIsEditDialogOpen(false)}
            isLoading={isUpdating}
            submitButtonText="Save Changes"
            title="Edit Task"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
