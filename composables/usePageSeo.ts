const SITE_URL = 'https://werkero.vercel.app'
const DEFAULT_DESCRIPTION = 'Werkero Studio — independent studio for web products, brands, and AI tools.'
const OG_LOCALE: Record<string, string> = {
  en: 'en_US',
  'zh-cn': 'zh_CN',
  'zh-tw': 'zh_TW',
  fr: 'fr_FR',
  de: 'de_DE',
  ru: 'ru_RU',
  ja: 'ja_JP',
}

/**
 * Per-page SEO: canonical URL + Open Graph / Twitter card tags.
 * Global defaults (og:site_name, og:type, og:image, twitter:card)
 * live in nuxt.config.ts app.head.
 */
export function usePageSeo(opts: {
  title: MaybeRefOrGetter<string>
  description?: MaybeRefOrGetter<string>
}) {
  const route = useRoute()
  const { locale } = useI18n()

  const title = computed(() => toValue(opts.title))
  const description = computed(() => toValue(opts.description) || DEFAULT_DESCRIPTION)
  const url = computed(() => `${SITE_URL}${route.path}`)
  const ogLocale = computed(() => OG_LOCALE[locale.value] ?? 'en_US')

  useHead({
    link: [{ key: 'canonical', rel: 'canonical', href: url }],
    meta: [
      { key: 'og:title', property: 'og:title', content: title },
      { key: 'og:description', property: 'og:description', content: description },
      { key: 'og:url', property: 'og:url', content: url },
      { key: 'og:locale', property: 'og:locale', content: ogLocale },
      { key: 'twitter:title', name: 'twitter:title', content: title },
      { key: 'twitter:description', name: 'twitter:description', content: description },
    ],
  })
}
