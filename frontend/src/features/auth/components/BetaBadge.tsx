export function BetaBadge({ onBrand = false }: { onBrand?: boolean }) {
  return (
    <span
      className={`rounded-full border px-2 py-[2px] text-[11px] font-semibold tracking-wide ${
        onBrand
          ? 'border-white/25 text-white/80'
          : 'border-border-strong text-text-2'
      }`}
    >
      Beta
    </span>
  )
}
