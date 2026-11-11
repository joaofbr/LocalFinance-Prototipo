import { Icon } from './Icon'

interface LogoProps {
  size?: number
  withWordmark?: boolean
}

export function Logo({ size = 40, withWordmark = true }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center bg-primary text-primary-fg"
        style={{ width: size, height: size, borderRadius: size * 0.28 }}
      >
        <Icon name="trendingUp" size={size * 0.52} strokeWidth={2.4} />
      </div>
      {withWordmark && (
        <span className="text-lg font-extrabold tracking-tight">
          LocalFinance
        </span>
      )}
    </div>
  )
}
