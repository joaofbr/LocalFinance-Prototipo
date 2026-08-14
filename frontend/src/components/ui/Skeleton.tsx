interface SkeletonProps {
  className?: string
  height?: number
}

export function Skeleton({ className = '', height }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-surface-2 ${className}`}
      style={height ? { height } : undefined}
    />
  )
}
