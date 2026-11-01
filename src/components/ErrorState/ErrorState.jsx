import { useState } from 'react';
import Icon from '../Icon/Icon';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';

/** Tela de erro amigável quando os dados salvos não puderem ser carregados. */
export default function ErrorState() {
  const { error, reload, restoreDemoData } = useFinance();
  const toast = useToast();
  const [restoring, setRestoring] = useState(false);

  async function handleRestore() {
    setRestoring(true);
    try {
      await restoreDemoData();
      toast.success('Dados de demonstração restaurados.');
    } catch (restoreError) {
      toast.error(restoreError.message || 'Não foi possível restaurar os dados.');
      setRestoring(false);
    }
  }

  return (
    <div className="card error-state" role="alert">
      <span className="empty-state__icon empty-state__icon--danger">
        <Icon name="alert" size={28} />
      </span>
      <h2 className="empty-state__title">Não foi possível carregar seus dados</h2>
      <p className="empty-state__text">{error?.message || 'Ocorreu um erro inesperado.'} Você pode tentar novamente ou restaurar os dados de demonstração.</p>
      <div className="empty-state__actions">
        <button type="button" className="btn btn--primary" onClick={reload}>
          <Icon name="refresh" size={18} /> Tentar novamente
        </button>
        <button type="button" className="btn btn--secondary" onClick={handleRestore} disabled={restoring}>
          {restoring ? 'Restaurando...' : 'Restaurar dados de exemplo'}
        </button>
      </div>
    </div>
  );
}
