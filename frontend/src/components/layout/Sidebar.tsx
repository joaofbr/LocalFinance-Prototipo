import { NavLink } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/useAuth'
import { NAV_ITEMS } from './navConfig'

export function Sidebar() {
  const { user, logout } = useAuth()
  const isAdmin = user?.role !== 'Member'

  return (
    <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-border bg-surface px-4 py-[22px] lg:flex">
      <div className="mb-6 px-2 py-1">
        <Logo size={40} />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5">
        {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] ${isActive
                ? 'bg-primary-weak font-semibold text-primary'
                : 'font-medium text-text-2 hover:bg-surface-2'
              }`
            }
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-2.5 border-t border-border pt-3.5">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar
            name={user?.name ?? 'LocalFinance'}
            color="#059669"
            size={36}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px] font-semibold">
              {user?.name ?? 'Minha conta'}
            </div>
            <div className="truncate text-[11.5px] text-text-3">
              {user?.role === 'Member' ? 'Membro' : 'Admin'}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sair"
            aria-label="Sair"
            className="flex rounded-lg p-1.5 text-text-3 hover:bg-surface-2"
          >
            <Icon name="logOut" size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
