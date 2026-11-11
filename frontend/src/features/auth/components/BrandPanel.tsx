import { Icon } from '@/components/ui/Icon'
import { BetaBadge } from './BetaBadge'
import { ProductTour } from './ProductTour'

export function BrandPanel() {
  return (
    <aside className="hidden w-[min(46%,620px)] flex-shrink-0 flex-col justify-between gap-10 bg-brand-ink px-12 py-10 text-white lg:flex xl:px-14">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-white/10 ring-1 ring-white/15">
          <Icon name="trendingUp" size={21} strokeWidth={2.4} />
        </span>
        <span className="text-[19px] font-extrabold tracking-tight">LocalFinance</span>
        <BetaBadge onBrand />
      </div>

      <div>
        <h1 className="mb-9 max-w-[460px] text-balance text-[34px] font-extrabold leading-[1.1] tracking-tight xl:text-[38px]">
          Saiba para onde vai o seu dinheiro, mês a mês.
        </h1>
        <ProductTour />
      </div>

      <p className="text-[12.5px] text-white/45">
        © {new Date().getFullYear()} LocalFinance
      </p>
    </aside>
  )
}
