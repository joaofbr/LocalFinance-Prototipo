import { BrandMark } from './BrandMark'

interface LogoProps {
  size?: number
  withWordmark?: boolean
}

export function Logo({ size = 40, withWordmark = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark size={size} />
      {withWordmark && (
        <span
          className="font-extrabold leading-none tracking-[-0.035em]"
          style={{ fontSize: Math.round(size * 0.55) }}
        >
          poupi
        </span>
      )}
    </div>
  )
}
