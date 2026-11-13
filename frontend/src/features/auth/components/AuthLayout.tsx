import type { ReactNode } from 'react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { AuthShowcase } from './AuthShowcase'
import { BetaBadge } from './BetaBadge'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
  note?: string
}

export function AuthLayout({ title, subtitle, children, footer, note }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface lg:flex-row">
      <AuthShowcase />

      <main className="relative flex flex-1 justify-center px-[22px] pb-10 pt-7 lg:items-center lg:p-10">
        <div className="absolute right-5 top-5 hidden lg:block">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-4">
            <BetaBadge />
          </div>
          <h2 className="mb-1.5 text-[26px] font-extrabold tracking-[-0.03em] lg:text-[30px]">
            {title}
          </h2>
          <p className="mb-7 text-[15px] text-text-2">{subtitle}</p>

          {children}

          {footer && (
            <p className="mt-6 text-center text-[14px] text-text-2">{footer}</p>
          )}

          {note && (
            <p className="mt-8 text-center text-[12.5px] leading-relaxed text-text-3">{note}</p>
          )}
        </div>
      </main>
    </div>
  )
}
