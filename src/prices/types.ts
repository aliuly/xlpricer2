/* ── Pricing data types ──────────────────── */

/**
 * Column-oriented (flattened) format
 */
export interface PricesData {
  keys: string[];
  /** Human-readable column labels (null for internal/unnamed columns). */
  columns: (string | null)[];
  /** Column-oriented data: `records[colIdx][rowIdx]`. */
  records: unknown[][];
  /** Total number of rows (may differ from `records[0].length`). */
  count?: number;
  /* ── metadata ──────── */
  schema?: string;
  params?: Record<string, string | Record<string, string>>;
  timestamp?: number;
  datetime?: string;
  cksum?: string;
  generatedBy?: string;
  /* --- additional metadata ------- */
  includes?: Record<string, string>;
  patches?: Record<string, {
    count: number;
    description: string;
  }>;
  /** Validation lists: name → sorted values. E.g. { EVS: [...], REGIONS: [...] } */
  choices?: Record<string, string[]>;
  /** Tier definitions: tierID → { _XlTitle_, _tiers, _tariffs_, region, ... } */
  tiers?: Record<string, Record<string, unknown>>;
}


/**
 * Options controlling pipeline behaviour.
 */
export interface PipelineOptions {
  /** Included data — keyed by filename stem, with version and parsed records. */
  includes?: Record<string, {
    version: string;
    records: Record<string, unknown>[];
  }>;
  /** Log progress to stderr. */
  verbose?: boolean
}
