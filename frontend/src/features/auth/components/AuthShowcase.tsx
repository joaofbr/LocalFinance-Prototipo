import { BrandMark } from '@/components/ui/BrandMark'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import { Logo } from '@/components/ui/Logo'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { formatPeriodLabel } from '@/lib/format'

const STAGE_GLOW =
  'radial-gradient(640px 460px at 72% 80%, var(--auth-glow-green), transparent 65%), radial-gradient(480px 380px at 12% 6%, var(--auth-glow-gold), transparent 60%)'

const DEMO_ROWS = [
  { name: 'Supermercado', detail: 'Itaú Click · 08', amount: '− 412,35', tint: '#fde7d8', income: false },
  { name: 'Aluguel', detail: 'Moradia · 10', amount: '− 1.850', tint: '#dbeafe', income: false },
  { name: 'Salário', detail: 'Renda · 05', amount: '+ 6.200', tint: '#dcfce7', income: true },
]

export function AuthShowcase() {
  const now = new Date()
  const period = formatPeriodLabel(now.getFullYear(), now.getMonth())
  const monthName = period.split(' ')[0].toLowerCase()
  const dueMonth = String(((now.getMonth() + 1) % 12) + 1).padStart(2, '0')

  return (
    <section className="relative h-[330px] flex-shrink-0 overflow-hidden bg-[var(--auth-stage)] px-[22px] pt-6 lg:flex lg:h-auto lg:min-h-screen lg:w-[56%] lg:flex-col lg:px-14 lg:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(var(--auth-dots) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: STAGE_GLOW }} />

      <div className="relative flex items-center justify-between">
        <Logo size={38} />
        <div className="lg:hidden">
          <ThemeToggle />
        </div>
      </div>

      <h1 className="relative mt-5 max-w-[540px] text-[31px] font-black leading-[1.06] tracking-[-0.045em] lg:mt-14 lg:text-[52px]">
        Saiba para onde vai <span className="text-primary">cada real</span> do seu mês.
      </h1>
      <p className="relative mt-4 hidden max-w-[460px] text-[17px] leading-relaxed text-text-2 lg:block">
        Gastos, cartões com fatura e relatórios por categoria. Sozinho ou dividindo com a família.
      </p>

      <div className="lg:relative lg:mt-12 lg:min-h-[340px] lg:flex-1">
        <PhoneMock period={period} />

        <ShowcaseChip
          className="bottom-5 left-4 -rotate-3 lg:bottom-auto lg:left-[4%] lg:top-[190px]"
          icon="creditCard"
          tone="gold"
          title="Fatura Nubank"
          detail={`vence 12/${dueMonth} · R$ 1.258,90`}
        />
        <ShowcaseChip
          className="hidden rotate-2 lg:right-[4%] lg:top-[56px] lg:flex"
          icon="check"
          tone="green"
          title="Sobrou R$ 820"
          detail={`em ${monthName}`}
        />
      </div>
    </section>
  )
}

function PhoneMock({ period }: { period: string }) {
  return (
    <div
      aria-hidden
      className="absolute left-1/2 top-[166px] h-[610px] w-[300px] origin-top -translate-x-[20%] -rotate-6 scale-[0.68] rounded-[48px] bg-[#0d1512] p-3 shadow-[0_50px_90px_-30px_rgba(6,40,28,0.45)] ring-1 ring-white/10 lg:top-4 lg:-translate-x-[40%] lg:scale-100"
    >
      <div data-theme="light" className="h-full w-full overflow-hidden rounded-[38px] bg-bg px-3.5 py-[18px] text-text">
        <div className="flex justify-between px-2 pb-2.5 text-[11px] font-bold">
          <span>9:41</span>
          <span className="tracking-[2px]">•••</span>
        </div>
        <div className="mb-3 flex items-center gap-2 text-[15px] font-extrabold">
          <BrandMark size={24} />
          {period}
        </div>
        <div className="mb-2 rounded-2xl border border-border bg-surface px-3.5 py-3">
          <div className="text-[10.5px] font-semibold text-text-3">Saldo do mês</div>
          <div className="mt-1 text-[24px] font-extrabold tracking-[-0.03em] text-primary">R$ 3.848,03</div>
        </div>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-border bg-surface px-3.5 py-3">
            <div className="text-[10.5px] font-semibold text-text-3">Receitas</div>
            <div className="mt-0.5 text-[15px] font-extrabold text-income">R$ 6.200</div>
          </div>
          <div className="rounded-2xl border border-border bg-surface px-3.5 py-3">
            <div className="text-[10.5px] font-semibold text-text-3">Despesas</div>
            <div className="mt-0.5 text-[15px] font-extrabold text-expense">R$ 2.352</div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-surface px-3.5 py-1.5">
          {DEMO_ROWS.map((row) => (
            <div key={row.name} className="flex items-center gap-2.5 border-t border-border py-2 text-[11.5px] first:border-t-0">
              <span className="h-[26px] w-[26px] flex-shrink-0 rounded-lg" style={{ background: row.tint }} />
              <span className="min-w-0 flex-1">
                <b className="block font-semibold">{row.name}</b>
                <span className="text-[10.5px] text-text-3">{row.detail}</span>
              </span>
              <b className={row.income ? 'text-income' : 'text-expense'}>{row.amount}</b>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface ShowcaseChipProps {
  className: string
  icon: IconName
  tone: 'gold' | 'green'
  title: string
  detail: string
}

const CHIP_TONE: Record<ShowcaseChipProps['tone'], string> = {
  gold: 'bg-[rgba(246,196,69,0.18)] text-[#c98a14]',
  green: 'bg-primary-weak text-primary',
}

function ShowcaseChip({ className, icon, tone, title, detail }: ShowcaseChipProps) {
  return (
    <div
      aria-hidden
      className={`absolute z-[2] flex items-center gap-[11px] rounded-2xl border border-border bg-surface px-3.5 py-3 shadow-[0_18px_40px_-16px_rgba(6,40,28,0.35)] ${className}`}
    >
      <span className={`flex h-[34px] w-[34px] items-center justify-center rounded-[10px] ${CHIP_TONE[tone]}`}>
        <Icon name={icon} size={18} />
      </span>
      <span>
        <b className="block text-[13.5px] font-bold">{title}</b>
        <span className="text-[12px] text-text-3">{detail}</span>
      </span>
    </div>
  )
}
