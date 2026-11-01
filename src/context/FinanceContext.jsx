import { createContext, useContext } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const value = useFinanceData();
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance deve ser usado dentro de <FinanceProvider>.');
  return context;
}
