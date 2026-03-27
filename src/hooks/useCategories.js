import { useCallback, useEffect, useState } from 'react';
import { categoryService } from '../services/categoryService';

export function useCategories(financialProfileId) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!financialProfileId) {
      setCategories([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const { data, error: err } = await categoryService.getAll(financialProfileId);
    if (err) {
      setError(err.message);
    } else {
      setCategories(data ?? []);
      setError(null);
    }
    setLoading(false);
  }, [financialProfileId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { categories, loading, error, refetch: fetch };
}
