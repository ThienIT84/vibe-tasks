import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST SESSION API ===');
    console.log('Request cookies:', request.cookies.getAll().map(c => ({ 
      name: c.name, 
      value: c.value.substring(0, 20) + '...' 
    })));

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No-op in route handlers
          },
        },
      }
    );

    // Try to get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('User result:', { user: user?.id, error: userError?.message });

    // Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Session result:', { session: session?.user?.id, error: sessionError?.message });

    return NextResponse.json({
      success: true,
      user: user ? { id: user.id, email: user.email } : null,
      session: session ? { user_id: session.user.id, expires_at: session.expires_at } : null,
      cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
    });
  } catch (error) {
    console.error('Test session error:', error);
    return NextResponse.json({ error: 'Test session failed', details: error }, { status: 500 });
  }
}
