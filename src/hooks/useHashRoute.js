import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_PAGE, PAGES } from '../utils/constants';

// Roteamento mínimo baseado em hash (#/transacoes). Para um app com 6 telas
// isso dispensa uma biblioteca de rotas e funciona em qualquer hospedagem estática.

const VALID_ROUTES = PAGES.map((page) => page.id);

function readRoute() {
  const id = window.location.hash.replace(/^#\/?/, '');
  return VALID_ROUTES.includes(id) ? id : DEFAULT_PAGE;
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const handleHashChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((id) => {
    window.location.hash = `/${id}`;
  }, []);

  return [route, navigate];
}
