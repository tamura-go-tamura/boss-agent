import { z } from 'zod';

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),

  // Google Cloud
  GOOGLE_CLOUD_PROJECT_ID: z.string(),
  GOOGLE_API_KEY: z.string(),
  GEMINI_API_KEY: z.string(),

  // Firebase
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string(),
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string(),

  // ADK
  ADK_ENDPOINT: z.string().url(),
  ADK_API_KEY: z.string(),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Validate and export environment variables
// 開発中はエラーを回避するため、デフォルト値を使用
export const env = envSchema.safeParse(process.env);

// デフォルト値を提供
const defaultEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://dummy.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dummy_anon_key',
  SUPABASE_SERVICE_ROLE_KEY: 'dummy_service_role_key',
  GOOGLE_CLOUD_PROJECT_ID: 'dummy-project',
  GOOGLE_API_KEY: 'dummy_google_api_key',
  GEMINI_API_KEY: 'dummy_gemini_api_key',
  NEXT_PUBLIC_FIREBASE_API_KEY: 'dummy_firebase_api_key',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'dummy-project.firebaseapp.com',
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: 'https://dummy-project.firebasedatabase.app',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'dummy-project',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'dummy-project.appspot.com',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  NEXT_PUBLIC_FIREBASE_APP_ID: '1:123456789:web:dummy',
  ADK_ENDPOINT: 'https://dummy-adk-endpoint.com',
  ADK_API_KEY: 'dummy_adk_api_key',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3001',
  NODE_ENV: 'development' as const,
};

export const envConfig = env.success ? env.data : defaultEnv;

export type Env = z.infer<typeof envSchema>;
