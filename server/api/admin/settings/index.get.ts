import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'settings.view')
  const { rows } = await useDb().query(
    `SELECT key, value, description, updated_at FROM site_settings WHERE brand_id=$1 ORDER BY key ASC`, [s.brandId])
  return rows
})
