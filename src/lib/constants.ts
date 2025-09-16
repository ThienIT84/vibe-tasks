/**
 * Application constants and configuration
 */

// =============================================
// TASK CONSTANTS
// =============================================

export const TASK_STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
  ARCHIVED: 'archived',
} as const;

export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export const TASK_STATUS_LABELS = {
  [TASK_STATUSES.PENDING]: 'Pending',
  [TASK_STATUSES.IN_PROGRESS]: 'In Progress',
  [TASK_STATUSES.DONE]: 'Done',
  [TASK_STATUSES.ARCHIVED]: 'Archived',
} as const;

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITIES.LOW]: 'Low',
  [TASK_PRIORITIES.MEDIUM]: 'Medium',
  [TASK_PRIORITIES.HIGH]: 'High',
  [TASK_PRIORITIES.URGENT]: 'Urgent',
} as const;

export const TASK_PRIORITY_COLORS = {
  [TASK_PRIORITIES.LOW]: 'bg-green-100 text-green-800',
  [TASK_PRIORITIES.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [TASK_PRIORITIES.HIGH]: 'bg-orange-100 text-orange-800',
  [TASK_PRIORITIES.URGENT]: 'bg-red-100 text-red-800',
} as const;

// =============================================
// UI CONSTANTS
// =============================================

export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export const TOAST_MESSAGES = {
  TASK_CREATED: 'Task created successfully!',
  TASK_UPDATED: 'Task updated successfully!',
  TASK_DELETED: 'Task deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SIGNED_OUT: 'Signed out successfully',
  ERROR_GENERIC: 'An unexpected error occurred',
  ERROR_UNAUTHORIZED: 'Unauthorized',
  ERROR_NETWORK: 'Network error. Please check your connection.',
} as const;

// =============================================
// API CONSTANTS
// =============================================

export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  TASK_BY_ID: (id: string) => `/api/tasks/${id}`,
} as const;

export const SUPABASE_ERROR_CODES = {
  NO_ROWS_FOUND: 'PGRST116',
  RLS_VIOLATION: '42501',
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
} as const;

// =============================================
// VALIDATION CONSTANTS
// =============================================

export const VALIDATION_RULES = {
  TASK_TITLE_MIN_LENGTH: 1,
  TASK_TITLE_MAX_LENGTH: 255,
  TASK_DESCRIPTION_MAX_LENGTH: 1000,
  PROFILE_NAME_MAX_LENGTH: 100,
  PROFILE_AVATAR_URL_MAX_LENGTH: 500,
} as const;

// =============================================
// PAGINATION CONSTANTS
// =============================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const;

// =============================================
// DATE FORMATS
// =============================================

export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss.sssZ',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
} as const;
