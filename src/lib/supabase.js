import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Use the Service Role Key globally if available to bypass all RLS constraints for local dev/testing
const activeKey = supabaseServiceRoleKey || supabaseAnonKey;

if (supabaseServiceRoleKey) {
  console.log("[DEBUG] Supabase client initialized with Service Role Key (RLS Bypassed Globally)");
} else {
  console.warn("[WARNING] Service Role Key missing, falling back to Anon Key (RLS Active)");
}

const supabase = createClient(supabaseUrl, activeKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

const supabaseAdmin = supabase;

export { supabase, supabaseAdmin };

// AUTH HELPERS
export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
