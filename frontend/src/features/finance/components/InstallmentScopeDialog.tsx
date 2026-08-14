import { Icon } from '@/components/ui/Icon'
import type { Transaction, TransactionScope } from '../types'

interface InstallmentScopeDialogProps {
  transaction: Transaction
  action: 'edit' | 'delete'
  busy?: boolean
  onChoose: (scope: TransactionScope) => void
  onCancel: () => void
}

export function InstallmentScopeDialog({
  transaction,
  action,
  busy = false,
  onChoose,
  onCancel,
}: InstallmentScopeDialogProps) {
  const deleting = action === 'delete'
  const current = transaction.installmentNumber ?? 1
  const total = transaction.installmentTotal ?? 1

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-[18px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] rounded-[20px] border border-border bg-surface p-[22px] shadow-card-lg"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-[17px] font-extrabold tracking-tight">
            {deleting ? 'Excluir parcela' : 'Editar parcela'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-3 hover:bg-surface-2"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <p className="mb-5 text-[13.5px] leading-relaxed text-text-2">
          “{transaction.description}” é a parcela {current} de {total}.{' '}
          {deleting
            ? 'O que você quer excluir?'
            : 'A que a alteração deve valer?'}
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => onChoose('one')}
            className="rounded-[14px] border border-border-strong px-4 py-3 text-[14px] font-semibold text-text hover:bg-surface-2 disabled:opacity-60"
          >
            Somente esta parcela
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onChoose('all')}
            className={`rounded-[14px] px-4 py-3 text-[14px] font-bold disabled:opacity-60 ${
              deleting
                ? 'border border-expense bg-expense-bg text-expense'
                : 'bg-primary text-primary-fg'
            }`}
          >
            {busy
              ? 'Aguarde...'
              : deleting
                ? `Excluir todas as ${total} parcelas`
                : `Aplicar às ${total} parcelas`}
          </button>
        </div>

        {!deleting && (
          <p className="mt-4 text-[12px] leading-relaxed text-text-3">
            Valor e data continuam sendo os desta parcela. Categoria,
            integrante, tipo e descrição valem para todas.
          </p>
        )}
      </div>
    </div>
  )
}
