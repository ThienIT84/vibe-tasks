'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()

  // Fetch user profile data
  useEffect(() => {
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
          console.error('Error fetching profile:', error)
          // If profile doesn't exist, create a basic one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || '',
              avatar_url: user.user_metadata?.avatar_url || ''
            })
            .select()
            .single()

          if (createError) {
            console.error('Error creating profile:', createError)
            toast.error('Failed to load profile')
          } else {
            setUserProfile(newProfile)
          }
        } else {
          setUserProfile(profile)
        }
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

  const handleCreateTask = () => {
    setIsCreating(true)
    // Simulate API call
    setTimeout(() => {
      setIsCreating(false)
      // Here you would typically show a success message or redirect
    }, 2000)
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
          <Button 
            onClick={handleCreateTask}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Creating..." : "Create Task"}
          </Button>
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
                <p className="text-3xl font-bold">12</p>
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
                <p className="text-3xl font-bold">8</p>
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
                <p className="text-3xl font-bold">24</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
