import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { getPagination, paginated } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'inquiries.view')
  const { limit, offset, page, pageSize } = getPagination(event)
  const status = getQuery(event).status ? String(getQuery(event).status) : null
  const params: any[] = [s.brandId]
  let where = `brand_id=$1 AND deleted_at IS NULL`
  if (status) { params.push(status); where += ` AND status=$${params.length}` }
  const total = await useDb().query(`SELECT count(*)::int AS n FROM inquiries WHERE ${where}`, params)
  const { rows } = await useDb().query(
    `SELECT id, name, email, company, budget, message, source, ip_address, status, created_at
       FROM inquiries WHERE ${where} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset])
  return paginated(rows, total.rows[0].n, page, pageSize)
})
