import { del } from '@vercel/blob'
import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Delete a media asset: physical delete from DB (no deleted_at on this table,
// see arch doc §3.6) and try to delete from Blob.
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'media.delete')
  const id = getRouterParam(event, 'id')
  if (!id) apiError(400, 'VALIDATION', 'id required')

  const { rows } = await useDb().query(
    `SELECT id, url, file_key FROM media_assets WHERE id=$1 AND brand_id=$2`,
    [id, s.brandId])
  if (!rows.length) apiError(404, 'NOT_FOUND', 'media not found')
  const m = rows[0]

  // Try to delete from Blob (best effort — don't fail if it errors)
  try {
    if (m.url) await del(m.url)
  } catch { /* ignore */ }

  await useDb().query(`DELETE FROM media_assets WHERE id=$1`, [id])
  await logOperation(s, 'delete', 'media_assets', id, { url: m.url }, null, getRequestIP(event))
  return { ok: true }
})
