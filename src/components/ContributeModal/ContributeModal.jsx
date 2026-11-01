import { useState } from 'react';
import Field from '../Field/Field';
import Icon from '../Icon/Icon';
import Modal from '../Modal/Modal';
import { formatCurrency, parseCurrencyInput, round2 } from '../../utils/format';

/** Modal para adicionar um valor guardado a uma meta existente. */
export default function ContributeModal({ goal, onSubmit, onClose }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const remaining = Math.max(goal.target - goal.current, 0);

  async function handleSubmit(event) {
    event.preventDefault();
    const value = parseCurrencyInput(amount);
    if (!Number.isFinite(value) || value <= 0) return setError('Informe um valor maior que zero.');

    setSaving(true);
    setSubmitError('');
    try {
      await onSubmit(round2(value));
    } catch (submitProblem) {
      setSubmitError(submitProblem?.message || 'Não foi possível adicionar o valor.');
      setSaving(false);
    }
    return undefined;
  }

  return (
    <Modal
      title="Adicionar valor"
      description={remaining > 0 ? `${goal.name}: faltam ${formatCurrency(remaining)} para atingir a meta.` : `${goal.name}: a meta já foi atingida.`}
      onClose={onClose}
      size="sm"
    >
      <form className="modal__form" onSubmit={handleSubmit} noValidate>
        <div className="modal__body">
          {submitError && (
            <p className="form-alert" role="alert">
              <Icon name="alert" size={18} /> {submitError}
            </p>
          )}
          <Field id="contribute-amount" label="Valor a adicionar (R$)" error={error} required>
            <input
              id="contribute-amount"
              className="input"
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'contribute-amount-error' : undefined}
              autoComplete="off"
            />
          </Field>
        </div>
        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Adicionar valor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
