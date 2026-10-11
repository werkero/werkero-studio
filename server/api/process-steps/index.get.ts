import { normLocale, pickLocale, useDb } from '../../utils/db'
import { getBrandId } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const brandId = await getBrandId(event)
  const { rows } = await useDb().query(
    `SELECT title, description, icon, output_tag, sort_order
       FROM process_steps WHERE brand_id=$1 AND status='published' AND deleted_at IS NULL
      ORDER BY sort_order ASC`, [brandId])
  return rows.map((s) => ({
    title: pickLocale(s.title, locale),
    description: pickLocale(s.description, locale),
    icon: s.icon,
    output_tag: pickLocale(s.output_tag, locale),
    sort_order: s.sort_order,
  }))
})
