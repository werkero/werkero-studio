import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { getPagination, paginated } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'users.view')
  const { limit, offset, page, pageSize } = getPagination(event)
  const total = await useDb().query(`SELECT count(*)::int AS n FROM admin_users WHERE brand_id=$1 AND deleted_at IS NULL`, [s.brandId])
  const { rows } = await useDb().query(
    `SELECT u.id, u.username, u.email, u.is_active, u.failed_attempts, u.locked_until, u.last_login_at, r.slug AS role
       FROM admin_users u JOIN roles r ON r.id=u.role_id
      WHERE u.brand_id=$1 AND u.deleted_at IS NULL ORDER BY u.created_at ASC LIMIT $2 OFFSET $3`,
    [s.brandId, limit, offset])
  return paginated(rows, total.rows[0].n, page, pageSize)
})
