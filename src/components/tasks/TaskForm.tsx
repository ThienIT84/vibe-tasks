'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { taskSchema, TaskFormData } from '@/lib/schemas/task';
import { TaskPriority, TaskStatus } from '@/types/task';
import { Loader2, Save, X } from 'lucide-react';

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitButtonText?: string;
  title?: string;
}

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitButtonText = 'Create Task',
  title = 'Create Task',
}: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      due_date: initialData?.due_date || '',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'pending',
    },
  });

  const handleSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="title">
          Title *
        </label>
        <Input
          id="title"
          placeholder="Enter task title"
          {...form.register('title')}
          disabled={isFormLoading}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="description">
          Description
        </label>
        <Textarea
          id="description"
          placeholder="Enter task description"
          rows={4}
          {...form.register('description')}
          disabled={isFormLoading}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="due_date">
            Due Date
          </label>
          <Input
            id="due_date"
            type="date"
            {...form.register('due_date')}
            disabled={isFormLoading}
          />
          {form.formState.errors.due_date && (
            <p className="text-sm text-red-600">{form.formState.errors.due_date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Priority *</label>
          <Select
            value={form.watch('priority')}
            onValueChange={(value: TaskPriority) => form.setValue('priority', value)}
            disabled={isFormLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.priority && (
            <p className="text-sm text-red-600">{form.formState.errors.priority.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status *</label>
          <Select
            value={form.watch('status')}
            onValueChange={(value: TaskStatus) => form.setValue('status', value)}
            disabled={isFormLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.status && (
            <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isFormLoading}
          className="flex-1 sm:flex-none"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isFormLoading}
          className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
        >
          {isFormLoading ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isSubmitting ? 'Saving...' : 'Loading...'}
            </div>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {submitButtonText}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
