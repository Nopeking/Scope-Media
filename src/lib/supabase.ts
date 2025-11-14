import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check required environment variables (only in browser/client-side)
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  console.error(
    `Required Supabase environment variables are not set. Missing: ${missingVars.join(', ')}. ` +
    'Please check your .env.local file.'
  );
}

// Client for public access (e.g., fetching data on client-side)
// Only create client if we have valid environment variables
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

// Client for admin access (e.g., server-side operations with service role key)
// Only create admin client if service role key is available (server-side only)
export const supabaseAdmin = supabaseServiceRoleKey && supabaseUrl
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

// Helper function to get admin client (throws error if not available)
export function getSupabaseAdmin() {
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not available. This function can only be used server-side.');
  }
  return supabaseAdmin!;
}
