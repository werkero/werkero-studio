import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb, normLocale } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Registers media metadata after a direct client-to-Blob upload.
// Body: { url, pathname, mime, alt, locale }
// Column names follow arch doc §3.6 (url, mime_type). No deleted_at on this
// table yet (see §3.6 note) — deletes are physical.
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'media.upload')

  const body = await readBody(event)
  const url = String(body.url || '').trim()
  const pathname = String(body.pathname || '').trim()
  if (!url || !pathname) apiError(400, 'VALIDATION', 'url and pathname required')

  const mime = String(body.mime || '') || null
  const alt = String(body.alt || '').trim()
  const locale = normLocale(body.locale || 'en')

  const altJson = alt ? JSON.stringify({ [locale]: alt }) : '{}'
  const ins = await useDb().query(
    `INSERT INTO media_assets (brand_id, file_key, url, mime_type, width, height, alt_text)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb) RETURNING id`,
    [s.brandId, pathname, url, mime, null, null, altJson])
  await logOperation(s, 'create', 'media_assets', ins.rows[0].id, null, { url }, getRequestIP(event))
  return { ok: true, id: ins.rows[0].id, url }
})
