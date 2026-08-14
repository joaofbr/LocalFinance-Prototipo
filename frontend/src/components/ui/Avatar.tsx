import { getInitials, hexToRgba } from '@/lib/format'

interface AvatarProps {
  name: string
  color: string
  size?: number
  muted?: boolean
}

export function Avatar({ name, color, size = 40, muted = false }: AvatarProps) {
  return (
    <span
      className="flex flex-shrink-0 items-center justify-center rounded-full font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: hexToRgba(color, muted ? 0.1 : 0.16),
        color: muted ? 'var(--text3)' : color,
      }}
    >
      {getInitials(name)}
    </span>
  )
}
