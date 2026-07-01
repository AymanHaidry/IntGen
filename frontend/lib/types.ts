export type ChartType =
  | 'column'
  | 'bar'
  | 'line'
  | 'area'
  | 'pie'
  | 'donut'
  | 'scatter'
  | 'stacked_bar'

export interface Series {
  id: string
  name: string
  color: string
  values: number[]
}

export interface ChartState {
  chartType: ChartType
  title: string
  xLabel: string
  yLabel: string
  categories: string[]
  series: Series[]
  barColors: (string | null)[]
  showLegend: boolean
  showGrid: boolean
  showValues: boolean
}

/** Chart types that render a single series with per-category (per-bar) colors. */
export const PER_BAR_TYPES: ChartType[] = ['column', 'bar', 'pie', 'donut']

/** Chart types that support multiple data series. */
export const MULTI_SERIES_TYPES: ChartType[] = ['line', 'area', 'scatter', 'stacked_bar']
