import { supabase } from "../lib/supabase";

export const userCurrencyService = {
  async getAll(userId) {
    if (!userId) return { data: [], error: null };
    const { data, error } = await supabase
      .from("user_currencies")
      .select("*")
      .eq("user_id", userId)
      .order("display_order", { ascending: true });
    return { data: data ?? [], error };
  },

  async add(userId, currencyCode) {
    const { data: existing } = await supabase
      .from("user_currencies")
      .select("display_order")
      .eq("user_id", userId)
      .order("display_order", { ascending: false })
      .limit(1);
    const nextOrder = existing?.length ? existing[0].display_order + 1 : 0;
    const { data, error } = await supabase
      .from("user_currencies")
      .insert({
        user_id: userId,
        currency_code: currencyCode,
        display_order: nextOrder,
      })
      .select()
      .single();
    return { data, error };
  },

  async remove(userId, currencyCode) {
    const { error } = await supabase
      .from("user_currencies")
      .delete()
      .eq("user_id", userId)
      .eq("currency_code", currencyCode);
    return { error };
  },
};
