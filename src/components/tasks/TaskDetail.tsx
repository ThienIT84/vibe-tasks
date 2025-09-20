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
  X
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/tasks">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge 
            className={`${getPriorityColor(task.priority)} border`}
          >
            <Flag className="w-3 h-3 mr-1" />
            {task.priority}
          </Badge>
          <Badge 
            className={`${getStatusColor(task.status)} border`}
          >
            {task.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Main Task Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-3xl font-bold text-gray-900">
                  {task.title}
                </CardTitle>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Due: {formatDate(task.due_date)}</span>
                  {task.due_date && (
                    <div className="flex gap-1">
                      {isOverdue(task.due_date) && (
                        <Badge variant="destructive" className="text-xs px-2 py-0.5">
                          Overdue
                        </Badge>
                      )}
                      {isDueToday(task.due_date) && !isOverdue(task.due_date) && (
                        <Badge variant="default" className="text-xs px-2 py-0.5 bg-orange-500 hover:bg-orange-600">
                          Due Today
                        </Badge>
                      )}
                      {isDueSoon(task.due_date) && !isOverdue(task.due_date) && !isDueToday(task.due_date) && (
                        <Badge variant="outline" className="text-xs px-2 py-0.5 border-orange-200 text-orange-700 bg-orange-50">
                          Due Soon
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Created: {isMounted ? format(new Date(task.inserted_at), 'MMM dd, yyyy') : 'Loading...'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {task.description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {task.status === 'pending' && (
              <Button
                onClick={() => handleStatusChange('in_progress')}
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Mark In Progress
              </Button>
            )}
            
            {task.status === 'in_progress' && (
              <Button
                onClick={() => handleStatusChange('done')}
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Done
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
              disabled={isUpdating || isDeleting}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isUpdating || isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
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
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
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
