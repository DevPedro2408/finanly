import { useEffect, useRef } from 'react';
import Icon from '../Icon/Icon';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { CURRENT_USER, PAGES } from '../../utils/constants';
import { getInitials } from '../../utils/format';
import './Sidebar.css';

function LogoMark() {
  return (
    <svg className="brand__mark" width="34" height="34" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="9" fill="#34d399" />
      <path d="M9.5 22v-7M16 22V9.5M22.5 22v-4.5" stroke="#0f1f1a" strokeWidth="3.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/**
 * Navegação principal.
 * - Desktop (>1100px): barra fixa com textos
 * - Tablet (768–1100px): barra compacta só com ícones (o texto continua disponível para leitores de tela)
 * - Mobile (<768px): menu lateral (drawer) aberto pelo botão do cabeçalho
 */
export default function Sidebar({ route, isOpen, onClose, onLogout }) {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const closeButtonRef = useRef(null);

  // Ao abrir o menu no mobile: foca o botão de fechar, fecha com Esc e trava a rolagem da página
  useEffect(() => {
    if (!isOpen || !isMobile) return undefined;

    closeButtonRef.current?.focus();
    document.body.classList.add('no-scroll');
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose(true);
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen, isMobile, onClose]);

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'is-visible' : ''}`} onClick={() => onClose(true)} aria-hidden="true" />

      <aside className={`sidebar ${isOpen ? 'is-open' : ''}`} aria-label="Barra lateral">
        <div className="sidebar__top">
          <a className="brand" href="#/dashboard" aria-label="Finanly — ir para o Dashboard" onClick={() => onClose(false)}>
            <LogoMark />
            <span className="brand__name">Finanly</span>
          </a>
          <button ref={closeButtonRef} type="button" className="icon-button sidebar__close" onClick={() => onClose(true)} aria-label="Fechar menu">
            <Icon name="close" />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Navegação principal">
          <ul>
            {PAGES.map((page) => {
              const isActive = route === page.id;
              return (
                <li key={page.id}>
                  <a
                    href={`#/${page.id}`}
                    className={`nav-link ${isActive ? 'is-active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    title={page.label}
                    onClick={() => onClose(false)}
                  >
                    <Icon name={page.icon} />
                    <span className="nav-link__label">{page.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar__footer">
          <div className="user">
            <span className="avatar" aria-hidden="true">
              {getInitials(CURRENT_USER.name)}
            </span>
            <div className="user__info">
              <strong>{CURRENT_USER.name}</strong>
              <span>{CURRENT_USER.plan}</span>
            </div>
          </div>
          <button type="button" className="nav-link nav-link--button" onClick={onLogout} title="Sair">
            <Icon name="logout" />
            <span className="nav-link__label">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
