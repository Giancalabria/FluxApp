import { useCallback, useEffect, useState } from 'react';
import { activityExpenseService } from '../services/activityExpenseService';

export function useActivityExpenses(activityId) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!activityId) {
      setExpenses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await activityExpenseService.getByActivityId(activityId);
    if (err) {
      setError(err.message);
      setExpenses([]);
    } else {
      setError(null);
      setExpenses(data ?? []);
    }
    setLoading(false);
  }, [activityId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createExpense = async (payload) => {
    const { data, error: err } = await activityExpenseService.create(payload);
    if (!err) await fetch();
    return { data, error: err };
  };

  const deleteExpense = async (id) => {
    const { error: err } = await activityExpenseService.remove(id);
    if (!err) await fetch();
    return { error: err };
  };

  return {
    expenses,
    loading,
    error,
    refetch: fetch,
    createExpense,
    deleteExpense,
  };
}
