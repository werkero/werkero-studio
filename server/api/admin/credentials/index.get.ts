import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'

// List with masked values — never expose raw keys.
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'credentials.view')
  const { rows } = await useDb().query(
    `SELECT id, provider, label, masked, updated_at FROM service_credentials WHERE brand_id=$1 ORDER BY provider ASC`,
    [s.brandId])
  return rows
})
