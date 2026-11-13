import { Link } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/useAuth'
import { useHousehold } from '@/features/finance/hooks'
import { useAccount } from '@/features/household/useAccount'
import { InstallSheet } from '@/features/install/InstallSheet'
import { useAddToHomeScreen } from '@/features/install/useAddToHomeScreen'
import { usePlatformOverview } from '@/features/platform/hooks'
import {
  CONSOLE_PATH,
  MORE_NAV_ITEMS,
  visibleNavItems,
} from '@/components/layout/navConfig'

export function MorePage() {
  const { user, logout } = useAuth()
  const account = useAccount()
  const isAdmin = user?.role !== 'Member'
  const isDeveloper = user?.developer ?? false
  const plan = useHousehold().data?.plan
  const pending = usePlatformOverview().data?.pendingAccounts ?? 0
  const install = useAddToHomeScreen()

  return (
    <div className="max-w-[560px]">
      <div className="mb-4 flex items-center gap-3.5 rounded-[20px] border border-border bg-surface p-[18px] shadow-card">
        <Avatar name={account.name || 'Poupi'} color={account.color} size={48} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15.5px] font-bold">
            {account.name || 'Minha conta'}
          </div>
          <div className="truncate text-[12.5px] text-text-3">
            {account.label ? `${account.label} · ${account.email}` : account.email}
          </div>
        </div>
      </div>

      <nav className="mb-4 overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
        {visibleNavItems(MORE_NAV_ITEMS, { isAdmin, isDeveloper, plan }).map((item) => (
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
            {item.to === CONSOLE_PATH && pending > 0 && (
              <span className="min-w-[22px] rounded-full bg-primary px-1.5 text-center text-[11.5px] font-bold leading-[22px] text-primary-fg">
                {pending}
              </span>
            )}
            <Icon name="chevronRight" size={18} className="text-text-3" />
          </Link>
        ))}
      </nav>

      {install.available && install.platform && (
        <>
          <button
            type="button"
            onClick={install.start}
            className="mb-4 flex w-full items-center gap-3 rounded-[20px] border border-border bg-surface p-4 text-left shadow-card hover:bg-surface-2"
          >
            <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[11px] bg-primary-weak text-primary">
              <Icon name="smartphone" size={19} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold text-text">
                Adicionar à tela inicial
              </span>
              <span className="block text-[12.5px] text-text-3">
                Abra o Poupi como um app, em tela cheia.
              </span>
            </span>
            <Icon name="chevronRight" size={18} className="text-text-3" />
          </button>
          {install.sheetOpen && (
            <InstallSheet
              platform={install.platform}
              canPrompt={install.canPrompt}
              onInstall={() => void install.install()}
              onClose={install.closeSheet}
            />
          )}
        </>
      )}

      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-border-strong bg-surface py-3.5 text-[14.5px] font-semibold text-expense hover:bg-expense-bg"
      >
        <Icon name="logOut" size={18} />
        Sair da conta
      </button>
    </div>
  )
}
