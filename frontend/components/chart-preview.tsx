'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Copy, FileSpreadsheet, Loader2, Check, AlertCircle } from 'lucide-react'
import type { ChartState } from '@/lib/types'
import { renderChart, exportXlsx } from '@/lib/chart'

interface ChartPreviewProps {
  state: ChartState
}

type CopyState = 'idle' | 'copied' | 'error'

export function ChartPreview({ state }: ChartPreviewProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')
  const [downloadingXlsx, setDownloadingXlsx] = useState(false)

  const filename = (state.title || 'intgen-chart').trim().replace(/\s+/g, '_') || 'chart'

  // Debounced auto-render whenever the chart state changes.
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setError(null)
      try {
        const b = await renderChart(state, controller.signal)
        setBlob(b)
        setUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return URL.createObjectURL(b)
        })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError((err as Error).message || 'Could not render chart')
        }
      } finally {
        setLoading(false)
      }
    }, 400)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(state)])

  const downloadBlob = (b: Blob, name: string) => {
    const link = document.createElement('a')
    const href = URL.createObjectURL(b)
    link.href = href
    link.download = name
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(href)
  }

  const handleDownloadPng = () => {
    if (blob) downloadBlob(blob, `${filename}.png`)
  }

  const handleCopy = async () => {
    if (!blob) return
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
    setTimeout(() => setCopyState('idle'), 2000)
  }

  const handleXlsx = async () => {
    setDownloadingXlsx(true)
    try {
      const b = await exportXlsx(state)
      downloadBlob(b, `${filename}.xlsx`)
    } catch {
      setError('Could not export Excel file')
    } finally {
      setDownloadingXlsx(false)
    }
  }

  const btnBase =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-sans text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative flex min-h-[340px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-4">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={state.title || 'Generated chart preview'}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          !error && (
            <div className="flex flex-col items-center gap-2 text-muted">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-sans text-sm">Rendering…</span>
            </div>
          )
        )}

        {loading && url && (
          <div className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 backdrop-blur">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex max-w-sm flex-col items-center gap-2 text-center text-muted">
            <AlertCircle className="h-6 w-6 text-primary" />
            <span className="font-sans text-sm">{error}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!blob}
          className={`${btnBase} border border-border bg-card text-foreground hover:border-primary/60`}
        >
          {copyState === 'copied' ? (
            <>
              <Check className="h-4 w-4 text-accent" />
              Copied
            </>
          ) : copyState === 'error' ? (
            <>
              <AlertCircle className="h-4 w-4" />
              Blocked
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy image
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={!blob}
          className={`${btnBase} border border-border bg-card text-foreground hover:border-primary/60`}
        >
          <Download className="h-4 w-4" />
          PNG
        </button>

        <button
          type="button"
          onClick={handleXlsx}
          disabled={downloadingXlsx}
          className={`${btnBase} bg-primary text-primary-foreground hover:opacity-90`}
        >
          {downloadingXlsx ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="h-4 w-4" />
          )}
          Excel
        </button>
      </div>
      <p className="text-center font-sans text-xs text-muted-foreground">
        Copy pastes straight into a cell. Excel export includes an editable native chart and the data table.
      </p>
    </div>
  )
}
