import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'

type Tone = 'income' | 'expense' | 'neutral'

interface StatCardProps {
  label: string
  value: string
  icon: IconName
  tone: Tone
  valueColor?: string
  className?: string
}

const TONE_STYLES: Record<Tone, { badge: string; value: string }> = {
  income: { badge: 'bg-income-bg text-income', value: 'text-income' },
  expense: { badge: 'bg-expense-bg text-expense', value: 'text-expense' },
  neutral: { badge: 'bg-neutral-bg text-neutral', value: 'text-text' },
}

export function StatCard({
  label,
  value,
  icon,
  tone,
  valueColor,
  className = '',
}: StatCardProps) {
  const styles = TONE_STYLES[tone]
  return (
    <div
      className={`min-w-0 rounded-2xl border border-border bg-surface px-4 py-4 shadow-card sm:px-5 sm:py-[18px] ${className}`}
    >
      <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold text-text-2">
        <span
          className={`flex h-[28px] w-[28px] flex-shrink-0 items-center justify-center rounded-lg ${styles.badge}`}
        >
          <Icon name={icon} size={15} />
        </span>
        <span className="truncate">{label}</span>
      </div>
      <div
        className={`truncate text-[20px] font-extrabold tracking-tight sm:text-[25px] ${styles.value}`}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
    </div>
  )
}
