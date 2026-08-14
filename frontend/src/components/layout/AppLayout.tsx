import { Outlet, useLocation } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { PeriodProvider } from '@/features/finance/PeriodContext'
import {
  TransactionSheetProvider,
  useTransactionSheet,
} from '@/features/finance/TransactionSheetProvider'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { PullToRefresh } from './PullToRefresh'
import { getPageTitle } from './navConfig'

export function AppLayout() {
  return (
    <PeriodProvider>
      <TransactionSheetProvider>
        <AppShell />
      </TransactionSheetProvider>
    </PeriodProvider>
  )
}

function AppShell() {
  const location = useLocation()
  const { openNew } = useTransactionSheet()
  const title = getPageTitle(location.pathname)

  return (
    <div className="flex min-h-screen">
      <PullToRefresh />
      <Sidebar />

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-bg px-5 py-3.5">
          <div className="flex items-center gap-2.5 lg:hidden">
            <Logo size={36} withWordmark={false} />
            <span className="text-[17px] font-extrabold tracking-tight">
              {title}
            </span>
          </div>
          <h1 className="hidden text-[21px] font-extrabold tracking-tight lg:block">
            {title}
          </h1>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <div className="safe-content mx-auto w-full max-w-[1120px] flex-1 p-5">
          <Outlet />
        </div>
      </main>

      <BottomNav onNewTransaction={openNew} />
    </div>
  )
}
