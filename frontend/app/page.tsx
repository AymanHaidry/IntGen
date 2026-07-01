'use client'

import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import type { ChartState, ChartType } from '@/lib/types'
import { PER_BAR_TYPES } from '@/lib/types'
import { PALETTE, uid } from '@/lib/chart'
import { ChartTypePicker } from '@/components/chart-type-picker'
import { DataEditor } from '@/components/data-editor'
import { StyleControls } from '@/components/style-controls'
import { ChartPreview } from '@/components/chart-preview'

const INITIAL_CATEGORIES = ['Q1', 'Q2', 'Q3', 'Q4']

function createInitialState(): ChartState {
  return {
    chartType: 'column',
    title: 'Quarterly Revenue',
    xLabel: 'Quarter',
    yLabel: 'Revenue (k)',
    categories: [...INITIAL_CATEGORIES],
    series: [
      {
        id: uid(),
        name: 'Revenue',
        color: PALETTE[0],
        values: [42, 55, 38, 71],
      },
    ],
    barColors: INITIAL_CATEGORIES.map((_, i) => PALETTE[i % PALETTE.length]),
    showLegend: true,
    showGrid: true,
    showValues: false,
  }
}

export default function Page() {
  const [state, setState] = useState<ChartState>(createInitialState)

  const handleTypeChange = (chartType: ChartType) => {
    setState((prev) => {
      const next: ChartState = { ...prev, chartType }
      // Per-bar chart types support only a single data series.
      if (PER_BAR_TYPES.includes(chartType) && prev.series.length > 1) {
        next.series = [prev.series[0]]
      }
      // Keep per-bar colors aligned with the number of categories.
      if (next.barColors.length !== next.categories.length) {
        next.barColors = next.categories.map(
          (_, i) => prev.barColors[i] ?? PALETTE[i % PALETTE.length],
        )
      }
      return next
    })
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">IntGen</h1>
            <p className="font-sans text-sm text-muted">
              Charts &amp; diagrams, ready for your spreadsheets
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        {/* Left: controls */}
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              Chart type
            </h2>
            <ChartTypePicker value={state.chartType} onChange={handleTypeChange} />
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              Data &amp; colors
            </h2>
            <DataEditor state={state} onChange={setState} />
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              Labels &amp; display
            </h2>
            <StyleControls state={state} onChange={setState} />
          </section>
        </div>

        {/* Right: preview + export */}
        <div className="lg:sticky lg:top-8 lg:h-fit">
          <section className="rounded-xl border border-border bg-panel p-5">
            <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wide text-muted">
              Preview
            </h2>
            <ChartPreview state={state} />
          </section>
        </div>
      </div>

      <footer className="mt-10 border-t border-border pt-6 text-center font-sans text-xs text-muted-foreground">
        Charts rendered with Python &amp; matplotlib · Native Excel export via openpyxl
      </footer>
    </main>
  )
}
