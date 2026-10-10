import { requireAdmin, requirePermission, logOperation } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { apiError } from '../../utils/api'

// PUT /api/admin/brand — update editable brand fields.
const EDITABLE = ['name', 'tagline', 'domain', 'default_locale', 'contact_email', 'social_links'] as const

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'settings.edit')
  const body = await readBody(event)

  const name = String(body.name || '').trim()
  if (!name) apiError(400, 'VALIDATION', 'name required')

  const before = (await useDb().query(`SELECT * FROM brands WHERE id=$1`, [s.brandId])).rows[0]
  if (!before) apiError(404, 'NOT_FOUND', 'brand not found')

  const tagline = body.tagline ?? {}
  const socialLinks = body.social_links ?? {}
  if (typeof tagline !== 'object' || typeof socialLinks !== 'object') {
    apiError(400, 'VALIDATION', 'tagline and social_links must be objects')
  }

  await useDb().query(
    `UPDATE brands SET name=$2, tagline=$3, domain=$4, default_locale=$5,
       contact_email=$6, social_links=$7, updated_at=now()
     WHERE id=$1`,
    [s.brandId, name, JSON.stringify(tagline),
     String(body.domain || '').trim() || null,
     String(body.default_locale || 'en').trim() || 'en',
     String(body.contact_email || '').trim() || null,
     JSON.stringify(socialLinks)])

  const after = (await useDb().query(`SELECT * FROM brands WHERE id=$1`, [s.brandId])).rows[0]
  const diff = (k: string) => ({ before: before[k] ?? null, after: after[k] ?? null })
  await logOperation(s, 'update', 'brands', before.slug,
    Object.fromEntries(EDITABLE.map(k => [k, diff(k).before])),
    Object.fromEntries(EDITABLE.map(k => [k, diff(k).after])),
    getRequestIP(event))
  return { ok: true }
})
