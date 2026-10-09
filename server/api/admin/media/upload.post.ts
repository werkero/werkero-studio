import { put } from '@vercel/blob'
import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb, normLocale } from '../../../utils/db'
import { apiError } from '../../../utils/api'

// Server-side upload to Vercel Blob, then register metadata.
// Requires BLOB_READ_WRITE_TOKEN env var (from Vercel Blob store).
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'media.upload')

  const form = await readMultipartFormData(event)
  if (!form) apiError(400, 'VALIDATION', 'multipart form required')
  const file = form.find((f) => f.name === 'file')
  if (!file || !file.data) apiError(400, 'VALIDATION', 'file field required')
  const alt = form.find((f) => f.name === 'alt')?.data?.toString() || ''
  const locale = normLocale(form.find((f) => f.name === 'locale')?.data?.toString() || 'en')

  const filename = file.filename || `upload-${Date.now()}`
  // Sanitize filename for Blob pathname
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const pathname = `media/${Date.now()}-${safeName}`

  let blob
  try {
    blob = await put(pathname, file.data, {
      access: 'public',
      contentType: file.type || undefined,
    })
  } catch (e: any) {
    apiError(500, 'BLOB_UPLOAD_FAILED', e?.message || 'Vercel Blob upload failed')
  }

  const altJson = alt ? JSON.stringify({ [locale]: alt }) : '{}'
  const ins = await useDb().query(
    `INSERT INTO media_assets (brand_id, file_key, file_url, mime, size_bytes, width, height, alt_text)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb) RETURNING id`,
    [s.brandId, blob!.pathname, blob!.url, file.type || null,
     file.data.length || null, null, null, altJson])
  await logOperation(s, 'create', 'media_assets', ins.rows[0].id, null, { file_url: blob!.url }, getRequestIP(event))
  return { ok: true, id: ins.rows[0].id, url: blob!.url }
})
