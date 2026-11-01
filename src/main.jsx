import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Os estilos globais vêm ANTES do App: assim o CSS de cada componente (importado dentro do App)
// é carregado depois e consegue sobrescrever as regras base quando precisa.
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';

import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
