import type { ChartState, ChartType } from './types'
import { PER_BAR_TYPES } from './types'

export const PALETTE = [
  '#CC785C', // clay coral
  '#6A8EAE', // slate blue
  '#788C5D', // sage
  '#D4A27F', // tan
  '#BF4D43', // brick
  '#5C6B73', // muted slate
  '#A87C5F', // cocoa
  '#8DA9C4', // dusty blue
]

export interface ChartTypeMeta {
  type: ChartType
  label: string
  multi: boolean
}

export const CHART_TYPES: ChartTypeMeta[] = [
  { type: 'column', label: 'Column', multi: false },
  { type: 'bar', label: 'Bar', multi: false },
  { type: 'line', label: 'Line', multi: true },
  { type: 'area', label: 'Area', multi: true },
  { type: 'pie', label: 'Pie', multi: false },
  { type: 'donut', label: 'Donut', multi: false },
  { type: 'scatter', label: 'Scatter', multi: true },
  { type: 'stacked_bar', label: 'Stacked', multi: true },
]

export function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

/** Build the JSON payload the Python backend expects. */
export function toPayload(state: ChartState) {
  const isPerBar = PER_BAR_TYPES.includes(state.chartType)
  return {
    chart_type: state.chartType,
    title: state.title,
    x_label: state.xLabel,
    y_label: state.yLabel,
    categories: state.categories,
    series: state.series.map((s) => ({
      name: s.name,
      values: s.values,
      color: s.color,
    })),
    bar_colors: isPerBar ? state.barColors : null,
    show_legend: state.showLegend,
    show_grid: state.showGrid,
    show_values: state.showValues,
  }
}

export async function renderChart(state: ChartState, signal?: AbortSignal): Promise<Blob> {
  const res = await fetch('/api/render', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(state)),
    signal,
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `Render failed (${res.status})`)
  }
  return res.blob()
}

export async function exportXlsx(state: ChartState): Promise<Blob> {
  const res = await fetch('/api/export/xlsx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toPayload(state)),
  })
  if (!res.ok) throw new Error(`Export failed (${res.status})`)
  return res.blob()
}
