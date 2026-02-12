import { supabase } from '../lib/supabase';
import { todayLocal } from '../lib/dateRangePresets';

export const activityExpenseService = {
  /**
   * Fetch all expenses for an activity with paid_by member and splits.
   * Each expense has: ...expense, paid_by_member: { id, name }, splits: [{ member_id, amount, member: { id, name } }]
   */
  async getByActivityId(activityId) {
    const { data: expenses, error: expError } = await supabase
      .from('activity_expenses')
      .select(`
        *,
        paid_by_member:activity_members!paid_by_member_id(id, name),
        expense_splits(
          id,
          member_id,
          amount,
          member:activity_members!member_id(id, name)
        )
      `)
      .eq('activity_id', activityId)
      .order('date', { ascending: false });

    if (expError) return { data: null, error: expError };
    return { data: expenses ?? [], error: null };
  },

  /**
   * Create an expense and its splits in one go.
   * payload: { activity_id, paid_by_member_id, amount, description?, date?, splits: [{ member_id, amount }] }
   * Sum of splits.amount must equal payload.amount (enforced in UI).
   */
  async create(payload) {
    const { activity_id, paid_by_member_id, amount, description, date, splits } = payload;
    const expenseRow = {
      activity_id,
      paid_by_member_id,
      amount: Number(amount),
      description: description || null,
      date: date || todayLocal(),
    };

    const { data: expense, error: expError } = await supabase
      .from('activity_expenses')
      .insert(expenseRow)
      .select()
      .single();

    if (expError) return { data: null, error: expError };
    if (!splits?.length) return { data: { ...expense, expense_splits: [] }, error: null };

    const splitRows = splits.map((s) => ({
      expense_id: expense.id,
      member_id: s.member_id,
      amount: Number(s.amount),
    }));

    const { error: splitError } = await supabase.from('expense_splits').insert(splitRows);
    if (splitError) {
      await supabase.from('activity_expenses').delete().eq('id', expense.id);
      return { data: null, error: splitError };
    }

    const { data: fullExpense } = await this.getById(expense.id);
    return { data: fullExpense ?? expense, error: null };
  },

  /** Get one expense with paid_by and splits (for refetch after create). */
  async getById(expenseId) {
    const { data, error } = await supabase
      .from('activity_expenses')
      .select(`
        *,
        paid_by_member:activity_members!paid_by_member_id(id, name),
        expense_splits(
          id,
          member_id,
          amount,
          member:activity_members!member_id(id, name)
        )
      `)
      .eq('id', expenseId)
      .single();
    return { data, error };
  },

  /** Delete an expense (splits cascade). */
  async remove(id) {
    const { error } = await supabase.from('activity_expenses').delete().eq('id', id);
    return { error };
  },
};
