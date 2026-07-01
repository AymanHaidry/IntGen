'use client'

import type { ChartState } from '@/lib/types'

interface StyleControlsProps {
  state: ChartState
  onChange: (next: ChartState) => void
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5"
    >
      <span
        className={[
          'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-border',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 transform rounded-full bg-card shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          ].join(' ')}
        />
      </span>
      <span className="font-sans text-sm text-foreground">{label}</span>
    </button>
  )
}

export function StyleControls({ state, onChange }: StyleControlsProps) {
  const inputCls =
    'w-full rounded-md border border-input bg-card px-2.5 py-1.5 font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/30'
  const labelCls = 'mb-1 block font-sans text-xs font-medium text-muted'

  return (
    <div className="space-y-4">
      <div>
        <label className={labelCls} htmlFor="title">
          Chart title
        </label>
        <input
          id="title"
          value={state.title}
          onChange={(e) => onChange({ ...state, title: e.target.value })}
          className={inputCls}
          placeholder="Untitled chart"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="xlabel">
            X-axis label
          </label>
          <input
            id="xlabel"
            value={state.xLabel}
            onChange={(e) => onChange({ ...state, xLabel: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="ylabel">
            Y-axis label
          </label>
          <input
            id="ylabel"
            value={state.yLabel}
            onChange={(e) => onChange({ ...state, yLabel: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-3 pt-1">
        <Toggle
          label="Grid"
          checked={state.showGrid}
          onChange={(v) => onChange({ ...state, showGrid: v })}
        />
        <Toggle
          label="Legend"
          checked={state.showLegend}
          onChange={(v) => onChange({ ...state, showLegend: v })}
        />
        <Toggle
          label="Value labels"
          checked={state.showValues}
          onChange={(v) => onChange({ ...state, showValues: v })}
        />
      </div>
    </div>
  )
}
