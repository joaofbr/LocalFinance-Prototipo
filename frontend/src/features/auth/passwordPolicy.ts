export const PASSWORD_MAX_LENGTH = 128

interface PasswordRule {
  id: string
  label: string
  test: (value: string) => boolean
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'Pelo menos 8 caracteres', test: (value) => value.length >= 8 },
  { id: 'upper', label: 'Uma letra maiúscula', test: (value) => /\p{Lu}/u.test(value) },
  {
    id: 'special',
    label: 'Um caractere especial (! @ # $ % …)',
    test: (value) => /[^\p{L}\p{Nd}\s]/u.test(value),
  },
]

export type PasswordStrength = 'empty' | 'weak' | 'good' | 'strong'

export function meetsPasswordPolicy(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value))
}

export function passwordStrength(value: string): PasswordStrength {
  if (!value) return 'empty'
  if (!meetsPasswordPolicy(value)) return 'weak'
  const varied = /\p{Ll}/u.test(value) && /\p{Nd}/u.test(value)
  return value.length >= 12 && varied ? 'strong' : 'good'
}
