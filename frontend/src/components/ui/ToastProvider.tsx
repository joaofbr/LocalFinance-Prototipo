import { createContext, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'
import type { IconName } from './Icon'

type ToastKind = 'success' | 'neutral' | 'warning'

interface Toast {
  message: string
  kind: ToastKind
}

const ICON_BY_KIND: Record<ToastKind, IconName> = {
  success: 'checkCircle',
  neutral: 'trash',
  warning: 'alert',
}

const STYLE_BY_KIND: Record<ToastKind, string> = {
  success: 'bg-text text-bg',
  neutral: 'bg-text text-bg',
  warning: 'border border-expense bg-expense-bg text-expense',
}

const DURATION_BY_KIND: Record<ToastKind, number> = {
  success: 2600,
  neutral: 2600,
  warning: 7000,
}

interface ToastContextValue {
  showToast: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (message: string, kind: ToastKind = 'success') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setToast({ message, kind })
    timeoutRef.current = setTimeout(() => setToast(null), DURATION_BY_KIND[kind])
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 z-[60] w-[min(92vw,26rem)] -translate-x-1/2"
        >
          <div
            className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13.5px] font-semibold shadow-card-lg ${STYLE_BY_KIND[toast.kind]}`}
          >
            <Icon
              name={ICON_BY_KIND[toast.kind]}
              size={toast.kind === 'success' ? 20 : 18}
              className="flex-shrink-0"
            />
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
