import { supabase } from "../lib/supabase";

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export const transactionService = {
  async getAll(filters = {}) {
    let query = supabase
      .from("transactions")
      .select(
        `
        *,
        account:accounts!account_id(name),
        category:categories!category_id(name, classification)
      `,
      )
      .eq("type", "expense")
      .order("date", { ascending: false });

    if (filters.financialProfileId)
      query = query.eq("financial_profile_id", filters.financialProfileId);
    if (filters.accountId) query = query.eq("account_id", filters.accountId);
    if (filters.accountIds?.length)
      query = query.in("account_id", filters.accountIds);
    if (filters.currencyCode)
      query = query.eq("currency_code", filters.currencyCode);
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);

    const rawFrom = filters.dateFrom && String(filters.dateFrom).trim();
    const rawTo = filters.dateTo && String(filters.dateTo).trim();
    if (rawFrom && rawTo && YMD.test(rawFrom) && YMD.test(rawTo)) {
      const [dateFrom, dateTo] =
        rawFrom <= rawTo ? [rawFrom, rawTo] : [rawTo, rawFrom];
      query = query.gte("date", dateFrom).lte("date", dateTo);
    }

    const { data, error } = await query;
    return { data, error };
  },

  async create(tx) {
    const row = { ...tx, type: "expense" };
    const { data, error } = await supabase
      .from("transactions")
      .insert(row)
      .select()
      .single();
    return { data, error };
  },

  async createMany(rows) {
    if (!rows?.length) return { data: [], error: null };
    const tagged = rows.map((r) => ({ ...r, type: "expense" }));
    const { data, error } = await supabase
      .from("transactions")
      .insert(tagged)
      .select();
    return { data, error };
  },

  async remove(id) {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    return { error };
  },
};
