'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, BarChart3, TrendingUp, CheckCircle, Clock, AlertCircle, ArrowLeft, Zap, Award, Target, Activity, Calendar, Users, Star, Sparkles } from 'lucide-react';
import CompletionRateChart from './CompletionRateChart';
import PriorityDistributionChart from './PriorityDistributionChart';
import ProductivityTrendsChart from './ProductivityTrendsChart';
import VelocityMetrics from './VelocityMetrics';
import StatusDistributionChart from './StatusDistributionChart';

interface AnalyticsDashboardProps {
  onBackToDashboard?: () => void;
}

interface AnalyticsData {
  completionRateOverTime: Array<{
    date: string;
    completionRate: number;
    totalTasks: number;
    completedTasks: number;
  }>;
  priorityDistribution: Array<{
    priority: string;
    count: number;
    percentage: number;
  }>;
  productivityTrends: Array<{
    date: string;
    tasksCreated: number;
    tasksCompleted: number;
  }>;
  velocityMetrics: {
    averageCompletionTime: number;
    tasksPerWeek: number;
    fastestTask: number;
    slowestTask: number;
  };
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    date: string;
    activities: number;
    created: number;
    updated: number;
  }>;
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completionRate: number;
  };
}

export default function AnalyticsDashboard({ onBackToDashboard }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="space-y-8 p-6">
          {/* Header Skeleton */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl" />
            <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Skeleton className="h-12 w-32" />
                  <div>
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
          
          {/* Summary Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-4" />
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="space-y-8">
            <div className="text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div>
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Skeleton className="h-80 w-full rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBackToDashboard && (
            <Button
              variant="outline"
              onClick={onBackToDashboard}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          )}
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Analytics</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <Card>
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
            <p className="text-gray-500">Create some tasks to see analytics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <div className="space-y-8 p-6">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 dark:border-gray-700/20 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {onBackToDashboard && (
                  <Button
                    variant="outline"
                    onClick={onBackToDashboard}
                    className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                  </Button>
                )}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Analytics Dashboard
                      </h1>
                      <p className="text-muted-foreground">Real-time insights & performance metrics</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                onClick={fetchAnalytics}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  Total Tasks
                </CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">All Time</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{analytics.summary.totalTasks}</div>
              <div className="flex items-center gap-2">
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-full" />
                </div>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">100%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                All time tasks created
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">
                  Completion Rate
                </CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Success</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{analytics.summary.completionRate}%</div>
              <div className="flex items-center gap-2">
                <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${analytics.summary.completionRate}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">{analytics.summary.completionRate}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {analytics.summary.completedTasks} of {analytics.summary.totalTasks} completed
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                  In Progress
                </CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-orange-500 animate-pulse" />
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Active</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">{analytics.summary.inProgressTasks}</div>
              <div className="flex items-center gap-2">
                <div className="w-full bg-orange-200 dark:bg-orange-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${analytics.summary.totalTasks > 0 ? (analytics.summary.inProgressTasks / analytics.summary.totalTasks) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                  {analytics.summary.totalTasks > 0 ? Math.round((analytics.summary.inProgressTasks / analytics.summary.totalTasks) * 100) : 0}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Currently working on
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  Pending
                </CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Waiting</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{analytics.summary.pendingTasks}</div>
              <div className="flex items-center gap-2">
                <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${analytics.summary.totalTasks > 0 ? (analytics.summary.pendingTasks / analytics.summary.totalTasks) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                  {analytics.summary.totalTasks > 0 ? Math.round((analytics.summary.pendingTasks / analytics.summary.totalTasks) * 100) : 0}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Waiting to start
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 dark:from-white dark:via-blue-100 dark:to-purple-100 bg-clip-text text-transparent">
              Performance Analytics
            </h2>
            <p className="text-muted-foreground">Detailed insights and trends</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Completion Rate Over Time */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Completion Rate Trend</CardTitle>
                    <p className="text-sm text-muted-foreground">Progress over time</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CompletionRateChart data={analytics.completionRateOverTime} />
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Priority Distribution</CardTitle>
                    <p className="text-sm text-muted-foreground">Task priority breakdown</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <PriorityDistributionChart data={analytics.priorityDistribution} />
              </CardContent>
            </Card>

            {/* Productivity Trends */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Productivity Trends</CardTitle>
                    <p className="text-sm text-muted-foreground">Created vs completed</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ProductivityTrendsChart data={analytics.productivityTrends} />
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Status Distribution</CardTitle>
                    <p className="text-sm text-muted-foreground">Task status overview</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <StatusDistributionChart data={analytics.statusDistribution} />
              </CardContent>
            </Card>
          </div>

          {/* Velocity Metrics */}
          <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Velocity Metrics</CardTitle>
                  <p className="text-muted-foreground">Performance and efficiency indicators</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <VelocityMetrics data={analytics.velocityMetrics} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
