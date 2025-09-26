/**
 * Type definitions for the Vibe Tasks application
 */

// =============================================
// ENUMS AND TYPES
// =============================================

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'archived';
export type DueTimeType = 'next_hour' | '2_hours' | '4_hours' | '8_hours' | 'custom';

// =============================================
// CORE INTERFACES
// =============================================

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null; // ISO timestamp string
  due_time_type: DueTimeType;
  priority: TaskPriority;
  status: TaskStatus;
  inserted_at: string; // ISO timestamp
  updated_at: string;  // ISO timestamp
}

// =============================================
// INPUT/OUTPUT INTERFACES
// =============================================

export interface CreateTaskInput {
  title: string;
  description?: string;
  due_date?: string | null;
  due_time_type?: DueTimeType;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  due_time_type?: DueTimeType;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface UpdateProfileInput {
  full_name?: string;
  avatar_url?: string;
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface TaskCounts {
  pending: number;
  inProgress: number;
  done: number;
}

// =============================================
// UTILITY TYPES
// =============================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface FormState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
