'use client'
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import Link from "next/link"
import { CheckCircle, Users, Calendar, Target, ArrowRight, CheckSquare } from "lucide-react"

export default function Home() {
  const [result, setResult] = useState<string>("Chưa kiểm tra")
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
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Vibe Tasks
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mini Team Task Manager — Vibe-coding MVP
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/tasks">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <CheckSquare className="mr-2 h-4 w-4" />
              Manage Tasks
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Team Collaboration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Work together seamlessly with your team on shared tasks and projects.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Task Scheduling</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Organize and schedule your tasks with intuitive calendar integration.
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-lg">Goal Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Set and track your team&apos;s goals with progress monitoring and analytics.
            </p>
          </CardContent>
        </Card>
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
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">Active Tasks</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">Team Members</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-xs text-muted-foreground">Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
