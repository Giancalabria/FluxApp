import { supabase } from "../lib/supabase";

export const financialProfileService = {
  async listByUser(userId) {
    if (!userId) return { data: [], error: null };
    const { data, error } = await supabase
      .from("financial_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    return { data: data ?? [], error };
  },

  async create(row) {
    const { data, error } = await supabase
      .from("financial_profiles")
      .insert(row)
      .select()
      .single();
    return { data, error };
  },

  async updateName(id, name) {
    const trimmed = String(name).trim();
    if (trimmed.length < 1 || trimmed.length > 64) {
      return {
        data: null,
        error: { message: "Name must be 1–64 characters." },
      };
    }
    const { data, error } = await supabase
      .from("financial_profiles")
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },
};
