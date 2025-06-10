import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { envConfig } from '@/config/env';

// Client-side Supabase client
export const createSupabaseClient = () => {
  return createClientComponentClient({
    supabaseUrl: envConfig.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
};

// Service role client (for admin operations)
export const createSupabaseServiceClient = () => {
  return createClient(
    envConfig.NEXT_PUBLIC_SUPABASE_URL,
    envConfig.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
