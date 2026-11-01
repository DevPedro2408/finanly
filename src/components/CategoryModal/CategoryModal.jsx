import { useState } from 'react';
import Field from '../Field/Field';
import Icon from '../Icon/Icon';
import IconPicker from '../IconPicker/IconPicker';
import Modal from '../Modal/Modal';
import { useFinance } from '../../context/FinanceContext';
import { CATEGORY_COLORS, TYPE_LABELS } from '../../utils/constants';
import { normalizeText } from '../../utils/format';

const INCOME_COLOR = '#0e7c66';

/** Modal para criar uma nova categoria (nome, tipo e ícone). */
export default function CategoryModal({ onSubmit, onClose }) {
  const { categories } = useFinance();
  const [name, setName] = useState('');
  const [kind, setKind] = useState('expense');
  const [icon, setIcon] = useState('box');
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = name.trim();

    if (trimmed.length < 2) return setError('Informe um nome com pelo menos 2 caracteres.');
    if (categories.some((category) => normalizeText(category.name) === normalizeText(trimmed))) {
      return setError('Já existe uma categoria com esse nome.');
    }

    setSaving(true);
    setSubmitError('');
    try {
      await onSubmit({
        name: trimmed,
        icon,
        kind,
        color: kind === 'income' ? INCOME_COLOR : CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length],
      });
    } catch (submitProblem) {
      setSubmitError(submitProblem?.message || 'Não foi possível salvar a categoria.');
      setSaving(false);
    }
    return undefined;
  }

  return (
    <Modal title="Nova categoria" description="Organize suas transações com categorias personalizadas." onClose={onClose} size="sm">
      <form className="modal__form" onSubmit={handleSubmit} noValidate>
        <div className="modal__body">
          {submitError && (
            <p className="form-alert" role="alert">
              <Icon name="alert" size={18} /> {submitError}
            </p>
          )}

          <Field id="cat-name" label="Nome da categoria" error={error} required>
            <input
              id="cat-name"
              className="input"
              type="text"
              maxLength={30}
              placeholder="Ex.: Pets"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError('');
              }}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'cat-name-error' : undefined}
              autoComplete="off"
            />
          </Field>

          <fieldset className="field">
            <legend className="field__label">Tipo</legend>
            <div className="segmented segmented--type">
              {['expense', 'income'].map((option) => (
                <label key={option} className={`segmented__option segmented__option--${option}`}>
                  <input type="radio" name="cat-kind" value={option} checked={kind === option} onChange={() => setKind(option)} />
                  <span>
                    <Icon name={option === 'income' ? 'arrowDown' : 'arrowUp'} size={16} />
                    {TYPE_LABELS[option]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <IconPicker name="cat-icon" value={icon} onChange={setIcon} />
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar categoria'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
