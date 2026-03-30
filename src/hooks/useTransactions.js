import { useCallback, useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';

export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { financialProfileId, ...rest } = filters;

  const fetch = useCallback(async () => {
    if (!financialProfileId) {
      setTransactions([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const { data, error: err } = await transactionService.getAll({ ...rest, financialProfileId });
    if (err) {
      setError(err.message);
      setTransactions([]);
    } else {
      setError(null);
      setTransactions(data ?? []);
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financialProfileId, JSON.stringify(rest)]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createTransaction = async (tx) => {
    const { data, error: err } = await transactionService.create(tx);
    if (!err) await fetch();
    return { data, error: err };
  };

  const deleteTransaction = async (id) => {
    const { error: err } = await transactionService.remove(id);
    if (!err) await fetch();
    return { error: err };
  };

  const createTransactions = async (rows) => {
    const { data, error: err } = await transactionService.createMany(rows);
    if (!err) await fetch();
    return { data, error: err };
  };

  const clearError = useCallback(() => setError(null), []);

  return {
    transactions,
    loading,
    error,
    refetch: fetch,
    createTransaction,
    createTransactions,
    deleteTransaction,
    clearError,
  };
}
