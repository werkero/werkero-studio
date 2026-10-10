/**
 * Site content from L1 (i18n JSON), L2 (content JSON), L3 (Postgres API).
 * L1 loaded via import.meta.glob — no dependency on @nuxtjs/i18n message loading.
 * Same shape the templates expect (page.hero.line1, page.nav.services, ...).
 */

// Eager-load all L1 dictionaries: i18n/locales/<locale>/<ns>.json
const l1Modules = import.meta.glob('~/locales/*/*.json', { eager: true }) as Record<string, { default: any }>

const l1: Record<string, Record<string, any>> = {}
for (const [path, mod] of Object.entries(l1Modules)) {
  const m = path.match(/locales\/([^/]+)\/([^/]+)\.json$/)
  if (!m) continue
  const [, locale, ns] = m
  l1[locale] ??= {}
  l1[locale][ns] = (mod as any).default ?? mod
}

function getL1(locale: string, ns: string): any {
  return l1[locale]?.[ns] ?? l1['en']?.[ns] ?? {}
}

export function useSiteContent() {
  const { locale } = useI18n()
  const loc = computed(() => locale.value)

  const nav = computed(() => getL1(loc.value, 'nav'))
  const hero = computed(() => getL1(loc.value, 'hero'))
  const ticker = computed(() => getL1(loc.value, 'ticker'))
  const cta = computed(() => getL1(loc.value, 'cta'))
  const footer = computed(() => {
    const f = getL1(loc.value, 'footer')
    return { ...f, email: f?.links?.email ?? '' }
  })
  const workDetail = computed(() => getL1(loc.value, 'workDetail'))
  const worksUi = computed(() => getL1(loc.value, 'works'))
  const faqUi = computed(() => getL1(loc.value, 'faq'))
  const servicesUi = computed(() => getL1(loc.value, 'services'))
  const positionUi = computed(() => getL1(loc.value, 'position'))
  const processUi = computed(() => getL1(loc.value, 'workflow'))
  const aboutUi = computed(() => getL1(loc.value, 'about'))
  const commonUi = computed(() => getL1(loc.value, 'common'))
  const contactUi = computed(() => getL1(loc.value, 'contact'))

  // L3: dynamic content from API
  const { data: allWorks } = useAsyncData(`works-${loc.value}`, () =>
    $fetch('/api/works', { query: { locale: loc.value } }) as Promise<any[]>)
  const { data: allServices } = useAsyncData(`services-${loc.value}`, () =>
    $fetch('/api/services', { query: { locale: loc.value } }) as Promise<any[]>)
  const { data: allFaqs } = useAsyncData(`faqs-${loc.value}`, () =>
    $fetch('/api/faqs', { query: { locale: loc.value } }) as Promise<any[]>)

  const page = computed(() => ({
    nav: nav.value,
    hero: hero.value,
    ticker: ticker.value,
    // Homepage showcase sections: API-first (CMS source of truth), L1 curated copy as fallback.
    // Doodle/wide presentation mapped from slug+icon so admin edits flow to the homepage.
    services: {
      ...servicesUi.value,
      details: servicesUi.value?.details ?? 'Details',
      items: (allServices.value?.length ? allServices.value : (servicesUi.value?.items ?? [])).map((s: any, i: number) => ({
        title: s.title, text: s.description ?? s.text,
        doodle: s.icon ?? s.doodle ?? ['browser', 'sparkles', 'eglobe', 'shapes'][i] ?? 'browser',
        wide: (s.slug ?? '') === 'brand-web-design' || !!s.wide,
      })),
    },
    works: {
      ...worksUi.value,
      featured: 'laurero',
      view_case: worksUi.value?.viewCase ?? 'View case',
    },
    faq: {
      ...faqUi.value,
      items: (allFaqs.value?.length ? allFaqs.value : (faqUi.value?.items ?? [])).map((f: any) => ({
        q: f.question ?? f.q, a: f.answer ?? f.a,
      })),
    },
    cta: cta.value,
    footer: footer.value,
    work_detail: workDetail.value,
    position: positionUi.value,
    process: processUi.value,
    about: aboutUi.value,
    common: commonUi.value,
    contact: contactUi.value,
  }))

  const works = computed(() => allWorks.value ?? [])

  // Homepage showcase: curated editorial copy from L1 (artifact parity),
  // ordered like the artifact: featured Laurero, then the other five.
  const showcaseOrder = ['laurero', 'ai-archives', 'awarely', 'aether', 'arkhyx-blog', 'kyvero']
  const showcaseWorks = computed(() => {
    const items = worksUi.value?.items ?? {}
    const api = allWorks.value ?? []
    return showcaseOrder
      .map((slug) => {
        const curated = items[slug]
        if (!curated) return null
        const fromApi = api.find((w: any) => w.slug === slug) ?? {}
        return { slug, title: fromApi.title ?? curated.title, ...curated }
      })
      .filter(Boolean)
  })

  return { locale: loc, nav, footer, page, works, showcaseWorks }
}
