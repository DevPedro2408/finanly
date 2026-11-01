import { useMemo, useState } from 'react';
import { BalanceChart, CashflowBars } from '../../components/Charts/Charts';
import { ReportsSkeleton } from '../../components/Skeleton/Skeletons';
import StatCard from '../../components/StatCard/StatCard';
import { CardHeader, ChartLegend, EmptyState, PageToolbar, ProgressBar } from '../../components/ui/ui';
import Icon from '../../components/Icon/Icon';
import { useFinance } from '../../context/FinanceContext';
import { useChartPalette } from '../../hooks/useChartPalette';
import { REPORT_PERIOD_OPTIONS } from '../../utils/constants';
import { buildReport, getReferenceDate } from '../../utils/finance';
import { formatCurrency } from '../../utils/format';
import './Reports.css';

const PERIOD_DESCRIPTIONS = {
  thisMonth: 'no mês',
  last3: 'nos últimos 3 meses',
  last6: 'nos últimos 6 meses',
  year: 'no ano',
};

/** Relatórios: totais, médias, categorias e evolução do saldo em um período escolhido. */
export default function Reports() {
  const { transactions, categories, status } = useFinance();
  const palette = useChartPalette();
  const [period, setPeriod] = useState('last6');

  const report = useMemo(() => buildReport(transactions, categories, period, getReferenceDate(transactions)), [transactions, categories, period]);

  if (status === 'loading') return <ReportsSkeleton />;

  const { totals, topCategory } = report;
  const periodLabel = REPORT_PERIOD_OPTIONS.find((option) => option.value === period).label;
  const monthsText = report.monthsCount === 1 ? 'mês' : 'meses';
  const balanceDelta = `${report.balanceChange >= 0 ? '+' : '-'}${formatCurrency(Math.abs(report.balanceChange))}`;
  const topShare = topCategory && totals.expense > 0 ? Math.round((topCategory.value / totals.expense) * 100) : 0;

  return (
    <>
      <PageToolbar
        description="Analise seus números por período."
        actions={
          <div className="segmented segmented--tabs" role="group" aria-label="Período do relatório">
            {REPORT_PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`segmented__tab ${period === option.value ? 'is-active' : ''}`}
                aria-pressed={period === option.value}
                onClick={() => setPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        }
      />

      {!report.hasData ? (
        <section className="card">
          <EmptyState icon="reports" title="Sem dados neste período" description="Não há transações concluídas no período escolhido. Experimente outro filtro ou registre novas transações." />
        </section>
      ) : (
        <>
          <section className="stat-grid stat-grid--3" aria-label={`Resumo — ${periodLabel}`}>
            <StatCard title="Total de receitas" value={formatCurrency(totals.income)} icon="trendUp" tone="income" footnote={`Recebido ${PERIOD_DESCRIPTIONS[period]}`} />
            <StatCard title="Total de despesas" value={formatCurrency(totals.expense)} icon="trendDown" tone="expense" footnote={`Gasto ${PERIOD_DESCRIPTIONS[period]}`} />
            <StatCard
              title="Maior categoria de gasto"
              value={topCategory ? topCategory.name : '—'}
              icon={topCategory ? topCategory.icon : 'tag'}
              tone="brand"
              footnote={topCategory ? `${formatCurrency(topCategory.value)} · ${topShare}% das despesas` : 'Sem despesas no período'}
            />
            <StatCard title="Média mensal de gastos" value={formatCurrency(report.averageExpense)} icon="wallet" tone="expense" footnote={`Base: ${report.monthsCount} ${monthsText}`} />
            <StatCard title="Economia média" value={formatCurrency(report.averageSavings)} icon="piggy" tone="saving" footnote={`Por mês · ${totals.savings >= 0 ? 'sobra' : 'falta'} de ${formatCurrency(Math.abs(totals.savings))} no período`} />
            <StatCard title="Evolução do saldo" value={balanceDelta} icon="reports" tone="brand" footnote={`Saldo final: ${formatCurrency(report.closingBalance)}`} />
          </section>

          <div className="dashboard-grid dashboard-grid--even">
            <section className="card" aria-labelledby="report-bars-title">
              <CardHeader id="report-bars-title" title="Receitas x despesas" subtitle={periodLabel} />
              <ChartLegend
                items={[
                  { label: 'Receitas', color: palette.income },
                  { label: 'Despesas', color: palette.expense },
                ]}
              />
              <CashflowBars data={report.series} />
            </section>

            <section className="card" aria-labelledby="report-balance-title">
              <CardHeader id="report-balance-title" title="Evolução do saldo" subtitle="Saldo acumulado ao longo do período" />
              <ChartLegend items={[{ label: 'Saldo', color: palette.balance }]} />
              <BalanceChart data={report.series} />
            </section>
          </div>

          <section className="card" aria-labelledby="report-categories-title">
            <CardHeader id="report-categories-title" title="Onde você mais gastou" subtitle={periodLabel} />
            {report.categoryTotals.length === 0 ? (
              <p className="muted">Nenhuma despesa concluída neste período.</p>
            ) : (
              <ol className="rank-list">
                {report.categoryTotals.map((category) => {
                  const share = Math.round((category.value / totals.expense) * 100);
                  return (
                    <li key={category.id} className="rank-item">
                      <span className="category-bubble" style={{ '--cat-color': category.color }}>
                        <Icon name={category.icon} size={18} />
                      </span>
                      <div className="rank-item__body">
                        <div className="rank-item__head">
                          <span className="rank-item__name">{category.name}</span>
                          <span className="rank-item__value">
                            {formatCurrency(category.value)} <span className="rank-item__share">({share}%)</span>
                          </span>
                        </div>
                        <ProgressBar value={share} label={`${category.name}: ${share}% das despesas`} tone="muted" size="sm" />
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </>
      )}
    </>
  );
}
