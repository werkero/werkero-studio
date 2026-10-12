import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Get a single media asset (for picker preview).
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'media.view')
  const id = getRouterParam(event, 'id')
  if (!id) apiError(400, 'VALIDATION', 'id required')

  const { rows } = await useDb().query(
    `SELECT id, url, filename, mime_type FROM media_assets WHERE id=$1 AND brand_id=$2`,
    [id, s.brandId])
  if (!rows.length) apiError(404, 'NOT_FOUND', 'media not found')
  return rows[0]
})
