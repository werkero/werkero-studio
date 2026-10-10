import { requireAdmin, requirePermission, logOperation } from '../../../../utils/auth'
import { useDb } from '../../../../utils/db'
import { apiError } from '../../../../utils/api'

// Rename a role (non-system only)
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'roles.edit')
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const name = String(body.name || '').trim()
  if (!name) apiError(400, 'VALIDATION', 'name required')
  const role = await useDb().query(`SELECT id, is_system, slug, name FROM roles WHERE id=$1`, [id])
  if (!role.rows.length) apiError(404, 'NOT_FOUND', 'not found')
  if (role.rows[0].is_system) apiError(400, 'VALIDATION', 'system roles cannot be renamed')
  await useDb().query(`UPDATE roles SET name=$1, updated_at=now() WHERE id=$2`, [name, id])
  await logOperation(s, 'update', 'roles', id, { name: role.rows[0].name }, { name }, getRequestIP(event))
  return { ok: true }
})
