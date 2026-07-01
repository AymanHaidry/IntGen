'use client'

import {
  BarChart3,
  BarChartHorizontal,
  LineChart,
  AreaChart,
  PieChart,
  CircleDashed,
  ScatterChart,
  Layers,
} from 'lucide-react'
import type { ChartType } from '@/lib/types'
import { CHART_TYPES } from '@/lib/chart'

const ICONS: Record<ChartType, React.ComponentType<{ className?: string }>> = {
  column: BarChart3,
  bar: BarChartHorizontal,
  line: LineChart,
  area: AreaChart,
  pie: PieChart,
  donut: CircleDashed,
  scatter: ScatterChart,
  stacked_bar: Layers,
}

interface ChartTypePickerProps {
  value: ChartType
  onChange: (type: ChartType) => void
}

export function ChartTypePicker({ value, onChange }: ChartTypePickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {CHART_TYPES.map(({ type, label }) => {
        const Icon = ICONS[type]
        const active = value === type
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-pressed={active}
            className={[
              'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors',
              active
                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                : 'border-border bg-card text-muted hover:border-primary/50 hover:text-foreground',
            ].join(' ')}
          >
            <Icon className="h-5 w-5" />
            <span className="font-sans text-xs font-medium">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
