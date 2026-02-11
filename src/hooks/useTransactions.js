import { useCallback, useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';

export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await transactionService.getAll(filters);
    if (err) {
      setError(err.message);
    } else {
      setTransactions(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [JSON.stringify(filters)]);

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

  return { transactions, loading, error, refetch: fetch, createTransaction, deleteTransaction };
}
