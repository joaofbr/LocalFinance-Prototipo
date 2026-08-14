import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'
import { hexToRgba } from '@/lib/format'

interface CategoryIconBadgeProps {
  icon: IconName
  color: string
  size?: number
  iconSize?: number
  muted?: boolean
}

export function CategoryIconBadge({
  icon,
  color,
  size = 40,
  iconSize = 19,
  muted = false,
}: CategoryIconBadgeProps) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: hexToRgba(color, muted ? 0.08 : 0.14),
        color: muted ? 'var(--text3)' : color,
      }}
    >
      <Icon name={icon} size={iconSize} />
    </div>
  )
}
