// Pequenos componentes de interface reutilizados em várias páginas.
// Os estilos estão em src/styles/components.css.

import Icon from '../Icon/Icon';

/** Cartão com título; a ação (link/botão) fica no canto direito. */
export function CardHeader({ title, subtitle, action, id }) {
  return (
    <div className="card__header">
      <div>
        <h2 className="card__title" id={id}>
          {title}
        </h2>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/** Linha no topo das páginas: texto de apoio à esquerda e ações à direita. */
export function PageToolbar({ description, actions }) {
  return (
    <div className="page-toolbar">
      <p className="page-toolbar__text">{description}</p>
      {actions && <div className="page-toolbar__actions">{actions}</div>}
    </div>
  );
}

/** Estado vazio: ícone, mensagem e (opcionalmente) botões de ação. */
export function EmptyState({ icon = 'inbox', title, description, children }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Icon name={icon} size={28} />
      </span>
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__text">{description}</p>}
      {children && <div className="empty-state__actions">{children}</div>}
    </div>
  );
}

/** Barra de progresso acessível (role="progressbar"). `value` vai de 0 a 100. */
export function ProgressBar({ value, label, tone = 'brand', size = 'md' }) {
  const percent = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={`progress progress--${tone} progress--${size}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={label}
    >
      <div className="progress__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}

/** Bloco cinza animado usado enquanto os dados carregam. */
export function Skeleton({ width = '100%', height = 16, radius = 8, className = '' }) {
  return <span className={`skeleton ${className}`.trim()} style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}

/** Legenda dos gráficos (cor + texto; a linha tracejada diferencia a série sem depender só da cor). */
export function ChartLegend({ items }) {
  return (
    <ul className="chart-legend" aria-label="Legenda do gráfico">
      {items.map((item) => (
        <li key={item.label}>
          <span className={`chart-legend__swatch ${item.dashed ? 'is-dashed' : ''}`} style={{ '--swatch': item.color }} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
