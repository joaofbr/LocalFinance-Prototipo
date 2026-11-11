import { Icon } from './Icon'

interface FormAlertProps {
  message: string
  tone?: 'error' | 'info'
}

export function FormAlert({ message, tone = 'error' }: FormAlertProps) {
  const toneClass =
    tone === 'error'
      ? 'bg-expense-bg text-expense font-semibold'
      : 'border border-border bg-surface-2 text-text-2 font-medium'
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mb-[18px] flex items-start gap-2.5 rounded-xl px-3.5 py-3 text-[13.5px] leading-relaxed ${toneClass}`}
    >
      <span className="mt-[2px] flex-shrink-0">
        <Icon name="alert" size={16} />
      </span>
      <span>{message}</span>
    </div>
  )
}
