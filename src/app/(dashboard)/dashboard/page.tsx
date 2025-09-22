'use client'
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Plus, Clock, CheckCircle, Circle, User, Mail, RefreshCw, CheckSquare, BarChart3 } from "lucide-react"
import TaskForm from "@/components/tasks/TaskForm"
import { TaskFormData } from "@/lib/schemas/task"
import { useBroadcastChannel, type BroadcastMessage } from "@/lib/hooks/broadcast"
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard"

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string
}

type TaskStatus = "pending" | "in_progress" | "done" | "archived"
type TaskPriority = "low" | "medium" | "high" | "urgent"
type Task = { id: string; user_id: string; title: string; description: string | null; status: TaskStatus; priority: TaskPriority; due_date: string | null; inserted_at: string; updated_at: string }

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "pending" as TaskStatus, priority: "medium" as TaskPriority, due_date: "" })
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [counts, setCounts] = useState<{ pending: number; inProgress: number; done: number }>({ pending: 0, inProgress: 0, done: 0 })
  const [tasks, setTasks] = useState<Task[]>([])
  const [isFetchingTasks, setIsFetchingTasks] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isRefreshingCounts, setIsRefreshingCounts] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const router = useRouter()
  const hasInitializedRef = useRef(false)
  const isFetchingCountsRef = useRef(false)
  const fetchTaskCountsRef = useRef<((showRefreshIndicator?: boolean) => Promise<void>) | undefined>(undefined)
  const fetchTasksRef = useRef<(() => Promise<void>) | undefined>(undefined)

  // Test session function
  const testSession = async () => {
    try {
      const response = await fetch('/api/test-session');
      const data = await response.json();
      setTestResult(data);
      console.log('Test session result:', data);
    } catch (error) {
      console.error('Test session error:', error);
      setTestResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  // Handle cross-tab communication
  const handleBroadcastMessage = useCallback((message: BroadcastMessage) => {
    console.log('Dashboard received broadcast message:', message);
    
    switch (message.type) {
      case 'TASK_CREATED':
        console.log('Dashboard: Task created, refreshing data');
        fetchTaskCountsRef.current?.(true);
        fetchTasksRef.current?.();
        break;
      case 'TASK_UPDATED':
        console.log('Dashboard: Task updated, refreshing data');
        fetchTaskCountsRef.current?.(true);
        fetchTasksRef.current?.();
        break;
      case 'TASK_DELETED':
        console.log('Dashboard: Task deleted, refreshing data');
        fetchTaskCountsRef.current?.(true);
        fetchTasksRef.current?.();
        break;
      case 'TASK_STATUS_CHANGED':
        console.log('Dashboard: Task status changed, refreshing data');
        fetchTaskCountsRef.current?.(true);
        fetchTasksRef.current?.();
        break;
      case 'TASK_PRIORITY_CHANGED':
        console.log('Dashboard: Task priority changed, refreshing data');
        fetchTaskCountsRef.current?.(true);
        fetchTasksRef.current?.();
        break;
      case 'REFRESH_DASHBOARD':
        // Force refresh dashboard
        console.log('Dashboard: Force refreshing dashboard');
        fetchTaskCountsRef.current?.(true);
        fetchTasksRef.current?.();
        break;
    }
  }, []);

  const { broadcastTaskCreated, broadcastTaskUpdated, broadcastTaskDeleted } = useBroadcastChannel(
    'vibe-tasks-sync',
    handleBroadcastMessage
  );

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])


  // Fetch user profile data
  useEffect(() => {
    if (!isMounted || hasInitializedRef.current) return
    hasInitializedRef.current = true
    const fetchUserProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        console.log('Dashboard: User check result:', { user: user?.id, error: userError?.message });
        
        if (!user) {
          console.log('Dashboard: No user found, redirecting to sign-in');
          router.push('/sign-in')
          return
        }

        // Fetch profile from profiles table
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.warn('Error fetching profile:', error)
          console.warn('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          })
          
          // If profile doesn't exist, create one
          if (error.code === 'PGRST116') {
            console.log('Profile not found, creating new profile...')
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email || '',
                full_name: '',
                avatar_url: ''
              })
              .select()
              .single()

            if (createError) {
              console.warn('Error creating profile:', createError)
              console.warn('Error details:', {
                code: createError.code,
                message: createError.message,
                details: createError.details,
                hint: createError.hint
              })
            } else if (newProfile) {
              setUserProfile(newProfile)
            }
          }
        } else if (profile) {
          setUserProfile(profile)
        } else {
          // Fallback: create a basic profile from user data
          const fallbackProfile = {
            id: user.id,
            email: user.email || '',
            full_name: '',
            avatar_url: ''
          }
          setUserProfile(fallbackProfile)
        }

        // Fetch task counters and list
        await Promise.all([fetchTaskCounts(), fetchTasks()])
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Failed to load user data')
        router.push('/sign-in')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [router, isMounted])

  const fetchTaskCounts = async (showRefreshIndicator = false) => {
    if (isFetchingCountsRef.current) return
    isFetchingCountsRef.current = true
    try {
      if (showRefreshIndicator) {
        setIsRefreshingCounts(true)
      }
      const next = { pending: 0, inProgress: 0, done: 0 }

      const [p, ip, d] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'done'),
      ])

      if (p.error) {
        console.warn('pending count error', p.error)
        toast.error('Failed to load pending tasks count')
      }
      if (ip.error) {
        console.warn('in_progress count error', ip.error)
        toast.error('Failed to load in-progress tasks count')
      }
      if (d.error) {
        console.warn('done count error', d.error)
        toast.error('Failed to load completed tasks count')
      }

      next.pending = p.count ?? 0
      next.inProgress = ip.count ?? 0
      next.done = d.count ?? 0
      setCounts(next)
    } catch (e) {
      console.error('Failed to fetch counts', e)
      toast.error('Failed to load task statistics')
    } finally {
      isFetchingCountsRef.current = false
      setIsRefreshingCounts(false)
    }
  }

  const fetchTasks = async () => {
    try {
      setIsFetchingTasks(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('inserted_at', { ascending: false })
        .limit(10) // Chỉ lấy 10 task gần đây nhất
      if (error) {
        console.error('Error fetching tasks:', error)
        toast.error('Failed to load tasks')
        return
      }
      setTasks((data as Task[]) || [])
    } catch (e) {
      console.error('Failed to fetch tasks', e)
      toast.error('Failed to load tasks')
    } finally {
      setIsFetchingTasks(false)
    }
  }

  // Update refs when functions are defined
  useEffect(() => {
    fetchTaskCountsRef.current = fetchTaskCounts;
    fetchTasksRef.current = fetchTasks;
  }, [fetchTaskCounts, fetchTasks]);

  const handleCreateOrUpdateTask = async (data: TaskFormData) => {
    try {
      setIsCreating(true)
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: data.title.trim(),
            description: data.description?.trim() || null,
            status: data.status,
            priority: data.priority,
            due_date: data.due_date ? data.due_date : null,
          })
          .eq('id', editingTask.id)
        if (error) {
          toast.error(error.message || 'Failed to update task')
          return
        }
        toast.success('Task updated successfully!')
        // Broadcast task update to other tabs
        broadcastTaskUpdated({ id: editingTask.id, ...data });
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error('Unauthorized')
          return
        }
        const { data: newTask, error } = await supabase
          .from('tasks')
          .insert([
            {
              user_id: user.id,
              title: data.title.trim(),
              description: data.description?.trim() || null,
              status: data.status,
              priority: data.priority,
              due_date: data.due_date ? data.due_date : null,
            },
          ])
          .select()
          .single()
        if (error) {
          toast.error(error.message || 'Failed to create task')
          return
        }
        toast.success('Task created successfully!')
        // Broadcast task creation to other tabs
        broadcastTaskCreated(newTask);
      }
      setIsDialogOpen(false)
      setNewTask({ title: '', description: '', status: 'pending', priority: 'medium', due_date: '' })
      setEditingTask(null)
      await Promise.all([fetchTaskCounts(true), fetchTasks()])
    } catch (e: unknown) {
      toast.error((e as Error)?.message || 'Unexpected error')
    } finally {
      setIsCreating(false)
    }
  }

  const openEditTask = (task: Task) => {
    setEditingTask(task)
    setNewTask({ title: task.title, description: task.description ?? '', status: task.status, priority: task.priority, due_date: task.due_date ?? '' })
    setIsDialogOpen(true)
  }

  const handleDeleteTask = async (task: Task) => {
    const confirmDelete = window.confirm(`Delete task "${task.title}"?`)
    if (!confirmDelete) return
    try {
      setIsDeleting(task.id)
      const { error } = await supabase.from('tasks').delete().eq('id', task.id)
      if (error) {
        toast.error(error.message || 'Failed to delete task')
        return
      }
      toast.success('Task deleted successfully')
      // Broadcast task deletion to other tabs
      broadcastTaskDeleted(task.id);
      await Promise.all([fetchTaskCounts(true), fetchTasks()])
    } catch (e: unknown) {
      toast.error((e as Error)?.message || 'Failed to delete task')
    } finally {
      setIsDeleting(null)
    }
  }


  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* User Profile Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Task List Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-16" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <div className="ml-auto flex space-x-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show Analytics Dashboard if toggled
  if (showAnalytics) {
    return <AnalyticsDashboard onBackToDashboard={() => setShowAnalytics(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8 animate-in fade-in-50 duration-700">
      {/* Modern Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl" />
        <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Track your progress and manage your workflow
                  </p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">Total Tasks:</span>
                  <span className="font-semibold">{counts.pending + counts.inProgress + counts.done}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">Completed:</span>
                  <span className="font-semibold">{counts.done}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-muted-foreground">In Progress:</span>
                  <span className="font-semibold">{counts.inProgress}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/tasks')}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                View All Tasks
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => Promise.all([fetchTaskCounts(true), fetchTasks()])}
                disabled={isRefreshingCounts || isFetchingTasks}
                className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshingCounts || isFetchingTasks ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              
              <Button 
                variant={showAnalytics ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={showAnalytics 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" 
                  : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                }
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showAnalytics ? "Hide Analytics" : "Show Analytics"}
              </Button>
              
              <Button 
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                disabled={isCreating}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "Creating..." : "Create Task"}
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
                  </DialogHeader>
                  <TaskForm
                    initialData={editingTask ? {
                      title: editingTask.title,
                      description: editingTask.description || '',
                      due_date: editingTask.due_date || '',
                      priority: editingTask.priority,
                      status: editingTask.status,
                    } : undefined}
                    onSubmit={handleCreateOrUpdateTask}
                    onCancel={() => {
                      setIsDialogOpen(false);
                      setEditingTask(null);
                    }}
                    isLoading={isCreating}
                    submitButtonText={editingTask ? 'Save Changes' : 'Create Task'}
                    title={editingTask ? 'Edit Task' : 'Create Task'}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Test Session Result */}
      {testResult && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Session Result:</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {/* User Profile */}
      {userProfile && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={userProfile.avatar_url} 
                  alt={userProfile.full_name || userProfile.email}
                />
                <AvatarFallback className="text-lg">
                  {userProfile.full_name 
                    ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                    : userProfile.email.charAt(0).toUpperCase()
                  }
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold truncate">
                    {userProfile.full_name || 'No name provided'}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground truncate">
                    {userProfile.email}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
              onClick={() => router.push('/tasks?status=pending')}
            >
              <Circle className="h-6 w-6 text-green-600" />
              <span className="text-sm font-medium">Pending Tasks</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
              onClick={() => router.push('/tasks?status=in_progress')}
            >
              <Clock className="h-6 w-6 text-orange-600" />
              <span className="text-sm font-medium">In Progress</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
              onClick={() => setShowAnalytics(true)}
            >
              <BarChart3 className="h-6 w-6 text-purple-600" />
              <span className="text-sm font-medium">Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Task Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Tasks */}
        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Circle className="h-5 w-5 text-blue-500" />
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Pending Tasks</p>
                </div>
                {isRefreshingCounts ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <Skeleton className="h-8 w-12" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{counts.pending}</p>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Waiting to start</p>
                  </div>
                )}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Circle className="h-8 w-8 text-white" />
              </div>
            </div>
            {!isRefreshingCounts && (
              <div className="mt-4">
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${counts.pending + counts.inProgress + counts.done > 0 
                        ? (counts.pending / (counts.pending + counts.inProgress + counts.done)) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Progress Tasks */}
        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">In Progress</p>
                </div>
                {isRefreshingCounts ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    <Skeleton className="h-8 w-12" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{counts.inProgress}</p>
                    <p className="text-xs text-orange-600/70 dark:text-orange-400/70">Currently working</p>
                  </div>
                )}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
            {!isRefreshingCounts && (
              <div className="mt-4">
                <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${counts.pending + counts.inProgress + counts.done > 0 
                        ? (counts.inProgress / (counts.pending + counts.inProgress + counts.done)) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">Completed</p>
                </div>
                {isRefreshingCounts ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                    <Skeleton className="h-8 w-12" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400">{counts.done}</p>
                    <p className="text-xs text-green-600/70 dark:text-green-400/70">Successfully finished</p>
                  </div>
                )}
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            {!isRefreshingCounts && (
              <div className="mt-4">
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${counts.pending + counts.inProgress + counts.done > 0 
                        ? (counts.done / (counts.pending + counts.inProgress + counts.done)) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              Today's Tasks
            </CardTitle>
            <Badge variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.filter(task => {
              if (!task.due_date) return false;
              const today = new Date().toISOString().split('T')[0];
              return task.due_date === today;
            }).length > 0 ? (
              tasks.filter(task => {
                if (!task.due_date) return false;
                const today = new Date().toISOString().split('T')[0];
                return task.due_date === today;
              }).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'urgent' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <span className="font-medium">{task.title}</span>
                  </div>
                  <Badge className={
                    task.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300'
                  }>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p>No tasks due today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Tasks (Last 10)</CardTitle>
              {!isFetchingTasks && tasks.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {tasks.length} of your most recent tasks
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/tasks')}
            >
              <CheckSquare className="h-4 w-4 mr-2" />
              View All Tasks
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isFetchingTasks ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-3 pr-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="py-3 pr-4"><Skeleton className="h-4 w-72" /></td>
                      <td className="py-3 pr-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="py-3 pr-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3"><div className="flex justify-end gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></div></td>
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">
                      No recent tasks. <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 hover:text-blue-800"
                        onClick={() => router.push('/tasks')}
                      >
                        View all tasks
                      </Button>
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="border-b">
                      <td className="py-3 pr-4 align-top max-w-[280px] truncate">{task.title}</td>
                      <td className="py-3 pr-4 align-top max-w-[480px] truncate">{task.description}</td>
                      <td className="py-3 pr-4 align-top">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 pr-4 align-top capitalize">{task.status.replace('_', ' ')}</td>
                      <td className="py-3 align-top">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => openEditTask(task)}
                            disabled={isDeleting === task.id || isUpdating === task.id}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteTask(task)}
                            disabled={isDeleting === task.id || isUpdating === task.id}
                          >
                            {isDeleting === task.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Deleting...
                              </div>
                            ) : (
                              'Delete'
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  )
}
