export type OnboardingStepId =
  | 'account'
  | 'first-transaction'
  | 'card'
  | 'category'
  | 'family-mode'
  | 'invite'
  | 'split'

export interface OnboardingStep {
  id: OnboardingStepId
  done: boolean
}

export interface Onboarding {
  showWelcome: boolean
  invited: boolean
  familyOwner: string | null
  checklist: OnboardingStep[]
  familyGuide: OnboardingStep[]
}
