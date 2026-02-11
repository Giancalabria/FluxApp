/**
 * Exchange rates for converting balances to USD.
 * - ARS: from DolarAPI (dólar blue, "venta") — reflects real-world conversion.
 * - USD, USDT, USDC: treated as 1 USD (stablecoins are pegged to USD).
 * @see https://dolarapi.com/docs/
 */

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const DOLAR_API_BASE = 'https://dolarapi.com/v1/dolares';

let cached = null;

/**
 * Get USD/ARS rate (dólar blue, sell price). 1 USD = rate ARS.
 * So to convert ARS → USD: amountArs / rate.
 * @returns {{ rate: number, updatedAt: string } | null}
 */
async function fetchUsdArsRate() {
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { rate: cached.rate, updatedAt: cached.updatedAt };
  }

  try {
    const res = await fetch(`${DOLAR_API_BASE}/blue`);
    if (!res.ok) throw new Error(`DolarAPI ${res.status}`);
    const data = await res.json();
    // "venta" = sell price = ARS per 1 USD
    const rate = Number(data.venta);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error('Invalid rate');
    const updatedAt = data.fechaActualizacion || new Date().toISOString();
    cached = { rate, updatedAt, timestamp: Date.now() };
    return { rate, updatedAt };
  } catch (err) {
    if (cached) return { rate: cached.rate, updatedAt: cached.updatedAt };
    throw err;
  }
}

/**
 * Currencies that are 1:1 with USD (no API needed).
 */
const USD_PEGGED = new Set(['USD', 'USDT', 'USDC']);

/**
 * Convert an amount in the given currency to USD.
 * @param {number} amount
 * @param {string} currency - e.g. 'ARS', 'USD', 'USDT', 'USDC'
 * @param {number|null} usdArsRate - from fetchUsdArsRate(); if null and currency is ARS, returns null
 * @returns {number|null} USD amount, or null if conversion not available (e.g. ARS without rate)
 */
export function convertToUsd(amount, currency, usdArsRate) {
  if (!Number.isFinite(amount)) return null;
  if (USD_PEGGED.has(currency)) return amount;
  if (currency === 'ARS') {
    if (usdArsRate == null || !Number.isFinite(usdArsRate) || usdArsRate <= 0) return null;
    return amount / usdArsRate;
  }
  return null;
}

/**
 * Fetch the USD/ARS (blue) rate. Cached for 1 hour.
 * @returns {Promise<{ rate: number, updatedAt: string }>}
 */
export async function getUsdArsRate() {
  return fetchUsdArsRate();
}

export const exchangeRateService = {
  getUsdArsRate,
  convertToUsd,
  USD_PEGGED,
};
