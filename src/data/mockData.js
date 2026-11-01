// Dados fictícios de demonstração. São FIXOS (nada aleatório), então o dashboard
// aparece sempre igual e completo na primeira execução.
//
// Convenções:
// - amount é sempre positivo; quem define se entra ou sai é o campo `type` ("income" | "expense")
// - date no formato ISO "AAAA-MM-DD"
// - status: "paid" (concluída) | "pending" (pendente, não entra nos totais)

import { round2 } from '../utils/format';

export const initialCategories = [
  { id: 'alimentacao', name: 'Alimentação', icon: 'utensils', color: '#f97316', kind: 'expense' },
  { id: 'transporte', name: 'Transporte', icon: 'car', color: '#3b82f6', kind: 'expense' },
  { id: 'moradia', name: 'Moradia', icon: 'home', color: '#8b5cf6', kind: 'expense' },
  { id: 'saude', name: 'Saúde', icon: 'heart', color: '#ec4899', kind: 'expense' },
  { id: 'educacao', name: 'Educação', icon: 'graduation', color: '#14b8a6', kind: 'expense' },
  { id: 'lazer', name: 'Lazer', icon: 'gamepad', color: '#eab308', kind: 'expense' },
  { id: 'compras', name: 'Compras', icon: 'bag', color: '#84cc16', kind: 'expense' },
  { id: 'outros', name: 'Outros', icon: 'box', color: '#94a3b8', kind: 'expense' },
  { id: 'renda', name: 'Renda', icon: 'briefcase', color: '#0e7c66', kind: 'income' },
];

const makeTransaction = (id, name, categoryId, date, type, amount, extra = {}) => ({
  id,
  name,
  categoryId,
  date,
  type,
  amount,
  description: extra.description ?? '',
  status: extra.status ?? 'paid',
});

// ---------------------------------------------------------------------------
// Histórico de maio a setembro: gerado a partir de uma tabela fixa por mês.
// O gasto com "Compras" é o que sobra para fechar o total de despesas do mês.
// ---------------------------------------------------------------------------
const FIXED_EXPENSES = { aluguel: 1200, internet: 119.9, netflix: 55.9, academia: 129.9, curso: 289 };

const MONTHLY_HISTORY = [
  { month: '2026-05', freelance: 4300, total: 3720, energia: 176.4, mercado: 548.2, restaurante: 142.5, uber: 58.9, combustivel: 210, farmacia: 74.8, outros: 90 },
  { month: '2026-06', freelance: 4900, total: 3890, energia: 182.1, mercado: 571.6, restaurante: 168, uber: 72.4, combustivel: 225, farmacia: 61.2, outros: 120 },
  { month: '2026-07', freelance: 3700, total: 4210, energia: 201.7, mercado: 603.9, restaurante: 214.5, uber: 95.3, combustivel: 240, farmacia: 132.9, outros: 180 },
  { month: '2026-08', freelance: 5800, total: 3950, energia: 195.3, mercado: 559.4, restaurante: 189.9, uber: 81.6, combustivel: 215, farmacia: 69.5, outros: 110 },
  { month: '2026-09', freelance: 5600, total: 3600, energia: 171.8, mercado: 532.7, restaurante: 127.4, uber: 47.8, combustivel: 205, farmacia: 58.3, outros: 95 },
];

function buildMonth(spec, index) {
  const month = spec.month;
  const id = (number) => `h${index + 1}-${String(number).padStart(2, '0')}`;
  const fixedTotal = Object.values(FIXED_EXPENSES).reduce((sum, value) => sum + value, 0);
  const variableTotal = spec.energia + spec.mercado + spec.restaurante + spec.uber + spec.combustivel + spec.farmacia + spec.outros;
  const compras = round2(spec.total - fixedTotal - variableTotal);

  return [
    makeTransaction(id(1), 'Salário', 'renda', `${month}-25`, 'income', 4500, { description: 'Salário mensal' }),
    makeTransaction(id(2), 'Dividendos', 'renda', `${month}-05`, 'income', 1000),
    makeTransaction(id(3), 'Freelance', 'renda', `${month}-18`, 'income', spec.freelance, { description: 'Projeto de desenvolvimento web' }),
    makeTransaction(id(4), 'Aluguel', 'moradia', `${month}-05`, 'expense', FIXED_EXPENSES.aluguel, { description: 'Aluguel do apartamento' }),
    makeTransaction(id(5), 'Energia', 'moradia', `${month}-10`, 'expense', spec.energia),
    makeTransaction(id(6), 'Internet', 'moradia', `${month}-12`, 'expense', FIXED_EXPENSES.internet),
    makeTransaction(id(7), 'Mercado', 'alimentacao', `${month}-14`, 'expense', spec.mercado),
    makeTransaction(id(8), 'Restaurante', 'alimentacao', `${month}-20`, 'expense', spec.restaurante),
    makeTransaction(id(9), 'Uber', 'transporte', `${month}-24`, 'expense', spec.uber),
    makeTransaction(id(10), 'Combustível', 'transporte', `${month}-16`, 'expense', spec.combustivel),
    makeTransaction(id(11), 'Netflix', 'lazer', `${month}-09`, 'expense', FIXED_EXPENSES.netflix, { description: 'Assinatura mensal' }),
    makeTransaction(id(12), 'Academia', 'saude', `${month}-07`, 'expense', FIXED_EXPENSES.academia, { description: 'Mensalidade' }),
    makeTransaction(id(13), 'Farmácia', 'saude', `${month}-19`, 'expense', spec.farmacia),
    makeTransaction(id(14), 'Curso de Inglês', 'educacao', `${month}-06`, 'expense', FIXED_EXPENSES.curso, { description: 'Mensalidade do curso' }),
    makeTransaction(id(15), 'Compras online', 'compras', `${month}-22`, 'expense', compras),
    makeTransaction(id(16), 'Presente', 'outros', `${month}-11`, 'expense', spec.outros),
  ];
}

