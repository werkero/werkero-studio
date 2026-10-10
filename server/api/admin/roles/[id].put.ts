import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Replace a role's permission set
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'roles.edit')
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const role = await useDb().query(`SELECT id, is_system, slug FROM roles WHERE id=$1`, [id])
  if (!role.rows.length) apiError(404, 'NOT_FOUND', 'not found')
  const permSlugs: string[] = Array.isArray(body.permissions) ? body.permissions : []
  const perms = permSlugs.length
    ? (await useDb().query(`SELECT id FROM permissions WHERE slug = ANY($1)`, [permSlugs])).rows
    : []
  await useDb().query(`DELETE FROM role_permissions WHERE role_id=$1`, [id])
  for (const p of perms) {
    await useDb().query(`INSERT INTO role_permissions (role_id, permission_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [id, p.id])
  }
  await logOperation(s, 'update', 'roles', id, { slug: role.rows[0].slug }, { permissions: permSlugs }, getRequestIP(event))
  return { ok: true }
})
