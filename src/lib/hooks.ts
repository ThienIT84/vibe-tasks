/**
 * Custom React hooks for the Vibe Tasks application
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'
import { toast } from 'sonner'
import type { UserProfile, Task, TaskCounts } from '@/types/task'

// =============================================
// AUTHENTICATION HOOKS
// =============================================

/**
 * Hook to manage user authentication state
 */
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Convert Supabase User to UserProfile
          const userProfile: UserProfile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            created_at: user.created_at,
            updated_at: user.updated_at
          }
          setUser(userProfile)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error getting user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(  
      (event, session) => {
        if (session?.user) {
          // Convert Supabase User to UserProfile
          const userProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || '',
            avatar_url: session.user.user_metadata?.avatar_url || '',
            created_at: session.user.created_at,
            updated_at: session.user.updated_at
          }
          setUser(userProfile)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/sign-in')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Failed to sign out')
    }
  }

  return { user, isLoading, signOut }
}

// =============================================
// PROFILE HOOKS
// =============================================

/**
 * Hook to manage user profile
 */
export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (userId: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: '',
              full_name: '',
              avatar_url: ''
            })
            .select()
            .single()

          if (createError) {
            throw createError
          }
          setProfile(newProfile)
        } else {
          throw fetchError
        }
      } else {
        setProfile(data)
      }
    } catch (err: unknown) {
      console.error('Error fetching profile:', err)
      setError((err as Error)?.message || 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!profile) return

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)

      if (error) throw error

      setProfile(prev => prev ? { ...prev, ...updates } : null)
      toast.success('Profile updated successfully!')
    } catch (err: unknown) {
      console.error('Error updating profile:', err)
      toast.error((err as Error)?.message || 'Failed to update profile')
    }
  }

  return { profile, isLoading, error, fetchProfile, updateProfile }
}

// =============================================
// TASK HOOKS
// =============================================

/**
 * Hook to manage tasks
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .order('inserted_at', { ascending: false })

      if (fetchError) throw fetchError
      setTasks(data || [])
    } catch (err: unknown) {
      console.error('Error fetching tasks:', err)
      setError((err as Error)?.message || 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'inserted_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()

      if (error) throw error

      setTasks(prev => [data[0], ...prev])
      toast.success('Task created successfully!')
      return data[0]
    } catch (err: unknown) {
      console.error('Error creating task:', err)
      toast.error((err as Error)?.message || 'Failed to create task')
      throw err
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()

      if (error) throw error

      setTasks(prev => prev.map(task => task.id === id ? data[0] : task))
      toast.success('Task updated successfully!')
      return data[0]
    } catch (err: unknown) {
      console.error('Error updating task:', err)
      toast.error((err as Error)?.message || 'Failed to update task')
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTasks(prev => prev.filter(task => task.id !== id))
      toast.success('Task deleted successfully!')
    } catch (err: unknown) {
      console.error('Error deleting task:', err)
      toast.error((err as Error)?.message || 'Failed to delete task')
      throw err
    }
  }

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask
  }
}

// =============================================
// TASK COUNTS HOOK
// =============================================

/**
 * Hook to manage task counts
 */
export function useTaskCounts() {
  const [counts, setCounts] = useState<TaskCounts>({ pending: 0, inProgress: 0, done: 0 })
  const [isLoading, setIsLoading] = useState(false)

  const fetchCounts = async () => {
    try {
      setIsLoading(true)

      const [pending, inProgress, done] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'done'),
      ])

      setCounts({
        pending: pending.count || 0,
        inProgress: inProgress.count || 0,
        done: done.count || 0
      })
    } catch (error) {
      console.error('Error fetching task counts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return { counts, isLoading, fetchCounts }
}

// =============================================
// UTILITY HOOKS
// =============================================

/**
 * Hook to prevent hydration mismatch
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}

/**
 * Hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook for local storage
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue] as const
}
