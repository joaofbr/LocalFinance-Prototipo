import { formatMoney } from '@/lib/format'
import type { DonutLegendItem, DonutSegment } from '../selectors'

interface DonutChartProps {
  segments: DonutSegment[]
  legend: DonutLegendItem[]
  total: number
}

export function DonutChart({ segments, legend, total }: DonutChartProps) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="relative h-40 w-40 flex-shrink-0">
        <svg viewBox="0 0 42 42" className="h-full w-full">
          <circle
            cx="21"
            cy="21"
            r="15.915"
            fill="none"
            stroke="var(--surface2)"
            strokeWidth="4.5"
          />
          {segments.map((segment, index) => (
            <circle
              key={index}
              cx="21"
              cy="21"
              r="15.915"
              fill="none"
              stroke={segment.color}
              strokeWidth="4.5"
              strokeDasharray={segment.dash}
              strokeDashoffset={segment.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold text-text-3">Total</span>
          <span className="text-[15px] font-extrabold tabular-nums">
            {formatMoney(total)}
          </span>
        </div>
      </div>

      <div className="flex min-w-[160px] flex-1 flex-col gap-2.5">
        {legend.map((item) => (
          <div key={item.categoryId} className="flex items-center gap-2.5">
            <span
              className="h-[9px] w-[9px] flex-shrink-0 rounded-[3px]"
              style={{ background: item.color }}
            />
            <span className="flex-1 truncate text-[13.5px] text-text-2">
              {item.name}
            </span>
            <span className="text-[12px] font-semibold text-text-3">
              {item.percent}%
            </span>
            <span className="text-[13px] font-bold tabular-nums">
              {formatMoney(item.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
