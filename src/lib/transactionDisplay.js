/** Amount shown in the active workspace (profile) currency when available. */
export function transactionDisplayAmount(t, profileCurrencyCode) {
  const ap = t.amount_profile;
  if (ap != null && Number.isFinite(Number(ap))) {
    return { amount: Number(ap), currency: profileCurrencyCode };
  }
  const ccy =
    t.currency_code ?? t.account?.currency_code ?? t.account?.currency ?? "ARS";
  return { amount: Number(t.amount || 0), currency: ccy };
}
