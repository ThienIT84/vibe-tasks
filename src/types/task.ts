Bạn hãy tạo folder `src/types` trong project và thêm file `task.ts` với nội dung sau:

```ts
// src/types/task.ts

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'archived';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null; // ISO date string (YYYY-MM-DD)
  priority: TaskPriority;
  status: TaskStatus;
  inserted_at: string; // ISO timestamp
  updated_at: string;  // ISO timestamp
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
}
