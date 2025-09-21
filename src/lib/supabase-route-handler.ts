import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function createRouteHandlerSupabaseClient(request?: NextRequest) {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In route handlers, we can't modify cookies directly
          // The session should be handled by the client-side
          cookiesToSet.forEach(({ name, value, options }) => {
            // This is a no-op in route handlers
            // Cookies are managed by the client-side Supabase client
          });
        },
      },
    }
  );
}
