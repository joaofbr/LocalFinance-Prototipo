import { useToast } from '@/components/ui/ToastProvider'
import { useAuth } from '@/features/auth/useAuth'
import { usePeriod } from '@/features/finance/PeriodContext'
import { useTransactionSheet } from '@/features/finance/TransactionSheetProvider'
import { useInterpretTransaction } from '@/features/finance/hooks'
import { getApiErrorMessage } from '@/lib/apiError'
import { defaultDateInPeriod, todayIso } from '@/lib/format'
import { WelcomeSheet } from './WelcomeSheet'
import {
  useMarkWelcomeSeen,
  useOnboarding,
  useRefreshOnboardingOnMutations,
} from './hooks'

export function OnboardingHost() {
  useRefreshOnboardingOnMutations()
  const { data } = useOnboarding()
  const { user } = useAuth()
  const { year, month } = usePeriod()
  const { openDraft } = useTransactionSheet()
  const { showToast } = useToast()
  const markSeen = useMarkWelcomeSeen()
  const interpret = useInterpretTransaction()

  if (!data?.showWelcome || !user) return null

  const tryIt = (text: string) =>
    interpret.mutate(
      { text, today: todayIso(), defaultDate: defaultDateInPeriod(year, month) },
      {
        onSuccess: (draft) => {
          markSeen.mutate()
          openDraft(draft, text, () => undefined)
        },
        onError: (error) =>
          showToast(
            getApiErrorMessage(error, 'Não foi possível ler o lançamento'),
            'warning',
          ),
      },
    )

  return (
    <WelcomeSheet
      firstName={user.name.trim().split(/\s+/)[0]}
      invited={data.invited}
      familyOwner={data.familyOwner}
      trying={interpret.isPending}
      onTry={tryIt}
      onClose={() => markSeen.mutate()}
    />
  )
}
