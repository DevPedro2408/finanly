import { useMemo, useRef, useState } from 'react';
import Field from '../Field/Field';
import Icon from '../Icon/Icon';
import Modal from '../Modal/Modal';
import { useFinance } from '../../context/FinanceContext';
import { STATUS_LABELS, TYPE_LABELS } from '../../utils/constants';
import { todayISO } from '../../utils/dates';
import { numberToInput, parseCurrencyInput, round2 } from '../../utils/format';
import './TransactionModal.css';

const MAX_AMOUNT = 999_999_999;

function getInitialValues(transaction, categories) {
  if (transaction) {
    return {
      name: transaction.name,
      amount: numberToInput(transaction.amount),
      type: transaction.type,
      categoryId: transaction.categoryId,
      date: transaction.date,
      description: transaction.description ?? '',
      status: transaction.status ?? 'paid',
    };
  }
  const firstExpenseCategory = categories.find((category) => category.kind === 'expense');
  return { name: '', amount: '', type: 'expense', categoryId: firstExpenseCategory?.id ?? '', date: todayISO(), description: '', status: 'paid' };
}

/** Valida o formulário e devolve { campo: 'mensagem' } (objeto vazio = tudo certo). */
function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Informe um nome com pelo menos 2 caracteres.';

  const amount = parseCurrencyInput(values.amount);
  if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Informe um valor maior que zero. Ex.: 150,00';
  else if (amount > MAX_AMOUNT) errors.amount = 'O valor informado é muito alto.';

  if (!values.categoryId) errors.categoryId = 'Selecione uma categoria.';
  if (!values.date) errors.date = 'Informe a data da transação.';
  return errors;
}

/**
 * Modal de criar/editar transação.
 * - `transaction` presente => modo edição (formulário vem preenchido)
 * - `onSubmit(values)` é assíncrono; se lançar erro, a mensagem aparece no próprio modal
 */
export default function TransactionModal({ transaction, onSubmit, onClose }) {
  const { categories } = useFinance();
  const [values, setValues] = useState(() => getInitialValues(transaction, categories));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const formRef = useRef(null);
  const isEditing = Boolean(transaction);

  // Só mostra categorias do mesmo tipo da transação (receita x despesa)
  const categoryOptions = useMemo(() => categories.filter((category) => category.kind === values.type), [categories, values.type]);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleTypeChange(type) {
    const options = categories.filter((category) => category.kind === type);
    setValues((current) => ({
      ...current,
      type,
      categoryId: options.some((category) => category.id === current.categoryId) ? current.categoryId : (options[0]?.id ?? ''),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const foundErrors = validate(values);
    setErrors(foundErrors);

    if (Object.keys(foundErrors).length > 0) {
      // Leva o foco para o primeiro campo com erro
      window.requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }

    setSaving(true);
    setSubmitError('');
    try {
      await onSubmit({
        name: values.name.trim(),
        amount: round2(parseCurrencyInput(values.amount)),
        type: values.type,
        categoryId: values.categoryId,
        date: values.date,
        description: values.description.trim(),
        status: values.status,
      });
    } catch (error) {
      setSubmitError(error?.message || 'Não foi possível salvar a transação. Tente novamente.');
      setSaving(false);
    }
  }

  const describe = (field) => (errors[field] ? `tx-${field}-error` : undefined);

  return (
    <Modal
      title={isEditing ? 'Editar transação' : 'Nova transação'}
      description={isEditing ? 'Altere os dados e salve para atualizar o dashboard.' : 'Preencha os dados para registrar uma receita ou despesa.'}
      onClose={onClose}
    >
      <form ref={formRef} className="modal__form" onSubmit={handleSubmit} noValidate>
        <div className="modal__body">
          {submitError && (
            <p className="form-alert" role="alert">
              <Icon name="alert" size={18} /> {submitError}
            </p>
          )}

          <fieldset className="field">
            <legend className="field__label">Tipo</legend>
            <div className="segmented segmented--type">
              {['income', 'expense'].map((type) => (
                <label key={type} className={`segmented__option segmented__option--${type}`}>
                  <input type="radio" name="tx-type" value={type} checked={values.type === type} onChange={() => handleTypeChange(type)} />
                  <span>
                    <Icon name={type === 'income' ? 'arrowDown' : 'arrowUp'} size={16} />
                    {TYPE_LABELS[type]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field id="tx-name" label="Nome da transação" error={errors.name} required>
            <input
              id="tx-name"
              data-autofocus
              className="input"
              type="text"
              maxLength={60}
              placeholder="Ex.: Supermercado"
              value={values.name}
              onChange={(event) => setField('name', event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={describe('name')}
              autoComplete="off"
            />
          </Field>

          <div className="form-grid">
            <Field id="tx-amount" label="Valor (R$)" error={errors.amount} required>
              <input
                id="tx-amount"
                className="input"
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={values.amount}
                onChange={(event) => setField('amount', event.target.value)}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={describe('amount')}
                autoComplete="off"
              />
            </Field>

            <Field id="tx-date" label="Data" error={errors.date} required>
              <input
                id="tx-date"
                className="input"
                type="date"
                value={values.date}
                onChange={(event) => setField('date', event.target.value)}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={describe('date')}
              />
            </Field>

            <Field id="tx-category" label="Categoria" error={errors.categoryId} required>
              <select
                id="tx-category"
                className="select"
                value={values.categoryId}
                onChange={(event) => setField('categoryId', event.target.value)}
                aria-invalid={Boolean(errors.categoryId)}
                aria-describedby={describe('categoryId')}
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="tx-status" label="Status" hint="Pendentes não entram no saldo.">
              <select id="tx-status" className="select" value={values.status} onChange={(event) => setField('status', event.target.value)}>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field id="tx-description" label="Descrição (opcional)">
            <textarea
              id="tx-description"
              className="textarea"
              rows={3}
              maxLength={200}
              placeholder="Alguma observação sobre esta transação?"
              value={values.description}
              onChange={(event) => setField('description', event.target.value)}
            />
          </Field>
        </div>

        <div className="modal__footer">
          <button type="button" className="btn btn--secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar transação'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
