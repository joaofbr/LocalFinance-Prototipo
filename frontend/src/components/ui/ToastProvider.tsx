import { createContext, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from './Icon'

type ToastKind = 'success' | 'neutral'

interface Toast {
  message: string
  kind: ToastKind
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
    timeoutRef.current = setTimeout(() => setToast(null), 2600)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2">
          <div className="flex items-center gap-2.5 rounded-xl bg-text px-4 py-3 text-[13.5px] font-semibold text-bg shadow-card-lg">
            <Icon
              name={toast.kind === 'success' ? 'checkCircle' : 'trash'}
              size={toast.kind === 'success' ? 20 : 18}
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
