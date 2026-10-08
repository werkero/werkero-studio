import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Get a role with its current permission slugs
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'roles.view')
  const id = getRouterParam(event, 'id') as string
  const { rows } = await useDb().query(`SELECT id, slug, name, is_system FROM roles WHERE id=$1`, [id])
  if (!rows.length) apiError(404, 'NOT_FOUND', 'not found')
  const perms = await useDb().query(
    `SELECT p.slug FROM permissions p JOIN role_permissions rp ON rp.permission_id=p.id WHERE rp.role_id=$1 ORDER BY p.slug`, [id])
  return { ...rows[0], permissions: perms.rows.map((r) => r.slug) }
})
