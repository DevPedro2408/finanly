import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { financeService } from '../services/financeService';
import { createId, round2 } from '../utils/format';

// Hook que concentra TODO o estado de dados do app (transações, categorias e metas)
// e as ações que alteram esses dados. As páginas só consomem; não conhecem o localStorage.
//
// Padrão usado nas ações: atualização otimista.
//   1. atualiza a tela na hora;
//   2. tenta salvar pelo serviço;
//   3. se falhar, desfaz a alteração e repassa o erro (quem chamou mostra o toast de erro).

const EMPTY_DATA = { transactions: [], categories: [], goals: [] };

export function useFinanceData() {
  const [data, setData] = useState(EMPTY_DATA);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);
  const dataRef = useRef(EMPTY_DATA); // cópia síncrona para as ações sempre lerem o dado mais recente

  const applyData = useCallback((next) => {
    dataRef.current = next;
    setData(next);
  }, []);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      applyData(await financeService.loadAll());
      setStatus('ready');
    } catch (loadError) {
      setError(loadError);
      setStatus('error');
    }
  }, [applyData]);

  useEffect(() => {
    load();
  }, [load]);

  /** Aplica `updater` a uma coleção, salva e desfaz se o salvamento falhar. */
  const mutate = useCallback(
    async (collection, updater) => {
      const previous = dataRef.current;
      applyData({ ...previous, [collection]: updater(previous[collection]) });
      try {
        await financeService.save(collection, dataRef.current[collection]);
      } catch (saveError) {
        applyData(previous);
        throw saveError;
      }
    },
    [applyData],
  );

  const actions = useMemo(
    () => ({
      reload: load,

      addTransaction: (values) => mutate('transactions', (list) => [{ id: createId('tx'), ...values }, ...list]),

      updateTransaction: (id, values) =>
        mutate('transactions', (list) => list.map((item) => (item.id === id ? { ...item, ...values } : item))),

      deleteTransaction: (id) => mutate('transactions', (list) => list.filter((item) => item.id !== id)),

      clearTransactions: () => mutate('transactions', () => []),

      addCategory: (values) => mutate('categories', (list) => [...list, { id: createId('cat'), ...values }]),

      addGoal: (values) => mutate('goals', (list) => [...list, { id: createId('goal'), ...values }]),

      contributeToGoal: (id, amount) =>
        mutate('goals', (list) =>
          list.map((goal) => (goal.id === id ? { ...goal, current: round2(goal.current + amount) } : goal)),
        ),

      deleteGoal: (id) => mutate('goals', (list) => list.filter((goal) => goal.id !== id)),

      restoreDemoData: async () => {
        applyData(await financeService.resetToDemo());
        setError(null);
        setStatus('ready');
      },
    }),
    [load, mutate, applyData],
  );

  return useMemo(() => ({ ...data, status, error, ...actions }), [data, status, error, actions]);
}
