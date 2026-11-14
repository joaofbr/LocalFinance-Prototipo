import { useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/useAuth'
import { useMembers } from '@/features/finance/hooks'
import { QUICK_ENTRY_FOCUS } from '@/features/finance/quickEntry'
import { useDismissChecklist, useDismissFamilyGuide, useOnboarding } from './hooks'
import type { OnboardingStep, OnboardingStepId } from './types'

interface GettingStartedCardProps {
  familyOnly?: boolean
}

interface StepCopy {
  label: string
  hint?: string
}

export function GettingStartedCard({ familyOnly = false }: GettingStartedCardProps) {
  const { data } = useOnboarding()
  const { user } = useAuth()
  const members = useMembers().data ?? []
  const navigate = useNavigate()
  const dismissChecklist = useDismissChecklist()
  const dismissFamilyGuide = useDismissFamilyGuide()

  if (!data) return null
  const family = data.familyGuide.length > 0
  if (!family && (familyOnly || data.checklist.length === 0)) return null

  const steps = family ? data.familyGuide : data.checklist
  const done = steps.filter((step) => step.done).length
  const finished = done === steps.length
  const partner = members.find((m) => m.id !== user?.id && m.active)
  const splitExample = partner
    ? `aluguel 2400 dividido com ${partner.name.trim().split(/\s+/)[0].toLowerCase()}`
    : 'aluguel 2400 dividido'

  const copy: Record<OnboardingStepId, StepCopy> = {
    account: { label: 'Criar sua conta' },
    'first-transaction': {
      label: 'Lançar o primeiro gasto',
      hint: 'Escreva no campo de cima, como "uber 25 ontem"',
    },
    card: {
      label: 'Cadastrar seu cartão de crédito',
      hint: 'Cada compra cai sozinha na fatura certa',
    },
    category: {
      label: 'Criar uma categoria sua',
      hint: 'Pet, academia, filhos: do seu jeito',
    },
    'family-mode': { label: 'Ativar o modo família' },
    invite: {
      label: 'Convidar um integrante',
      hint: 'A pessoa recebe um convite por e-mail e passa a ver os mesmos lançamentos',
    },
    split: {
      label: 'Lançar uma despesa dividida',
      hint: `Ex.: "${splitExample}"`,
    },
  }

  const focusQuickEntry = () => navigate('/', { state: { [QUICK_ENTRY_FOCUS]: true } })
  const actions: Partial<Record<OnboardingStepId, () => void>> = {
    'first-transaction': focusQuickEntry,
    card: () => navigate('/cards'),
    category: () => navigate('/categories'),
    invite: () => navigate('/members'),
    split: focusQuickEntry,
  }

  const dismiss = () => (family ? dismissFamilyGuide.mutate() : dismissChecklist.mutate())

  const title = finished ? 'Tudo pronto!' : family ? 'Modo família ativado' : 'Primeiros passos'
  const subtitle = finished
    ? family
      ? 'Sua família já está lançando junto.'
      : 'Você já conhece o essencial do Poupi.'
    : family
      ? 'Agora traga quem divide as contas com você.'
      : 'O essencial para o Poupi trabalhar por você.'

  return (
    <section
      aria-labelledby="getting-started-title"
      className="mb-[18px] rounded-2xl border border-border bg-surface p-5 shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="getting-started-title" className="text-[15px] font-bold">
            {title}
          </h2>
          <p className="mt-0.5 text-[13px] text-text-2">{subtitle}</p>
        </div>
        <span className="flex-shrink-0 pt-0.5 text-[12.5px] font-semibold text-text-3">
          {done} de {steps.length}
        </span>
      </div>

      <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </div>

      <ul className="mt-2 divide-y divide-border">
        {steps.map((step) => (
          <li key={step.id}>
            <StepRow step={step} copy={copy[step.id]} onOpen={actions[step.id]} />
          </li>
        ))}
      </ul>

      <div className="mt-1 flex justify-end">
        <button
          type="button"
          onClick={dismiss}
          className={`rounded-lg px-3 py-2 text-[13px] font-semibold ${
            finished ? 'bg-primary text-primary-fg' : 'text-text-3 hover:bg-surface-2'
          }`}
        >
          {finished ? 'Fechar' : 'Pular'}
        </button>
      </div>
    </section>
  )
}

function StepRow({
  step,
  copy,
  onOpen,
}: {
  step: OnboardingStep
  copy: StepCopy
  onOpen?: () => void
}) {
  const content = (
    <>
      <span
        className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
          step.done ? 'bg-primary text-primary-fg' : 'border-[1.5px] border-border-strong'
        }`}
      >
        {step.done && <Icon name="check" size={14} strokeWidth={2.6} />}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-[14px] font-semibold ${step.done ? 'text-text-3 line-through' : 'text-text'}`}
        >
          {copy.label}
        </span>
        {!step.done && copy.hint && (
          <span className="mt-0.5 block text-[12.5px] text-text-2">{copy.hint}</span>
        )}
      </span>
      {!step.done && onOpen && (
        <Icon name="chevronRight" size={18} className="flex-shrink-0 text-text-3" />
      )}
    </>
  )

  if (step.done || !onOpen) {
    return <div className="flex items-center gap-3 py-3">{content}</div>
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-xl px-2 py-3 text-left hover:bg-surface-2"
    >
      {content}
    </button>
  )
}
