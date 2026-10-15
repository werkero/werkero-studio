import { useDb } from '../utils/db'

const SITE = 'https://werkero.vercel.app'
const LOCALES = ['en', 'zh-cn', 'zh-tw', 'fr', 'de', 'ru', 'ja'] as const
const STATIC_PAGES = ['/', '/studio', '/works', '/testimonials', '/contact'] as const
// Fallback when the database is unreachable (e.g. build-time prerender).
// Production always reads the live list from the query below.
const FALLBACK_WORK_SLUGS = ['laurero', 'ai-archives', 'awarely', 'aether', 'arkhyx-blog', 'kyvero'] as const

const prefix = (locale: string) => (locale === 'en' ? '' : `/${locale}`)

export default defineEventHandler(async (event) => {
  let slugs: readonly string[] = FALLBACK_WORK_SLUGS
  try {
    const { rows } = await useDb().query(
      `SELECT slug FROM works WHERE status = 'published' AND deleted_at IS NULL ORDER BY sort_order ASC`
    )
    if (rows.length) slugs = rows.map((r: { slug: string }) => r.slug)
  } catch {
    // DB unreachable — serve the fallback list rather than a 500
  }

  const urls: string[] = []
  for (const locale of LOCALES) {
    const p = prefix(locale)
    for (const page of STATIC_PAGES) {
      urls.push(
        `<url><loc>${SITE}${p}${page}</loc><changefreq>monthly</changefreq><priority>${page === '/' ? '1.0' : '0.8'}</priority></url>`
      )
    }
    for (const slug of slugs) {
      urls.push(`<url><loc>${SITE}${p}/works/${slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>`)
    }
  }

  setHeader(event, 'content-type', 'text/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
})
