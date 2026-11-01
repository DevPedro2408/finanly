import Icon from '../Icon/Icon';
import './Toast.css';

const ICONS = { success: 'check', error: 'alert', info: 'info' };
const LABELS = { success: 'Sucesso', error: 'Erro', info: 'Aviso' };

/**
 * Lista de notificações rápidas (toasts). Cada toast tem role="status" (ou "alert" para erros),
 * então leitores de tela anunciam a mensagem sem mover o foco do usuário.
 */
export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="toast-viewport">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
          <Icon name={ICONS[toast.type]} size={20} className="toast__icon" />
          <p className="toast__message">
            <span className="sr-only">{LABELS[toast.type]}: </span>
            {toast.message}
          </p>
          <button type="button" className="icon-button icon-button--sm" onClick={() => onDismiss(toast.id)} aria-label="Fechar notificação">
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
