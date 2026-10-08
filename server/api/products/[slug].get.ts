import { normLocale, pickLocale, useDb } from '../../utils/db'
import { getBrandId, apiError } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const brandId = await getBrandId(event)
  const slug = getRouterParam(event, 'slug')
  const { rows } = await useDb().query(
    `SELECT slug, name, tagline, description, specs, gallery, body, meta, cover_asset_id, sort_order
       FROM products WHERE brand_id=$1 AND slug=$2 AND status='published' AND deleted_at IS NULL LIMIT 1`,
    [brandId, slug])
  if (!rows.length) apiError(404, 'NOT_FOUND', 'Product not found')
  const p = rows[0]
  return {
    slug: p.slug, name: pickLocale(p.name, locale), tagline: pickLocale(p.tagline, locale),
    description: pickLocale(p.description, locale), specs: pickLocale(p.specs, locale) ?? [],
    gallery: p.gallery, body: pickLocale(p.body, locale), meta: pickLocale(p.meta, locale),
    cover_asset_id: p.cover_asset_id, sort_order: p.sort_order,
  }
})
