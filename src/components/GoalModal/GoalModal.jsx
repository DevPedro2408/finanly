import { useRef, useState } from 'react';
import Field from '../Field/Field';
import Icon from '../Icon/Icon';
import IconPicker from '../IconPicker/IconPicker';
import Modal from '../Modal/Modal';
import { parseCurrencyInput, round2 } from '../../utils/format';

/** Modal para criar uma nova meta financeira. */
export default function GoalModal({ onSubmit, onClose }) {
  const [values, setValues] = useState({ name: '', target: '', current: '', deadline: '', icon: 'target' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  function validate() {
    const found = {};
    if (values.name.trim().length < 2) found.name = 'Informe um nome com pelo menos 2 caracteres.';

    const target = parseCurrencyInput(values.target);
    if (!Number.isFinite(target) || target <= 0) found.target = 'Informe um valor maior que zero.';

    if (values.current.trim() !== '') {
      const current = parseCurrencyInput(values.current);
      if (!Number.isFinite(current) || current < 0) found.current = 'Informe um valor válido (zero ou maior).';
      else if (Number.isFinite(target) && current > target) found.current = 'O valor atual não pode ser maior que a meta.';
    }
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      window.requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }

    setSaving(true);
    setSubmitError('');
    try {
      await onSubmit({
        name: values.name.trim(),
        icon: values.icon,
        target: round2(parseCurrencyInput(values.target)),
        current: values.current.trim() === '' ? 0 : round2(parseCurrencyInput(values.current)),
        deadline: values.deadline || null,
      });
    } catch (error) {
      setSubmitError(error?.message || 'Não foi possível salvar a meta.');
      setSaving(false);
    }
  }

  const describe = (field) => (errors[field] ? `goal-${field}-error` : undefined);

  return (
    <Modal title="Nova meta" description="Defina quanto você quer juntar e acompanhe o progresso." onClose={onClose}>
      <form ref={formRef} className="modal__form" onSubmit={handleSubmit} noValidate>
        <div className="modal__body">
          {submitError && (
            <p className="form-alert" role="alert">
              <Icon name="alert" size={18} /> {submitError}
            </p>
          )}

          <Field id="goal-name" label="Nome da meta" error={errors.name} required>
            <input
              id="goal-name"
              className="input"
              type="text"
              maxLength={50}
              placeholder="Ex.: Trocar de celular"
              value={values.name}
              onChange={(event) => setField('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describe('name')}
              autoComplete="off"
            />
          </Field>

          <div className="form-grid">
            <Field id="goal-target" label="Valor da meta (R$)" error={errors.target} required>
              <input
                id="goal-target"
                className="input"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={values.target}
                onChange={(event) => setField('target', event.target.value)}
                aria-invalid={Boolean(errors.target)}
                aria-describedby={describe('target')}
                autoComplete="off"
              />
            </Field>

            <Field id="goal-current" label="Já guardado (R$)" error={errors.current} hint="Opcional">
              <input
                id="goal-current"
                className="input"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={values.current}
                onChange={(event) => setField('current', event.target.value)}
                aria-invalid={Boolean(errors.current)}
                aria-describedby={describe('current')}
                autoComplete="off"
              />
            </Field>
          </div>

          <Field id="goal-deadline" label="Prazo" hint="Opcional">
            <input id="goal-deadline" className="input" type="date" value={values.deadline} onChange={(event) => setField('deadline', event.target.value)} />
          </Field>

          <IconPicker name="goal-icon" value={values.icon} onChange={(icon) => setField('icon', icon)} />
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar meta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
