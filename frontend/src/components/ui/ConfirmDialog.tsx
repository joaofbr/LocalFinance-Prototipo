import { Icon } from './Icon'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel: string
  destructive?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-[18px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-[420px] rounded-[22px] bg-surface shadow-card-lg"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-[18px]">
          <h3 className="text-[17px] font-extrabold tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 text-text-2"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        <p className="px-5 py-5 text-[14px] leading-relaxed text-text-2">
          {message}
        </p>

        <div className="flex justify-end gap-2.5 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border-strong px-4 py-2.5 text-[14px] font-semibold text-text-2 hover:bg-surface-2"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-xl px-4 py-2.5 text-[14px] font-bold text-white disabled:opacity-60 ${
              destructive ? 'bg-expense' : 'bg-primary'
            }`}
          >
            {busy ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
