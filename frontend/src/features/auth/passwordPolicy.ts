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

export type PasswordStrength = 'empty' | 'weak' | 'medium' | 'strong'

export function meetsPasswordPolicy(value: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(value))
}

export function passwordStrength(value: string): PasswordStrength {
  if (!value) return 'empty'
  const met = PASSWORD_RULES.filter((rule) => rule.test(value)).length
  if (met === PASSWORD_RULES.length) return 'strong'
  return met === PASSWORD_RULES.length - 1 ? 'medium' : 'weak'
}
