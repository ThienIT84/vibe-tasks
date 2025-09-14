'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { ArrowLeft, User, Image, Save, Loader2 } from "lucide-react"

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    avatar_url: ''
  })
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
          toast.error('Failed to load profile')
          return
        }

        if (profile) {
          setUserProfile(profile)
          setFormData({
            full_name: profile.full_name || '',
            avatar_url: profile.avatar_url || ''
          })
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

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('User not authenticated')
        router.push('/sign-in')
        return
      }

      // Update profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name.trim(),
          avatar_url: formData.avatar_url.trim()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to update profile')
        return
      }

      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name.trim(),
        avatar_url: formData.avatar_url.trim()
      } : null)

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = userProfile && (
    formData.full_name !== (userProfile.full_name || '') ||
    formData.avatar_url !== (userProfile.avatar_url || '')
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Back to Dashboard Link */}
          <div className="text-center">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>

          {/* Loading Card */}
          <Card>
            <CardHeader className="space-y-1 text-center">
              <div className="h-8 bg-muted animate-pulse rounded w-48 mx-auto"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-64 mx-auto"></div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
                  <div className="h-10 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
                  <div className="h-10 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="h-10 bg-muted animate-pulse rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Dashboard Link */}
        <div className="text-center">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
            <CardDescription>
              Update your personal information and avatar
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Current Profile Preview */}
            {userProfile && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={formData.avatar_url} 
                      alt={formData.full_name || userProfile.email}
                    />
                    <AvatarFallback>
                      {formData.full_name 
                        ? formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
                        : userProfile.email.charAt(0).toUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {formData.full_name || 'No name provided'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userProfile.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveChanges} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="pl-10"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Avatar URL Field */}
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="avatar_url"
                    type="url"
                    placeholder="Enter avatar image URL"
                    value={formData.avatar_url}
                    onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                    className="pl-10"
                    disabled={isSaving}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a valid image URL for your avatar
                </p>
              </div>

              {/* Save Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Changes are saved automatically to your profile
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
