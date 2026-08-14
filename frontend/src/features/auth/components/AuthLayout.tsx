import type { ReactNode } from 'react'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { BrandPanel } from './BrandPanel'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <BrandPanel />

      <div className="relative flex flex-1 items-center justify-center p-6">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo size={44} />
          </div>

          <h2 className="mb-1.5 text-[26px] font-extrabold tracking-tight">
            {title}
          </h2>
          <p className="mb-7 text-[14.5px] text-text-2">{subtitle}</p>

          {children}

          {footer && (
            <p className="mt-6 text-center text-[13.5px] text-text-2">{footer}</p>
          )}
        </div>
      </div>
    </div>
  )
}
