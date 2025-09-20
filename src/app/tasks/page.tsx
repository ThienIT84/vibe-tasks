import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import Link from 'next/link';
import TaskListClient from '@/components/tasks/TaskListClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Home, ChevronRight } from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '@/types/task';

interface TasksPageProps {
  searchParams: Promise<{
    q?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    sort?: string;
    dir?: 'asc' | 'desc';
    page?: string;
  }>;
}

async function getTasks(searchParams: Awaited<TasksPageProps['searchParams']>) {
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/sign-in');
  }

  // Build query
  let query = supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id);

  // Apply filters
  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`);
  }

  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  if (searchParams.priority) {
    query = query.eq('priority', searchParams.priority);
  }

  // Apply sorting
  const sortField = searchParams.sort || 'inserted_at';
  const sortDir = searchParams.dir || 'desc';
  query = query.order(sortField, { ascending: sortDir === 'asc' });

  // Apply pagination
  const page = parseInt(searchParams.page || '1');
  const pageSize = 10;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data: tasks, error, count } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    return { tasks: [], totalCount: 0, error: error.message };
  }

  const totalCount = count || 0;

  return {
    tasks: (tasks as Task[]) || [],
    totalCount,
    error: null,
    pagination: {
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize),
    }
  };
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const resolvedSearchParams = await searchParams;
  const { tasks, totalCount, error, pagination } = await getTasks(resolvedSearchParams);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="flex items-center hover:text-foreground">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Tasks</span>
          </nav>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground">
                Manage and organize your tasks efficiently
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Task List with Loading */}
          <TaskListClient 
            initialTasks={tasks}
            totalCount={totalCount}
            pagination={pagination}
            searchParams={resolvedSearchParams}
          />
        </div>
      </div>
    </div>
  );
}
