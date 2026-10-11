<template>
  <main>
    <!-- Header -->
    <section class="section works-head">
      <div class="wrap works-head-inner">
        <Reveal><h1 class="serif works-title">{{ page.works.listTitle }}</h1></Reveal>
        <Reveal :delay="120"><p class="works-sub">{{ page.works.listSubtitle }}</p></Reveal>
      </div>
    </section>

    <!-- Grid -->
    <section class="section works-grid-sec">
      <div class="wrap">
        <div class="works-grid">
          <Reveal v-for="(w, i) in listWorks" :key="w.slug" :delay="(i % 3) * 90">
            <NuxtLink :to="localePath(`/works/${w.slug}`)" class="card-white works-card">
              <div class="works-art" :style="{ background: w.bg }">
                <WorkArt :type="w.doodle" class="works-doodle" />
              </div>
              <div class="works-body">
                <h3>{{ w.title }}</h3>
                <p class="works-tags">{{ tags(w) }}</p>
              </div>
            </NuxtLink>
          </Reveal>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { locale, page, works } = useSiteContent()
const localePath = useLocalePath()

// All published works (API, sort_order) merged with L1 display fields.
const listWorks = computed(() => {
  const items = (page.value.works as any)?.items ?? {}
  return (works.value ?? []).map((w: any) => {
    const curated = items[w.slug] ?? {}
    return {
      slug: w.slug,
      title: w.title ?? curated.title,
      services: w.services ?? [],
      category: curated.category ?? '',
      bg: curated.bg ?? '#ece7db',
      doodle: curated.doodle ?? 'browser',
    }
  }).filter((w: any) => w.title)
})

function tags(w: any) {
  if (w.services?.length) return w.services.join(' · ')
  return w.category
}

useHead({ title: () => `${page.value.works.listTitle} — Werkero Studio` })
</script>

<style scoped>
.works-head { padding-bottom: 0; }
.works-head-inner { text-align: center; max-width: 720px; }
.works-title { font-size: clamp(3rem, 7vw, 5.5rem); letter-spacing: -0.01em; margin: 0 0 1.2rem; font-weight: 500; }
.works-sub { font-size: clamp(1.05rem, 1.6vw, 1.3rem); opacity: 0.72; margin: 0; line-height: 1.6; }

.works-grid-sec { padding-top: clamp(2.5rem, 5vw, 4rem); }
.works-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.4rem, 3vw, 2.4rem); }
.works-grid > div { display: flex; flex-direction: column; }
.works-card { display: flex; flex-direction: column; flex: 1; text-decoration: none; overflow: hidden; transition: transform 0.45s var(--ease), box-shadow 0.45s var(--ease); }
.works-card:hover { transform: translateY(-6px); box-shadow: 0 22px 60px rgba(11, 11, 14, 0.14); }
.works-art { aspect-ratio: 16 / 10; display: flex; align-items: center; justify-content: center; padding: 2rem; overflow: hidden; }
.works-doodle { width: 100%; max-width: 280px; height: auto; }
.works-body { padding: 1.4rem 1.6rem 1.8rem; }
.works-body h3 { font-size: 1.45rem; margin: 0 0 0.4rem; font-weight: 600; }
.works-tags { color: var(--muted); font-size: 0.92rem; margin: 0; }

@media (max-width: 960px) {
  .works-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 620px) {
  .works-grid { grid-template-columns: 1fr; }
}
</style>
