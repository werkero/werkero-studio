import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { getPagination, paginated } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'translation.trigger')
  const { limit, offset, page, pageSize } = getPagination(event)
  const status = getQuery(event).status ? String(getQuery(event).status) : null
  const params: any[] = [s.brandId]
  let where = `brand_id=$1`
  if (status) { params.push(status); where += ` AND status=$${params.length}` }
  const total = await useDb().query(`SELECT count(*)::int AS n FROM translation_jobs WHERE ${where}`, params)
  const { rows } = await useDb().query(
    `SELECT id, resource_type, resource_id, field, source_locale, target_locale, status, attempts, error, created_at, updated_at
       FROM translation_jobs WHERE ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset])
  return paginated(rows, total.rows[0].n, page, pageSize)
})
