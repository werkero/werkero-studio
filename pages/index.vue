<template>
  <main v-if="page">
    <!-- HERO -->
    <section class="hero">
      <div class="bubbles" aria-hidden="true"><i /><i /><i /><i /></div>
      <div class="wrap hero-grid">
        <div>
          <p class="eyebrow rise in">{{ page.hero.eyebrow }}</p>
          <h1 class="hero-title">
            <span class="rise in" style="transition-delay: 120ms">{{ page.hero.line1 }}</span>
            <span class="rise in" style="transition-delay: 260ms">{{ page.hero.line2 }}</span>
          </h1>
        </div>
        <div class="hero-side rise in" style="transition-delay: 420ms">
          <p>{{ page.hero.description }}</p>
          <a :href="anchor('#contact')" class="btn-lime">
            {{ page.hero.cta }}
            <svg class="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 L17 7 M8 7 h9 v9" /></svg>
          </a>
        </div>
      </div>
      <div class="wrap hero-strip rise in" style="transition-delay: 600ms">
        <NuxtLink
          v-for="w in works"
          :key="w.slug"
          :to="localePath(`/works/${w.slug}`)"
          class="strip-item"
        >
          {{ w.title }}
        </NuxtLink>
      </div>
    </section>

    <!-- TICKER -->
    <Ticker :label="page.ticker.label" :items="page.ticker.items" />

    <!-- SERVICES -->
    <section id="services" class="section">
      <div class="wrap">
        <Reveal><p class="eyebrow">{{ page.services.eyebrow }}</p></Reveal>
        <Reveal :delay="100">
          <h2 class="display">{{ page.services.title }} <Doodle type="star" :size="46" class="inline-doodle" /></h2>
        </Reveal>
        <div class="svc-grid">
          <Reveal v-for="(s, i) in page.services.items" :key="i" :delay="i * 100">
            <ServiceCard :item="s" />
          </Reveal>
        </div>
      </div>
    </section>

    <!-- WORKS -->
    <section id="work" class="section" style="padding-top: 0">
      <div class="wrap">
        <Reveal><p class="eyebrow">{{ page.works.eyebrow }}</p></Reveal>
        <Reveal :delay="100"><h2 class="display">{{ page.works.title }}</h2></Reveal>
        <Reveal :delay="150" v-if="featured">
          <WorkCard
            :to="localePath(`/works/${featured.slug}`)"
            :title="featured.title"
            :tagline="featured.tagline"
            :view-case="page.works.view_case"
            featured
            class="featured-card"
          />
        </Reveal>
        <div class="works-grid">
          <Reveal v-for="(w, i) in rest" :key="w.slug" :delay="(i % 2) * 100">
            <WorkCard
              :to="localePath(`/works/${w.slug}`)"
              :title="w.title"
              :tagline="w.tagline"
              :view-case="page.works.view_case"
            />
          </Reveal>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section id="faq" class="section" style="padding-top: 0">
      <div class="wrap narrow">
        <Reveal><p class="eyebrow">{{ page.faq.eyebrow }}</p></Reveal>
        <Reveal :delay="100"><h2 class="display">{{ page.faq.title }}</h2></Reveal>
        <Reveal :delay="150">
          <div class="faq-list">
            <FaqItem v-for="(f, i) in page.faq.items" :key="i" :q="f.q" :a="f.a" />
          </div>
        </Reveal>
      </div>
    </section>

    <!-- CTA -->
    <section id="contact" class="cta">
      <div class="bubbles" aria-hidden="true"><i /><i /><i /></div>
      <div class="wrap cta-inner">
        <Reveal>
          <Doodle type="star" :size="54" class="cta-doodle" />
          <h2 class="display">{{ page.cta.title }}</h2>
        </Reveal>
        <Reveal :delay="120">
          <a :href="`mailto:${page.footer.email}`" class="btn-lime btn-big">
            {{ page.cta.button }}
            <svg class="arr" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 L17 7 M8 7 h9 v9" /></svg>
          </a>
        </Reveal>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const anchor = (hash: string) => localePath({ path: '/', hash })

const { data: page } = await useAsyncData(`index-${locale.value}`, () =>
  queryCollection('site').path(`/${locale.value}`).first()
)

const { data: allWorks } = await useAsyncData(`works-${locale.value}`, () =>
  $fetch('/api/works', { query: { locale: locale.value } }) as Promise<
    { slug: string; title: string; tagline: string }[]
  >
)

const works = computed(() => allWorks.value ?? [])
const featuredSlug = computed(() => (page.value as any)?.works?.featured ?? 'laurero')
const featured = computed(() => works.value.find((w) => w.slug === featuredSlug.value) ?? works.value[0])
const rest = computed(() => works.value.filter((w) => w.slug !== featured.value?.slug))

useHead({
  title: () => `${(page.value as any)?.title ?? 'Werkero Studio'}`,
})
</script>

<style scoped>
.hero { position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: flex-end; padding: 9rem 0 0; }
.hero-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 3rem; align-items: end; position: relative; z-index: 1; }
.hero-title { font-size: clamp(3rem, 8vw, 7.5rem); line-height: 1.0; letter-spacing: -0.015em; margin: 1.4rem 0 0; color: var(--paper); }
.hero-title span { display: block; }
.hero-side p { color: var(--muted); line-height: 1.65; margin: 0 0 1.8rem; max-width: 36ch; }
.hero-strip {
  position: relative; z-index: 1;
  display: flex; gap: 0.8rem; overflow-x: auto;
  margin-top: 4rem; padding: 1.2rem 0 2rem;
  border-top: 1px solid var(--line);
}
.strip-item {
  flex: none; text-decoration: none; color: var(--muted);
  border: 1px solid var(--line); border-radius: 64px; padding: 0.6rem 1.3rem;
  font-size: 0.85rem; font-weight: 600; letter-spacing: 0.06em;
  transition: color 0.3s, border-color 0.3s;
}
.strip-item:hover { color: var(--ink); background: var(--lime); border-color: var(--lime); }
.svc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4rem; margin-top: 3rem; }
.inline-doodle { display: inline-block; vertical-align: -6px; color: var(--lime); margin-left: 0.4rem; }
.featured-card { display: block; margin-top: 3rem; }
.works-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4rem 1.6rem; margin-top: 2.6rem; }
.works-grid > div:nth-child(even) { transform: translateY(2.6rem); }
.narrow { max-width: 820px; }
.faq-list { margin-top: 2.2rem; border-top: 1px solid var(--line); }
.cta { position: relative; overflow: hidden; background: #050508; border-top: 1px solid var(--line); }
.cta-inner { position: relative; z-index: 1; text-align: center; padding: 7rem 0; }
.cta-doodle { color: var(--lime); margin: 0 auto 1.6rem; }
.btn-big { font-size: 1.15rem; padding: 1.35rem 3rem; margin-top: 2.6rem; }
@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; }
  .svc-grid { grid-template-columns: 1fr; }
  .works-grid { grid-template-columns: 1fr; }
  .works-grid > div:nth-child(even) { transform: none; }
}
</style>
