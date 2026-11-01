import { useCallback, useEffect, useRef, useState } from 'react';
import ErrorState from './components/ErrorState/ErrorState';
import Header from './components/Header/Header';
import Icon from './components/Icon/Icon';
import Sidebar from './components/Sidebar/Sidebar';
import TransactionFlows from './components/TransactionFlows/TransactionFlows';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { UIProvider, useUI } from './context/UIContext';
import { useHashRoute } from './hooks/useHashRoute';
import Categories from './pages/Categories/Categories';
import Dashboard from './pages/Dashboard/Dashboard';
import Goals from './pages/Goals/Goals';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Transactions from './pages/Transactions/Transactions';
import { PAGES } from './utils/constants';

const PAGE_COMPONENTS = {
  dashboard: Dashboard,
  transacoes: Transactions,
  categorias: Categories,
  metas: Goals,
  relatorios: Reports,
  configuracoes: Settings,
};

export default function App() {
  const [route, navigate] = useHashRoute();

  return (
    <ThemeProvider>
      <ToastProvider>
        <FinanceProvider>
          <UIProvider>
            <AppShell route={route} navigate={navigate} />
          </UIProvider>
        </FinanceProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

/** Estrutura da tela: sidebar + cabeçalho + conteúdo da página atual. */
function AppShell({ route, navigate }) {
  const { status } = useFinance();
  const { search, setSearch, openTransactionForm } = useUI();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef(null);
  const menuButtonRef = useRef(null);
  const skipFocusRef = useRef(true); // não mexe no foco na primeira renderização nem ao buscar

  const page = PAGES.find((item) => item.id === route);
  const PageComponent = PAGE_COMPONENTS[route];

  // A cada troca de página: título da aba, rolagem ao topo e foco no conteúdo (acessibilidade)
  useEffect(() => {
    document.title = `${page.label} · Finanly`;
    window.scrollTo(0, 0);
    if (skipFocusRef.current) {
      skipFocusRef.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [page]);

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) menuButtonRef.current?.focus();
  }, []);

  // Digitar na busca do cabeçalho leva para a página de Transações sem roubar o foco do campo
  function handleSearchChange(value) {
    setSearch(value);
    if (value && route !== 'transacoes') {
      skipFocusRef.current = true;
      navigate('transacoes');
    }
  }

  function handleSkipLink(event) {
    event.preventDefault();
    mainRef.current?.focus();
  }

  return (
    <div className="app">
      <a className="skip-link" href="#conteudo" onClick={handleSkipLink}>
        Ir para o conteúdo
      </a>

      <Sidebar
        route={route}
        isOpen={menuOpen}
        onClose={closeMenu}
        onLogout={() => toast.info('Esta é uma versão de demonstração: não há login real.')}
      />

      <div className="app__body">
        <Header
          title={page.label}
          search={search}
          onSearchChange={handleSearchChange}
          onMenuClick={() => setMenuOpen(true)}
          menuButtonRef={menuButtonRef}
          onAddTransaction={() => openTransactionForm()}
        />

        <main id="conteudo" ref={mainRef} className="page" tabIndex={-1}>
          {status === 'error' ? <ErrorState /> : <PageComponent />}
        </main>
      </div>

      <button type="button" className="fab" onClick={() => openTransactionForm()} aria-label="Nova transação">
        <Icon name="plus" size={26} />
      </button>

      <TransactionFlows />
    </div>
  );
}
