import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'roles.view')
  const { rows } = await useDb().query(
    `SELECT r.id, r.slug, r.name, r.is_system,
            (SELECT count(*)::int FROM role_permissions rp WHERE rp.role_id=r.id) AS perm_count,
            (SELECT count(*)::int FROM admin_users u WHERE u.role_id=r.id AND u.deleted_at IS NULL) AS user_count
       FROM roles r ORDER BY r.slug ASC`)
  return rows
})
