import { requireAdmin, requirePermission } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Retry a failed job: reset to pending
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'translation.retry')
  const body = await readBody(event)
  const id = String(body.id || '')
  if (!id) apiError(400, 'VALIDATION', 'id required')
  const { rows } = await useDb().query(`SELECT id FROM translation_jobs WHERE id=$1 AND brand_id=$2 AND status='failed'`,
    [id, s.brandId])
  if (!rows.length) apiError(404, 'NOT_FOUND', 'failed job not found')
  await useDb().query(`UPDATE translation_jobs SET status='pending', attempts=0, error=NULL, updated_at=now() WHERE id=$1`, [id])
  return { ok: true }
})
