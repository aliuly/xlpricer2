import { useCallback, useRef, useState } from 'react'

declare const __GIT_VERSION__: string

interface Props {
  config?: Record<string, unknown>
}

export default function HomeTab({ config }: Props) {
  const [busy, setBusy] = useState(false)
  const workerRef = useRef<Worker | null>(null)

  const homeConfig = (config ?? {}) as {
    pricesUrl?: string
    includes?: string[]
  }

  const handleGenerate = useCallback(() => {
    const { pricesUrl, includes } = homeConfig
    if (!pricesUrl) return
    setBusy(true)

    const AS_KEY = 'xlpricer-assumptions-'
    const COMP_TABS_KEY = 'xlpricer-components-tabs'
    const COMP_DATA_PREFIX = 'xlpricer-components-'

    let assumptions: Record<string, string>[] = []
    let components: Record<string, unknown> = {}
    try {
      const raw = localStorage.getItem(AS_KEY + 'assumptions')
      if (raw) assumptions = JSON.parse(raw)
    } catch {}
    try {
      const metasRaw = localStorage.getItem(COMP_TABS_KEY)
      if (metasRaw) {
        const metas: { id: string; label: string }[] = JSON.parse(metasRaw)
        for (const { id, label } of metas) {
          const dataRaw = localStorage.getItem(COMP_DATA_PREFIX + id)
          if (dataRaw) components[label] = JSON.parse(dataRaw)
        }
      }
    } catch {}

    if (!workerRef.current) {
      workerRef.current = new Worker(
        new URL('./xlsxWorker.ts', import.meta.url),
        { type: 'module' },
      )
    }

    workerRef.current.onmessage = (e: MessageEvent<{ type: string; buffer?: ArrayBuffer; message?: string; stack?: string }>) => {
      setBusy(false)
      if (e.data.type === 'err') {
        const msg = e.data.stack
          ? `${e.data.message}\n\n${e.data.stack}`
          : (e.data.message ?? 'Unknown error')
        alert(`Failed to generate XLSX:\n${msg}`)
        return
      }
      if (!e.data.buffer) return
      const blob = new Blob([e.data.buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pricing.xlsx'
      a.click()
      URL.revokeObjectURL(url)
    }

    workerRef.current.onerror = () => {
      setBusy(false)
      alert('Failed to generate XLSX.')
    }

    const base = window.location.href
    workerRef.current.postMessage({
      assumptions,
      components,
      dataUrl: pricesUrl,
      includeUrls: (includes ?? []).map(u => new URL(u, base).href),
      appMeta: {
        version: __GIT_VERSION__,
        spaUrl: window.location.origin + window.location.pathname,
      },
    })
  }, [homeConfig])

  return (
    <div className="relative flex-1 flex flex-col overflow-auto bg-gray-50 dark:bg-gray-900">

      {/* ── Header ──────────────────────────── */}
      <header className="bg-gradient-to-br from-magenta to-magenta-dark text-white py-10 px-6 text-center shrink-0">
        <h1 className="text-3xl font-bold mb-2 tracking-wide">
          📊 XLPricer
        </h1>
        <p className="text-pink-200 text-base">
          T-Cloud Public pricing spreadsheet generator
        </p>
      </header>

      {/* ── Content ─────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
      {/* ── Intro ─────────────────────────── */}
      <div className="max-w-lg">
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          This application generates pricing sheets for T-Cloud Public.
          Edit assumptions and components in their respective tabs,
          then export a ready-to-use XLSX spreadsheet.
        </p>
      </div>

      {/* ── Actions ───────────────────────── */}
      <div className="w-full max-w-sm">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 text-left">
          Actions
        </h3>
        <ul className="space-y-2 text-left">
          <li>
            <button
              onClick={handleGenerate}
              disabled={busy}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">📊</span>
              <div className="text-left">
                <div className="font-medium">Generate XLSX…</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Build a pricing spreadsheet from your data
                </div>
              </div>
            </button>
          </li>
        </ul>
      </div>

      {/* ── Version ──────────────────────── */}
      <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
        version {__GIT_VERSION__}
      </p>

      </div>

      {/* ── Busy overlay ──────────────────── */}
      {busy && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-magenta border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Generating spreadsheet…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
