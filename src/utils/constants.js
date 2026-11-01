// Constantes compartilhadas pela aplicação. Centralizar aqui evita "valores mágicos" espalhados.

// Chaves usadas no localStorage (o prefixo "finanly:" é adicionado em services/storage.js)
export const STORAGE_KEYS = {
  transactions: 'transactions',
  categories: 'categories',
  goals: 'goals',
  theme: 'theme',
};

export const TYPE_LABELS = { income: 'Receita', expense: 'Despesa' };
export const STATUS_LABELS = { paid: 'Concluída', pending: 'Pendente' };

export const TYPE_FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'income', label: 'Receitas' },
  { value: 'expense', label: 'Despesas' },
];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'oldest', label: 'Mais antigas' },
  { value: 'highest', label: 'Maior valor' },
  { value: 'lowest', label: 'Menor valor' },
];

export const TRANSACTION_PERIOD_OPTIONS = [
  { value: 'all', label: 'Todo o período' },
  { value: 'thisMonth', label: 'Este mês' },
  { value: 'lastMonth', label: 'Mês anterior' },
  { value: 'last3', label: 'Últimos 3 meses' },
  { value: 'year', label: 'Este ano' },
  { value: 'custom', label: 'Personalizado' },
];

export const REPORT_PERIOD_OPTIONS = [
  { value: 'thisMonth', label: 'Este mês' },
  { value: 'last3', label: 'Últimos 3 meses' },
  { value: 'last6', label: 'Últimos 6 meses' },
  { value: 'year', label: 'Este ano' },
];

// Quantas transações aparecem por vez na página de Transações
export const PAGE_SIZE = 10;

// Páginas do app: o "id" é o que aparece na URL (#/id)
export const PAGES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'transacoes', label: 'Transações', icon: 'transactions' },
  { id: 'categorias', label: 'Categorias', icon: 'categories' },
  { id: 'metas', label: 'Metas', icon: 'goals' },
  { id: 'relatorios', label: 'Relatórios', icon: 'reports' },
  { id: 'configuracoes', label: 'Configurações', icon: 'settings' },
];
export const DEFAULT_PAGE = 'dashboard';

// Usuário fictício, apenas para demonstração
export const CURRENT_USER = { name: 'Camila Rocha', plan: 'Plano Pessoal' };

// Ícones que o usuário pode escolher ao criar categorias e metas
export const ICON_CHOICES = [
  { name: 'utensils', label: 'Alimentação' },
  { name: 'car', label: 'Carro' },
  { name: 'home', label: 'Casa' },
  { name: 'heart', label: 'Saúde' },
  { name: 'graduation', label: 'Livro' },
  { name: 'gamepad', label: 'Lazer' },
  { name: 'bag', label: 'Compras' },
  { name: 'box', label: 'Pacote' },
  { name: 'briefcase', label: 'Trabalho' },
  { name: 'laptop', label: 'Notebook' },
  { name: 'shield', label: 'Segurança' },
  { name: 'plane', label: 'Viagem' },
  { name: 'headphones', label: 'Fones' },
  { name: 'piggy', label: 'Economia' },
  { name: 'target', label: 'Meta' },
];

// Cores usadas ao criar novas categorias (alternadas automaticamente)
export const CATEGORY_COLORS = ['#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#eab308', '#84cc16', '#06b6d4'];
