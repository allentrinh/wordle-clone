import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const fetchGames = async () => {
  if (!supabase.auth.user()) return { data: [] };
  return await supabase.from("games").select().eq("user_id", supabase.auth.user().id).order("id", { ascending: false });
};

export const insert = async (table: string, payload: object) => {
  const { data, error } = await supabase.from(table).insert(payload);
};

export const update = async (table: string, where: object, payload: object) => {
  const { data, error } = await supabase.from(table).update(payload).match(where);
};

export const upsert = async (table: string, payload: object) => {
  const { data, error } = await supabase.from(table).upsert(payload);
};

export const fetchHints = async (id?: string) => {
  const userId = id ? id : supabase.auth.user().id;
  if (!userId) return 0;

  const { data, error } = await supabase.from("profiles").select("hints").eq("id", userId).limit(1).single();

  // Instantiate a new instance of this user in profiles with a fresh set of hints
  if (!data || error) {
    await insert("profiles", {
      id: userId,
      hints: 10,
    });

    return 10;
  }

  return data.hints;
};
