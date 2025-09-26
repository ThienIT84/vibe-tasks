'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { taskSchema, TaskFormData } from '@/lib/schemas/task';
import { TaskPriority, TaskStatus, DueTimeType } from '@/types/task';
import { calculateDueTime, getDueTimeTypeOptions } from '@/lib/time-utils';
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
  const [dueTimeType, setDueTimeType] = useState<DueTimeType>('custom');
  const [customDateTime, setCustomDateTime] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      due_date: initialData?.due_date || '',
      due_time_type: initialData?.due_time_type || 'custom',
      priority: initialData?.priority || 'medium',
      status: initialData?.status || 'pending',
    },
  });

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Initialize due time type and custom date time
  useEffect(() => {
    if (initialData?.due_time_type) {
      setDueTimeType(initialData.due_time_type);
    }
    if (initialData?.due_date) {
      // Convert UTC date to local datetime-local format
      const date = new Date(initialData.due_date);
      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      setCustomDateTime(localDateTime.toISOString().slice(0, 16));
    }
  }, [initialData]);

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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-6">
        {/* Title Section */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2" htmlFor="title">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Task Title *
          </label>
          <Input
            id="title"
            placeholder="Enter a descriptive task title..."
            {...form.register('title')}
            disabled={isFormLoading}
            className="h-12 text-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {form.formState.errors.title.message}
            </p>
          )}
        </div>

        {/* Description Section */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2" htmlFor="description">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Description
          </label>
          <Textarea
            id="description"
            placeholder="Add more details about this task..."
            rows={4}
            {...form.register('description')}
            disabled={isFormLoading}
            className="border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none"
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
              {form.formState.errors.description.message}
            </p>
          )}
        </div>

        {/* Priority, Status, and Due Date */}
        <div className="space-y-6">
          {/* Priority */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Priority *
            </label>
            <Select
              value={form.watch('priority')}
              onValueChange={(value: TaskPriority) => form.setValue('priority', value)}
              disabled={isFormLoading}
            >
              <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low" className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Low Priority
                </SelectItem>
                <SelectItem value="medium" className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Medium Priority
                </SelectItem>
                <SelectItem value="high" className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  High Priority
                </SelectItem>
                <SelectItem value="urgent" className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Urgent Priority
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.priority && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.priority.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Status *
            </label>
            <Select
              value={form.watch('status')}
              onValueChange={(value: TaskStatus) => form.setValue('status', value)}
              disabled={isFormLoading}
            >
              <SelectTrigger className="h-12 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending" className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Pending
                </SelectItem>
                <SelectItem value="in_progress" className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  In Progress
                </SelectItem>
                <SelectItem value="done" className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Done
                </SelectItem>
                <SelectItem value="archived" className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  Archived
                </SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.status.message}
              </p>
            )}
          </div>

          {/* Deadline */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              Deadline
            </label>
            
            {/* Quick Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {getDueTimeTypeOptions().map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={dueTimeType === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setDueTimeType(option.value as DueTimeType);
                    if (option.value !== 'custom') {
                      const calculatedTime = calculateDueTime(option.value as DueTimeType);
                      form.setValue('due_date', calculatedTime.toISOString());
                      form.setValue('due_time_type', option.value as DueTimeType);
                    } else {
                      form.setValue('due_date', customDateTime);
                      form.setValue('due_time_type', 'custom');
                    }
                  }}
                  disabled={isFormLoading}
                  className="flex items-center gap-2 text-xs h-10"
                >
                  <span className="text-sm">{option.icon}</span>
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              ))}
            </div>
            
            {/* Custom DateTime Picker */}
            {dueTimeType === 'custom' && (
              <div className="space-y-2">
                <Input
                  type="datetime-local"
                  value={customDateTime}
                  onChange={(e) => {
                    setCustomDateTime(e.target.value);
                    // Convert local datetime to UTC ISO string
                    if (e.target.value) {
                      const localDate = new Date(e.target.value);
                      form.setValue('due_date', localDate.toISOString());
                    } else {
                      form.setValue('due_date', '');
                    }
                    form.setValue('due_time_type', 'custom');
                  }}
                  disabled={isFormLoading}
                  className="h-12 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose specific date and time
                </p>
              </div>
            )}
            
            {/* Show selected deadline */}
            {form.watch('due_date') && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Selected:</span> {form.watch('due_date') && isMounted ? new Date(form.watch('due_date')!).toLocaleString('vi-VN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                  }) : 'Loading...'}
                </p>
              </div>
            )}
            
            {form.formState.errors.due_date && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                {form.formState.errors.due_date.message}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isFormLoading}
            className="h-12 px-6 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isFormLoading}
            className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
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
    </div>
  );
}
