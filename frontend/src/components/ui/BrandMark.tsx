import { useId } from 'react'

const DETAIL_MIN_SIZE = 32

interface BrandMarkProps {
  size?: number
}

export function BrandMark({ size = 40 }: BrandMarkProps) {
  const gradientId = `brand-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const detailed = size >= DETAIL_MIN_SIZE

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#12a678" />
          <stop offset="1" stopColor="#056a4c" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill={`url(#${gradientId})`} />
      <circle cx="24" cy="19.75" r="8.3" fill="none" stroke="#fff" strokeWidth="5" />
      <line
        x1="15.7"
        y1="19.75"
        x2="15.7"
        y2="36.55"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="19.75" r="5.8" fill="#c98a14" />
      <circle cx="23.55" cy="19.3" r="5" fill="#f6c445" />
      {detailed && (
        <circle
          cx="23.55"
          cy="19.3"
          r="3.6"
          fill="#fbd468"
          stroke="#e0a526"
          strokeWidth="0.5"
        />
      )}
    </svg>
  )
}
