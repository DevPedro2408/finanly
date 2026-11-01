import Icon from '../Icon/Icon';
import { ICON_CHOICES } from '../../utils/constants';
import './IconPicker.css';

/** Seletor de ícone (grupo de radios estilizados, navegável por teclado). */
export default function IconPicker({ name, value, onChange, legend = 'Ícone' }) {
  return (
    <fieldset className="field icon-picker">
      <legend className="field__label">{legend}</legend>
      <div className="icon-picker__grid">
        {ICON_CHOICES.map((choice) => (
          <label key={choice.name} className="icon-picker__option">
            <input type="radio" name={name} value={choice.name} checked={value === choice.name} onChange={() => onChange(choice.name)} />
            <span className="icon-picker__item">
              <Icon name={choice.name} size={20} />
              <span className="sr-only">{choice.label}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
