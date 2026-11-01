import { useEffect, useRef, useState } from 'react';
import Icon from '../Icon/Icon';
import { useTheme } from '../../context/ThemeContext';
import { initialNotifications } from '../../data/mockData';
import { CURRENT_USER } from '../../utils/constants';
import { getGreeting, getInitials } from '../../utils/format';
import './Header.css';

/** Cabeçalho: título da página, saudação, busca, notificações, tema e avatar. */
export default function Header({ title, search, onSearchChange, onMenuClick, menuButtonRef, onAddTransaction }) {
  const { theme, toggleTheme } = useTheme();
  const firstName = CURRENT_USER.name.split(' ')[0];

  return (
    <header className="header">
      <div className="header__title">
        <button type="button" ref={menuButtonRef} className="icon-button header__menu" onClick={onMenuClick} aria-label="Abrir menu de navegação">
          <Icon name="menu" />
        </button>
        <div className="header__heading">
          <h1>{title}</h1>
          <p>
            {getGreeting()}, {firstName}
          </p>
        </div>
      </div>

      <form className="header__search" role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor="global-search" className="sr-only">
          Buscar transações pelo nome
        </label>
        <Icon name="search" size={18} className="header__search-icon" />
        <input
          id="global-search"
          type="search"
          className="input input--with-icon"
          placeholder="Buscar transações..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          autoComplete="off"
        />
      </form>

      <div className="header__actions">
        <button type="button" className="btn btn--primary header__add" onClick={onAddTransaction}>
          <Icon name="plus" size={18} />
          <span className="header__add-label">Nova transação</span>
        </button>
        <NotificationsMenu />
        <button type="button" className="icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
        </button>
        <span className="avatar" role="img" aria-label={`Usuária ${CURRENT_USER.name}`}>
          {getInitials(CURRENT_USER.name)}
        </span>
      </div>
    </header>
  );
}

/** Sino de notificações com painel suspenso (fecha com Esc ou clicando fora). */
function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialNotifications);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const unreadCount = items.filter((item) => item.unread).length;

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="notifications" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="icon-button"
        aria-expanded={open}
        aria-controls="notifications-panel"
        aria-label={unreadCount ? `Notificações, ${unreadCount} não lidas` : 'Notificações'}
        onClick={() => setOpen((current) => !current)}
      >
        <Icon name="bell" />
        {unreadCount > 0 && (
          <span className="notifications__badge" aria-hidden="true">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div id="notifications-panel" className="notifications__panel" role="region" aria-label="Notificações">
          <div className="notifications__header">
            <h2>Notificações</h2>
            {unreadCount > 0 && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setItems((list) => list.map((item) => ({ ...item, unread: false })))}>
                Marcar como lidas
              </button>
            )}
          </div>
          <ul>
            {items.map((item) => (
              <li key={item.id} className={item.unread ? 'is-unread' : ''}>
                <p className="notifications__title">
                  {item.title}
                  {item.unread && <span className="badge badge--info">Nova</span>}
                </p>
                <p className="notifications__text">{item.text}</p>
                <span className="notifications__time">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
