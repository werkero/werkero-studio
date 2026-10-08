import pg from 'pg'

let _pool: pg.Pool | null = null

/** Shared Postgres connection pool (local dev: werkero on localhost). */
export function useDb(): pg.Pool {
  if (!_pool) {
    const url = process.env.POSTGRES_URL
    if (!url) throw new Error('POSTGRES_URL is not set')
    _pool = new pg.Pool({ connectionString: url, max: 5 })
  }
  return _pool
}

/**
 * Resolve a JSONB i18n field: { en: '…', 'zh-cn': '…' } → string for the
 * requested locale, falling back to English, then to the first available value.
 */
export function pickLocale<T = string>(field: Record<string, T> | null | undefined, locale: string): T | null {
  if (!field || typeof field !== 'object') return null
  if (field[locale] != null) return field[locale] as T
  if (field.en != null) return field.en as T
  const first = Object.values(field)[0]
  return (first ?? null) as T | null
}

/** Normalize a locale query param to one of the supported codes. */
const SUPPORTED = new Set(['en', 'zh-cn', 'zh-tw', 'fr', 'de', 'ru', 'ja'])
export function normLocale(q: unknown): string {
  const l = String(q ?? 'en').toLowerCase()
  return SUPPORTED.has(l) ? l : 'en'
}
