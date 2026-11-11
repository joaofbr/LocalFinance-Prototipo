import { useState } from 'react'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import { useTheme } from '@/components/theme/ThemeProvider'
import { useToast } from '@/components/ui/ToastProvider'
import { useAccount } from '@/features/household/useAccount'
import { ChangePasswordModal } from '../components/ChangePasswordModal'

export function ProfilePage() {
  const account = useAccount()
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const [changingPassword, setChangingPassword] = useState(false)
  const dark = theme === 'dark'

  return (
    <div className="max-w-[560px]">
      <div className="mb-4 flex items-center gap-4 rounded-[20px] border border-border bg-surface p-5 shadow-card">
        <Avatar name={account.name || 'Usuário'} color={account.color} size={56} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[17px] font-bold">
            {account.name || 'Usuário'}
          </div>
          <div className="truncate text-[13px] text-text-2">{account.email}</div>
          {account.label && (
            <div className="mt-0.5 truncate text-[12.5px] text-text-3">
              {account.label}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-card">
        <SettingsRow
          icon={dark ? 'moon' : 'sun'}
          title="Tema escuro"
          subtitle={dark ? 'Ativado' : 'Desativado'}
        >
          <button
            type="button"
            role="switch"
            aria-checked={dark}
            aria-label="Tema escuro"
            onClick={toggleTheme}
            className={`relative h-[28px] w-[48px] flex-shrink-0 rounded-full transition-colors ${
              dark ? 'bg-primary' : 'bg-border-strong'
            }`}
          >
            <span
              className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-card transition-[left] ${
                dark ? 'left-[23px]' : 'left-[3px]'
              }`}
            />
          </button>
        </SettingsRow>
        <SettingsRow icon="lock" title="Senha" subtitle="Trocar a senha de acesso">
          <button
            type="button"
            onClick={() => setChangingPassword(true)}
            className="rounded-[11px] border border-border-strong px-3.5 py-[9px] text-[13px] font-semibold text-text hover:bg-surface-2"
          >
            Trocar
          </button>
        </SettingsRow>
      </div>

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
  children: ReactNode
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
