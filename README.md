# Finanly

> Finanly é um dashboard de controle financeiro pessoal que permite acompanhar receitas, despesas, saldo, categorias de gastos e metas financeiras em uma interface moderna e intuitiva.

Projeto de portfólio Front-End construído com **React + Vite + CSS puro** (sem Tailwind, sem TypeScript). Todos os valores são fictícios e servem apenas para demonstração.

## Preview

<!-- Adicione aqui os prints do projeto depois de rodá-lo, por exemplo em /docs: -->
<!-- ![Dashboard (tema claro)](docs/dashboard-light.png) -->
<!-- ![Dashboard (tema escuro)](docs/dashboard-dark.png) -->
<!-- ![Versão mobile](docs/mobile.png) -->

## Funcionalidades

- **Dashboard** com saldo, receitas, despesas e economia, comparados ao mês anterior
- **Gráficos** (Recharts): receitas x despesas dos últimos 6 meses e rosca de despesas por categoria
- **Transações**: adicionar, editar e excluir (com confirmação), com toast de sucesso
- **Busca e filtros que funcionam de verdade**: busca por nome (campo do cabeçalho), tipo, categoria, período (inclusive personalizado) e ordenação
- **Categorias**: quantidade de transações, total e participação nas despesas; criação de novas categorias
- **Metas**: barras de progresso, criação de metas e adição de valores
- **Relatórios** por período (mês, 3 meses, 6 meses, ano): totais, maior categoria, média mensal, economia média e evolução do saldo
- **Tema claro/escuro** com transição suave (respeita `prefers-reduced-motion`) e preferência salva
- **Persistência** em `localStorage` por meio de uma camada de serviço
- **Estados da aplicação**: loading (skeleton), vazio, erro e feedback de sucesso
- **Responsivo de verdade**: sidebar fixa no desktop, compacta no tablet e menu lateral no celular; tabela vira lista de cartões; modais viram "bottom sheet"
- **Acessível**: HTML semântico, labels, foco visível, navegação por teclado, modais com foco preso, gráficos com tabela alternativa para leitores de tela

## Tecnologias utilizadas

- [React 18](https://react.dev/) — componentes e hooks
- [Vite 5](https://vite.dev/) — dev server e build
- [Recharts](https://recharts.org/) — gráficos
- CSS puro — variáveis (tokens), `color-mix`, container queries e media queries

## Estrutura do projeto

```
src/
├── components/        # Componentes reutilizáveis (Sidebar, Header, StatCard, Charts, Modal...)
├── pages/             # Uma pasta por tela (Dashboard, Transactions, Categories, Goals, Reports, Settings)
├── context/           # Estado global: dados financeiros, tema, toasts e UI (modais/busca)
├── hooks/             # useFinanceData, useHashRoute, useMediaQuery, useChartPalette
├── services/          # storage.js (localStorage) e financeService.js (camada de dados)
├── utils/             # Cálculos financeiros, datas, formatação e constantes
├── data/              # Dados fictícios fixos (mockData.js)
├── styles/            # Tokens de design (cores/tema), base, componentes e layout
├── App.jsx
└── main.jsx
```

### Decisões de arquitetura

- **Camada de serviço**: nenhum componente chama `localStorage` diretamente. `services/storage.js` é o único ponto de acesso e `services/financeService.js` expõe métodos **assíncronos**. Para trocar por uma API, basta reescrever o `financeService` (por exemplo com `fetch`) — hooks e componentes não mudam.
- **Cálculos puros**: `utils/finance.js` recebe dados e devolve dados (sem React), o que facilita testar e reaproveitar.
- **Atualização otimista**: as ações em `useFinanceData` atualizam a tela na hora, salvam em seguida e desfazem a alteração se o salvamento falhar.
- **Mês de referência**: o dashboard usa o mês da transação mais recente, então os dados de demonstração sempre aparecem completos, independentemente da data atual.
- **Transações pendentes** aparecem nas listas, mas não entram em saldo, totais e gráficos até serem concluídas.
- **Roteamento por hash** (`#/transacoes`): sem dependência extra e funciona em qualquer hospedagem estática.

## Como instalar

Requisitos: [Node.js](https://nodejs.org/) 18 ou superior.

```bash
npm install
```

## Como executar

```bash
npm run dev
```

Abra o endereço exibido no terminal (normalmente http://localhost:5173).

## Como fazer build

```bash
npm run build     # gera a pasta dist/
npm run preview   # serve o build localmente para conferir
```

O conteúdo de `dist/` pode ser publicado na Vercel, Netlify, GitHub Pages ou qualquer hospedagem estática.

## Melhorias futuras

- Integrar com uma API real (substituindo apenas o `financeService`)
- Testes automatizados (Vitest + Testing Library) para `utils/finance.js` e para os formulários
- Transações recorrentes e parcelamentos
- Orçamento mensal por categoria com alertas
- Exportação de relatórios em CSV/PDF e importação de extratos
- Autenticação e multiusuário
- PWA para uso offline no celular

## Aprendizados

O que este projeto demonstra tecnicamente:

- **React**: composição de telas, renderização condicional (loading, vazio, erro) e portais para modais.
- **Componentização**: componentes pequenos e reutilizáveis (`StatCard`, `Modal`, `Field`, `ProgressBar`, `TransactionList`), cada um com seu CSS.
- **Hooks**: `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useId` e hooks próprios (`useFinanceData`, `useMediaQuery`, `useHashRoute`).
- **Gerenciamento de estado**: Context API dividida por responsabilidade (dados, tema, toasts, UI) com ações centralizadas e atualização otimista com rollback.
- **LocalStorage**: camada de acesso única, tratamento de dados corrompidos e de armazenamento indisponível.
- **Manipulação de dados**: agregações por mês e categoria, variação percentual, saldo acumulado e séries para gráficos.
- **Filtros**: busca que ignora acentos, filtros combinados, período personalizado com validação, ordenação e paginação ("mostrar mais").
- **Gráficos**: áreas, barras e rosca responsivos com Recharts, cores por tema e tooltips customizados.
- **Responsividade**: abordagem mobile-first de verdade (drawer, bottom sheet, tabela → cartões, alvos de toque de 44px) e container queries para esconder colunas conforme o espaço do cartão.
- **CSS**: design tokens com variáveis, tema escuro por atributo `data-theme`, transições respeitando `prefers-reduced-motion`.
- **Acessibilidade**: landmarks e HTML semântico, `aria-*`, foco gerenciado entre páginas e modais, estados indicados por texto e ícone (não só cor) e alternativa textual para gráficos.
