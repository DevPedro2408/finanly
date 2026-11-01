import { useMemo, useState } from 'react';
import CategoryModal from '../../components/CategoryModal/CategoryModal';
import Icon from '../../components/Icon/Icon';
import { CardsPageSkeleton } from '../../components/Skeleton/Skeletons';
import { PageToolbar, ProgressBar } from '../../components/ui/ui';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { TYPE_LABELS } from '../../utils/constants';
import { getMonthKey } from '../../utils/dates';
import { getReferenceDate, isPaid } from '../../utils/finance';
import { formatCurrency, round2 } from '../../utils/format';
import './Categories.css';

/** Lista de categorias com quantidade de transações e totais. */
export default function Categories() {
  const { transactions, categories, status, addCategory } = useFinance();
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);

  // Uma única passada pelas transações calcula tudo que os cartões precisam
  const stats = useMemo(() => {
    const referenceMonth = getMonthKey(getReferenceDate(transactions));
    const result = Object.fromEntries(categories.map((category) => [category.id, { count: 0, total: 0, month: 0 }]));

    transactions.forEach((transaction) => {
      const entry = result[transaction.categoryId];
      if (!entry) return;
      entry.count += 1;
      if (isPaid(transaction)) {
        entry.total += transaction.amount;
        if (getMonthKey(transaction.date) === referenceMonth) entry.month += transaction.amount;
      }
    });

    Object.values(result).forEach((entry) => {
      entry.total = round2(entry.total);
      entry.month = round2(entry.month);
    });
    return result;
  }, [transactions, categories]);

  const totalExpenses = useMemo(
    () => categories.filter((category) => category.kind === 'expense').reduce((sum, category) => sum + stats[category.id].total, 0),
    [categories, stats],
  );

  if (status === 'loading') return <CardsPageSkeleton />;

  async function handleCreate(values) {
    try {
      await addCategory(values);
      toast.success('Categoria adicionada com sucesso.');
      setModalOpen(false);
    } catch (error) {
      toast.error('Não foi possível salvar a categoria.');
      throw error;
    }
  }

  return (
    <>
      <PageToolbar
        description="Veja onde seu dinheiro entra e para onde ele vai. Os totais consideram apenas transações concluídas."
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
            <Icon name="plus" size={18} /> Nova categoria
          </button>
        }
      />

      <ul className="cards-grid" aria-label="Categorias">
        {categories.map((category) => {
          const entry = stats[category.id];
          const isIncome = category.kind === 'income';
          const share = !isIncome && totalExpenses > 0 ? Math.round((entry.total / totalExpenses) * 100) : 0;

          return (
            <li key={category.id}>
              <article className="card category-card">
                <div className="category-card__head">
                  <span className="category-bubble category-bubble--lg" style={{ '--cat-color': category.color }}>
                    <Icon name={category.icon} size={24} />
                  </span>
                  <div>
                    <h2 className="category-card__name">{category.name}</h2>
                    <span className={`badge badge--${category.kind}`}>
                      <Icon name={isIncome ? 'arrowDown' : 'arrowUp'} size={12} />
                      {TYPE_LABELS[category.kind]}
                    </span>
                  </div>
                </div>

                <dl className="category-card__stats">
                  <div>
                    <dt>Transações</dt>
                    <dd>{entry.count}</dd>
                  </div>
                  <div>
                    <dt>{isIncome ? 'Total recebido' : 'Total gasto'}</dt>
                    <dd>{formatCurrency(entry.total)}</dd>
                  </div>
                  <div>
                    <dt>No mês</dt>
                    <dd>{formatCurrency(entry.month)}</dd>
                  </div>
                </dl>

                {isIncome ? (
                  <p className="category-card__share">Fonte de receitas</p>
                ) : (
                  <>
                    <ProgressBar value={share} label={`${category.name} representa ${share}% das despesas`} tone="muted" size="sm" />
                    <p className="category-card__share">{entry.count === 0 ? 'Nenhuma transação ainda' : `${share}% das despesas`}</p>
                  </>
                )}
              </article>
            </li>
          );
        })}
      </ul>

      {modalOpen && <CategoryModal onSubmit={handleCreate} onClose={() => setModalOpen(false)} />}
    </>
  );
}
