import { normLocale, pickLocale, useDb } from '../../utils/db'
import { getBrandId } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const brandId = await getBrandId(event)
  const { rows } = await useDb().query(
    `SELECT client_name, client_title, avatar_asset_id, rating, content, sort_order
       FROM testimonials WHERE brand_id=$1 AND status='approved' AND deleted_at IS NULL
      ORDER BY sort_order ASC`, [brandId])
  return rows.map((t) => ({
    client_name: t.client_name, client_title: pickLocale(t.client_title, locale),
    avatar_asset_id: t.avatar_asset_id, rating: t.rating,
    content: pickLocale(t.content, locale), sort_order: t.sort_order,
  }))
})
