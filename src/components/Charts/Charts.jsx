import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useChartPalette } from '../../hooks/useChartPalette';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery';
import { formatCompactCurrency, formatCurrency } from '../../utils/format';
import { EmptyState } from '../ui/ui';
import './Charts.css';

// Os gráficos são desenhados em SVG (Recharts) e escondidos de leitores de tela (aria-hidden).
// Em troca, cada gráfico traz uma tabela com os mesmos dados, visível só para leitores de tela.

function ChartFigure({ height, caption, columns, rows, children }) {
  return (
    <figure className="chart">
      <div className="chart__canvas" style={{ '--chart-height': `${height}px` }} aria-hidden="true">
        {children}
      </div>
      {/* A tabela fica dentro de uma div .sr-only: navegadores não aplicam overflow/clip de forma confiável em <table> */}
      <div className="sr-only">
        <table>
          <caption>{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th key={cellIndex} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={cellIndex}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Balão exibido ao passar o mouse/tocar: título + uma linha por série (com nome, não só cor). */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const title = payload[0]?.payload?.fullLabel ?? label;

  return (
    <div className="chart-tooltip">
      {title && <p className="chart-tooltip__title">{title}</p>}
      <ul>
        {payload.map((item) => (
          <li key={item.dataKey ?? item.name}>
            <span className="chart-tooltip__swatch" style={{ background: item.color ?? item.payload?.color }} />
            <span className="chart-tooltip__name">{item.name}</span>
            <strong>{formatCurrency(item.value)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useAxisProps(palette) {
  return {
    xAxis: { tickLine: false, axisLine: false, tick: { fill: palette.axis, fontSize: 12 }, tickMargin: 8, interval: 'preserveStartEnd', minTickGap: 12 },
    yAxis: { tickLine: false, axisLine: false, tick: { fill: palette.axis, fontSize: 12 }, width: 52, tickFormatter: formatCompactCurrency },
  };
}

/** Área: receitas (linha contínua) x despesas (linha tracejada) por período. */
export function CashflowChart({ data, height = 280 }) {
  const palette = useChartPalette();
  const reduceMotion = usePrefersReducedMotion();
  const axis = useAxisProps(palette);

  return (
    <ChartFigure
      height={height}
      caption="Receitas e despesas por mês"
      columns={['Período', 'Receitas', 'Despesas']}
      rows={data.map((item) => [item.fullLabel, formatCurrency(item.income), formatCurrency(item.expense)])}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} accessibilityLayer={false}>
          <defs>
            <linearGradient id="cashflow-income" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.income} stopOpacity={0.28} />
              <stop offset="100%" stopColor={palette.income} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cashflow-expense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.expense} stopOpacity={0.2} />
              <stop offset="100%" stopColor={palette.expense} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axis.xAxis} />
          <YAxis {...axis.yAxis} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: palette.axis, strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="income" name="Receitas" stroke={palette.income} strokeWidth={2.5} fill="url(#cashflow-income)" isAnimationActive={!reduceMotion} />
          <Area type="monotone" dataKey="expense" name="Despesas" stroke={palette.expense} strokeWidth={2.5} strokeDasharray="6 4" fill="url(#cashflow-expense)" isAnimationActive={!reduceMotion} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}

/** Barras agrupadas: receitas x despesas (usado em Relatórios). */
export function CashflowBars({ data, height = 280 }) {
  const palette = useChartPalette();
  const reduceMotion = usePrefersReducedMotion();
  const axis = useAxisProps(palette);

  return (
    <ChartFigure
      height={height}
      caption="Receitas e despesas no período"
      columns={['Período', 'Receitas', 'Despesas']}
      rows={data.map((item) => [item.fullLabel, formatCurrency(item.income), formatCurrency(item.expense)])}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2} accessibilityLayer={false}>
          <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axis.xAxis} />
          <YAxis {...axis.yAxis} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: palette.grid, fillOpacity: 0.5 }} />
          <Bar dataKey="income" name="Receitas" fill={palette.income} radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={!reduceMotion} />
          <Bar dataKey="expense" name="Despesas" fill={palette.expense} fillOpacity={0.55} stroke={palette.expense} strokeWidth={1.5} radius={[4, 4, 0, 0]} maxBarSize={26} isAnimationActive={!reduceMotion} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}

/** Evolução do saldo acumulado. */
export function BalanceChart({ data, height = 280 }) {
  const palette = useChartPalette();
  const reduceMotion = usePrefersReducedMotion();
  const axis = useAxisProps(palette);

  return (
    <ChartFigure
      height={height}
      caption="Evolução do saldo"
      columns={['Período', 'Saldo']}
      rows={data.map((item) => [item.fullLabel, formatCurrency(item.balance)])}
    >
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} accessibilityLayer={false}>
          <defs>
            <linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.balance} stopOpacity={0.25} />
              <stop offset="100%" stopColor={palette.balance} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axis.xAxis} />
          <YAxis {...axis.yAxis} />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: palette.axis, strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="balance" name="Saldo" stroke={palette.balance} strokeWidth={2.5} fill="url(#balance-fill)" isAnimationActive={!reduceMotion} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}

/** Rosca de despesas por categoria + legenda com valores e porcentagens. */
export function CategoryDonut({ data, height = 220 }) {
  const palette = useChartPalette();
  const reduceMotion = usePrefersReducedMotion();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!data.length) {
    return <EmptyState icon="inbox" title="Sem despesas neste mês" description="Quando houver despesas concluídas, elas aparecem aqui por categoria." />;
  }

  return (
    <div className="donut">
      <ChartFigure
        height={height}
        caption="Despesas por categoria"
        columns={['Categoria', 'Valor']}
        rows={data.map((item) => [item.name, formatCurrency(item.value)])}
      >
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <PieChart accessibilityLayer={false}>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="94%" paddingAngle={2} stroke={palette.surface} strokeWidth={2} isAnimationActive={!reduceMotion}>
              {data.map((item) => (
                <Cell key={item.id} fill={item.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut__center">
          <span>Total</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </ChartFigure>

      <ul className="legend">
        {data.map((item) => (
          <li key={item.id}>
            <span className="legend__swatch" style={{ background: item.color }} aria-hidden="true" />
            <span className="legend__name">{item.name}</span>
            <span className="legend__value">{formatCurrency(item.value)}</span>
            <span className="legend__percent">{Math.round((item.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
