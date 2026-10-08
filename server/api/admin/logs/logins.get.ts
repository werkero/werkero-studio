import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { getPagination, paginated } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'logs.view')
  const { limit, offset, page, pageSize } = getPagination(event)
  const total = await useDb().query(
    `SELECT count(*)::int AS n FROM login_logs l LEFT JOIN admin_users u ON u.id=l.admin_user_id WHERE u.brand_id=$1 OR l.admin_user_id IS NULL`, [s.brandId])
  const { rows } = await useDb().query(
    `SELECT l.id, COALESCE(u.username, l.username_attempted) AS username, l.ip_address, l.status, l.failure_reason, l.created_at
       FROM login_logs l LEFT JOIN admin_users u ON u.id=l.admin_user_id
      WHERE (u.brand_id=$1 OR u.brand_id IS NULL) ORDER BY l.created_at DESC LIMIT $2 OFFSET $3`, [s.brandId, limit, offset])
  return paginated(rows, total.rows[0].n, page, pageSize)
})
