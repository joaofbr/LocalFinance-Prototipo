import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/useAuth'
import { MORE_NAV_ITEMS } from '@/components/layout/navConfig'

export function MorePage() {
  const { user, logout } = useAuth()
  const isAdmin = user?.role !== 'Member'

  return (
    <div className="max-w-[560px]">
      <div className="mb-4 flex items-center gap-3.5 rounded-[20px] border border-border bg-surface p-[18px] shadow-card">
        <Avatar name={user?.name ?? 'LocalFinance'} color="#059669" size={48} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15.5px] font-bold">
            {user?.name ?? 'Minha conta'}
          </div>
          <div className="truncate text-[12.5px] text-text-3">
            {user?.email}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-weak px-2.5 py-1 text-[11.5px] font-semibold text-primary">
          <Icon name="shield" size={12} />
          {isAdmin ? 'Admin' : 'Membro'}
        </span>
      </div>

      <nav className="mb-4 overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
        {MORE_NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-3 border-b border-border p-4 no-underline last:border-b-0 hover:bg-surface-2"
          >
            <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[11px] bg-surface-2 text-text-2">
              <Icon name={item.icon} size={19} />
            </span>
            <span className="min-w-0 flex-1 text-[14.5px] font-semibold text-text">
              {item.label}
            </span>
            <Icon name="chevronRight" size={18} className="text-text-3" />
          </Link>
        ))}
      </nav>

      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-expense bg-expense-bg py-3.5 text-[14.5px] font-bold text-expense"
      >
        <Icon name="logOut" size={18} />
        Sair da conta
      </button>
    </div>
  )
}
