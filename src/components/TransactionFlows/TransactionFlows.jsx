import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import TransactionModal from '../TransactionModal/TransactionModal';
import { useFinance } from '../../context/FinanceContext';
import { useToast } from '../../context/ToastContext';
import { useUI } from '../../context/UIContext';

/**
 * Renderizado uma única vez no App. Cuida dos dois "fluxos" de transação que podem ser
 * abertos de qualquer página: o formulário (criar/editar) e a confirmação de exclusão.
 * Aqui também acontece o feedback de sucesso/erro (toast).
 */
export default function TransactionFlows() {
  const { addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const { formState, closeTransactionForm, deleteTarget, cancelDelete } = useUI();
  const toast = useToast();

  async function handleSave(values) {
    const editing = formState.transaction;
    try {
      if (editing) {
        await updateTransaction(editing.id, values);
        toast.success('Transação atualizada com sucesso.');
      } else {
        await addTransaction(values);
        toast.success('Transação adicionada com sucesso.');
      }
      closeTransactionForm();
    } catch (error) {
      toast.error('Não foi possível salvar a transação.');
      throw error; // o modal mostra a mensagem detalhada e continua aberto
    }
  }

  async function handleDelete() {
    try {
      await deleteTransaction(deleteTarget.id);
      toast.success('Transação excluída.');
    } catch {
      toast.error('Não foi possível excluir a transação. Tente novamente.');
    } finally {
      cancelDelete();
    }
  }

  return (
    <>
      {formState.open && <TransactionModal transaction={formState.transaction} onSubmit={handleSave} onClose={closeTransactionForm} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Excluir transação?"
          message={`Tem certeza que deseja excluir “${deleteTarget.name}”? Essa ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          onConfirm={handleDelete}
          onCancel={cancelDelete}
        />
      )}
    </>
  );
}
