import { notFound, redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import TaskDetailClient from '@/components/tasks/TaskDetailClient';
import { Task } from '@/types/task';

interface TaskPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getTask(id: string): Promise<Task | null> {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect('/sign-in');
  }

  // Fetch task by ID, scoped by user_id
  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !task) {
    return null;
  }

  return task as Task;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const resolvedParams = await params;
  const task = await getTask(resolvedParams.id);

  if (!task) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <TaskDetailClient initialTask={task} />
      </div>
    </div>
  );
}