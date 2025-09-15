import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServerSupabase(req: Request) {
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

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase(req);
  const { data, error } = await supabase.from('tasks').select('*').eq('id', params.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase(req);
  const patch = await req.json();

  const { data, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', params.id)
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = getServerSupabase(req);
  const { error } = await supabase.from('tasks').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
