import { Skeleton } from '../ui/ui';

// Esqueletos de carregamento. Cada um imita o formato do conteúdo real para evitar "pulos" de layout.

function Busy({ children, label = 'Carregando dados...' }) {
  return (
    <div aria-busy="true" className="skeleton-wrap">
      <span className="sr-only" role="status">
        {label}
      </span>
      {children}
    </div>
  );
}

export function StatsSkeleton({ count = 4, className = 'stat-grid' }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="card stat-card" key={index}>
          <Skeleton width={40} height={40} radius={12} />
          <Skeleton width="45%" height={14} />
          <Skeleton width="70%" height={28} />
          <Skeleton width="85%" height={14} />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 280 }) {
  return (
    <div className="card" aria-hidden="true">
      <Skeleton width="40%" height={20} />
      <div style={{ height: 16 }} />
      <Skeleton width="100%" height={height} radius={12} />
    </div>
  );
}

export function ListSkeleton({ rows = 5 }) {
  return (
    <div className="card" aria-hidden="true">
      <Skeleton width="35%" height={20} />
      <div className="skeleton-rows">
        {Array.from({ length: rows }, (_, index) => (
          <div className="skeleton-row" key={index}>
            <Skeleton width={40} height={40} radius={12} />
            <div className="skeleton-row__text">
              <Skeleton width="50%" height={14} />
              <Skeleton width="30%" height={12} />
            </div>
            <Skeleton width={80} height={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Esqueleto da página inicial (Dashboard). */
export function DashboardSkeleton() {
  return (
    <Busy>
      <StatsSkeleton />
      <div className="dashboard-grid">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      <ListSkeleton />
    </Busy>
  );
}

/** Esqueleto genérico de páginas com lista. */
export function ListPageSkeleton() {
  return (
    <Busy>
      <ListSkeleton rows={6} />
    </Busy>
  );
}

/** Esqueleto de páginas em grade de cartões (Categorias e Metas). */
export function CardsPageSkeleton() {
  return (
    <Busy>
      <div className="cards-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="card" key={index}>
            <Skeleton width={44} height={44} radius={12} />
            <div style={{ height: 14 }} />
            <Skeleton width="60%" height={18} />
            <div style={{ height: 10 }} />
            <Skeleton width="100%" height={12} />
          </div>
        ))}
      </div>
    </Busy>
  );
}

/** Esqueleto de Relatórios. */
export function ReportsSkeleton() {
  return (
    <Busy>
      <StatsSkeleton count={6} className="stat-grid stat-grid--3" />
      <div className="dashboard-grid">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </Busy>
  );
}
