import { normLocale, pickLocale, useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const { rows } = await useDb().query(
    `SELECT slug, title, tagline, role, services, overview, cover_asset_id, sort_order
       FROM works
      WHERE status = 'published' AND deleted_at IS NULL
      ORDER BY sort_order ASC`
  )
  return rows.map((w) => ({
    slug: w.slug,
    title: pickLocale(w.title, locale),
    tagline: pickLocale(w.tagline, locale),
    role: pickLocale(w.role, locale),
    services: pickLocale<string[]>(w.services, locale) ?? [],
    overview: pickLocale(w.overview, locale),
    cover_asset_id: w.cover_asset_id,
    sort_order: w.sort_order,
  }))
})
