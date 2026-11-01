import { useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon/Icon';
import { ListPageSkeleton } from '../../components/Skeleton/Skeletons';
import TransactionFilters from '../../components/TransactionFilters/TransactionFilters';
import TransactionList from '../../components/TransactionList/TransactionList';
import { CardHeader, EmptyState, PageToolbar } from '../../components/ui/ui';
import { useFinance } from '../../context/FinanceContext';
import { useUI } from '../../context/UIContext';
import { PAGE_SIZE } from '../../utils/constants';
import { filterTransactions, getPeriodRange, getReferenceDate, sortTransactions, sumTransactions } from '../../utils/finance';
import { formatCurrency, indexById } from '../../utils/format';
import './Transactions.css';

const INITIAL_FILTERS = { type: 'all', categoryId: 'all', period: 'all', from: '', to: '', sort: 'recent' };

/** Lista completa de transações com busca (do cabeçalho), filtros, ordenação e "mostrar mais". */
export default function Transactions() {
  const { transactions, categories, status } = useFinance();
  const { search, setSearch, openTransactionForm, requestDelete } = useUI();
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const categoriesById = useMemo(() => indexById(categories), [categories]);
  const referenceDate = useMemo(() => getReferenceDate(transactions), [transactions]);
  const invalidRange = Boolean(filters.period === 'custom' && filters.from && filters.to && filters.from > filters.to);

  // Pipeline: filtrar (busca + tipo + categoria + período) -> ordenar
  const filtered = useMemo(() => {
    const range = invalidRange ? null : getPeriodRange(filters.period, referenceDate, { from: filters.from, to: filters.to });
    const matches = filterTransactions(transactions, { search, type: filters.type, categoryId: filters.categoryId, range });
    return sortTransactions(matches, filters.sort);
  }, [transactions, search, filters, referenceDate, invalidRange]);

  const totals = useMemo(() => sumTransactions(filtered), [filtered]);

  // Qualquer mudança de busca volta a lista para a primeira "página"
  useEffect(() => setVisibleCount(PAGE_SIZE), [search]);

  if (status === 'loading') return <ListPageSkeleton />;

  const activeCount = [filters.type !== 'all', filters.categoryId !== 'all', filters.period !== 'all', Boolean(search)].filter(Boolean).length;

  function updateFilters(patch) {
    setFilters((current) => ({ ...current, ...patch }));
    setVisibleCount(PAGE_SIZE);
  }

  function clearAll() {
    setFilters(INITIAL_FILTERS);
    setSearch('');
    setVisibleCount(PAGE_SIZE);
  }

  const hasAnyTransaction = transactions.length > 0;

  return (
    <>
      <PageToolbar
        description="Pesquise, filtre e gerencie todas as suas movimentações."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => openTransactionForm()}>
            <Icon name="plus" size={18} /> Nova transação
          </button>
        }
      />

      <section className="card" aria-labelledby="transactions-title">
        <CardHeader id="transactions-title" title="Todas as transações" />

        <TransactionFilters
          filters={filters}
          onChange={updateFilters}
          onClear={clearAll}
          categories={categories}
          search={search}
          onClearSearch={() => setSearch('')}
          activeCount={activeCount}
          invalidRange={invalidRange}
        />

        {filtered.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="Nenhuma transação encontrada."
            description={hasAnyTransaction ? 'Nenhum resultado para a busca e os filtros aplicados.' : 'Comece registrando sua primeira receita ou despesa.'}
          >
            {hasAnyTransaction && activeCount > 0 && (
              <button type="button" className="btn btn--secondary" onClick={clearAll}>
                Limpar filtros
              </button>
            )}
            <button type="button" className="btn btn--primary" onClick={() => openTransactionForm()}>
              <Icon name="plus" size={18} /> Adicionar transação
            </button>
          </EmptyState>
        ) : (
          <>
            <p className="list-summary" aria-live="polite">
              <span>
                <strong>{filtered.length}</strong> {filtered.length === 1 ? 'transação' : 'transações'}
              </span>
              <span>
                Receitas: <strong className="text-income">{formatCurrency(totals.income)}</strong>
              </span>
              <span>
                Despesas: <strong className="text-expense">{formatCurrency(totals.expense)}</strong>
              </span>
            </p>

            <TransactionList transactions={filtered.slice(0, visibleCount)} categoriesById={categoriesById} onEdit={openTransactionForm} onDelete={requestDelete} />

            {filtered.length > visibleCount && (
              <div className="load-more">
                <button type="button" className="btn btn--secondary" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                  Mostrar mais ({filtered.length - visibleCount} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
