import Icon from '../Icon/Icon';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { STATUS_LABELS, TYPE_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/dates';
import { formatSignedCurrency } from '../../utils/format';
import './TransactionList.css';

const FALLBACK_CATEGORY = { name: 'Sem categoria', icon: 'box', color: '#94a3b8' };

/**
 * Lista de transações.
 * - Telas largas: tabela completa
 * - Celular (<= 720px): lista de cartões (sem rolagem horizontal)
 *
 * Só um dos dois é renderizado por vez, assim leitores de tela não leem tudo duplicado.
 */
export default function TransactionList({ transactions, categoriesById, onEdit, onDelete }) {
  const isMobile = useMediaQuery('(max-width: 720px)');
  const props = { transactions, categoriesById, onEdit, onDelete };
  return isMobile ? <TransactionCards {...props} /> : <TransactionTable {...props} />;
}

function CategoryBubble({ category }) {
  return (
    <span className="category-bubble" style={{ '--cat-color': category.color }}>
      <Icon name={category.icon} size={18} />
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span className={`badge badge--${type}`}>
      <Icon name={type === 'income' ? 'arrowDown' : 'arrowUp'} size={12} />
      {TYPE_LABELS[type]}
    </span>
  );
}

function StatusBadge({ status = 'paid' }) {
  return (
    <span className={`badge badge--${status}`}>
      <Icon name={status === 'pending' ? 'clock' : 'check'} size={12} />
      {STATUS_LABELS[status]}
    </span>
  );
}

function Amount({ transaction }) {
  return (
    <span className={`amount amount--${transaction.type} ${transaction.status === 'pending' ? 'is-pending' : ''}`}>
      <span className="sr-only">{TYPE_LABELS[transaction.type]}: </span>
      {formatSignedCurrency(transaction.amount, transaction.type)}
    </span>
  );
}

function RowActions({ transaction, onEdit, onDelete }) {
  return (
    <div className="row-actions">
      <button type="button" className="icon-button icon-button--sm" onClick={() => onEdit(transaction)} aria-label={`Editar ${transaction.name}`}>
        <Icon name="edit" size={18} />
      </button>
      <button type="button" className="icon-button icon-button--sm icon-button--danger" onClick={() => onDelete(transaction)} aria-label={`Excluir ${transaction.name}`}>
        <Icon name="trash" size={18} />
      </button>
    </div>
  );
}

function TransactionTable({ transactions, categoriesById, onEdit, onDelete }) {
  return (
    <div className="tx-table-wrap">
      <table className="tx-table">
        <caption className="sr-only">Lista de transações</caption>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col" className="col-category">
              Categoria
            </th>
            <th scope="col">Data</th>
            <th scope="col" className="col-type">
              Tipo
            </th>
            <th scope="col" className="col-amount">
              Valor
            </th>
            <th scope="col">Status</th>
            <th scope="col" className="col-actions">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => {
            const category = categoriesById[transaction.categoryId] ?? FALLBACK_CATEGORY;
            return (
              <tr key={transaction.id}>
                <td>
                  <div className="tx-name">
                    <CategoryBubble category={category} />
                    <div>
                      <span className="tx-name__title">{transaction.name}</span>
                      <span className="tx-name__sub">{category.name}</span>
                    </div>
                  </div>
                </td>
                <td className="col-category">{category.name}</td>
                <td className="tx-date">{formatDate(transaction.date)}</td>
                <td className="col-type">
                  <TypeBadge type={transaction.type} />
                </td>
                <td className="col-amount">
                  <Amount transaction={transaction} />
                </td>
                <td>
                  <StatusBadge status={transaction.status} />
                </td>
                <td className="col-actions">
                  <RowActions transaction={transaction} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TransactionCards({ transactions, categoriesById, onEdit, onDelete }) {
  return (
    <ul className="tx-cards" aria-label="Lista de transações">
      {transactions.map((transaction) => {
        const category = categoriesById[transaction.categoryId] ?? FALLBACK_CATEGORY;
        return (
          <li key={transaction.id} className="tx-card">
            <div className="tx-card__main">
              <CategoryBubble category={category} />
              <div className="tx-card__info">
                <span className="tx-name__title">{transaction.name}</span>
                <span className="tx-name__sub">
                  {category.name} · {formatDate(transaction.date)}
                </span>
              </div>
              <Amount transaction={transaction} />
            </div>
            <div className="tx-card__footer">
              <div className="tx-card__badges">
                <TypeBadge type={transaction.type} />
                <StatusBadge status={transaction.status} />
              </div>
              <div className="tx-card__actions">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => onEdit(transaction)} aria-label={`Editar ${transaction.name}`}>
                  <Icon name="edit" size={16} /> Editar
                </button>
                <button type="button" className="btn btn--secondary btn--sm btn--danger-text" onClick={() => onDelete(transaction)} aria-label={`Excluir ${transaction.name}`}>
                  <Icon name="trash" size={16} /> Excluir
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
