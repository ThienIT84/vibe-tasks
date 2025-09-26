import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServerSupabase(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    }
  );
  return supabase;
}

export async function GET(req: NextRequest) {
  const supabase = getServerSupabase(req);

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const search = searchParams.get('search') ?? undefined;

  let query = supabase.from('tasks').select('*').eq('user_id', user.id);

  if (status) query = query.eq('status', status);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  const { data, error } = await query.order('due_date', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const supabase = getServerSupabase(req);
  const body = await req.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = {
    user_id: user.id,
    title: body.title,
    description: body.description ?? null,
    due_date: body.due_date ?? null,
    due_time_type: body.due_time_type ?? 'custom',
    priority: body.priority ?? 'medium',
    status: body.status ?? 'pending',
  };

  const { data, error } = await supabase.from('tasks').insert(payload).select('*').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
