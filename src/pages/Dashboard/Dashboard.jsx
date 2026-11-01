import { useMemo } from 'react';
import { CashflowChart, CategoryDonut } from '../../components/Charts/Charts';
import Icon from '../../components/Icon/Icon';
import { DashboardSkeleton } from '../../components/Skeleton/Skeletons';
import StatCard from '../../components/StatCard/StatCard';
import TransactionList from '../../components/TransactionList/TransactionList';
import { CardHeader, ChartLegend, EmptyState, PageToolbar, ProgressBar } from '../../components/ui/ui';
import { useFinance } from '../../context/FinanceContext';
import { useUI } from '../../context/UIContext';
import { useChartPalette } from '../../hooks/useChartPalette';
import { buildDashboardSummary, getGoalPercent } from '../../utils/finance';
import { formatCurrency, indexById } from '../../utils/format';
import './Dashboard.css';

/** Página inicial: indicadores do mês, gráficos, transações recentes e metas. */
export default function Dashboard() {
  const { transactions, categories, goals, status } = useFinance();
  const { openTransactionForm, requestDelete } = useUI();
  const palette = useChartPalette();

  const summary = useMemo(() => buildDashboardSummary(transactions, categories), [transactions, categories]);
  const categoriesById = useMemo(() => indexById(categories), [categories]);

  if (status === 'loading') return <DashboardSkeleton />;

  const { current, balance, changes } = summary;
  const hasTransactions = transactions.length > 0;

  return (
    <>
      <PageToolbar
        description={`Resumo financeiro de ${summary.monthLabel}`}
        actions={
          <a className="btn btn--secondary" href="#/relatorios">
            <Icon name="reports" size={18} /> Ver relatórios
          </a>
        }
      />

      <section className="stat-grid" aria-label="Indicadores do mês">
        <StatCard title="Saldo atual" value={formatCurrency(balance)} icon="wallet" tone="brand" change={changes.balance} />
        <StatCard title="Receitas" value={formatCurrency(current.income)} icon="trendUp" tone="income" change={changes.income} />
        <StatCard title="Despesas" value={formatCurrency(current.expense)} icon="trendDown" tone="expense" change={changes.expense} inverse />
        <StatCard title="Economia" value={formatCurrency(current.savings)} icon="piggy" tone="saving" change={changes.savings} />
      </section>

      {!hasTransactions ? (
        <section className="card">
          <EmptyState icon="inbox" title="Nenhuma transação encontrada." description="Registre sua primeira receita ou despesa para ver gráficos e indicadores.">
            <button type="button" className="btn btn--primary" onClick={() => openTransactionForm()}>
              <Icon name="plus" size={18} /> Adicionar transação
            </button>
          </EmptyState>
        </section>
      ) : (
        <>
          <div className="dashboard-grid">
            <section className="card" aria-labelledby="cashflow-title">
              <CardHeader id="cashflow-title" title="Receitas e despesas" subtitle="Últimos 6 meses" />
              <ChartLegend
                items={[
                  { label: 'Receitas', color: palette.income },
                  { label: 'Despesas', color: palette.expense, dashed: true },
                ]}
              />
              <CashflowChart data={summary.series} />
            </section>

            <section className="card" aria-labelledby="donut-title">
              <CardHeader id="donut-title" title="Despesas por categoria" subtitle={`Em ${summary.monthLabel}`} />
              <CategoryDonut data={summary.categoryTotals} />
            </section>
          </div>

          <section className="card" aria-labelledby="recent-title">
            <CardHeader
              id="recent-title"
              title="Transações recentes"
              action={
                <a className="link" href="#/transacoes">
                  Ver todas
                </a>
              }
            />
            <TransactionList transactions={summary.recent} categoriesById={categoriesById} onEdit={openTransactionForm} onDelete={requestDelete} />
          </section>
        </>
      )}

      <section className="card" aria-labelledby="goals-title">
        <CardHeader
          id="goals-title"
          title="Suas metas"
          action={
            <a className="link" href="#/metas">
              Ver todas
            </a>
          }
        />
        {goals.length === 0 ? (
          <p className="muted">Você ainda não tem metas. Crie a primeira na página de Metas.</p>
        ) : (
          <ul className="goal-mini-list">
            {goals.slice(0, 3).map((goal) => {
              const percent = getGoalPercent(goal);
              return (
                <li key={goal.id} className="goal-mini">
                  <div className="goal-mini__head">
                    <span className="goal-mini__name">
                      <Icon name={goal.icon} size={18} /> {goal.name}
                    </span>
                    <strong>{percent}%</strong>
                  </div>
                  <ProgressBar value={percent} label={`Progresso da meta ${goal.name}`} />
                  <p className="goal-mini__values">
                    {formatCurrency(goal.current)} de {formatCurrency(goal.target)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
