import { del } from '@vercel/blob'
import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Batch soft-delete media assets (max 200 per call).
// Body: { ids: string[] }
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'media.delete')

  const body = await readBody(event)
  const ids = Array.isArray(body.ids)
    ? body.ids.map((x: any) => String(x)).filter(Boolean).slice(0, 200)
    : []
  if (!ids.length) apiError(400, 'VALIDATION', 'ids required')

  const { rows } = await useDb().query(
    `SELECT id, file_url FROM media_assets WHERE id = ANY($1) AND brand_id=$2 AND deleted_at IS NULL`,
    [ids, s.brandId])
  if (!rows.length) return { ok: true, deleted: 0 }

  // Best-effort Blob cleanup — never fail the request on it
  for (const m of rows) {
    try { if (m.file_url) await del(m.file_url) } catch { /* ignore */ }
  }
  const delIds = rows.map((r: any) => r.id)
  await useDb().query(
    `UPDATE media_assets SET deleted_at=now(), updated_at=now() WHERE id = ANY($1)`,
    [delIds])
  await logOperation(s, 'delete', 'media_assets', delIds.join(','), { count: delIds.length }, null, getRequestIP(event))
  return { ok: true, deleted: delIds.length }
})
