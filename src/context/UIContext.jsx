import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Estado de interface compartilhado entre telas distantes:
// - busca global (digitada no cabeçalho, usada na página de Transações)
// - modal de adicionar/editar transação
// - confirmação de exclusão de transação

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState({ open: false, transaction: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Sem argumento abre o modal para CRIAR; com uma transação abre para EDITAR.
  const openTransactionForm = useCallback((transaction = null) => setFormState({ open: true, transaction }), []);
  const closeTransactionForm = useCallback(() => setFormState({ open: false, transaction: null }), []);
  const requestDelete = useCallback((transaction) => setDeleteTarget(transaction), []);
  const cancelDelete = useCallback(() => setDeleteTarget(null), []);

  const value = useMemo(
    () => ({
      search,
      setSearch,
      formState,
      openTransactionForm,
      closeTransactionForm,
      deleteTarget,
      requestDelete,
      cancelDelete,
    }),
    [search, formState, openTransactionForm, closeTransactionForm, deleteTarget, requestDelete, cancelDelete],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI deve ser usado dentro de <UIProvider>.');
  return context;
}
