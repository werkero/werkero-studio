const LOCALES = ['en', 'zh-cn', 'zh-tw', 'fr', 'de', 'ru', 'ja'] as const
const WORK_SLUGS = ['laurero', 'ai-archives', 'awarely', 'aether', 'arkhyx-blog', 'kyvero'] as const

const localePrefix = (l: string) => (l === 'en' ? '' : `/${l}`)

// Every page × every locale, so `nuxi generate` prerenders real /works/[slug] paths
const prerenderRoutes: string[] = LOCALES.flatMap((l) => [
  `${localePrefix(l)}/`,
  ...WORK_SLUGS.map((s) => `${localePrefix(l)}/works/${s}`),
])

export default defineNuxtConfig({
  modules: ['@nuxt/content', '@nuxtjs/i18n', '@element-plus/nuxt'],

  css: ['flag-icons/css/flag-icons.min.css', '~/assets/css/main.css'],

  content: {
    // collections are declared in content.config.ts
  },

  i18n: {
    lazy: false,
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-US', name: 'English' },
      { code: 'zh-cn', language: 'zh-CN', name: '简体中文' },
      { code: 'zh-tw', language: 'zh-TW', name: '繁體中文' },
      { code: 'fr', language: 'fr-FR', name: 'Français' },
      { code: 'de', language: 'de-DE', name: 'Deutsch' },
      { code: 'ru', language: 'ru-RU', name: 'Русский' },
      { code: 'ja', language: 'ja-JP', name: '日本語' },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
  },

  app: {
    head: {
      title: 'Werkero Studio',
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Werkero Studio — independent studio for web products, brands, and AI tools.' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..800;1,400..700&family=Inter:wght@300..800&display=swap',
        },
      ],
    },
  },

  nitro: {
    prerender: {
      routes: prerenderRoutes,
      crawlLinks: true,
      // DB may be unreachable at build time (e.g. preview envs); don't fail
      // the whole build — unprerendered routes fall back to runtime SSR.
      failOnError: false,
    },
  },

  compatibilityDate: '2025-01-01',
})
