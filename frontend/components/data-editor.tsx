'use client'

import { Plus, Trash2, Columns3 } from 'lucide-react'
import type { ChartState } from '@/lib/types'
import { PER_BAR_TYPES } from '@/lib/types'
import { PALETTE, uid } from '@/lib/chart'
import { ColorSwatch } from './color-swatch'

interface DataEditorProps {
  state: ChartState
  onChange: (next: ChartState) => void
}

export function DataEditor({ state, onChange }: DataEditorProps) {
  const isPerBar = PER_BAR_TYPES.includes(state.chartType)
  const allowMultiSeries = !isPerBar

  const addRow = () => {
    onChange({
      ...state,
      categories: [...state.categories, `Item ${state.categories.length + 1}`],
      series: state.series.map((s) => ({ ...s, values: [...s.values, 0] })),
      barColors: [...state.barColors, PALETTE[state.categories.length % PALETTE.length]],
    })
  }

  const removeRow = (i: number) => {
    if (state.categories.length <= 1) return
    onChange({
      ...state,
      categories: state.categories.filter((_, idx) => idx !== i),
      series: state.series.map((s) => ({
        ...s,
        values: s.values.filter((_, idx) => idx !== i),
      })),
      barColors: state.barColors.filter((_, idx) => idx !== i),
    })
  }

  const setCategory = (i: number, val: string) => {
    const categories = [...state.categories]
    categories[i] = val
    onChange({ ...state, categories })
  }

  const setValue = (si: number, ri: number, val: string) => {
    const num = val === '' || val === '-' ? 0 : Number(val)
    const series = state.series.map((s, idx) => {
      if (idx !== si) return s
      const values = [...s.values]
      values[ri] = Number.isNaN(num) ? 0 : num
      return { ...s, values }
    })
    onChange({ ...state, series })
  }

  const setBarColor = (i: number, color: string) => {
    const barColors = [...state.barColors]
    barColors[i] = color
    onChange({ ...state, barColors })
  }

  const addSeries = () => {
    const color = PALETTE[state.series.length % PALETTE.length]
    onChange({
      ...state,
      series: [
        ...state.series,
        {
          id: uid(),
          name: `Series ${state.series.length + 1}`,
          color,
          values: state.categories.map(() => 0),
        },
      ],
    })
  }

  const removeSeries = (idx: number) => {
    if (state.series.length <= 1) return
    onChange({ ...state, series: state.series.filter((_, i) => i !== idx) })
  }

  const setSeriesName = (idx: number, name: string) => {
    onChange({
      ...state,
      series: state.series.map((s, i) => (i === idx ? { ...s, name } : s)),
    })
  }

  const setSeriesColor = (idx: number, color: string) => {
    onChange({
      ...state,
      series: state.series.map((s, i) => (i === idx ? { ...s, color } : s)),
    })
  }

  const inputCls =
    'w-full rounded-md border border-input bg-card px-2.5 py-1.5 font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30'

  return (
    <div className="space-y-3">
      {/* Series controls for multi-series charts */}
      {allowMultiSeries && (
        <div className="space-y-2">
          {state.series.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2">
              <ColorSwatch
                color={s.color}
                onChange={(c) => setSeriesColor(idx, c)}
                title={`Color for ${s.name}`}
              />
              <input
                value={s.name}
                onChange={(e) => setSeriesName(idx, e.target.value)}
                className={inputCls}
                placeholder={`Series ${idx + 1}`}
                aria-label={`Series ${idx + 1} name`}
              />
              <button
                type="button"
                onClick={() => removeSeries(idx)}
                disabled={state.series.length <= 1}
                className="shrink-0 rounded-md p-1.5 text-muted transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={`Remove ${s.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSeries}
            className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-primary transition-colors hover:text-foreground"
          >
            <Columns3 className="h-3.5 w-3.5" />
            Add series
          </button>
        </div>
      )}

      {/* Data table */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-panel">
              {isPerBar && (
                <th className="w-10 px-2 py-2 font-sans text-[11px] font-semibold uppercase tracking-wide text-muted">
                  <span className="sr-only">Color</span>
                </th>
              )}
              <th className="px-3 py-2 text-left font-sans text-[11px] font-semibold uppercase tracking-wide text-muted">
                Label
              </th>
              {state.series.map((s) => (
                <th
                  key={s.id}
                  className="px-3 py-2 text-left font-sans text-[11px] font-semibold uppercase tracking-wide text-muted"
                >
                  {s.name || 'Value'}
                </th>
              ))}
              <th className="w-10 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {state.categories.map((cat, ri) => (
              <tr key={ri} className="border-t border-border">
                {isPerBar && (
                  <td className="px-2 py-1.5 text-center align-middle">
                    <ColorSwatch
                      color={state.barColors[ri] ?? PALETTE[ri % PALETTE.length]}
                      onChange={(c) => setBarColor(ri, c)}
                      title={`Color for ${cat}`}
                    />
                  </td>
                )}
                <td className="px-2 py-1.5">
                  <input
                    value={cat}
                    onChange={(e) => setCategory(ri, e.target.value)}
                    className={inputCls}
                    aria-label={`Label ${ri + 1}`}
                  />
                </td>
                {state.series.map((s, si) => (
                  <td key={s.id} className="px-2 py-1.5">
                    <input
                      type="number"
                      value={Number.isFinite(s.values[ri]) ? s.values[ri] : 0}
                      onChange={(e) => setValue(si, ri, e.target.value)}
                      className={inputCls}
                      aria-label={`${s.name} value ${ri + 1}`}
                    />
                  </td>
                ))}
                <td className="px-2 py-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => removeRow(ri)}
                    disabled={state.categories.length <= 1}
                    className="rounded-md p-1.5 text-muted transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label={`Remove row ${ri + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-2 font-sans text-xs font-medium text-muted transition-colors hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Add row
      </button>
    </div>
  )
}
