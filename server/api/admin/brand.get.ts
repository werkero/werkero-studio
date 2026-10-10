import { requireAdmin, requirePermission } from '../../utils/auth'
import { useDb } from '../../utils/db'

// GET /api/admin/brand — current brand record for the admin brand tab.
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'settings.view')
  const { rows } = await useDb().query(
    `SELECT slug, name, tagline, domain, default_locale, contact_email, social_links
     FROM brands WHERE id=$1`, [s.brandId])
  return rows[0] ?? null
})
