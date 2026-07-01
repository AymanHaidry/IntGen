'use client'

import { useRef } from 'react'
import { PALETTE } from '@/lib/chart'

interface ColorSwatchProps {
  color: string
  onChange: (color: string) => void
  title?: string
}

export function ColorSwatch({ color, onChange, title }: ColorSwatchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title={title ?? 'Pick a color'}
        aria-label={title ?? 'Pick a color'}
        className="h-7 w-7 rounded-md border border-border shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
        style={{ backgroundColor: color }}
      />
      <input
        ref={inputRef}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-0 w-0 opacity-0"
        tabIndex={-1}
      />
    </div>
  )
}

export function PaletteRow({ onPick }: { onPick: (color: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PALETTE.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onPick(c)}
          aria-label={`Use ${c}`}
          className="h-5 w-5 rounded border border-border transition-transform hover:scale-110"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}
