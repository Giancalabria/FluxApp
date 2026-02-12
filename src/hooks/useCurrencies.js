import { useCallback, useEffect, useState } from 'react';
import { currencyService } from '../services/currencyService';

export function useCurrencies() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await currencyService.getAll();
    if (err) {
      setError(err.message);
      setCurrencies([]);
    } else {
      setCurrencies(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { currencies, loading, error, refetch: fetch };
}
