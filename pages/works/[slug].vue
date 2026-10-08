<template>
  <main v-if="work">
    <!-- detail hero -->
    <section class="whero">
      <div class="bubbles" aria-hidden="true"><i /><i /><i /></div>
      <div class="wrap whero-inner">
        <p class="eyebrow rise in">{{ labels.kicker }}</p>
        <h1 class="whero-title rise in" style="transition-delay: 120ms">{{ work.title }}</h1>
        <p class="whero-tag rise in" style="transition-delay: 240ms">{{ work.tagline }}</p>
        <div class="wmeta rise in" style="transition-delay: 360ms">
          <div>
            <span class="wmeta-k">{{ labels.role }}</span>
            <span class="wmeta-v">{{ work.role }}</span>
          </div>
          <div>
            <span class="wmeta-k">{{ labels.scope }}</span>
            <span class="wmeta-v">{{ (work.services || []).join(' · ') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- body -->
    <section class="section">
      <div class="wrap narrow">
        <Reveal><p class="eyebrow">{{ labels.overview }}</p></Reveal>
        <Reveal :delay="80">
          <p class="overview">{{ work.overview }}</p>
        </Reveal>
        <Reveal :delay="120">
          <ContentRenderer :value="work" class="prose body-copy" />
        </Reveal>
        <Reveal :delay="140" v-if="work.highlights?.length">
          <ul class="highlights">
            <li v-for="(h, i) in work.highlights" :key="i">{{ h }}</li>
          </ul>
        </Reveal>
      </div>
    </section>

    <!-- next project -->
    <section class="nextwrap" v-if="nextWork">
      <NuxtLink :to="localePath(`/works/${nextWork.slug}`)" class="next-card">
        <div class="wrap next-inner">
          <div>
            <p class="eyebrow">{{ labels.next }}</p>
            <h2 class="display">{{ nextWork.title }}</h2>
          </div>
          <span class="btn-lime">
            {{ labels.view }}
            <svg class="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 L17 7 M8 7 h9 v9" /></svg>
          </span>
        </div>
      </NuxtLink>
    </section>
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const { locale } = useI18n()
const localePath = useLocalePath()
const slug = route.params.slug as string

const { data: work } = await useAsyncData(`work-${locale.value}-${slug}`, () =>
  $fetch(`/api/works/${slug}`, { query: { locale: locale.value } })
)
if (!work.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found' })
}

const { data: site } = await useAsyncData(`site-${locale.value}`, () =>
  queryCollection('site').path(`/${locale.value}`).first()
)
const labels = computed(() => (site.value as any)?.work_detail ?? {
  kicker: 'Case study', role: 'Role', scope: 'Scope',
  overview: 'Overview', next: 'Next project', view: 'View case',
})

const { data: allWorks } = await useAsyncData(`works-${locale.value}`, () =>
  $fetch('/api/works', { query: { locale: locale.value } }) as Promise<
    { slug: string; title: string }[]
  >
)
const nextWork = computed(() => {
  const list = allWorks.value ?? []
  const i = list.findIndex((w) => w.slug === slug)
  return i >= 0 ? list[(i + 1) % list.length] : null
})

useHead({ title: () => `${(work.value as any)?.title ?? 'Work'} — Werkero Studio` })
</script>

<style scoped>
.whero { position: relative; padding: 11rem 0 5rem; overflow: hidden; }
.whero-inner { position: relative; z-index: 1; }
.whero-title { font-size: clamp(3.2rem, 9vw, 8rem); line-height: 1; margin: 1.4rem 0 0; }
.whero-tag { font-size: clamp(1.1rem, 1rem + 0.8vw, 1.5rem); color: var(--muted); margin: 1.4rem 0 0; max-width: 52ch; line-height: 1.55; }
.wmeta { display: flex; gap: 3.5rem; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid var(--line); flex-wrap: wrap; }
.wmeta-k { display: block; font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.5rem; }
.wmeta-v { font-weight: 600; }
.narrow { max-width: 820px; }
.overview { font-family: var(--font-serif); font-size: clamp(1.4rem, 1.2rem + 1vw, 1.9rem); line-height: 1.45; margin: 1.6rem 0 2.6rem; }
.body-copy { margin-bottom: 2.4rem; }
.highlights { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.9rem; }
.highlights li {
  border: 1px solid var(--line); border-radius: 16px; padding: 1.1rem 1.4rem;
  background: rgba(250, 247, 240, 0.025); line-height: 1.6;
}
.highlights li::before { content: ''; display: inline-block; width: 9px; height: 9px; background: var(--lime); transform: rotate(8deg); margin-right: 0.8rem; }
.nextwrap { border-top: 1px solid var(--line); background: #050508; }
.next-card { display: block; text-decoration: none; color: inherit; }
.next-inner {
  display: flex; justify-content: space-between; align-items: center; gap: 2rem;
  padding-top: 5rem; padding-bottom: 5rem;
}
@media (max-width: 760px) { .next-inner { flex-direction: column; align-items: flex-start; } }
</style>
