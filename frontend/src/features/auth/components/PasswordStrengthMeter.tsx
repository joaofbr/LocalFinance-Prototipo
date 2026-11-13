import { Icon } from '@/components/ui/Icon'
import { PASSWORD_RULES, passwordStrength } from '../passwordPolicy'
import type { PasswordStrength } from '../passwordPolicy'

const LEVELS: Record<PasswordStrength, { label: string; filled: number; bar: string }> = {
  empty: { label: '', filled: 0, bar: '' },
  weak: { label: 'Senha fraca', filled: 1, bar: 'bg-expense' },
  medium: { label: 'Senha média', filled: 2, bar: 'bg-[#c98500]' },
  strong: { label: 'Senha forte', filled: 3, bar: 'bg-primary' },
}

export function PasswordStrengthMeter({ value }: { value: string }) {
  const strength = passwordStrength(value)
  const level = LEVELS[strength]

  return (
    <div className="-mt-2.5 mb-[18px]">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index < level.filled ? level.bar : 'bg-border'
              }`}
            />
          ))}
        </div>
        <span aria-live="polite" className="min-w-[78px] text-right text-[12px] font-semibold text-text-2">
          {level.label}
        </span>
      </div>

      <ul className="flex flex-col gap-1">
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(value)
          return (
            <li
              key={rule.id}
              className={`flex items-center gap-2 text-[12.5px] ${met ? 'text-primary' : 'text-text-3'}`}
            >
              {met ? (
                <Icon name="check" size={14} strokeWidth={2.6} />
              ) : (
                <span aria-hidden className="mx-[2px] h-2.5 w-2.5 rounded-full border-[1.5px] border-current" />
              )}
              <span>{rule.label}</span>
              <span className="sr-only">{met ? '(cumprido)' : '(pendente)'}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
