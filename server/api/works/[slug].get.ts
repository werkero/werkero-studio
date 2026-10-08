import { parseMarkdown } from '@nuxtjs/mdc/runtime'
import { normLocale, pickLocale, useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const locale = normLocale(getQuery(event).locale)
  const slug = getRouterParam(event, 'slug')

  const { rows } = await useDb().query(
    `SELECT slug, title, tagline, role, services, overview, highlights, body, meta,
            cover_asset_id, sort_order, published_at
       FROM works
      WHERE slug = $1 AND status = 'published' AND deleted_at IS NULL
      LIMIT 1`,
    [slug]
  )
  if (!rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Work not found' })
  }
  const w = rows[0]

  // Parse the stored Markdown body into an MDC AST so the page's
  // <ContentRenderer :value="work" /> keeps working unchanged.
  const md = pickLocale(w.body, locale) ?? ''
  const parsed = md ? await parseMarkdown(md) : null

  return {
    slug: w.slug,
    title: pickLocale(w.title, locale),
    tagline: pickLocale(w.tagline, locale),
    role: pickLocale(w.role, locale),
    services: pickLocale<string[]>(w.services, locale) ?? [],
    overview: pickLocale(w.overview, locale),
    highlights: pickLocale<string[]>(w.highlights, locale) ?? [],
    body: parsed?.body ?? null,
    meta: pickLocale(w.meta, locale),
    cover_asset_id: w.cover_asset_id,
    sort_order: w.sort_order,
    published_at: w.published_at,
  }
})
