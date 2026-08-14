import { useState } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import { useTheme } from '@/components/theme/ThemeProvider'
import { useToast } from '@/components/ui/ToastProvider'
import { useAuth } from '@/features/auth/useAuth'
import { getInitials } from '@/lib/format'
import { ChangePasswordModal } from '../components/ChangePasswordModal'

export function ProfilePage() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const [changingPassword, setChangingPassword] = useState(false)

  const name = user?.name ?? 'Usuário'
  const isAdmin = user?.role !== 'Member'

  return (
    <div className="max-w-[560px]">
      <div className="mb-4 flex items-center gap-4 rounded-[20px] border border-border bg-surface p-[22px] shadow-card">
        <span className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-full bg-primary-weak text-[22px] font-extrabold text-primary">
          {getInitials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[18px] font-bold">{name}</div>
          <div className="truncate text-[13.5px] text-text-2">
            {user?.email}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary-weak px-2.5 py-1 text-[11.5px] font-semibold text-primary">
          <Icon name="shield" size={12} />
          {isAdmin ? 'Admin' : 'Membro'}
        </span>
      </div>

      <div className="mb-4 overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
        <SettingsRow
          icon={theme === 'dark' ? 'sun' : 'moon'}
          title="Tema escuro"
          subtitle="Alterne entre claro e escuro"
        >
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-[11px] border border-border-strong px-3.5 py-[9px] text-[13px] font-semibold text-text hover:bg-surface-2"
          >
            Alternar
          </button>
        </SettingsRow>
        <SettingsRow
          icon="lock"
          title="Senha"
          subtitle="Trocar a senha de acesso"
        >
          <button
            type="button"
            onClick={() => setChangingPassword(true)}
            className="rounded-[11px] border border-border-strong px-3.5 py-[9px] text-[13px] font-semibold text-text hover:bg-surface-2"
          >
            Trocar
          </button>
        </SettingsRow>
        <SettingsRow icon="globe" title="Idioma" subtitle="Português (Brasil)" />
      </div>

      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-expense bg-expense-bg py-3.5 text-[14.5px] font-bold text-expense"
      >
        <Icon name="logOut" size={18} />
        Sair da conta
      </button>

      {changingPassword && (
        <ChangePasswordModal
          onClose={() => setChangingPassword(false)}
          onSuccess={() => {
            setChangingPassword(false)
            showToast('Senha alterada')
          }}
        />
      )}
    </div>
  )
}

interface SettingsRowProps {
  icon: IconName
  title: string
  subtitle: string
  children?: ReactNode
}

function SettingsRow({ icon, title, subtitle, children }: SettingsRowProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border p-4 last:border-b-0">
      <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[11px] bg-surface-2 text-text-2">
        <Icon name={icon} size={19} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-semibold">{title}</div>
        <div className="text-[12.5px] text-text-3">{subtitle}</div>
      </div>
      {children}
    </div>
  )
}
