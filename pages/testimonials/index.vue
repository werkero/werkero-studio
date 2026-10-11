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

    <!-- Grid -->
    <section class="section tm-grid-sec">
      <div class="wrap">
        <div v-if="list.length" class="tm-grid">
          <Reveal v-for="(t, i) in list" :key="i" :delay="(i % 3) * 90">
            <article class="card-white tm-card">
              <div v-if="t.rating" class="tm-stars" aria-label="rating">
                <span v-for="n in 5" :key="n" :class="{ on: n <= t.rating }">★</span>
              </div>
              <p class="tm-content">“{{ t.content }}”</p>
              <div class="tm-who">
                <div class="tm-avatar">{{ (t.client_name || '?').slice(0, 1).toUpperCase() }}</div>
                <div>
                  <div class="tm-name">{{ t.client_name }}</div>
                  <div v-if="t.client_title" class="tm-title">{{ t.client_title }}</div>
                </div>
              </div>
            </article>
          </Reveal>
        </div>
        <p v-else class="tm-empty">{{ page.testimonials.listSubtitle }}</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { page, testimonials } = useSiteContent()

const list = computed(() => (testimonials.value ?? []).filter((t: any) => t.content))

useHead({ title: () => `${page.value.testimonials.listTitle} — Werkero Studio` })
</script>

<style scoped>
.tm-hero { position: relative; background: #0a0a0e; color: var(--paper); padding: 10rem 0 6rem; overflow: hidden; }
.tm-hero .hero-glow-b { width: 46vw; height: 46vw; right: -12vw; top: -8vw; opacity: 0.5; }
.tm-hero .hero-glow-p { width: 40vw; height: 40vw; left: 28vw; bottom: -18vw; opacity: 0.4; }
.tm-hero-inner { text-align: center; position: relative; z-index: 1; max-width: 760px; margin: 0 auto; padding-top: 2rem; }
.tm-title { font-size: clamp(3rem, 8vw, 6rem); line-height: 1.05; letter-spacing: -0.01em; color: #faf7f0; margin: 0 0 1.4rem; font-weight: 500; }
.tm-sub { color: rgba(250, 247, 240, 0.72); font-size: clamp(1.05rem, 1.6vw, 1.3rem); margin: 0; line-height: 1.6; }

.tm-grid-sec { padding-top: clamp(2.5rem, 5vw, 4rem); }
.tm-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(1.4rem, 3vw, 2.2rem); }
.tm-grid > div { display: flex; flex-direction: column; }
.tm-card { display: flex; flex-direction: column; flex: 1; padding: 2rem 1.8rem; }
.tm-stars { color: #d8d2c2; font-size: 1.05rem; letter-spacing: 0.15em; margin-bottom: 1rem; }
.tm-stars .on { color: #e8a33d; }
.tm-content { font-size: 1.02rem; line-height: 1.7; color: #2b2925; margin: 0 0 1.6rem; flex: 1; }
.tm-who { display: flex; align-items: center; gap: 0.9rem; }
.tm-avatar { width: 44px; height: 44px; border-radius: 50%; background: #0a0a0e; color: #faf7f0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; }
.tm-name { font-weight: 600; font-size: 0.98rem; }
.tm-title { color: var(--muted); font-size: 0.88rem; margin-top: 0.15rem; }
.tm-empty { text-align: center; color: var(--muted); padding: 3rem 0; }

@media (max-width: 960px) {
  .tm-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 620px) {
  .tm-grid { grid-template-columns: 1fr; }
}
</style>
