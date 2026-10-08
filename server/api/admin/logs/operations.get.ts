import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { getPagination, paginated } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'logs.view')
  const { limit, offset, page, pageSize } = getPagination(event)
  const rt = getQuery(event).resource_type ? String(getQuery(event).resource_type) : null
  const params: any[] = [s.brandId]
  let where = `o.brand_id=$1`
  if (rt) { params.push(rt); where += ` AND o.resource_type=$${params.length}` }
  const total = await useDb().query(`SELECT count(*)::int AS n FROM operation_logs o WHERE ${where}`, params)
  const { rows } = await useDb().query(
    `SELECT o.id, u.username, o.action, o.resource_type, o.resource_id, o.changes, o.ip_address, o.created_at
       FROM operation_logs o LEFT JOIN admin_users u ON u.id=o.admin_user_id
      WHERE ${where} ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, limit, offset])
  return paginated(rows, total.rows[0].n, page, pageSize)
})
