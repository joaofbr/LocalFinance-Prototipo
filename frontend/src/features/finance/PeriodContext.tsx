import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { formatPeriodLabel } from '@/lib/format'

interface PeriodContextValue {
  year: number
  month: number
  label: string
  goToPreviousMonth: () => void
  goToNextMonth: () => void
}

const PeriodContext = createContext<PeriodContextValue | null>(null)

export function PeriodProvider({ children }: { children: ReactNode }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const shift = (delta: number) => {
    setMonth((currentMonth) => {
      const next = currentMonth + delta
      if (next < 0) {
        setYear((y) => y - 1)
        return 11
      }
      if (next > 11) {
        setYear((y) => y + 1)
        return 0
      }
      return next
    })
  }

  const value: PeriodContextValue = {
    year,
    month,
    label: formatPeriodLabel(year, month),
    goToPreviousMonth: () => shift(-1),
    goToNextMonth: () => shift(1),
  }

  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePeriod(): PeriodContextValue {
  const context = useContext(PeriodContext)
  if (!context) {
    throw new Error('usePeriod must be used within a PeriodProvider')
  }
  return context
}
