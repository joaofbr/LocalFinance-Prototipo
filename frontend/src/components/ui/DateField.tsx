import type { MouseEvent } from 'react'
import { formatDateMedium } from '@/lib/format'
import { Icon } from './Icon'

interface DateFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

function openPickerWithMouse(event: MouseEvent<HTMLInputElement>) {
  if (!window.matchMedia('(pointer: fine)').matches) return
  try {
    event.currentTarget.showPicker()
  } catch {
    return
  }
}

export function DateField({ id, value, onChange, className = '' }: DateFieldProps) {
  return (
    <div
      className={`relative h-[46px] min-w-0 overflow-hidden rounded-xl border-[1.5px] border-border-strong bg-surface transition-colors focus-within:border-primary hover:border-text-3 ${className}`}
    >
      <span className="pointer-events-none flex h-full items-center justify-between gap-2 pl-3.5 pr-3 text-[14px] text-text">
        <span className="truncate">{formatDateMedium(value)}</span>
        <Icon name="calendar" size={17} className="flex-shrink-0 text-text-3" />
      </span>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => {
          if (e.target.value) onChange(e.target.value)
        }}
        onClick={openPickerWithMouse}
        className="absolute inset-0 h-full w-full min-w-0 cursor-pointer appearance-none opacity-0"
      />
    </div>
  )
}
