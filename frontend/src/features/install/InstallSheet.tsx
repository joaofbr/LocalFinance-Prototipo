import type { ReactNode } from 'react'
import { BrandMark } from '@/components/ui/BrandMark'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import type { MobilePlatform } from './platform'

interface Step {
  icon: IconName
  text: ReactNode
}

const STEPS: Record<MobilePlatform, Step[]> = {
  ios: [
    { icon: 'share', text: <>Toque em <strong>Compartilhar</strong>, na barra do Safari.</> },
    { icon: 'plusSquare', text: <>Role a lista e toque em <strong>Adicionar à Tela de Início</strong>.</> },
    { icon: 'check', text: <>Toque em <strong>Adicionar</strong>. O ícone aparece junto dos seus apps.</> },
  ],
  android: [
    { icon: 'moreVertical', text: <>Toque no <strong>menu</strong> do navegador, no canto de cima.</> },
    { icon: 'plusSquare', text: <>Toque em <strong>Adicionar à tela inicial</strong> ou <strong>Instalar app</strong>.</> },
    { icon: 'check', text: <>Confirme. O ícone aparece junto dos seus apps.</> },
  ],
}

const BENEFITS: Step[] = [
  { icon: 'smartphone', text: 'Abre com um toque, sem digitar o endereço.' },
  { icon: 'grid', text: 'Tela cheia, sem a barra do navegador.' },
  { icon: 'zap', text: 'Lance um gasto na hora, onde você estiver.' },
]

const FOOTNOTE: Record<MobilePlatform, string> = {
  ios: 'Não achou a opção? Abra este endereço no Safari: dentro do WhatsApp ou do Instagram ela não aparece.',
  android: 'Não achou a opção? Abra este endereço no Chrome: dentro do WhatsApp ou do Instagram ela não aparece.',
}

interface InstallSheetProps {
  platform: MobilePlatform
  canPrompt: boolean
  onInstall: () => void
  onClose: () => void
}

export function InstallSheet({ platform, canPrompt, onInstall, onClose }: InstallSheetProps) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] sm:items-center sm:p-5"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-t-[26px] bg-surface px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-6 shadow-card-lg sm:rounded-[26px]"
      >
        <div className="mb-5 flex items-center gap-3.5">
          <BrandMark size={48} />
          <div>
            <h3 id="install-title" className="text-[17px] font-extrabold tracking-tight">
              {canPrompt ? 'Instale o Poupi' : 'Adicionar à tela inicial'}
            </h3>
            <p className="mt-0.5 text-[13px] text-text-2">
              Fica junto dos seus apps e abre direto, em tela cheia.
            </p>
          </div>
        </div>

        {canPrompt ? (
          <>
            <ul className="mb-5 flex flex-col gap-2.5">
              {BENEFITS.map((benefit) => (
                <li key={benefit.icon} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3.5 py-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-primary">
                    <Icon name={benefit.icon} size={18} />
                  </span>
                  <span className="text-[13.5px] leading-snug text-text-2">{benefit.text}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onInstall}
              className="mb-2 w-full rounded-xl bg-primary py-3.5 text-[14.5px] font-bold text-primary-fg"
            >
              Instalar agora
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl py-3 text-[14px] font-semibold text-text-2 hover:bg-surface-2"
            >
              Agora não
            </button>
          </>
        ) : (
          <>
            <ol className="mb-4 flex flex-col gap-2.5">
              {STEPS[platform].map((step, index) => (
                <li key={index} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-3.5 py-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-fg">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-[13.5px] leading-snug text-text-2 [&_strong]:font-semibold [&_strong]:text-text">
                    {step.text}
                  </span>
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-primary">
                    <Icon name={step.icon} size={18} />
                  </span>
                </li>
              ))}
            </ol>

            <p className="mb-5 text-[12px] leading-relaxed text-text-3">{FOOTNOTE[platform]}</p>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl bg-primary py-3.5 text-[14.5px] font-bold text-primary-fg"
            >
              Entendi
            </button>
          </>
        )}
      </div>
    </div>
  )
}