// ---------------------------------------------------------------------------
// Outubro (mês de referência): escrito à mão.
// Receitas = R$ 12.500,00 | Despesas = R$ 4.050,00 | Economia = R$ 8.450,00
// ---------------------------------------------------------------------------
const OCTOBER = [
  makeTransaction('o-01', 'Supermercado', 'alimentacao', '2026-10-28', 'expense', 250, { description: 'Compras da semana' }),
  makeTransaction('o-02', 'Salário', 'renda', '2026-10-25', 'income', 4500, { description: 'Salário mensal' }),
  makeTransaction('o-03', 'Uber', 'transporte', '2026-10-24', 'expense', 35),
  makeTransaction('o-04', 'Cinema', 'lazer', '2026-10-26', 'expense', 64, { description: 'Ingressos de sábado' }),
  makeTransaction('o-05', 'Tênis de corrida', 'compras', '2026-10-22', 'expense', 399.9),
  makeTransaction('o-06', 'Mercado', 'alimentacao', '2026-10-21', 'expense', 412.6),
  makeTransaction('o-07', 'Restaurante', 'alimentacao', '2026-10-20', 'expense', 138.4, { description: 'Jantar de aniversário' }),
  makeTransaction('o-08', 'Farmácia', 'saude', '2026-10-19', 'expense', 86.3),
  makeTransaction('o-09', 'Freelance', 'renda', '2026-10-18', 'income', 5000, { description: 'Site institucional para cliente' }),
  makeTransaction('o-10', 'Combustível', 'transporte', '2026-10-16', 'expense', 220),
  makeTransaction('o-11', 'Internet', 'moradia', '2026-10-12', 'expense', 119.9),
  makeTransaction('o-12', 'Presente', 'outros', '2026-10-11', 'expense', 150, { description: 'Presente de aniversário' }),
  makeTransaction('o-13', 'Energia', 'moradia', '2026-10-10', 'expense', 187.5),
  makeTransaction('o-14', 'Netflix', 'lazer', '2026-10-09', 'expense', 55.9, { description: 'Assinatura mensal' }),
  makeTransaction('o-15', 'Freelance', 'renda', '2026-10-08', 'income', 1800, { description: 'Manutenção de loja virtual' }),
  makeTransaction('o-16', 'Academia', 'saude', '2026-10-07', 'expense', 129.9, { description: 'Mensalidade' }),
  makeTransaction('o-17', 'Curso de Inglês', 'educacao', '2026-10-06', 'expense', 289, { description: 'Mensalidade do curso' }),
  makeTransaction('o-18', 'Aluguel', 'moradia', '2026-10-05', 'expense', 1200, { description: 'Aluguel do apartamento' }),
  makeTransaction('o-19', 'Dividendos', 'renda', '2026-10-05', 'income', 1200),
  makeTransaction('o-20', 'Manutenção do carro', 'transporte', '2026-10-03', 'expense', 311.6, { description: 'Troca de óleo e filtros' }),
  // Pendente: aparece na lista, mas ainda não entra nos totais
  makeTransaction('o-21', 'IPTU (parcela)', 'moradia', '2026-10-31', 'expense', 210, { status: 'pending', description: 'Vence hoje' }),
];

export const initialTransactions = [...MONTHLY_HISTORY.flatMap(buildMonth), ...OCTOBER];

export const initialGoals = [
  { id: 'g-1', name: 'Comprar um notebook', icon: 'laptop', target: 5000, current: 3200, deadline: '2026-12-20' },
  { id: 'g-2', name: 'Reserva de emergência', icon: 'shield', target: 10000, current: 6500, deadline: '2027-06-30' },
  { id: 'g-3', name: 'Viagem para o Nordeste', icon: 'plane', target: 4000, current: 1200, deadline: '2027-01-31' },
  { id: 'g-4', name: 'Fone de ouvido novo', icon: 'headphones', target: 600, current: 600, deadline: '2026-10-15' },
];

// Notificações de exemplo exibidas no sino do cabeçalho
export const initialNotifications = [
  { id: 'n-1', title: 'IPTU vence hoje', text: 'A parcela de R$ 210,00 está pendente.', time: 'Hoje', unread: true },
  { id: 'n-2', title: 'Ótimo mês!', text: 'Você economizou cerca de 68% da sua renda em outubro.', time: 'Ontem', unread: true },
  { id: 'n-3', title: 'Meta quase lá', text: 'Reserva de emergência está em 65% do objetivo.', time: 'Há 3 dias', unread: false },
];
