import { Icon } from '@/components/ui/Icon'

const FEATURES = [
  'Resumo mensal com gráficos por categoria',
  'Login por integrante e gestão de acessos',
  'Categorias coloridas e relatórios detalhados',
]

export function BrandPanel() {
  return (
    <div className="relative hidden flex-1 flex-col justify-center gap-9 overflow-hidden bg-gradient-to-br from-primary-strong to-primary px-[52px] py-12 text-white lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-white/20 text-white">
          <Icon name="trendingUp" size={30} strokeWidth={2.4} />
        </div>
        <span className="text-[22px] font-extrabold tracking-tight">
          LocalFinance
        </span>
      </div>

      <div className="max-w-[400px]">
        <h1 className="mb-[18px] text-[36px] font-extrabold leading-[1.15] tracking-tight">
          O controle financeiro de toda a família, em um só lugar.
        </h1>
        <p className="text-base leading-relaxed text-white/85">
          Registre receitas e despesas por integrante, acompanhe o resumo do mês
          e tome decisões com clareza.
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {FEATURES.map((feature) => (
          <div
            key={feature}
            className="flex items-center gap-2.5 text-[14.5px] text-white/90"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20">
              <Icon name="check" size={14} />
            </span>
            {feature}
          </div>
        ))}
      </div>
    </div>
  )
}
