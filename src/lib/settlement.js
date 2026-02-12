export function computeSettlement(members, expenses, splits) {
  if (!members?.length || !expenses?.length) return [];

  const memberIds = new Set(members.map((m) => m.id));

  const totalPaid = {};
  memberIds.forEach((id) => (totalPaid[id] = 0));
  expenses.forEach((e) => {
    const id = e.paid_by_member_id;
    if (memberIds.has(id)) totalPaid[id] = (totalPaid[id] || 0) + Number(e.amount);
  });

  const totalOwed = {};
  memberIds.forEach((id) => (totalOwed[id] = 0));
  (splits || []).forEach((s) => {
    if (memberIds.has(s.member_id))
      totalOwed[s.member_id] = (totalOwed[s.member_id] || 0) + Number(s.amount);
  });

  const balances = {};
  memberIds.forEach((id) => {
    balances[id] = (totalPaid[id] || 0) - (totalOwed[id] || 0);
  });

  Object.keys(balances).forEach((id) => {
    balances[id] = Math.round(balances[id] * 100) / 100;
  });

  const creditors = memberIds
    .filter((id) => balances[id] > 0)
    .map((id) => ({ id, balance: balances[id] }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = memberIds
    .filter((id) => balances[id] < 0)
    .map((id) => ({ id, balance: -balances[id] }))
    .sort((a, b) => b.balance - a.balance);

  const result = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    const amount = Math.min(creditor.balance, debtor.balance);
    if (amount <= 0) break;
    const rounded = Math.round(amount * 100) / 100;
    result.push({
      fromMemberId: debtor.id,
      toMemberId: creditor.id,
      amount: rounded,
    });
    creditor.balance -= rounded;
    debtor.balance -= rounded;
    if (creditor.balance <= 0) i++;
    if (debtor.balance <= 0) j++;
  }

  return result;
}
