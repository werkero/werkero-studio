import { normLocale, pickLocale, useDb } from '../../utils/db'
import { getBrandId, getPagination, paginated } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const brandId = await getBrandId(event)
  const { limit, offset, page, pageSize } = getPagination(event)
  const total = await useDb().query(
    `SELECT count(*)::int AS n FROM products WHERE brand_id=$1 AND status='published' AND deleted_at IS NULL`, [brandId])
  const { rows } = await useDb().query(
    `SELECT slug, name, tagline, description, cover_asset_id, sort_order
       FROM products WHERE brand_id=$1 AND status='published' AND deleted_at IS NULL
      ORDER BY sort_order ASC LIMIT $2 OFFSET $3`, [brandId, limit, offset])
  return paginated(rows.map((p) => ({
    slug: p.slug,
    name: pickLocale(p.name, locale),
    tagline: pickLocale(p.tagline, locale),
    description: pickLocale(p.description, locale),
    cover_asset_id: p.cover_asset_id,
    sort_order: p.sort_order,
  })), total.rows[0].n, page, pageSize)
})
