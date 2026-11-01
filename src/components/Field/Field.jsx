import Icon from '../Icon/Icon';

/**
 * Agrupa label + controle + dica/erro.
 * O controle (input/select/textarea) vem em `children` e deve usar o mesmo `id`.
 * Para o leitor de tela ler o erro, o controle usa aria-describedby={`${id}-error`}.
 */
export default function Field({ id, label, error, hint, required = false, children, className = '' }) {
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
      <label htmlFor={id} className="field__label">
        {label}
        {required && (
          <span className="field__required" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`}>
          <Icon name="alert" size={14} /> {error}
        </p>
      )}
    </div>
  );
}
