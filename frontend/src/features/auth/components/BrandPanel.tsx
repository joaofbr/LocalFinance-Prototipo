import { Logo } from '@/components/ui/Logo'
import { BetaBadge } from './BetaBadge'
import { ProductTour } from './ProductTour'

export function BrandPanel() {
  return (
    <aside className="hidden w-[min(46%,620px)] flex-shrink-0 flex-col justify-between gap-10 bg-brand-ink px-12 py-10 text-white lg:flex xl:px-14">
      <div className="flex items-center gap-3">
        <Logo size={40} />
        <BetaBadge onBrand />
      </div>

      <div>
        <h1 className="mb-9 max-w-[460px] text-balance text-[34px] font-extrabold leading-[1.1] tracking-tight xl:text-[38px]">
          Saiba para onde vai o seu dinheiro, mês a mês.
        </h1>
        <ProductTour />
      </div>

      <p className="text-[12.5px] text-white/45">
        © {new Date().getFullYear()} Poupi
      </p>
    </aside>
  )
}
