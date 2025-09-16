'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Plus, Clock, CheckCircle, Circle, LogOut, User, Mail, RefreshCw } from "lucide-react"

// Custom hooks and utilities
import { useAuth, useProfile, useTasks, useTaskCounts, useIsMounted } from "@/lib/hooks"
import { TASK_STATUSES, TASK_PRIORITIES, TASK_PRIORITY_COLORS, TOAST_MESSAGES } from "@/lib/constants"
import { getInitials, truncateText } from "@/lib/utils"
import type { TaskStatus, TaskPriority, CreateTaskInput } from "@/types/task"

export default function Dashboard() {
  // State
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [newTask, setNewTask] = useState<CreateTaskInput>({
    title: "",
    description: "",
    status: TASK_STATUSES.PENDING,
    priority: TASK_PRIORITIES.MEDIUM,
    due_date: ""
  })

  // Hooks
  const router = useRouter()
  const isMounted = useIsMounted()
  const { user, signOut } = useAuth()
  const { profile, fetchProfile } = useProfile()
  const { tasks, isLoading: tasksLoading, fetchTasks, createTask, updateTask, deleteTask } = useTasks()
  const { counts, isLoading: countsLoading, fetchCounts } = useTaskCounts()

  // Redirect if not authenticated
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/sign-in')
    return null
  }

  // Load data on mount
  if (profile === null) {
    fetchProfile(user.id)
  }

  // Handlers
  const handleCreateOrUpdateTask = async () => {
    try {
      setIsCreating(true)
      
      if (editingTask) {
        await updateTask(editingTask.id, newTask)
      } else {
        await createTask(newTask)
      }
      
      setIsDialogOpen(false)
      setNewTask({
        title: "",
        description: "",
        status: TASK_STATUSES.PENDING,
        priority: TASK_PRIORITIES.MEDIUM,
        due_date: ""
      })
      setEditingTask(null)
      
      // Refresh counts
      await fetchCounts()
    } catch (error) {
      console.error('Error handling task:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteTask = async (task: any) => {
    const confirmDelete = window.confirm(`Delete task "${task.title}"?`)
    if (!confirmDelete) return
    
    try {
      setIsDeleting(task.id)
      await deleteTask(task.id)
      await fetchCounts()
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setIsDeleting(null)
    }
  }

  const openEditTask = (task: any) => {
    setEditingTask(task)
    setNewTask({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || ''
    })
    setIsDialogOpen(true)
  }

  const handleRefresh = async () => {
    await Promise.all([fetchCounts(), fetchTasks()])
  }

  // Loading state
  if (tasksLoading && tasks.length === 0) {
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your task progress and manage your workflow
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={countsLoading || tasksLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${countsLoading || tasksLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isCreating}>
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? "Creating..." : "Create Task"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Create Task'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="task-title">Title</label>
                  <Input 
                    id="task-title" 
                    placeholder="Task title" 
                    value={newTask.title} 
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="task-desc">Description</label>
                  <Textarea 
                    id="task-desc" 
                    placeholder="Task description" 
                    value={newTask.description} 
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="task-due">Due Date</label>
                    <Input 
                      id="task-due" 
                      type="date" 
                      value={newTask.due_date} 
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select 
                      value={newTask.priority} 
                      onValueChange={(value: TaskPriority) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TASK_PRIORITIES.LOW}>Low</SelectItem>
                        <SelectItem value={TASK_PRIORITIES.MEDIUM}>Medium</SelectItem>
                        <SelectItem value={TASK_PRIORITIES.HIGH}>High</SelectItem>
                        <SelectItem value={TASK_PRIORITIES.URGENT}>Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select 
                      value={newTask.status} 
                      onValueChange={(value: TaskStatus) => setNewTask({ ...newTask, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={TASK_STATUSES.PENDING}>Pending</SelectItem>
                        <SelectItem value={TASK_STATUSES.IN_PROGRESS}>In Progress</SelectItem>
                        <SelectItem value={TASK_STATUSES.DONE}>Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => { 
                    setIsDialogOpen(false)
                    setEditingTask(null)
                    setNewTask({
                      title: "",
                      description: "",
                      status: TASK_STATUSES.PENDING,
                      priority: TASK_PRIORITIES.MEDIUM,
                      due_date: ""
                    })
                  }} 
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateOrUpdateTask} 
                  disabled={isCreating || !newTask.title.trim()}
                >
                  {isCreating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editingTask ? 'Saving...' : 'Creating...'}
                    </div>
                  ) : (
                    editingTask ? 'Save' : 'Create'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* User Profile */}
      {profile && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage 
                  src={profile.avatar_url} 
                  alt={profile.full_name || profile.email}
                />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.full_name || profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold truncate">
                    {profile.full_name || 'No name provided'}
                  </h3>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                {countsLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                    <Skeleton className="h-8 w-12" />
                  </div>
                ) : (
                  <p className="text-3xl font-bold">{counts.pending}</p>
                )}
              </div>
              <Circle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                {countsLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mr-2"></div>
                    <Skeleton className="h-8 w-12" />
                  </div>
                ) : (
                  <p className="text-3xl font-bold">{counts.inProgress}</p>
                )}
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Done</p>
                {countsLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500 mr-2"></div>
                    <Skeleton className="h-8 w-12" />
                  </div>
                ) : (
                  <p className="text-3xl font-bold">{counts.done}</p>
                )}
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
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
                {tasksLoading ? (
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
                    <td colSpan={5} className="py-6 text-center text-muted-foreground">No tasks yet</td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="border-b">
                      <td className="py-3 pr-4 align-top max-w-[280px] truncate">{task.title}</td>
                      <td className="py-3 pr-4 align-top max-w-[480px] truncate">{task.description}</td>
                      <td className="py-3 pr-4 align-top">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${TASK_PRIORITY_COLORS[task.priority]}`}>
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
                            disabled={isDeleting === task.id}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteTask(task)}
                            disabled={isDeleting === task.id}
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
  )
}
