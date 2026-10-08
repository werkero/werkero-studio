import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { normLocale } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Register an uploaded asset. Phase 1: client uploads to Vercel Blob directly,
// then registers metadata here. (Server-side Blob upload wired in Phase 4.)
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'media.upload')
  const body = await readBody(event)
  const locale = normLocale(body.locale || 'en')
  const fileUrl = String(body.file_url || '')
  if (!fileUrl) apiError(400, 'VALIDATION', 'file_url required')
  const alt = body.alt ? JSON.stringify({ [locale]: String(body.alt) }) : '{}'
  const ins = await useDb().query(
    `INSERT INTO media_assets (brand_id, file_key, file_url, mime, size_bytes, width, height, alt_text)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb) RETURNING id`,
    [s.brandId, String(body.file_key || fileUrl), fileUrl, body.mime || null,
     body.size_bytes || null, body.width || null, body.height || null, alt])
  await logOperation(s, 'create', 'media_assets', ins.rows[0].id, null, { file_url: fileUrl }, getRequestIP(event))
  return { ok: true, id: ins.rows[0].id }
})
