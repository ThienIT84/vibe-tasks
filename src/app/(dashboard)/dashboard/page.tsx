'use client'
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Plus, Clock, CheckCircle, Circle, LogOut, User, Mail } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string
}

type TaskStatus = "pending" | "in_progress" | "done" | "archived"
type Task = { id: string; user_id: string; title: string; description: string | null; status: TaskStatus; inserted_at: string; updated_at: string }

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "pending" as TaskStatus, due_date: "" })
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [counts, setCounts] = useState<{ pending: number; inProgress: number; done: number }>({ pending: 0, inProgress: 0, done: 0 })
  const [tasks, setTasks] = useState<Task[]>([])
  const [isFetchingTasks, setIsFetchingTasks] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const router = useRouter()
  const hasInitializedRef = useRef(false)
  const isFetchingCountsRef = useRef(false)

  // Fetch user profile data
  useEffect(() => {
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
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
        }
        if (profile) setUserProfile(profile)

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
  }, [router])

  const fetchTaskCounts = async () => {
    if (isFetchingCountsRef.current) return
    isFetchingCountsRef.current = true
    try {
      const next = { pending: 0, inProgress: 0, done: 0 }

      const [p, ip, d] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'done'),
      ])

      if (p.error) console.warn('pending count error', p.error)
      if (ip.error) console.warn('in_progress count error', ip.error)
      if (d.error) console.warn('done count error', d.error)

      next.pending = p.count ?? 0
      next.inProgress = ip.count ?? 0
      next.done = d.count ?? 0
      setCounts(next)
    } catch (e) {
      console.error('Failed to fetch counts', e)
    } finally {
      isFetchingCountsRef.current = false
    }
  }

  const fetchTasks = async () => {
    try {
      setIsFetchingTasks(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('inserted_at', { ascending: false })
      if (error) {
        console.error('Error fetching tasks:', error)
        return
      }
      setTasks((data as Task[]) || [])
    } catch (e) {
      console.error('Failed to fetch tasks', e)
    } finally {
      setIsFetchingTasks(false)
    }
  }

  const handleCreateOrUpdateTask = async () => {
    try {
      setIsCreating(true)
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: newTask.title.trim(),
            description: newTask.description.trim() || null,
            status: newTask.status,
            due_date: newTask.due_date ? newTask.due_date : null,
          })
          .eq('id', editingTask.id)
        if (error) {
          toast.error(error.message || 'Failed to update task')
          return
        }
        toast.success('Task updated successfully!')
      } else {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          toast.error('Unauthorized')
          return
        }
        const { error } = await supabase
          .from('tasks')
          .insert([
            {
              user_id: user.id,
              title: newTask.title.trim(),
              description: newTask.description.trim() || null,
              status: newTask.status,
              due_date: newTask.due_date ? newTask.due_date : null,
            },
          ])
        if (error) {
          toast.error(error.message || 'Failed to create task')
          return
        }
        toast.success('Task created successfully!')
      }
      setIsDialogOpen(false)
      setNewTask({ title: '', description: '', status: 'pending' })
      setEditingTask(null)
      await Promise.all([fetchTaskCounts(), fetchTasks()])
    } catch (e: any) {
      toast.error(e?.message || 'Unexpected error')
    } finally {
      setIsCreating(false)
    }
  }

  const openEditTask = (task: Task) => {
    setEditingTask(task)
    setNewTask({ title: task.title, description: task.description ?? '', status: task.status, due_date: (task as any).due_date ?? '' })
    setIsDialogOpen(true)
  }

  const handleDeleteTask = async (task: Task) => {
    const confirmDelete = window.confirm(`Delete task "${task.title}"?`)
    if (!confirmDelete) return
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id)
      if (error) {
        toast.error(error.message || 'Failed to delete task')
        return
      }
      toast.success('Task deleted')
      await Promise.all([fetchTaskCounts(), fetchTasks()])
    } catch (e: any) {
      toast.error(e?.message || 'Unexpected error')
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        toast.error('Error signing out')
        return
      }
      toast.success('Signed out successfully')
      router.push('/sign-in')
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSigningOut(false)
    }
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
                  <Input id="task-title" placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="task-desc">Description</label>
                  <Textarea id="task-desc" placeholder="Task description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="task-due">Due Date</label>
                    <Input id="task-due" type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={newTask.status} onValueChange={(v: TaskStatus) => setNewTask({ ...newTask, status: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingTask(null); }} disabled={isCreating}>Cancel</Button>
                <Button onClick={handleCreateOrUpdateTask} disabled={isCreating || !newTask.title.trim()}>
                  {isCreating ? (editingTask ? 'Saving...' : 'Creating...') : (editingTask ? 'Save' : 'Create')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </Button>
        </div>
      </div>

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

      {/* Task Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold">{counts.pending}</p>
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
                <p className="text-3xl font-bold">{counts.inProgress}</p>
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
                <p className="text-3xl font-bold">{counts.done}</p>
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
                      <td className="py-3 pr-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="py-3"><div className="flex justify-end gap-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-16" /></div></td>
                    </tr>
                  ))
                ) : tasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted-foreground">No tasks yet</td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="border-b">
                      <td className="py-3 pr-4 align-top max-w-[280px] truncate">{task.title}</td>
                      <td className="py-3 pr-4 align-top max-w-[480px] truncate">{task.description}</td>
                      <td className="py-3 pr-4 align-top capitalize">{task.status.replace('_', ' ')}</td>
                      <td className="py-3 align-top">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditTask(task)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteTask(task)}>Delete</Button>
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
