// Cálculos financeiros puros (sem React). Recebem dados e devolvem dados,
// o que deixa tudo fácil de testar e de reaproveitar nas páginas.
//
// Regra importante: transações com status "pending" (pendentes) aparecem nas listas,
// mas NÃO entram em saldo, totais e gráficos até serem marcadas como concluídas.

import {
  addMonths,
  daysInMonth,
  getMonthKey,
  monthEnd,
  monthLabelLong,
  monthLabelShort,
  monthsBetween,
  monthStart,
  todayISO,
} from './dates';
import { normalizeText, round2 } from './format';

export const isPaid = (transaction) => transaction.status !== 'pending';
const signedAmount = (transaction) => (transaction.type === 'income' ? transaction.amount : -transaction.amount);

/** Mês de referência do app: a data da transação mais recente (ou hoje, se não houver nenhuma). */
export function getReferenceDate(transactions) {
  if (!transactions.length) return todayISO();
  return transactions.reduce((latest, item) => (item.date > latest ? item.date : latest), transactions[0].date);
}

/** Soma receitas, despesas e economia de uma lista de transações. */
export function sumTransactions(transactions) {
  let income = 0;
  let expense = 0;
  transactions.forEach((item) => {
    if (!isPaid(item)) return;
    if (item.type === 'income') income += item.amount;
    else expense += item.amount;
  });
  return { income: round2(income), expense: round2(expense), savings: round2(income - expense) };
}

export const getMonthSummary = (transactions, monthKey) =>
  sumTransactions(transactions.filter((item) => getMonthKey(item.date) === monthKey));

/** Saldo acumulado até uma data (inclusive). */
export const getBalanceUntil = (transactions, endDate) =>
  round2(transactions.reduce((total, item) => (isPaid(item) && item.date <= endDate ? total + signedAmount(item) : total), 0));

/** Saldo acumulado antes de uma data (exclusive). */
export const getBalanceBefore = (transactions, startDate) =>
  round2(transactions.reduce((total, item) => (isPaid(item) && item.date < startDate ? total + signedAmount(item) : total), 0));

/** Variação percentual. Retorna null quando não há base de comparação (anterior = 0). */
export function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** Série mensal (receitas/despesas) dos últimos `count` meses, terminando em `endMonthKey`. */
export function getMonthlySeries(transactions, endMonthKey, count) {
  return Array.from({ length: count }, (_, index) => {
    const key = addMonths(endMonthKey, index - (count - 1));
    return {
      key,
      label: monthLabelShort(key),
      fullLabel: monthLabelLong(key),
      ...getMonthSummary(transactions, key),
    };
  });
}

/** Total por categoria, ordenado do maior para o menor. */
export function getCategoryTotals(transactions, categories, type = 'expense') {
  const totals = new Map();
  transactions.forEach((item) => {
    if (!isPaid(item) || item.type !== type) return;
    const current = totals.get(item.categoryId) ?? { value: 0, count: 0 };
    totals.set(item.categoryId, { value: round2(current.value + item.amount), count: current.count + 1 });
  });

  return categories
    .filter((category) => totals.has(category.id))
    .map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      ...totals.get(category.id),
    }))
    .sort((a, b) => b.value - a.value);
}

/** Converte um período ("thisMonth", "last3"...) em { start, end } de datas ISO. */
export function getPeriodRange(period, referenceDate, custom = {}) {
  const refMonth = getMonthKey(referenceDate);
  switch (period) {
    case 'thisMonth':
      return { start: monthStart(refMonth), end: monthEnd(refMonth) };
    case 'lastMonth': {
      const month = addMonths(refMonth, -1);
      return { start: monthStart(month), end: monthEnd(month) };
    }
    case 'last3':
      return { start: monthStart(addMonths(refMonth, -2)), end: monthEnd(refMonth) };
    case 'last6':
      return { start: monthStart(addMonths(refMonth, -5)), end: monthEnd(refMonth) };
    case 'year':
      return { start: `${refMonth.slice(0, 4)}-01-01`, end: `${refMonth.slice(0, 4)}-12-31` };
    case 'custom':
      return { start: custom.from || null, end: custom.to || null };
    default:
      return null; // "all": sem restrição de datas
  }
}

