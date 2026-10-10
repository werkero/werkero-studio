import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { getPagination, paginated } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'media.view')
  const { limit, offset, page, pageSize } = getPagination(event)
  const q = getQuery(event)
  const type = String(q.type || 'all')
  const search = String(q.q || '').trim()

  const conds = [`brand_id=$1`]
  const params: any[] = [s.brandId]
  if (type === 'image') { conds.push(`mime_type LIKE 'image/%'`); }
  else if (type === 'video') { conds.push(`mime_type LIKE 'video/%'`); }
  else if (type === 'other') { conds.push(`(mime_type NOT LIKE 'image/%' AND mime_type NOT LIKE 'video/%')`); }
  if (search) { params.push(`%${search}%`); conds.push(`(url ILIKE $${params.length} OR file_key ILIKE $${params.length})`); }
  const where = conds.join(' AND ')

  const total = await useDb().query(`SELECT count(*)::int AS n FROM media_assets WHERE ${where}`, params)
  const { rows } = await useDb().query(
    `SELECT id, file_key, url, mime_type, width, height, alt_text, created_at
       FROM media_assets WHERE ${where}
      ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset])
  return paginated(rows, total.rows[0].n, page, pageSize)
})
