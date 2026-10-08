import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'roles.edit')
  const body = await readBody(event)
  const slug = String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
  const name = String(body.name || '').trim()
  if (!slug || !name) apiError(400, 'VALIDATION', 'slug and name required')
  try {
    const ins = await useDb().query(
      `INSERT INTO roles (slug, name, is_system) VALUES ($1,$2,false) RETURNING id`, [slug, name])
    await logOperation(s, 'create', 'roles', ins.rows[0].id, null, { slug, name }, getRequestIP(event))
    return { ok: true, id: ins.rows[0].id }
  } catch (e: any) {
    if (String(e.message).includes('duplicate')) apiError(409, 'CONFLICT', 'role slug exists')
    throw e
  }
})
