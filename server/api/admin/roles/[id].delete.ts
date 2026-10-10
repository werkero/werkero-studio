import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Delete a role (non-system only, must have no users assigned)
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'roles.edit')
  const id = getRouterParam(event, 'id') as string
  const role = await useDb().query(`SELECT id, is_system, slug FROM roles WHERE id=$1`, [id])
  if (!role.rows.length) apiError(404, 'NOT_FOUND', 'not found')
  if (role.rows[0].is_system) apiError(400, 'VALIDATION', 'system roles cannot be deleted')
  const users = await useDb().query(
    `SELECT count(*)::int AS n FROM admin_users WHERE role_id=$1 AND deleted_at IS NULL`, [id])
  if (users.rows[0].n > 0) apiError(400, 'VALIDATION', 'role has users assigned')
  await useDb().query(`DELETE FROM role_permissions WHERE role_id=$1`, [id])
  await useDb().query(`DELETE FROM roles WHERE id=$1`, [id])
  await logOperation(s, 'delete', 'roles', id, { slug: role.rows[0].slug }, null, getRequestIP(event))
  return { ok: true }
})
