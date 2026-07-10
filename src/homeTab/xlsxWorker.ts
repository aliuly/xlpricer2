/**
 * Web Worker entry point for XLSX generation.
 *
 * This file exists because Vite requires a separate entry point to detect
 * and bundle a Web Worker (via `new URL('./xlsxWorker.ts', import.meta.url)`).
 * That pattern also enables lazy-loading — the worker and its ExcelJS
 * dependency are code-split and only downloaded on first click.
 *
 * This worker handles data acquisition (fetch + parse) then calls the
 * pure workbook builder in ../xlsx/writer.ts.
 */

import Papa from 'papaparse'
import { generatePricingXlsx } from '../xlsx/writer'
import type { PricingData, AppMeta } from '../xlsx/writer'
import { processPricingData } from '../prices/index'
import type { PricesData } from '../prices/types'

/** The message shape sent from the main thread (HomeTab). */
interface WorkerRequest {
  assumptions: unknown
  components: Record<string, unknown>
  dataUrl: string
  includeUrls?: string[]
  appMeta: AppMeta
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  try {
    const req = e.data

    /* ── Fetch pricing JSON ── */
    const pricingRes = await fetch(req.dataUrl)
    if (!pricingRes.ok) {
      throw new Error(`Failed to fetch ${req.dataUrl}: HTTP ${pricingRes.status}`)
    }
    const pricingData: PricesData = await pricingRes.json()

    /* ── Fetch & parse include CSVs, then run the pipeline ── */
    const includes: Record<string, { version: string; records: Record<string, unknown>[] }> = {}
    for (const url of (req.includeUrls ?? [])) {
      const csvRes = await fetch(url)
      if (!csvRes.ok) {
        throw new Error(`Failed to fetch include ${url}: HTTP ${csvRes.status}`)
      }
      const raw = await csvRes.text()
      const version = csvRes.headers.get('Last-Modified') ?? new Date().toISOString()
      const parsed = Papa.parse<Record<string, string>>(raw, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim(),
        transform: (v: string) => v.trim(),
      })
      const stem = url.replace(/\.csv$/i, '').split('/').pop()!
      includes[stem] = { version, records: parsed.data as unknown as Record<string, unknown>[] }
      console.log(`Include ${stem}: ${parsed.data.length} records (${version})`)
    }

    processPricingData(pricingData, { includes })

    const out: PricingData = {
      assumptions: req.assumptions,
      components: req.components,
      pricingData,
      appMeta: req.appMeta,
    }

    const buffer = await generatePricingXlsx(out)
    self.postMessage({ type: 'ok', buffer }, { transfer: [buffer] })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    console.error('XLSX generation failed:', err)
    self.postMessage({ type: 'err', message, stack })
  }
}
