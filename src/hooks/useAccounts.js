import { useCallback, useEffect, useState } from 'react';
import { accountService } from '../services/accountService';

export function useAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await accountService.getAll();
    if (err) {
      setError(err.message);
    } else {
      setAccounts(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createAccount = async (account) => {
    const { data, error: err } = await accountService.create(account);
    if (!err) await fetch();
    return { data, error: err };
  };

  const updateAccount = async (id, updates) => {
    const { data, error: err } = await accountService.update(id, updates);
    if (!err) await fetch();
    return { data, error: err };
  };

  const deleteAccount = async (id) => {
    const { error: err } = await accountService.remove(id);
    if (!err) await fetch();
    return { error: err };
  };

  return { accounts, loading, error, refetch: fetch, createAccount, updateAccount, deleteAccount };
}
