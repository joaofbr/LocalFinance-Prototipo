import { Icon } from '@/components/ui/Icon'
import type { Transaction, TransactionScope } from '../types'

interface SeriesScopeDialogProps {
  transaction: Transaction
  action: 'edit' | 'delete'
  busy?: boolean
  onChoose: (scope: TransactionScope) => void
  onCancel: () => void
}

export function SeriesScopeDialog({
  transaction,
  action,
  busy = false,
  onChoose,
  onCancel,
}: SeriesScopeDialogProps) {
  const deleting = action === 'delete'
  const fixed = transaction.seriesKind === 'fixed'
  const shared = (transaction.splitTotal ?? 0) > 1
  const index = transaction.seriesIndex ?? 1
  const total = transaction.seriesTotal ?? 1
  const remaining = total - index + 1

  const broadScope: TransactionScope = fixed ? 'future' : 'all'

  const broadLabel = fixed
    ? deleting
      ? `Encerrar: excluir os ${remaining} meses restantes`
      : `Aplicar deste mês em diante (${remaining} meses)`
    : deleting
      ? `Excluir todas as ${total} parcelas`
      : `Aplicar às ${total} parcelas`

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
            {deleting
              ? fixed
                ? 'Excluir gasto fixo'
                : 'Excluir parcela'
              : fixed
                ? 'Editar gasto fixo'
                : 'Editar parcela'}
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
          “{transaction.description}” é{' '}
          {fixed
            ? `o mês ${index} de ${total} de um lançamento fixo`
            : `a parcela ${index} de ${total}`}
          {shared ? `, dividido entre ${transaction.splitTotal} integrantes` : ''}
          . {deleting ? 'O que você quer excluir?' : 'A que a alteração vale?'}
        </p>
        {shared && (
          <p className="mb-5 -mt-3 text-[12px] leading-relaxed text-text-3">
            Vale para todos os participantes: não dá para remover a parte de um
            só e deixar a do outro.
          </p>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => onChoose('one')}
            className="rounded-[14px] border border-border-strong px-4 py-3 text-[14px] font-semibold text-text hover:bg-surface-2 disabled:opacity-60"
          >
            Somente este mês
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onChoose(broadScope)}
            className={`rounded-[14px] px-4 py-3 text-[14px] font-bold disabled:opacity-60 ${
              deleting
                ? 'border border-expense bg-expense-bg text-expense'
                : 'bg-primary text-primary-fg'
            }`}
          >
            {busy ? 'Aguarde...' : broadLabel}
          </button>
        </div>

        {!deleting && (
          <p className="mt-4 text-[12px] leading-relaxed text-text-3">
            {fixed
              ? 'Os meses anteriores mantêm o valor antigo, preservando o histórico do que já foi pago.'
              : 'Valor e data continuam sendo os desta parcela. Categoria, integrante, tipo e descrição valem para todas.'}
          </p>
        )}
      </div>
    </div>
  )
}
