export interface GuideStep {
  target: string
  title: string
  text: string
}

interface PointerState {
  pointer: GuideStep
}

interface TourState {
  tour: true
}

export function pointTo(step: GuideStep): PointerState {
  return { pointer: step }
}

export const START_TOUR: TourState = { tour: true }

export function readPointer(state: unknown): GuideStep | null {
  if (typeof state !== 'object' || state === null || !('pointer' in state)) return null
  return (state as PointerState).pointer
}

export function wantsTour(state: unknown): boolean {
  return typeof state === 'object' && state !== null && 'tour' in state
}

export const TOUR_STEPS: GuideStep[] = [
  {
    target: 'quick-entry',
    title: 'Lance em segundos',
    text: 'Escreva um gasto do jeito que você falaria, como "mercado 89,90 ontem", e toque em Lançar. Você confere tudo antes de salvar.',
  },
  {
    target: 'new-transaction',
    title: 'Formulário completo',
    text: 'Prefere preencher campo a campo? Use este botão.',
  },
  {
    target: 'month',
    title: 'Um mês por vez',
    text: 'Troque o mês aqui. Compras no cartão aparecem no mês da fatura.',
  },
  {
    target: 'summary',
    title: 'O resumo do mês',
    text: 'Receitas, despesas e saldo, atualizados a cada lançamento.',
  },
  {
    target: 'menu',
    title: 'Cartões, categorias e família',
    text: 'Tudo o que você configura fica neste menu.',
  },
  {
    target: 'getting-started',
    title: 'Seus primeiros passos',
    text: 'Toque em cada passo e eu mostro onde clicar. Eles se marcam sozinhos.',
  },
]
