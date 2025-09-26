import { z } from 'zod';
import { DueTimeType } from '@/types/task';

export const taskSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  due_date: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val || val === '') return true; // Optional field
      const date = new Date(val);
      const now = new Date();
      return date > now;
    }, 'Due date must be in the future'),
  due_time_type: z.enum(['next_hour', '2_hours', '4_hours', '8_hours', 'custom']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['pending', 'in_progress', 'done', 'archived']),
});

export type TaskFormData = z.infer<typeof taskSchema> & {
  due_time_type?: DueTimeType;
};
