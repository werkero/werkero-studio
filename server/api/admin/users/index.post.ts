import { requireAdmin, requirePermission, logOperation, hashPassword } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'users.create')
  const body = await readBody(event)
  const username = String(body.username || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const roleSlug = String(body.role || 'editor')
  if (!username || !email || password.length < 8) apiError(400, 'VALIDATION', 'username, email, password (min 8) required')
  const role = await useDb().query(`SELECT id, slug FROM roles WHERE slug=$1`, [roleSlug])
  if (!role.rows.length) apiError(400, 'VALIDATION', 'bad role')
  if (role.rows[0].slug === 'superadmin' && s.roleSlug !== 'superadmin') apiError(403, 'FORBIDDEN', 'only superadmin can create superadmin')
  const hash = await hashPassword(password)
  try {
    const ins = await useDb().query(
      `INSERT INTO admin_users (brand_id, role_id, username, email, password_hash, is_active)
       VALUES ($1,$2,$3,$4,$5,true) RETURNING id`,
      [s.brandId, role.rows[0].id, username, email, hash])
    await logOperation(s, 'create', 'admin_users', ins.rows[0].id, null, { username, email, role: roleSlug }, getRequestIP(event))
    return { ok: true, id: ins.rows[0].id }
  } catch (e: any) {
    if (String(e.message).includes('duplicate')) apiError(409, 'CONFLICT', 'username or email exists')
    throw e
  }
})
