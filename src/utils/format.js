// Funções de formatação e conversão de valores (moeda, porcentagem, texto).

const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 8450 -> "R$ 8.450,00" */
export const formatCurrency = (value) => currencyFormatter.format(Number.isFinite(value) ? value : 0);

/** Receita -> "+R$ 4.500,00" | Despesa -> "-R$ 250,00" */
export const formatSignedCurrency = (value, type) =>
  `${type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(value))}`;

/** Versão curta para eixos de gráfico: 12500 -> "12,5 mil" */
export function formatCompactCurrency(value) {
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`;
  }
  return String(Math.round(value));
}

/** 12.5 -> "+12,5%" | null -> "—" */
export function formatPercent(value) {
  if (value === null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  const formatted = Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${sign}${formatted}%`;
}

export const round2 = (value) => Math.round(value * 100) / 100;

/**
 * Converte o texto digitado pelo usuário em número.
 * Aceita "1234,56", "1.234,56", "1234.56" e "R$ 50".
 * Retorna NaN quando o texto não é um valor válido.
 */
export function parseCurrencyInput(raw) {
  if (typeof raw === 'number') return raw;
  let value = String(raw ?? '').replace(/[R$\s]/g, '');
  if (!value) return NaN;

  if (value.includes(',')) {
    // Formato brasileiro: ponto é milhar e vírgula é decimal
    value = value.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(value)) {
    // "1.500" é mil e quinhentos, não 1,5
    value = value.replace(/\./g, '');
  }

  if (!/^\d+(\.\d+)?$/.test(value)) return NaN;
  return Number(value);
}

/** 1234.5 -> "1234,50" (para preencher o campo de valor ao editar) */
export const numberToInput = (value) => value.toFixed(2).replace('.', ',');

export function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Remove acentos e deixa em minúsculas para buscas que ignoram acento */
export const normalizeText = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export const createId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** [{id: 'a'}] -> { a: {id: 'a'} } */
export const indexById = (items) => Object.fromEntries(items.map((item) => [item.id, item]));
