import { del } from '@vercel/blob'
import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Delete a media asset: remove from DB (soft) and try to delete from Blob.
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'media.delete')
  const id = getRouterParam(event, 'id')
  if (!id) apiError(400, 'VALIDATION', 'id required')

  const { rows } = await useDb().query(
    `SELECT id, file_url, file_key FROM media_assets WHERE id=$1 AND brand_id=$2 AND deleted_at IS NULL`,
    [id, s.brandId])
  if (!rows.length) apiError(404, 'NOT_FOUND', 'media not found')
  const m = rows[0]

  // Try to delete from Blob (best effort — don't fail if it errors)
  try {
    if (m.file_url) await del(m.file_url)
  } catch { /* ignore */ }

  await useDb().query(
    `UPDATE media_assets SET deleted_at=now(), updated_at=now() WHERE id=$1`, [id])
  await logOperation(s, 'delete', 'media_assets', id, { file_url: m.file_url }, null, getRequestIP(event))
  return { ok: true }
})
