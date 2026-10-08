import { normLocale, pickLocale, useDb } from '../utils/db'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const { rows } = await useDb().query(
    `SELECT slug, name, tagline FROM brands WHERE slug = 'werkero' AND deleted_at IS NULL LIMIT 1`
  )
  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Brand not found' })
  }
  const b = rows[0]
  return {
    slug: b.slug,
    name: b.name,
    tagline: pickLocale(b.tagline, locale),
  }
})
