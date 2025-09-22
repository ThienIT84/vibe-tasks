'use client'
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import Link from "next/link"
import { CheckCircle, Users, Calendar, Target, ArrowRight, CheckSquare, RefreshCw, Star, Zap, Shield, Code, Github, ExternalLink, TrendingUp, Award, Clock, BarChart3, Sparkles } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

interface TaskStats {
  pending: number;
  inProgress: number;
  done: number;
  total: number;
}


export default function Home() {
  const [result, setResult] = useState<string>("Chưa kiểm tra")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [taskStats, setTaskStats] = useState<TaskStats>({ pending: 0, inProgress: 0, done: 0, total: 0 })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Fix hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setIsAuthenticated(!!user)
        if (user) {
          await fetchTaskStats()
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user)
      if (session?.user) {
        fetchTaskStats()
      } else {
        setTaskStats({ pending: 0, inProgress: 0, done: 0, total: 0 })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchTaskStats = async () => {
    try {
      const [pendingRes, inProgressRes, doneRes] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'in_progress'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'done'),
      ])

      const pending = pendingRes.count || 0
      const inProgress = inProgressRes.count || 0
      const done = doneRes.count || 0
      const total = pending + inProgress + done

      setTaskStats({ pending, inProgress, done, total })
    } catch (err) {
      console.error('Error fetching task stats:', err)
    }
  }


  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchTaskStats()
      toast.success("Dữ liệu đã được cập nhật")
    } catch (err) {
      toast.error("Lỗi khi cập nhật dữ liệu")
    } finally {
      setIsRefreshing(false)
    }
  }

  const ping = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      setResult(JSON.stringify({ hasSession: !!data.session }, null, 2))
      toast.success("Kết nối Supabase OK")
    } catch (e: unknown) {
      setResult(`Lỗi: ${(e as Error)?.message ?? "unknown"}`)
      toast.error("Ping Supabase thất bại")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20" />
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="relative text-center space-y-8 py-20 px-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium shadow-lg">
            <Sparkles className="h-4 w-4" />
            Built with Next.js 15 & Supabase
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              Vibe Tasks
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Modern Task Management Platform — 
              <span className="font-semibold text-blue-600 dark:text-blue-400"> Real-time collaboration</span> meets 
              <span className="font-semibold text-purple-600 dark:text-purple-400"> intelligent productivity</span>
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="outline" size="lg" className="w-full sm:w-auto border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300">
                <CheckSquare className="mr-2 h-5 w-5" />
                View Demo
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {isMounted && <ThemeToggle />}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</div>
              <div className="text-sm text-muted-foreground">Real-time Sync</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">∞</div>
              <div className="text-sm text-muted-foreground">Scalable</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">24/7</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Choose Vibe Tasks?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with modern technologies and designed for maximum productivity
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold">Real-time Collaboration</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Work together seamlessly with live updates, instant notifications, and cross-tab synchronization powered by Supabase real-time subscriptions.
              </p>
              <div className="mt-4 flex justify-center">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <Zap className="h-3 w-3 mr-1" />
                  Live Updates
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold">Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Advanced analytics dashboard with productivity trends, completion rates, and performance metrics to optimize your workflow.
              </p>
              <div className="mt-4 flex justify-center">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Insights
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold">Enterprise Security</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground leading-relaxed">
                Bank-level security with Supabase Auth, Row Level Security (RLS), and end-to-end encryption for your sensitive data.
              </p>
              <div className="mt-4 flex justify-center">
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Secure
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Status Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-semibold">System Status</h2>
          <p className="text-muted-foreground">
            Check the health of your application and database connections
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Health Check Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Health Check
                </CardTitle>
                <Badge variant="secondary">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Nhấn nút dưới đây để kiểm tra kết nối tới Supabase.
              </p>
              <Button onClick={ping} className="w-full">
                Ping Supabase
              </Button>
              <pre className="rounded-md bg-muted p-3 text-xs overflow-x-auto max-h-32">
                {result}
              </pre>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Live Dashboard</CardTitle>
                    <p className="text-sm text-muted-foreground">Real-time task statistics</p>
                  </div>
                </div>
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 hover:bg-white/50 dark:hover:bg-gray-800/50"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="grid grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                      <Skeleton className="h-8 w-12 mx-auto mb-3" />
                      <Skeleton className="h-4 w-20 mx-auto" />
                      <Skeleton className="h-2 w-full mt-3 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : isAuthenticated ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">{taskStats.pending}</div>
                    <div className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-3">Pending Tasks</div>
                    <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${taskStats.total > 0 ? (taskStats.pending / taskStats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{taskStats.inProgress}</div>
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">In Progress</div>
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${taskStats.total > 0 ? (taskStats.inProgress / taskStats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{taskStats.done}</div>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-3">Completed</div>
                    <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${taskStats.total > 0 ? (taskStats.done / taskStats.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{taskStats.total}</div>
                    <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3">Total Tasks</div>
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-4 w-4 text-purple-500" />
                      <span className="text-xs text-purple-600 dark:text-purple-400">All Time</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-muted-foreground text-lg mb-4">Sign in to view your task statistics</p>
                  <Link href="/sign-in">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Zap className="mr-2 h-4 w-4" />
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Built with Modern Tech Stack</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Leveraging cutting-edge technologies for optimal performance and developer experience
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Code className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg">Next.js 15</h3>
            <p className="text-sm text-muted-foreground">React Framework</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg">Supabase</h3>
            <p className="text-sm text-muted-foreground">Backend & Database</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg">TypeScript</h3>
            <p className="text-sm text-muted-foreground">Type Safety</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-bold text-lg">Tailwind CSS</h3>
            <p className="text-sm text-muted-foreground">Styling</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Developers Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real feedback from developers who use Vibe Tasks
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-muted-foreground mb-6 italic">
                "The real-time synchronization is incredible! I can see updates instantly across all my devices. The code quality and architecture are top-notch."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">JS</span>
                </div>
                <div>
                  <div className="font-bold">John Smith</div>
                  <div className="text-sm text-muted-foreground">Senior Full-Stack Developer</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-muted-foreground mb-6 italic">
                "This project showcases excellent modern React patterns, TypeScript usage, and clean architecture. Perfect for demonstrating technical skills to employers."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AR</span>
                </div>
                <div>
                  <div className="font-bold">Alex Rodriguez</div>
                  <div className="text-sm text-muted-foreground">Tech Lead</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Boost Your Productivity?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of developers who trust Vibe Tasks for their project management needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <Zap className="mr-2 h-5 w-5" />
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="https://github.com" target="_blank">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-purple-600 font-bold">
                <Github className="mr-2 h-5 w-5" />
                View Source Code
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

        </div>
      </div>
    </div>
  )
}
