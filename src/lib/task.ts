import { supabase } from '@/lib/supabase';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@/types/task';

type GetTasksParams = {
  status?: TaskStatus;
  search?: string;
  limit?: number;
  from?: number;
  to?: number;
  sortBy?: 'due_date' | 'inserted_at' | 'updated_at';
  sortDir?: 'asc' | 'desc';
};

export async function getTasks(params: GetTasksParams = {}): Promise<Task[]> {
  const {
    status,
    search,
    limit = 50,
    from = 0,
    to = limit - 1,
    sortBy = 'due_date',
    sortDir = 'asc',
  } = params;

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr) throw authErr;
  if (!user) throw new Error('Not authenticated');

  let query = supabase.from('tasks').select('*').eq('user_id', user.id);

  if (status) query = query.eq('status', status);
  if (search && search.trim()) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  query = query.order(sortBy, { ascending: sortDir === 'asc' }).range(from, to);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Task[];
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const payload = {
    user_id: user.id,
    title: input.title,
    description: input.description ?? null,
    due_date: input.due_date ?? null,
    priority: input.priority ?? 'medium',
    status: input.status ?? 'pending',
  };

  const { data, error } = await supabase.from('tasks').insert(payload).select('*').single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(id: string, patch: UpdateTaskInput): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}
