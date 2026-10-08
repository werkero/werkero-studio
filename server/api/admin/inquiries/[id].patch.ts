import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// new → contacted → closed / spam
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'inquiries.update')
  const id = getRouterParam(event, 'id') as string
  const body = await readBody(event)
  const status = String(body.status || '')
  if (!['new', 'contacted', 'closed', 'spam'].includes(status)) apiError(400, 'VALIDATION', 'bad status')
  const cur = await useDb().query(`SELECT status FROM inquiries WHERE id=$1 AND brand_id=$2`, [id, s.brandId])
  if (!cur.rows.length) apiError(404, 'NOT_FOUND', 'not found')
  await useDb().query(`UPDATE inquiries SET status=$1, updated_at=now() WHERE id=$2`, [status, id])
  await logOperation(s, 'update', 'inquiries', id, { status: cur.rows[0].status }, { status }, getRequestIP(event))
  return { ok: true }
})
