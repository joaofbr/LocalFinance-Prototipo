import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { Spotlight } from './Spotlight'
import { WelcomeSheet } from './WelcomeSheet'
import { TOUR_STEPS, readPointer, wantsTour } from './guide'
import {
  useMarkWelcomeSeen,
  useOnboarding,
  useRefreshOnboardingOnMutations,
} from './hooks'

type Phase = { kind: 'welcome' } | { kind: 'tour'; step: number } | { kind: 'idle' }

export function OnboardingHost() {
  useRefreshOnboardingOnMutations()
  const { data } = useOnboarding()
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const markSeen = useMarkWelcomeSeen()
  const [phase, setPhase] = useState<Phase>({ kind: 'welcome' })
  const [handledTourKey, setHandledTourKey] = useState<string | null>(null)

  const pointer = readPointer(location.state)
  const clearState = useCallback(
    () => navigate(location.pathname, { replace: true, state: null }),
    [navigate, location.pathname],
  )

  if (wantsTour(location.state) && handledTourKey !== location.key) {
    setHandledTourKey(location.key)
    setPhase({ kind: 'tour', step: 0 })
  }

  const finishTour = () => {
    setPhase({ kind: 'idle' })
    if (data?.showWelcome) markSeen.mutate()
    if (wantsTour(location.state)) clearState()
  }

  const hasGuide = Boolean(data && (data.checklist.length > 0 || data.familyGuide.length > 0))
  const steps = TOUR_STEPS.filter((s) => s.target !== 'getting-started' || hasGuide)

  const goToStep = (step: number) =>
    step >= steps.length ? finishTour() : setPhase({ kind: 'tour', step })

  if (phase.kind === 'tour') {
    const step = Math.min(phase.step, steps.length - 1)
    return (
      <Spotlight
        key={step}
        step={steps[step]}
        position={{ index: step, total: steps.length }}
        primaryLabel={step === steps.length - 1 ? 'Concluir' : 'Próximo'}
        secondaryLabel="Pular tour"
        onPrimary={() => goToStep(step + 1)}
        onSecondary={finishTour}
        onMissing={() => goToStep(step + 1)}
      />
    )
  }

  if (pointer) {
    return (
      <Spotlight
        key={location.key}
        step={pointer}
        primaryLabel="Entendi"
        secondaryLabel="Fechar"
        onPrimary={clearState}
        onSecondary={clearState}
        onTargetClick={clearState}
        onMissing={clearState}
      />
    )
  }

  if (phase.kind === 'welcome' && data?.showWelcome && user) {
    const start = () => {
      if (location.pathname !== '/') navigate('/')
      setPhase({ kind: 'tour', step: 0 })
    }
    return (
      <WelcomeSheet
        firstName={user.name.trim().split(/\s+/)[0]}
        invited={data.invited}
        familyOwner={data.familyOwner}
        onStart={start}
        onClose={() => {
          setPhase({ kind: 'idle' })
          markSeen.mutate()
        }}
      />
    )
  }

  return null
}
