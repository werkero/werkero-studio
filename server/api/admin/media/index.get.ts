import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { getPagination, paginated } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'media.view')
  const { limit, offset, page, pageSize } = getPagination(event)
  const total = await useDb().query(`SELECT count(*)::int AS n FROM media_assets WHERE brand_id=$1 AND deleted_at IS NULL`, [s.brandId])
  const { rows } = await useDb().query(
    `SELECT id, file_key, file_url, mime, size_bytes, width, height, alt_text, created_at
       FROM media_assets WHERE brand_id=$1 AND deleted_at IS NULL
      ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [s.brandId, limit, offset])
  return paginated(rows, total.rows[0].n, page, pageSize)
})
