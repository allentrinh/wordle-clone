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

export const update = async (table: string, where: object, payload: object) => {
  const { data, error } = await supabase.from(table).update(payload).match(where);
};

export const fetchHints = async () => {
  if (!supabase.auth.user()) return 0;

  const { data, error } = await supabase
    .from("profiles")
    .select("hints")
    .eq("id", supabase.auth.user().id)
    .limit(1)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Instantiate a new instance of this user in profiles with a fresh set of hints
  if (!data && !error) {
    insert("profiles", {
      id: supabase.auth.user().id,
      hints: 10,
    });

    return 10;
  }

  return data.hints;
};
