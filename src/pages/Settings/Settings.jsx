import { useState } from 'react';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import Icon from '../../components/Icon/Icon';
import { CardHeader, PageToolbar } from '../../components/ui/ui';
import { useFinance } from '../../context/FinanceContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { downloadJson } from '../../utils/download';
import './Settings.css';

const THEME_OPTIONS = [
  { value: 'light', label: 'Claro', icon: 'sun' },
  { value: 'dark', label: 'Escuro', icon: 'moon' },
];

/** Configurações: aparência (tema) e gerenciamento dos dados salvos no navegador. */
export default function Settings() {
  const { transactions, categories, goals, restoreDemoData, clearTransactions } = useFinance();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const [pendingAction, setPendingAction] = useState(null); // 'restore' | 'clear' | null

  function handleExport() {
    try {
      downloadJson('finanly-dados.json', { exportedAt: new Date().toISOString(), transactions, categories, goals });
      toast.success('Arquivo finanly-dados.json gerado.');
    } catch {
      toast.error('Não foi possível exportar os dados.');
    }
  }

  async function handleConfirm() {
    try {
      if (pendingAction === 'restore') {
        await restoreDemoData();
        toast.success('Dados de demonstração restaurados.');
      } else {
        await clearTransactions();
        toast.success('Todas as transações foram removidas.');
      }
    } catch {
      toast.error('Não foi possível concluir a ação. Tente novamente.');
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      <PageToolbar description="Personalize a aparência e gerencie os dados salvos neste navegador." />

      <div className="settings-grid">
        <section className="card" aria-labelledby="appearance-title">
          <CardHeader id="appearance-title" title="Aparência" subtitle="O tema escolhido fica salvo neste navegador." />
          <fieldset className="field">
            <legend className="sr-only">Tema da interface</legend>
            <div className="segmented segmented--type">
              {THEME_OPTIONS.map((option) => (
                <label key={option.value} className="segmented__option segmented__option--neutral">
                  <input type="radio" name="theme" value={option.value} checked={theme === option.value} onChange={() => setTheme(option.value)} />
                  <span>
                    <Icon name={option.icon} size={16} />
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="card" aria-labelledby="data-title">
          <CardHeader id="data-title" title="Seus dados" subtitle="Tudo é salvo no localStorage do seu navegador." />
          <ul className="settings-list">
            <li>
              <div>
                <h3>Exportar dados</h3>
                <p>Baixe um arquivo JSON com transações, categorias e metas.</p>
              </div>
              <button type="button" className="btn btn--secondary" onClick={handleExport}>
                <Icon name="download" size={18} /> Exportar
              </button>
            </li>
            <li>
              <div>
                <h3>Restaurar dados de demonstração</h3>
                <p>Volta ao conjunto inicial de exemplo. Suas alterações serão perdidas.</p>
              </div>
              <button type="button" className="btn btn--secondary" onClick={() => setPendingAction('restore')}>
                <Icon name="refresh" size={18} /> Restaurar
              </button>
            </li>
            <li>
              <div>
                <h3>Remover todas as transações</h3>
                <p>Apaga as transações para você começar do zero (e ver os estados vazios).</p>
              </div>
              <button type="button" className="btn btn--secondary btn--danger-text" onClick={() => setPendingAction('clear')}>
                <Icon name="trash" size={18} /> Remover
              </button>
            </li>
          </ul>
        </section>

        <section className="card" aria-labelledby="about-title">
          <CardHeader id="about-title" title="Sobre o Finanly" />
          <p className="muted">
            Projeto de portfólio feito com React, Vite e CSS puro. Os valores exibidos são fictícios e servem apenas para demonstração. O mês de referência do dashboard é o da transação mais recente.
          </p>
        </section>
      </div>

      {pendingAction && (
        <ConfirmDialog
          title={pendingAction === 'restore' ? 'Restaurar dados de demonstração?' : 'Remover todas as transações?'}
          message={
            pendingAction === 'restore'
              ? 'Transações, categorias e metas voltarão ao conjunto inicial. Essa ação não pode ser desfeita.'
              : 'Todas as transações serão apagadas. Categorias e metas continuam salvas. Essa ação não pode ser desfeita.'
          }
          confirmLabel={pendingAction === 'restore' ? 'Restaurar' : 'Remover tudo'}
          tone={pendingAction === 'restore' ? 'primary' : 'danger'}
          onConfirm={handleConfirm}
          onCancel={() => setPendingAction(null)}
        />
      )}
    </>
  );
}
