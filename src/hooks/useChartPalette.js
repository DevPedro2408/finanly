import { useTheme } from '../context/ThemeContext';

// Cores dos gráficos (SVG do Recharts) para cada tema.
// Os componentes HTML usam variáveis CSS; o SVG precisa de valores literais.
const CHART_PALETTES = {
  light: {
    income: '#0b7a5f',
    expense: '#d4452a',
    balance: '#3b5bdb',
    grid: '#e1e5dd',
    axis: '#52645a',
    surface: '#ffffff',
  },
  dark: {
    income: '#34d399',
    expense: '#ff8f7a',
    balance: '#8da2fb',
    grid: '#26352e',
    axis: '#9bb0a3',
    surface: '#111a16',
  },
};

export function useChartPalette() {
  const { theme } = useTheme();
  return CHART_PALETTES[theme];
}
