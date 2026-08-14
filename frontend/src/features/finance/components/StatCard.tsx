import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'

type Tone = 'income' | 'expense' | 'neutral'

interface StatCardProps {
  label: string
  value: string
  icon: IconName
  tone: Tone
  valueColor?: string
}

const TONE_STYLES: Record<Tone, { badge: string; value: string }> = {
  income: { badge: 'bg-income-bg text-income', value: 'text-income' },
  expense: { badge: 'bg-expense-bg text-expense', value: 'text-expense' },
  neutral: { badge: 'bg-neutral-bg text-neutral', value: 'text-text' },
}

export function StatCard({ label, value, icon, tone, valueColor }: StatCardProps) {
  const styles = TONE_STYLES[tone]
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-[18px] shadow-card">
      <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-text-2">
        <span
          className={`flex h-[30px] w-[30px] items-center justify-center rounded-lg ${styles.badge}`}
        >
          <Icon name={icon} size={15} />
        </span>
        {label}
      </div>
      <div
        className={`text-[25px] font-extrabold tracking-tight tabular-nums ${styles.value}`}
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
    </div>
  )
}
