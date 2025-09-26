'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  AlertCircle, 
  ChevronDown,
  Plus,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { useRouter } from 'next/navigation';
import { useBroadcastChannel, type BroadcastMessage } from '@/lib/hooks/broadcast';
import { supabase } from '@/lib/supabase-browser';

interface TasksTodayData {
  overdue: Task[];
  dueToday: Task[];
  totalCount: number;
}

interface TasksTodayProps {
  className?: string;
}

export default function TasksToday({ className = '' }: TasksTodayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<TasksTodayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState<string | null>(null);
  const router = useRouter();

  const fetchTodayTasks = useCallback(async () => {
    try {
      console.log('TasksToday: Starting to fetch tasks...');
      setIsLoading(true);
      
      // Check if we have a session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('TasksToday: Current session:', session ? 'exists' : 'none');
      console.log('TasksToday: Session error:', sessionError);
      console.log('TasksToday: Session details:', session);
      
      // If no session, try to refresh it
      if (!session && !sessionError) {
        console.log('TasksToday: No session found, trying to refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        console.log('TasksToday: Refresh result:', refreshedSession ? 'success' : 'failed', refreshError);
      }
      
      const response = await fetch('/api/tasks/today', {
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('TasksToday: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('TasksToday: Response error:', errorText);
        throw new Error(`Failed to fetch today tasks: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('TasksToday: Fetched tasks data:', data.tasks);
      setTasks(data.tasks);
    } catch (error) {
      console.error('TasksToday: Error fetching today tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle broadcast messages for real-time updates
  const handleBroadcastMessage = useCallback((message: BroadcastMessage) => {
    console.log('TasksToday received broadcast message:', message);
    
    switch (message.type) {
      case 'TASK_CREATED':
        console.log('TasksToday: New task created, refreshing...');
        fetchTodayTasks();
        break;
        
      case 'TASK_UPDATED':
        console.log('TasksToday: Task updated, refreshing...');
        fetchTodayTasks();
        break;
        
      case 'TASK_DELETED':
        console.log('TasksToday: Task deleted, refreshing...');
        fetchTodayTasks();
        break;
        
      case 'TASK_STATUS_CHANGED':
        console.log('TasksToday: Task status changed, updating...');
        
        // Show visual feedback for status changes
        if (message.data?.id) {
          setRecentlyUpdated(message.data.id);
          setTimeout(() => setRecentlyUpdated(null), 2000); // Clear after 2 seconds
        }
        
        // If task was marked as done, remove it from local state immediately
        if (message.data?.status === 'done' && message.data?.id) {
          setTasks(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              overdue: prev.overdue.filter(t => t.id !== message.data.id),
              dueToday: prev.dueToday.filter(t => t.id !== message.data.id),
              totalCount: prev.totalCount - 1
            };
          });
        } else {
          // For other status changes, refresh from server
          fetchTodayTasks();
        }
        break;
        
      case 'TASK_PRIORITY_CHANGED':
        console.log('TasksToday: Task priority changed, refreshing...');
        fetchTodayTasks();
        break;
    }
  }, [fetchTodayTasks]);

  const { } = useBroadcastChannel('vibe-tasks-sync', handleBroadcastMessage);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.log('TasksToday: useEffect triggered, isMounted:', isMounted);
    if (isMounted) {
      console.log('TasksToday: Calling fetchTodayTasks...');
      fetchTodayTasks();
    }
  }, [isMounted, fetchTodayTasks]);

  // Debug: Log component state
  useEffect(() => {
    console.log('TasksToday: Component state:', {
      isMounted,
      isLoading,
      tasks: tasks ? {
        totalCount: tasks.totalCount,
        overdue: tasks.overdue.length,
        dueToday: tasks.dueToday.length
      } : null
    });
  }, [isMounted, isLoading, tasks]);

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

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays === 2) {
      return '2 days ago';
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const isOverdue = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return date < startOfToday;
  };

  const isDueToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfTomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return date >= startOfToday && date < startOfTomorrow;
  };

  const handleTaskClick = (taskId: string) => {
    router.push(`/tasks/${taskId}`);
    setIsOpen(false);
  };

  const handleMarkAsDone = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent task click
    
    try {
      // Optimistic update - update UI immediately
      if (tasks) {
        setTasks(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            overdue: prev.overdue.filter(t => t.id !== taskId),
            dueToday: prev.dueToday.filter(t => t.id !== taskId),
            totalCount: prev.totalCount - 1
          };
        });
      }

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'done'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success('Task marked as done!');
      
      // Send broadcast message to update other components
      if (typeof window !== 'undefined') {
        const channel = new BroadcastChannel('vibe-tasks-sync');
        channel.postMessage({
          type: 'TASK_STATUS_CHANGED',
          data: { id: taskId, status: 'done' },
          timestamp: Date.now()
        });
        channel.close();
      }
      
      // Refresh tasks to get updated data from server
      setTimeout(() => {
        fetchTodayTasks();
      }, 500);
    } catch (error) {
      console.error('Error marking task as done:', error);
      toast.error('Failed to mark task as done');
      
      // Revert optimistic update on error
      fetchTodayTasks();
    }
  };

  if (!isMounted) {
    console.log('TasksToday: Not mounted, showing skeleton');
    return (
      <div className={`relative ${className}`}>
        <Button variant="outline" size="sm" disabled>
          <Calendar className="h-4 w-4 mr-2" />
          <Skeleton className="h-4 w-8" />
        </Button>
      </div>
    );
  }

  console.log('TasksToday: Rendering button, tasks:', tasks?.totalCount || 0);
  
  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          console.log('TasksToday: Button clicked, isOpen:', isOpen);
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Today
        {tasks && tasks.totalCount > 0 && (
          <Badge variant="destructive" className="ml-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {tasks.totalCount}
          </Badge>
        )}
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-lg border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Tasks Today</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    router.push('/tasks');
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <Skeleton className="h-4 w-4 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : !tasks || tasks.totalCount === 0 ? (
                <div className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-600 mb-1">No tasks for today</h3>
                  <p className="text-xs text-gray-500 mb-3">You're all caught up!</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      router.push('/tasks');
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Create Task
                  </Button>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {/* Overdue Section */}
                  {tasks.overdue.length > 0 && (
                    <div className="border-b">
                      <div className="px-4 py-2 bg-red-100 border-red-200">
                        <h4 className="text-sm font-medium text-red-900 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          Overdue ({tasks.overdue.length})
                        </h4>
                      </div>
                      <div className="p-2 space-y-1">
                        {tasks.overdue.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleTaskClick(task.id)}
                            className={`flex items-center space-x-3 p-2 rounded-md hover:bg-red-50 cursor-pointer transition-all duration-300 border-l-2 border-red-400 ${
                              recentlyUpdated === task.id ? 'bg-green-50 border-green-400 animate-pulse' : ''
                            }`}
                          >
                            <button
                              onClick={(e) => handleMarkAsDone(task.id, e)}
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                                task.status === 'done' 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-red-300 hover:border-green-500 hover:bg-green-50'
                              }`}
                              disabled={task.status === 'done'}
                              title={task.status === 'done' ? 'Task completed' : 'Mark as done'}
                            >
                              {task.status === 'done' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Circle className="w-3 h-3 text-red-400" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-red-900">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-red-600 font-medium">
                                  {task.due_date ? formatDate(task.due_date) : 'No due date'}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(task.priority)}`}
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Due Today Section */}
                  {tasks.dueToday.length > 0 && (
                    <div className="border-b">
                      <div className="px-4 py-2 bg-orange-50">
                        <h4 className="text-sm font-medium text-orange-800">Due Today ({tasks.dueToday.length})</h4>
                      </div>
                      <div className="p-2 space-y-1">
                        {tasks.dueToday.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleTaskClick(task.id)}
                            className={`flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-all duration-300 ${
                              recentlyUpdated === task.id ? 'bg-green-50 border-green-400 animate-pulse' : ''
                            }`}
                          >
                            <button
                              onClick={(e) => handleMarkAsDone(task.id, e)}
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                                task.status === 'done' 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                              }`}
                              disabled={task.status === 'done'}
                              title={task.status === 'done' ? 'Task completed' : 'Mark as done'}
                            >
                              {task.status === 'done' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <Circle className="w-3 h-3 text-gray-400" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {task.due_date ? formatTime(task.due_date) : 'No time'}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(task.priority)}`}
                                >
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
