import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchGames = async () => {
  if (!supabase.auth.user()) return { data: [] };
  return await supabase.from("games").select().eq("user_id", supabase.auth.user().id).order("id", { ascending: false });
};

export const insert = async (table: string, payload: object) => {
  const { data, error } = await supabase.from(table).insert([payload]);
};
