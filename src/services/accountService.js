import { supabase } from "../lib/supabase";

export const accountService = {
  async getAll(financialProfileId) {
    let q = supabase
      .from("accounts")
      .select("*")
      .order("created_at", { ascending: false });
    if (financialProfileId)
      q = q.eq("financial_profile_id", financialProfileId);
    const { data, error } = await q;
    return { data, error };
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async create(account) {
    const { data, error } = await supabase
      .from("accounts")
      .insert(account)
      .select()
      .single();
    return { data, error };
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from("accounts")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async remove(id) {
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    return { error };
  },
};
