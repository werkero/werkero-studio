const SITE_URL = 'https://werkero.vercel.app'
const DEFAULT_DESCRIPTION = 'Werkero Studio — independent studio for web products, brands, and AI tools.'
const DEFAULT_OG_IMAGE = 'https://werkero.vercel.app/og-image.png'
const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  'zh-cn': 'zh_CN',
  'zh-tw': 'zh_TW',
  fr: 'fr_FR',
  de: 'de_DE',
  ru: 'ru_RU',
  ja: 'ja_JP',
}

export type SeoPageKey = 'home' | 'studio' | 'works' | 'testimonials' | 'contact'

/**
 * Per-page SEO: document title, canonical URL, meta description,
 * Open Graph / Twitter card tags.
 * Global defaults (og:site_name, og:type, og:image, twitter:card)
 * live in nuxt.config.ts app.head.
 *
 * When `pageKey` is given, the DB-backed SEO entry
 * (GET /api/seo?page=<key>&locale=<lang>, edited in /admin/seo)
 * overrides title / description / og:image. A missing entry, empty
 * fields, or any fetch failure fall back to the defaults silently.
 * `noindex: true` on the entry adds `<meta name="robots" content="noindex">`.
 */
export function usePageSeo(opts: {
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string>
  pageKey?: SeoPageKey
}) {
  const route = useRoute()
  const { locale } = useI18n()

  // DB-backed override. SSR-friendly; never throws — any failure
  // (404 no entry, DB unreachable at build time) falls back silently.
  const { data: seoEntry } = opts.pageKey
    ? useAsyncData(`page-seo-${opts.pageKey}-${locale.value}`, () =>
        $fetch('/api/seo', { query: { page: opts.pageKey, locale: locale.value } }).catch(() => null),
      )
    : { data: computed(() => null) }

  const seoMeta = computed<Record<string, string>>(() => (seoEntry.value as any)?.meta ?? {})
  const noindex = computed(() => (seoEntry.value as any)?.noindex === true)

  const title = computed(() => seoMeta.value.title || toValue(opts.title))
  const description = computed(() => seoMeta.value.description || toValue(opts.description) || DEFAULT_DESCRIPTION)
  const ogImage = computed(() => seoMeta.value.og_image || DEFAULT_OG_IMAGE)
  const url = computed(() => `${SITE_URL}${route.path}`)
  const ogLocale = computed(() => OG_LOCALE[locale.value] ?? 'en_US')

  useHead({
    title,
    link: [{ key: 'canonical', rel: 'canonical', href: url }],
    meta: [
      { key: 'description', name: 'description', content: description },
      { key: 'og:title', property: 'og:title', content: title },
      { key: 'og:description', property: 'og:description', content: description },
      { key: 'og:image', property: 'og:image', content: ogImage },
      { key: 'og:url', property: 'og:url', content: url },
      { key: 'og:locale', property: 'og:locale', content: ogLocale },
      { key: 'twitter:title', name: 'twitter:title', content: title },
      { key: 'twitter:description', name: 'twitter:description', content: description },
      { key: 'twitter:image', name: 'twitter:image', content: ogImage },
      ...(noindex.value ? [{ key: 'robots', name: 'robots', content: 'noindex' }] : []),
    ],
  })
}
