import { useDb } from '../../utils/db'

// TEMPORARY debug endpoint — remove after diagnosing.
export default defineEventHandler(async () => {
  const url = process.env.POSTGRES_URL || ''
  const info = {
    hasUrl: !!url,
    // Redacted: show only structure, never credentials
    protocol: url.split('://')[0] || null,
    host: (() => { try { return new URL(url).hostname } catch { return 'UNPARSEABLE' } })(),
    port: (() => { try { return new URL(url).port || null } catch { return null } })(),
    db: (() => { try { return new URL(url).pathname || null } catch { return null } })(),
    params: (() => { try { return new URL(url).search || null } catch { return null } })(),
  }
  try {
    const { rows } = await useDb().query('SELECT count(*)::int AS n FROM works')
    return { ok: true, info, worksCount: rows[0]?.n ?? null }
  } catch (e: any) {
    return { ok: false, info, error: String(e?.message || e).slice(0, 300) }
  }
})
