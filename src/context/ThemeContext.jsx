import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { storage } from '../services/storage';
import { STORAGE_KEYS } from '../utils/constants';

const ThemeContext = createContext(null);

// Ordem de decisão: preferência salva > preferência do sistema > claro
function getInitialTheme() {
  try {
    const saved = storage.get(STORAGE_KEYS.theme, null);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* valor corrompido: ignora e segue */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Aplica o tema no <html> (o CSS usa [data-theme="dark"]) e salva a escolha.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      storage.set(STORAGE_KEYS.theme, theme);
    } catch {
      /* sem localStorage: o tema vale só para esta sessão */
    }
  }, [theme]);

  const applyTheme = useCallback((next) => {
    // A classe liga as transições de cor só durante a troca (o CSS respeita prefers-reduced-motion)
    const root = document.documentElement;
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 350);
    setTheme(next);
  }, []);

  const toggleTheme = useCallback(() => applyTheme(theme === 'dark' ? 'light' : 'dark'), [applyTheme, theme]);

  const value = useMemo(() => ({ theme, setTheme: applyTheme, toggleTheme }), [theme, applyTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser usado dentro de <ThemeProvider>.');
  return context;
}
