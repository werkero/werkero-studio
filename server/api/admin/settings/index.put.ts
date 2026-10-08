import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'settings.edit')
  const body = await readBody(event)
  const key = String(body.key || '')
  if (!key) apiError(400, 'VALIDATION', 'key required')
  const cur = await useDb().query(`SELECT value FROM site_settings WHERE brand_id=$1 AND key=$2`, [s.brandId, key])
  const before = cur.rows[0]?.value ?? null
  await useDb().query(
    `INSERT INTO site_settings (brand_id, key, value, description) VALUES ($1,$2,$3,$4)
     ON CONFLICT (brand_id, key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`,
    [s.brandId, key, JSON.stringify(body.value ?? null), body.description || null])
  await logOperation(s, 'update', 'site_settings', key, { value: before }, { value: body.value }, getRequestIP(event))
  return { ok: true }
})
