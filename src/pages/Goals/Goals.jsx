import { useState } from 'react';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import ContributeModal from '../../components/ContributeModal/ContributeModal';
import GoalModal from '../../components/GoalModal/GoalModal';
import Icon from '../../components/Icon/Icon';
import { CardsPageSkeleton } from '../../components/Skeleton/Skeletons';
import { EmptyState, PageToolbar, ProgressBar } from '../../components/ui/ui';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { formatMonthYear } from '../../utils/dates';
import { getGoalPercent } from '../../utils/finance';
import { formatCurrency } from '../../utils/format';
import './Goals.css';

/** Metas financeiras: criar, acompanhar progresso, adicionar valores e excluir. */
export default function Goals() {
  const { goals, status, addGoal, contributeToGoal, deleteGoal } = useFinance();
  const toast = useToast();
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [contributeTarget, setContributeTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  if (status === 'loading') return <CardsPageSkeleton />;

  async function handleCreate(values) {
    try {
      await addGoal(values);
      toast.success('Meta criada com sucesso.');
      setNewGoalOpen(false);
    } catch (error) {
      toast.error('Não foi possível salvar a meta.');
      throw error;
    }
  }

  async function handleContribute(amount) {
    try {
      await contributeToGoal(contributeTarget.id, amount);
      toast.success(`${formatCurrency(amount)} adicionados à meta.`);
      setContributeTarget(null);
    } catch (error) {
      toast.error('Não foi possível adicionar o valor.');
      throw error;
    }
  }

  async function handleDelete() {
    try {
      await deleteGoal(deleteTarget.id);
      toast.success('Meta excluída.');
    } catch {
      toast.error('Não foi possível excluir a meta.');
    } finally {
      setDeleteTarget(null);
    }
  }

  const completedCount = goals.filter((goal) => goal.current >= goal.target).length;

  return (
    <>
      <PageToolbar
        description={goals.length ? `${goals.length} ${goals.length === 1 ? 'meta' : 'metas'} · ${completedCount} concluída${completedCount === 1 ? '' : 's'}` : 'Defina objetivos e acompanhe o quanto falta para alcançá-los.'}
        actions={
          <button type="button" className="btn btn--primary" onClick={() => setNewGoalOpen(true)}>
            <Icon name="plus" size={18} /> Nova meta
          </button>
        }
      />

      {goals.length === 0 ? (
        <section className="card">
          <EmptyState icon="goals" title="Nenhuma meta cadastrada" description="Crie sua primeira meta, como uma reserva de emergência ou uma viagem.">
            <button type="button" className="btn btn--primary" onClick={() => setNewGoalOpen(true)}>
              <Icon name="plus" size={18} /> Criar meta
            </button>
          </EmptyState>
        </section>
      ) : (
        <ul className="cards-grid" aria-label="Metas financeiras">
          {goals.map((goal) => {
            const percent = getGoalPercent(goal);
            const remaining = Math.max(goal.target - goal.current, 0);
            const isComplete = remaining === 0;

            return (
              <li key={goal.id}>
                <article className="card goal-card">
                  <div className="goal-card__head">
                    <span className="category-bubble category-bubble--lg" style={{ '--cat-color': 'var(--brand)' }}>
                      <Icon name={goal.icon} size={24} />
                    </span>
                    <div className="goal-card__title">
                      <h2>{goal.name}</h2>
                      {goal.deadline && <p>Prazo: {formatMonthYear(goal.deadline)}</p>}
                    </div>
                    <button type="button" className="icon-button icon-button--sm icon-button--danger" onClick={() => setDeleteTarget(goal)} aria-label={`Excluir meta ${goal.name}`}>
                      <Icon name="trash" size={18} />
                    </button>
                  </div>

                  <div className="goal-card__progress">
                    <p className="goal-card__percent">{percent}%</p>
                    {isComplete && (
                      <span className="badge badge--paid">
                        <Icon name="check" size={12} /> Meta concluída
                      </span>
                    )}
                  </div>
                  <ProgressBar value={percent} label={`Progresso da meta ${goal.name}`} />

                  <dl className="goal-card__values">
                    <div>
                      <dt>Atual</dt>
                      <dd>{formatCurrency(goal.current)}</dd>
                    </div>
                    <div>
                      <dt>Meta</dt>
                      <dd>{formatCurrency(goal.target)}</dd>
                    </div>
                    <div>
                      <dt>Faltam</dt>
                      <dd>{formatCurrency(remaining)}</dd>
                    </div>
                  </dl>

                  <button type="button" className="btn btn--secondary" onClick={() => setContributeTarget(goal)}>
                    <Icon name="plus" size={18} /> Adicionar valor
                  </button>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      {newGoalOpen && <GoalModal onSubmit={handleCreate} onClose={() => setNewGoalOpen(false)} />}
      {contributeTarget && <ContributeModal goal={contributeTarget} onSubmit={handleContribute} onClose={() => setContributeTarget(null)} />}
      {deleteTarget && (
        <ConfirmDialog
          title="Excluir meta?"
          message={`Tem certeza que deseja excluir a meta “${deleteTarget.name}”? Essa ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
