import Icon from '../Icon/Icon';
import { SORT_OPTIONS, TRANSACTION_PERIOD_OPTIONS, TYPE_FILTERS } from '../../utils/constants';
import './TransactionFilters.css';

/**
 * Barra de filtros da página de Transações.
 * É um componente "controlado": quem guarda o estado é a página; aqui só exibimos e avisamos mudanças.
 */
export default function TransactionFilters({ filters, onChange, onClear, categories, search, onClearSearch, activeCount, invalidRange }) {
  return (
    <div className="filters">
      <div className="filters__row">
        <div className="segmented segmented--tabs" role="group" aria-label="Filtrar por tipo de transação">
          {TYPE_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`segmented__tab ${filters.type === option.value ? 'is-active' : ''}`}
              aria-pressed={filters.type === option.value}
              onClick={() => onChange({ type: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>

        {activeCount > 0 && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClear}>
            <Icon name="refresh" size={16} /> Limpar filtros
          </button>
        )}
      </div>

      <div className="filters__grid">
        <div className="field">
          <label className="field__label" htmlFor="filter-category">
            Categoria
          </label>
          <select id="filter-category" className="select" value={filters.categoryId} onChange={(event) => onChange({ categoryId: event.target.value })}>
            <option value="all">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="filter-period">
            Período
          </label>
          <select id="filter-period" className="select" value={filters.period} onChange={(event) => onChange({ period: event.target.value })}>
            {TRANSACTION_PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="filter-sort">
            Ordenar por
          </label>
          <select id="filter-sort" className="select" value={filters.sort} onChange={(event) => onChange({ sort: event.target.value })}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {filters.period === 'custom' && (
          <>
            <div className="field">
              <label className="field__label" htmlFor="filter-from">
                De
              </label>
              <input id="filter-from" type="date" className="input" value={filters.from} max={filters.to || undefined} onChange={(event) => onChange({ from: event.target.value })} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor="filter-to">
                Até
              </label>
              <input id="filter-to" type="date" className="input" value={filters.to} min={filters.from || undefined} onChange={(event) => onChange({ to: event.target.value })} />
            </div>
          </>
        )}
      </div>

      {invalidRange && (
        <p className="field__error" role="alert">
          <Icon name="alert" size={14} /> A data inicial precisa ser anterior à data final.
        </p>
      )}

      {search && (
        <p className="filters__chip">
          <span>
            Busca: “{search}”
          </span>
          <button type="button" className="icon-button icon-button--sm" onClick={onClearSearch} aria-label="Remover busca">
            <Icon name="close" size={14} />
          </button>
        </p>
      )}
    </div>
  );
}