/** Aplica busca, tipo, categoria e período. */
export function filterTransactions(transactions, { search = '', type = 'all', categoryId = 'all', range = null }) {
  const query = normalizeText(search);
  return transactions.filter((item) => {
    if (type !== 'all' && item.type !== type) return false;
    if (categoryId !== 'all' && item.categoryId !== categoryId) return false;
    if (range?.start && item.date < range.start) return false;
    if (range?.end && item.date > range.end) return false;
    if (query && !normalizeText(item.name).includes(query)) return false;
    return true;
  });
}

const SORTERS = {
  recent: (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
  oldest: (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  highest: (a, b) => b.amount - a.amount,
  lowest: (a, b) => a.amount - b.amount,
};

/** Retorna uma cópia ordenada (nunca altera o array original). */
export const sortTransactions = (transactions, sortBy = 'recent') => [...transactions].sort(SORTERS[sortBy] ?? SORTERS.recent);

/** Resumo usado pelo Dashboard: mês de referência vs. mês anterior. */
export function buildDashboardSummary(transactions, categories) {
  const referenceDate = getReferenceDate(transactions);
  const month = getMonthKey(referenceDate);
  const previousMonth = addMonths(month, -1);

  const current = getMonthSummary(transactions, month);
  const previous = getMonthSummary(transactions, previousMonth);
  const balance = getBalanceUntil(transactions, '9999-12-31');
  const previousBalance = getBalanceUntil(transactions, monthEnd(previousMonth));
  const monthTransactions = transactions.filter((item) => getMonthKey(item.date) === month);

  return {
    monthLabel: monthLabelLong(month),
    current,
    balance,
    changes: {
      balance: percentChange(balance, previousBalance),
      income: percentChange(current.income, previous.income),
      expense: percentChange(current.expense, previous.expense),
      savings: percentChange(current.savings, previous.savings),
    },
    series: getMonthlySeries(transactions, month, 6),
    categoryTotals: getCategoryTotals(monthTransactions, categories, 'expense'),
    recent: sortTransactions(transactions, 'recent').slice(0, 5),
  };
}

/** Relatório do período escolhido (usado na página Relatórios). */
export function buildReport(transactions, categories, period, referenceDate) {
  const refMonth = getMonthKey(referenceDate);
  const range = getPeriodRange(period, referenceDate);
  const inRange = transactions.filter((item) => item.date >= range.start && item.date <= range.end);

  const totals = sumTransactions(inRange);
  const monthKeys = monthsBetween(getMonthKey(range.start), refMonth);
  const monthsCount = Math.max(monthKeys.length, 1);
  const categoryTotals = getCategoryTotals(inRange, categories, 'expense');
  const openingBalance = getBalanceBefore(transactions, range.start);

  // "Este mês" mostra um ponto por dia; os demais períodos mostram um ponto por mês.
  const buckets =
    period === 'thisMonth'
      ? Array.from({ length: daysInMonth(refMonth) }, (_, index) => {
          const day = String(index + 1).padStart(2, '0');
          const date = `${refMonth}-${day}`;
          return {
            key: date,
            label: String(index + 1),
            fullLabel: `${index + 1} de ${monthLabelLong(refMonth)}`,
            ...sumTransactions(inRange.filter((item) => item.date === date)),
          };
        })
      : monthKeys.map((key) => ({
          key,
          label: monthLabelShort(key),
          fullLabel: monthLabelLong(key),
          ...sumTransactions(inRange.filter((item) => getMonthKey(item.date) === key)),
        }));

  // Evolução do saldo: saldo anterior ao período + resultado acumulado
  let runningBalance = openingBalance;
  const series = buckets.map((bucket) => {
    runningBalance = round2(runningBalance + bucket.income - bucket.expense);
    return { ...bucket, balance: runningBalance };
  });

  return {
    totals,
    monthsCount,
    averageExpense: round2(totals.expense / monthsCount),
    averageSavings: round2(totals.savings / monthsCount),
    topCategory: categoryTotals[0] ?? null,
    categoryTotals,
    series,
    openingBalance,
    closingBalance: runningBalance,
    balanceChange: round2(runningBalance - openingBalance),
    hasData: inRange.some(isPaid),
  };
}

/** Progresso de uma meta em porcentagem inteira (0 a 100). */
export const getGoalPercent = (goal) => (goal.target > 0 ? Math.min(100, Math.round((goal.current / goal.target) * 100)) : 0);
