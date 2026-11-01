// Helpers de data. Todas as datas do app são strings ISO "AAAA-MM-DD" e os meses são "AAAA-MM".
// Trabalhar com strings evita problemas de fuso horário que acontecem com `new Date('2026-10-28')`.

const pad = (number) => String(number).padStart(2, '0');

const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS_LONG = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** Data de hoje (fuso local) no formato AAAA-MM-DD */
export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "2026-10-28" -> "2026-10" */
export const getMonthKey = (isoDate) => isoDate.slice(0, 7);

/** Soma (ou subtrai) meses de uma chave "AAAA-MM" */
export function addMonths(monthKey, delta) {
  const [year, month] = monthKey.split('-').map(Number);
  const index = year * 12 + (month - 1) + delta;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

export function daysInMonth(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month, 0).getDate();
}

export const monthStart = (monthKey) => `${monthKey}-01`;
export const monthEnd = (monthKey) => `${monthKey}-${pad(daysInMonth(monthKey))}`;

/** Lista de meses entre duas chaves (inclusive) */
export function monthsBetween(startKey, endKey) {
  const months = [];
  let current = startKey;
  while (current <= endKey && months.length < 600) {
    months.push(current);
    current = addMonths(current, 1);
  }
  return months;
}

/** "2026-10" -> "Out" */
export const monthLabelShort = (monthKey) => MONTHS_SHORT[Number(monthKey.slice(5, 7)) - 1];

/** "2026-10" -> "outubro de 2026" */
export const monthLabelLong = (monthKey) => `${MONTHS_LONG[Number(monthKey.slice(5, 7)) - 1]} de ${monthKey.slice(0, 4)}`;

/** "2026-10-28" -> "28/10/2026" */
export function formatDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/** "2026-12-31" -> "dez/2026" (usado em prazos de metas) */
export function formatMonthYear(isoDate) {
  if (!isoDate) return '';
  return `${monthLabelShort(getMonthKey(isoDate)).toLowerCase()}/${isoDate.slice(0, 4)}`;
}
