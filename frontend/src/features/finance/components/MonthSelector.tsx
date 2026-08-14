import { Icon } from '@/components/ui/Icon'
import { usePeriod } from '../PeriodContext'

export function MonthSelector() {
  const { label, goToPreviousMonth, goToNextMonth } = usePeriod()

  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface p-1.5 shadow-card">
      <button
        type="button"
        onClick={goToPreviousMonth}
        aria-label="Mês anterior"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-text-2 hover:bg-surface-2"
      >
        <Icon name="chevronLeft" size={18} />
      </button>
      <div className="flex min-w-[130px] items-center justify-center gap-2 px-2 text-[14.5px] font-bold">
        <span className="flex text-primary">
          <Icon name="calendar" size={16} />
        </span>
        {label}
      </div>
      <button
        type="button"
        onClick={goToNextMonth}
        aria-label="Próximo mês"
        className="flex h-[34px] w-[34px] items-center justify-center rounded-lg text-text-2 hover:bg-surface-2"
      >
        <Icon name="chevronRight" size={18} />
      </button>
    </div>
  )
}
