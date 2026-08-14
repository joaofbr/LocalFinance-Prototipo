import { Icon } from './Icon'

interface LogoProps {
  size?: number
  withWordmark?: boolean
}

export function Logo({ size = 40, withWordmark = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-strong text-white shadow-card-md"
        style={{ width: size, height: size, borderRadius: size * 0.3 }}
      >
        <Icon name="trendingUp" size={size * 0.5} strokeWidth={2.4} />
      </div>
      {withWordmark && (
        <span className="text-lg font-extrabold tracking-tight">
          LocalFinance
        </span>
      )}
    </div>
  )
}
