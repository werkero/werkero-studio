import { normLocale, pickLocale, useDb } from '../../utils/db'
import { getBrandId } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const brandId = await getBrandId(event)
  const category = getQuery(event).category ? String(getQuery(event).category) : null
  const params: any[] = [brandId]
  let where = `brand_id=$1 AND status='published' AND deleted_at IS NULL`
  if (category) { params.push(category); where += ` AND category=$${params.length}` }
  const { rows } = await useDb().query(
    `SELECT category, question, answer, sort_order FROM faqs WHERE ${where} ORDER BY sort_order ASC`, params)
  return rows.map((f) => ({
    category: f.category, question: pickLocale(f.question, locale),
    answer: pickLocale(f.answer, locale), sort_order: f.sort_order,
  }))
})
