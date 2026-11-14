import { BrandMark } from '@/components/ui/BrandMark'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'

interface WelcomeSheetProps {
  firstName: string
  invited: boolean
  familyOwner: string | null
  onStart: () => void
  onClose: () => void
}

const HIGHLIGHTS: { icon: IconName; text: string }[] = [
  { icon: 'message', text: 'Lance um gasto escrevendo como você fala' },
  { icon: 'creditCard', text: 'Cada compra no cartão cai na fatura certa' },
  { icon: 'users', text: 'Divida as contas com quem mora com você' },
]

export function WelcomeSheet({
  firstName,
  invited,
  familyOwner,
  onStart,
  onClose,
}: WelcomeSheetProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] sm:items-center sm:p-5"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="max-h-[94vh] w-full max-w-[440px] overflow-y-auto rounded-t-[26px] bg-surface shadow-card-lg sm:rounded-[26px]"
      >
        <div className="px-6 pt-7">
          <BrandMark size={52} />
          <h2
            id="welcome-title"
            className="mt-5 text-[23px] font-extrabold leading-tight tracking-tight"
          >
            {invited ? `Boas-vindas à família, ${firstName}!` : `Boas-vindas, ${firstName}!`}
          </h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-text-2">
            {invited
              ? `${familyOwner ?? 'Sua família'} chamou você para organizar as contas da casa juntos. Em um minuto eu mostro onde fica cada coisa.`
              : 'Aqui você organiza o dinheiro da casa sem planilha. Em um minuto eu mostro onde fica cada coisa.'}
          </p>

          <ul className="mt-5 flex flex-col gap-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item.icon} className="flex items-center gap-3 text-[14px] font-semibold">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-weak text-primary">
                  <Icon name={item.icon} size={18} />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2.5 px-6 pb-[max(18px,env(safe-area-inset-bottom))] pt-7">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-border-strong py-3.5 text-[14.5px] font-semibold text-text"
          >
            Agora não
          </button>
          <button
            type="button"
            onClick={onStart}
            className="flex flex-[2] items-center justify-center gap-1.5 rounded-xl bg-primary py-3.5 text-[14.5px] font-bold text-primary-fg shadow-card-md"
          >
            Mostrar o Poupi
            <Icon name="chevronRight" size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
