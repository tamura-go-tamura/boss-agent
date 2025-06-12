import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { envConfig } from '@/config/env';

// Client-side Supabase client
export const createSupabaseClient = () => {
  return createClientComponentClient({
    supabaseUrl: envConfig.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
};

// Server-side Supabase client
export const createSupabaseServerClient = async () => {
  // Import cookies only when this function is called on the server
  const { cookies } = await import('next/headers');
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: () => cookieStore });
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

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      training_sessions: {
        Row: {
          id: string;
          user_id: string;
          boss_persona: string;
          scenario_id: string;
          stress_level: number;
          duration_minutes: number;
          score: number | null;
          feedback: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          boss_persona: string;
          scenario_id: string;
          stress_level: number;
          duration_minutes?: number;
          score?: number | null;
          feedback?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          boss_persona?: string;
          scenario_id?: string;
          stress_level?: number;
          duration_minutes?: number;
          score?: number | null;
          feedback?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      session_messages: {
        Row: {
          id: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          timestamp?: string;
          created_at?: string;
        };
      };
    };
  };
};
