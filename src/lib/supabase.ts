import { createClient } from '@supabase/supabase-js';

const getSupabaseConfig = () => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
});

// Cliente público para lectura de datos (Revista, etc)
export const supabase = createClient(
  getSupabaseConfig().url, 
  getSupabaseConfig().anonKey,
  { auth: { persistSession: false } }
);

// Cliente de ADMINISTRACIÓN (Solo usar en Server Actions)
export const getSupabaseAdmin = () => {
  const config = getSupabaseConfig();
  return createClient(config.url, config.serviceKey, {
    auth: { persistSession: false }
  });
};
