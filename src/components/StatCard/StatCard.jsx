import Icon from '../Icon/Icon';
import { formatPercent } from '../../utils/format';
import './StatCard.css';

/**
 * Cartão de indicador (saldo, receitas, despesas, economia...).
 *
 * - change: variação percentual (número), null (sem base de comparação) ou undefined (não mostrar)
 * - inverse: quando true, SUBIR é ruim (ex.: despesas)
 * - O sentido da variação é indicado por seta + sinal + texto, nunca só por cor.
 */
export default function StatCard({ title, value, icon, tone = 'brand', change, inverse = false, comparisonLabel = 'em relação ao mês anterior', footnote }) {
  return (
    <article className={`card stat-card stat-card--${tone}`}>
      <div className="stat-card__top">
        <span className="stat-card__icon">
          <Icon name={icon} size={22} />
        </span>
        <h3 className="stat-card__title">{title}</h3>
      </div>

      <p className="stat-card__value">{value}</p>

      {change !== undefined && <Delta change={change} inverse={inverse} comparisonLabel={comparisonLabel} />}
      {footnote && <p className="stat-card__footnote">{footnote}</p>}
    </article>
  );
}

function Delta({ change, inverse, comparisonLabel }) {
  if (change === null) {
    return <p className="stat-card__delta stat-card__delta--neutral">Sem dados anteriores para comparar</p>;
  }

  const isFlat = Math.abs(change) < 0.05;
  if (isFlat) {
    return <p className="stat-card__delta stat-card__delta--neutral">Sem variação {comparisonLabel}</p>;
  }

  const isRising = change > 0;
  const isGood = inverse ? !isRising : isRising;

  return (
    <p className={`stat-card__delta ${isGood ? 'stat-card__delta--good' : 'stat-card__delta--bad'}`}>
      <span className="delta-chip">
        <Icon name={isRising ? 'arrowUp' : 'arrowDown'} size={14} />
        <span className="sr-only">{isRising ? 'Aumento de ' : 'Redução de '}</span>
        {formatPercent(change)}
      </span>
      <span className="stat-card__comparison">{comparisonLabel}</span>
    </p>
  );
}
