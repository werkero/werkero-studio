import { requireAdmin, requirePermission, logOperation, hashPassword } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Update: is_active, role, or reset password
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'users.edit')
  const id = getRouterParam(event, 'id') as string
  if (id === s.uid) apiError(400, 'VALIDATION', 'cannot modify yourself')
  const body = await readBody(event)
  const cur = await useDb().query(`SELECT * FROM admin_users WHERE id=$1 AND brand_id=$2`, [id, s.brandId])
  if (!cur.rows.length) apiError(404, 'NOT_FOUND', 'not found')
  const sets: string[] = []
  const params: any[] = []
  let i = 1
  if (body.is_active !== undefined) { params.push(!!body.is_active); sets.push(`is_active=$${i++}`) }
  if (body.role) {
    const r = await useDb().query(`SELECT id, slug FROM roles WHERE slug=$1`, [String(body.role)])
    if (!r.rows.length) apiError(400, 'VALIDATION', 'bad role')
    if (r.rows[0].slug === 'superadmin' && s.roleSlug !== 'superadmin') apiError(403, 'FORBIDDEN', 'only superadmin can grant superadmin')
    params.push(r.rows[0].id); sets.push(`role_id=$${i++}`)
  }
  if (body.password) {
    if (String(body.password).length < 8) apiError(400, 'VALIDATION', 'password min 8 chars')
    params.push(await hashPassword(String(body.password))); sets.push(`password_hash=$${i++}`)
    params.push(0); sets.push(`failed_attempts=$${i++}`)
    sets.push(`locked_until=NULL`)
  }
  if (!sets.length) apiError(400, 'VALIDATION', 'nothing to update')
  params.push(id)
  await useDb().query(`UPDATE admin_users SET ${sets.join(', ')}, updated_at=now() WHERE id=$${i}`, params)
  await logOperation(s, 'update', 'admin_users', id, { username: cur.rows[0].username }, body, getRequestIP(event))
  return { ok: true }
})
