import { normLocale, pickLocale, useDb } from '../../utils/db'
import { getBrandId, apiError } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const brandId = await getBrandId(event)
  const page = String(getQuery(event).page || 'home')
  const { rows } = await useDb().query(
    `SELECT meta, noindex FROM seo WHERE brand_id=$1 AND page_key=$2 AND deleted_at IS NULL LIMIT 1`,
    [brandId, page])
  if (!rows.length) apiError(404, 'NOT_FOUND', 'SEO entry not found')
  return { page, meta: pickLocale(rows[0].meta, locale), noindex: rows[0].noindex }
})
