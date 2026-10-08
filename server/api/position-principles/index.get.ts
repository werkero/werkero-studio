import { normLocale, pickLocale, useDb } from '../../utils/db'
import { getBrandId } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const brandId = await getBrandId(event)
  const { rows } = await useDb().query(
    `SELECT title, description, sort_order
       FROM position_principles WHERE brand_id=$1 AND status='published' AND deleted_at IS NULL
      ORDER BY sort_order ASC`, [brandId])
  return rows.map((p) => ({
    title: pickLocale(p.title, locale), description: pickLocale(p.description, locale),
    sort_order: p.sort_order,
  }))
})
