<template>
  <main>
    <!-- Header (dark) -->
    <section class="tm-hero glow-wrap">
      <div class="glow glow-blue hero-glow-b" aria-hidden="true" />
      <div class="glow glow-purple hero-glow-p" aria-hidden="true" />
      <div class="wrap tm-hero-inner">
        <Reveal><h1 class="serif tm-title">{{ page.testimonials.listTitle }}</h1></Reveal>
        <Reveal :delay="120"><p class="tm-sub">{{ page.testimonials.listSubtitle }}</p></Reveal>
      </div>
    </section>

    <!-- Featured: one large quote -->
    <section v-if="featured" class="section tm-featured-sec">
      <div class="wrap tm-featured-inner">
        <Reveal>
          <div v-if="featured.rating" class="tm-stars tm-stars-lg" aria-label="rating">
            <span v-for="n in 5" :key="n" :class="{ on: n <= featured.rating }">★</span>
          </div>
          <blockquote class="serif tm-quote">“{{ featured.content }}”</blockquote>
          <div class="tm-who">
            <div class="tm-avatar">{{ (featured.client_name || '?').slice(0, 1).toUpperCase() }}</div>
            <div>
              <div class="tm-name">{{ featured.client_name }}</div>
              <div v-if="featured.client_title" class="tm-title-sm">{{ featured.client_title }}</div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- List: all testimonials, no cards -->
    <section v-if="list.length" class="section tm-list-sec">
      <div class="wrap tm-list-inner">
        <Reveal v-for="(t, i) in list" :key="i">
          <article class="tm-item">
            <span class="tm-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="tm-item-main">
              <p class="tm-excerpt">“{{ t.content }}”</p>
              <div class="tm-meta">
                <span class="tm-name-sm">{{ t.client_name }}</span>
                <span v-if="t.client_title" class="tm-title-xs">{{ t.client_title }}</span>
                <span v-if="t.rating" class="tm-stars tm-stars-sm">
                  <span v-for="n in 5" :key="n" :class="{ on: n <= t.rating }">★</span>
                </span>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { page, testimonials } = useSiteContent()

const list = computed(() => (testimonials.value ?? []).filter((t: any) => t.content))
const featured = computed(() => list.value[0] ?? null)

useHead({ title: () => `${page.value.testimonials.listTitle} — Werkero Studio` })
usePageSeo({ title: () => `${page.value.testimonials.listTitle} — Werkero Studio`, pageKey: 'testimonials' })
</script>

<style scoped>
.tm-hero { position: relative; background: #0a0a0e; color: var(--paper); padding: 10rem 0 6rem; overflow: hidden; }
.tm-hero .hero-glow-b { width: 46vw; height: 46vw; right: -12vw; top: -8vw; opacity: 0.5; }
.tm-hero .hero-glow-p { width: 40vw; height: 40vw; left: 28vw; bottom: -18vw; opacity: 0.4; }
.tm-hero-inner { text-align: center; position: relative; z-index: 1; max-width: 760px; margin: 0 auto; padding-top: 2rem; }
.tm-title { font-size: clamp(3.4rem, 9vw, 7rem); line-height: 1.02; letter-spacing: -0.01em; color: #faf7f0; margin: 0 0 1.4rem; font-weight: 500; }
.tm-sub { color: rgba(250, 247, 240, 0.72); font-size: clamp(1.05rem, 1.6vw, 1.3rem); margin: 0; line-height: 1.6; }

/* Featured */
.tm-featured-sec { padding-top: clamp(3rem, 6vw, 5rem); padding-bottom: clamp(3rem, 6vw, 5rem); }
.tm-featured-inner { max-width: 880px; text-align: center; }
.tm-stars { color: #d8d2c2; letter-spacing: 0.2em; }
.tm-stars .on { color: #e8a33d; }
.tm-stars-lg { font-size: 1.2rem; margin-bottom: 1.8rem; }
.tm-quote { font-size: clamp(1.6rem, 3.2vw, 2.6rem); line-height: 1.45; font-weight: 500; letter-spacing: -0.01em; margin: 0 0 2.2rem; color: #1c1a17; }
.tm-who { display: inline-flex; align-items: center; gap: 1rem; text-align: left; }
.tm-avatar { width: 52px; height: 52px; border-radius: 50%; background: #0a0a0e; color: #faf7f0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.25rem; flex-shrink: 0; }
.tm-name { font-weight: 600; font-size: 1.05rem; }
.tm-title-sm { color: var(--muted); font-size: 0.92rem; margin-top: 0.2rem; }

/* List */
.tm-list-sec { padding-top: 0; }
.tm-list-inner { max-width: 880px; }
.tm-item { display: flex; gap: 1.6rem; padding: 2.2rem 0; border-top: 1px solid rgba(11, 11, 14, 0.12); }
.tm-item:last-child { border-bottom: 1px solid rgba(11, 11, 14, 0.12); }
.tm-num { font-size: 0.85rem; color: var(--muted); font-weight: 600; letter-spacing: 0.08em; padding-top: 0.3rem; flex-shrink: 0; }
.tm-item-main { flex: 1; min-width: 0; }
.tm-excerpt { font-size: 1.08rem; line-height: 1.7; color: #2b2925; margin: 0 0 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.tm-meta { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
.tm-name-sm { font-weight: 600; font-size: 0.95rem; }
.tm-title-xs { color: var(--muted); font-size: 0.88rem; }
.tm-stars-sm { font-size: 0.85rem; margin-left: auto; }
</style>
