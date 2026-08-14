import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { BOTTOM_NAV_ITEMS } from './navConfig'

interface BottomNavProps {
  onNewTransaction: () => void
}

export function BottomNav({ onNewTransaction }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex items-end border-t border-border bg-surface safe-nav px-1.5 pt-1.5 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.15)] lg:hidden">
      {BOTTOM_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-[3px] py-1.5 text-[11px] ${isActive ? 'font-semibold text-primary' : 'font-medium text-text-3'
            }`
          }
        >
          <Icon name={item.icon} size={21} />
          <span>{item.label}</span>
        </NavLink>
      ))}
      <button
        type="button"
        onClick={onNewTransaction}
        aria-label="Novo lançamento"
        className="safe-fab absolute left-1/2 flex h-[58px] w-[58px] -translate-x-1/2 items-center justify-center rounded-full border-4 border-bg bg-primary text-primary-fg shadow-card-lg"
      >
        <Icon name="plus" size={26} strokeWidth={2.4} />
      </button>
    </nav>
  )
}
