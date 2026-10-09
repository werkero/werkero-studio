import { useDb } from '../utils/db'

// Public: site basic settings for frontend (site.name, site.url, etc.)
export default defineEventHandler(async (event) => {
  const { rows } = await useDb().query(
    `SELECT s.key, s.value FROM site_settings s
     JOIN brands b ON b.id = s.brand_id
     WHERE b.slug = 'werkero' AND s.key LIKE 'site.%'`)
  const out: Record<string, any> = {}
  for (const r of rows) out[r.key] = r.value
  return out
})
