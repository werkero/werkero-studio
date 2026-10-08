import { normLocale, pickLocale, useDb } from '../../utils/db'
import { getBrandId } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const brandId = await getBrandId(event)
  const { rows } = await useDb().query(
    `SELECT slug, icon, title, description, points, sort_order
       FROM services WHERE brand_id=$1 AND status='published' AND deleted_at IS NULL
      ORDER BY sort_order ASC`, [brandId])
  return rows.map((s) => ({
    slug: s.slug, icon: s.icon, title: pickLocale(s.title, locale),
    description: pickLocale(s.description, locale),
    points: pickLocale<string[]>(s.points, locale) ?? [], sort_order: s.sort_order,
  }))
})
