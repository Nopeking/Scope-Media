import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  // TEMPORARY: Middleware disabled - using client-side auth checks instead
  // TODO: Implement proper Supabase SSR with cookies for server-side auth
  console.log('⚠️ Middleware: Auth checks temporarily disabled - using client-side auth');
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
  ],
};
