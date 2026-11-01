import { useState } from 'react';
import Modal from '../Modal/Modal';

/**
 * Caixa de confirmação (ex.: antes de excluir).
 * `onConfirm` pode ser assíncrono; enquanto roda, os botões ficam desabilitados.
 */
export default function ConfirmDialog({ title, message, confirmLabel = 'Excluir', tone = 'danger', onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={title} description={message} onClose={onCancel} size="sm">
      <div className="modal__footer">
        {/* O foco inicial fica em "Cancelar": a opção mais segura para ações destrutivas */}
        <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={busy} data-autofocus>
          Cancelar
        </button>
        <button type="button" className={`btn ${tone === 'danger' ? 'btn--danger' : 'btn--primary'}`} onClick={handleConfirm} disabled={busy}>
          {busy ? 'Aguarde...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
