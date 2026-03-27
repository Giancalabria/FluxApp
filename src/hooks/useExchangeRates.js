import { useCallback, useEffect, useState } from 'react';
import { exchangeRateService } from '../services/exchangeRateService';
import { toISODate } from '../lib/dateRangePresets';

export function useExchangeRates() {
  const [usdArsRate, setUsdArsRate] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    exchangeRateService
      .getUsdArsRate()
      .then(({ rate, updatedAt: at }) => {
        if (!cancelled) {
          setUsdArsRate(rate);
          setUpdatedAt(at);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load exchange rate');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const convertToProfileCurrency = useCallback(
    (amount, fromCurrency, profileCurrency) =>
      exchangeRateService.convertToProfileCurrency(amount, fromCurrency, profileCurrency, usdArsRate),
    [usdArsRate]
  );

  const totalBalanceInProfileCurrency = useCallback(
    (accounts, profileCurrencyCode) => {
      if (!accounts?.length || !profileCurrencyCode) return 0;
      let total = 0;
      for (const a of accounts) {
        const currency = a.currency_code ?? a.currency;
        const bal = Number(a.balance || 0);
        if (currency === profileCurrencyCode) {
          total += bal;
          continue;
        }
        const conv = exchangeRateService.convertToProfileCurrency(bal, currency, profileCurrencyCode, usdArsRate);
        if (conv != null) total += conv;
        else total += bal;
      }
      return total;
    },
    [usdArsRate]
  );

  const monthTotalsInProfileCurrency = useCallback(
    (transactions, profileCurrencyCode) => {
      const now = new Date();
      const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
      let income = 0;
      let expense = 0;
      for (const t of transactions || []) {
        if (t.date < monthStart) continue;
        let amt = null;
        const stored = t.amount_profile;
        if (stored != null && Number.isFinite(Number(stored))) {
          amt = Number(stored);
        } else {
          const currency = t.currency_code ?? t.account?.currency_code ?? t.account?.currency ?? 'ARS';
          amt = exchangeRateService.convertToProfileCurrency(
            Number(t.amount || 0),
            currency,
            profileCurrencyCode,
            usdArsRate
          );
        }
        if (amt == null) continue;
        if (t.type === 'income') income += amt;
        if (t.type === 'expense') expense += amt;
      }
      return { income, expense };
    },
    [usdArsRate]
  );

  return {
    usdArsRate,
    updatedAt,
    loading,
    error,
    convertToProfileCurrency,
    totalBalanceInProfileCurrency,
    monthTotalsInProfileCurrency,
  };
}
