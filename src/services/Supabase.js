import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isLoggedIn = () => {
  return !!supabase.auth.currentUser;
};

export const currentUser = () => {
  return supabase.auth.currentUser;
};
