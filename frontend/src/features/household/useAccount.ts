import { useAuth } from '@/features/auth/useAuth'
import { useHousehold, useMembers } from '@/features/finance/hooks'

const FALLBACK_COLOR = '#3987e5'

export function useAccount() {
  const { user } = useAuth()
  const plan = useHousehold().data?.plan
  const color =
    useMembers().data?.find((member) => member.id === user?.id)?.color ??
    FALLBACK_COLOR

  const label =
    plan === undefined
      ? ''
      : plan === 'individual'
        ? 'Conta individual'
        : user?.role === 'Member'
          ? 'Família · Membro'
          : 'Família · Admin'

  return { name: user?.name ?? '', email: user?.email ?? '', label, color }
}
