/**
 * Time utility functions for deadline management
 */

import { DueTimeType } from '@/types/task';

// =============================================
// TIME CALCULATION FUNCTIONS
// =============================================

/**
 * Calculate due time based on due time type
 */
export const calculateDueTime = (dueTimeType: DueTimeType): Date => {
  const now = new Date();
  
  switch (dueTimeType) {
    case 'next_hour':
      // Next hour (e.g., 8:41 → 9:41)
      return new Date(now.getTime() + 60 * 60 * 1000);
    
    case '2_hours':
      // 2 hours from now
      return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    
    case '4_hours':
      // 4 hours from now
      return new Date(now.getTime() + 4 * 60 * 60 * 1000);
    
    case '8_hours':
      // 8 hours from now
      return new Date(now.getTime() + 8 * 60 * 60 * 1000);
    
    case 'custom':
    default:
      // Return current time for custom (will be overridden by user input)
      return now;
  }
};

// =============================================
// TIME REMAINING CALCULATION
// =============================================

export interface TimeRemaining {
  isOverdue: boolean;
  timeRemaining: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  hoursRemaining: number;
  minutesRemaining: number;
}

/**
 * Calculate time remaining until due date
 */
export const getTimeRemaining = (dueDate: string): TimeRemaining => {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  
  // Calculate hours and minutes
  const totalHours = Math.floor(diff / (1000 * 60 * 60));
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const hoursRemaining = Math.max(0, totalHours);
  const minutesRemaining = Math.max(0, totalMinutes % 60);
  
  // Check if overdue
  if (diff < 0) {
    return {
      isOverdue: true,
      timeRemaining: 'Overdue',
      urgencyLevel: 'critical',
      hoursRemaining: 0,
      minutesRemaining: 0
    };
  }
  
  // Calculate time remaining string
  let timeRemaining = '';
  let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  if (totalHours > 24) {
    const days = Math.floor(totalHours / 24);
    timeRemaining = `${days} day${days > 1 ? 's' : ''} left`;
    urgencyLevel = 'low';
  } else if (totalHours > 0) {
    timeRemaining = `${hoursRemaining}h ${minutesRemaining}m left`;
    if (totalHours < 1) {
      urgencyLevel = 'critical';
    } else if (totalHours < 2) {
      urgencyLevel = 'critical';
    } else if (totalHours < 4) {
      urgencyLevel = 'high';
    } else {
      urgencyLevel = 'medium';
    }
  } else if (totalMinutes > 0) {
    timeRemaining = `${minutesRemaining}m left`;
    urgencyLevel = totalMinutes < 30 ? 'critical' : 'high';
  } else {
    timeRemaining = 'Due now';
    urgencyLevel = 'critical';
  }
  
  return {
    isOverdue: false,
    timeRemaining,
    urgencyLevel,
    hoursRemaining,
    minutesRemaining
  };
};

// =============================================
// FORMATTING FUNCTIONS
// =============================================

/**
 * Format date for display
 */
export const formatDueDate = (dueDate: string): string => {
  const date = new Date(dueDate);
  const now = new Date();
  
  // Get local timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Format dates in local timezone for comparison
  const todayStr = now.toLocaleDateString('en-CA', { timeZone }); // YYYY-MM-DD format
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString('en-CA', { timeZone });
  
  const dueDateStr = date.toLocaleDateString('en-CA', { timeZone });
  
  if (dueDateStr === todayStr) {
    return `Today at ${date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone
    })}`;
  } else if (dueDateStr === tomorrowStr) {
    return `Tomorrow at ${date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone
    })}`;
  } else {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone
    });
  }
};

/**
 * Get urgency color classes
 */
export const getUrgencyClasses = (urgencyLevel: 'low' | 'medium' | 'high' | 'critical', isOverdue: boolean = false) => {
  if (isOverdue) {
    return {
      badge: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300 border-red-200 dark:border-red-700',
      text: 'text-red-600 dark:text-red-400',
      background: 'bg-red-50 dark:bg-red-950/20'
    };
  }
  
  switch (urgencyLevel) {
    case 'critical':
      return {
        badge: 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300 border-red-200 dark:border-red-700 animate-pulse',
        text: 'text-red-600 dark:text-red-400',
        background: 'bg-red-50 dark:bg-red-950/20'
      };
    case 'high':
      return {
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-800/30 dark:text-orange-300 border-orange-200 dark:border-orange-700',
        text: 'text-orange-600 dark:text-orange-400',
        background: 'bg-orange-50 dark:bg-orange-950/20'
      };
    case 'medium':
      return {
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
        text: 'text-yellow-600 dark:text-yellow-400',
        background: 'bg-yellow-50 dark:bg-yellow-950/20'
      };
    case 'low':
    default:
      return {
        badge: 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300 border-green-200 dark:border-green-700',
        text: 'text-green-600 dark:text-green-400',
        background: 'bg-green-50 dark:bg-green-950/20'
      };
  }
};

// =============================================
// VALIDATION FUNCTIONS
// =============================================

/**
 * Validate if due date is in the future
 */
export const isDueDateValid = (dueDate: string): boolean => {
  const now = new Date();
  const due = new Date(dueDate);
  return due > now;
};

/**
 * Get due time type options for UI
 */
export const getDueTimeTypeOptions = () => [
  { value: 'next_hour', label: 'Next Hour', icon: '⏰', description: '1 hour from now' },
  { value: '2_hours', label: '2 Hours', icon: '⏱️', description: '2 hours from now' },
  { value: '4_hours', label: '4 Hours', icon: '⏲️', description: '4 hours from now' },
  { value: '8_hours', label: '8 Hours', icon: '🕐', description: '8 hours from now' },
  { value: 'custom', label: 'Custom', icon: '⚙️', description: 'Choose specific date & time' }
];
