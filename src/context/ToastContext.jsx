import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ToastViewport from '../components/Toast/Toast';

const ToastContext = createContext(null);

const DURATION_MS = { success: 4000, info: 4000, error: 6500 };
let nextToastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((toast) => toast.id !== id)), []);

  const push = useCallback(
    (type, message) => {
      const id = ++nextToastId;
      setToasts((list) => [...list.slice(-2), { id, type, message }]); // no máximo 3 na tela
      window.setTimeout(() => dismiss(id), DURATION_MS[type]);
    },
    [dismiss],
  );

  // API simples: toast.success('...'), toast.error('...'), toast.info('...')
  const api = useMemo(
    () => ({
      success: (message) => push('success', message),
      error: (message) => push('error', message),
      info: (message) => push('info', message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast deve ser usado dentro de <ToastProvider>.');
  return context;
}
