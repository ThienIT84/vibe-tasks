import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import TaskDetail from '@/components/tasks/TaskDetail';
import { Task } from '@/types/task';

interface TaskPageProps {
  params: {
    id: string;
  };
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

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !task) {
    return null;
  }

  return task;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const task = await getTask(params.id);

  if (!task) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TaskDetail task={task} />
    </div>
  );
}