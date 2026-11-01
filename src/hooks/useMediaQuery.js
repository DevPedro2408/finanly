import { useEffect, useState } from 'react';

/** Retorna true enquanto a media query estiver ativa (ex.: "(max-width: 720px)"). */
export function useMediaQuery(query) {
  const getMatch = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = () => setMatches(mediaQuery.matches);
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

/** true quando o usuário pediu menos animações no sistema operacional. */
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
