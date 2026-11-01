import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icon/Icon';
import './Modal.css';

const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal acessível:
 * - role="dialog" + aria-modal + título associado (aria-labelledby)
 * - foco vai para o primeiro campo ao abrir e volta ao botão de origem ao fechar
 * - Tab fica "preso" dentro do modal; Esc e clique no fundo fecham
 * - a rolagem da página é travada enquanto está aberto
 */
export default function Modal({ title, description, onClose, children, size = 'md' }) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement;
    document.body.classList.add('no-scroll');

    // Foco inicial: elemento marcado com data-autofocus, senão o primeiro focável do conteúdo
    // (o botão de fechar do cabeçalho é ignorado nessa busca)
    const initialFocus =
      dialog.querySelector('[data-autofocus]') ??
      [...dialog.querySelectorAll(FOCUSABLE)].find((element) => !element.closest('.modal__header'));
    (initialFocus ?? dialog).focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...dialog.querySelectorAll(FOCUSABLE)].filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('no-scroll');
      previouslyFocused?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        <header className="modal__header">
          <div>
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="modal__description">
                {description}
              </p>
            )}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar janela">
            <Icon name="close" />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body,
  );
}
