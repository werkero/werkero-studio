<template>
  <main>
    <!-- Header (dark) -->
    <section class="studio-hero glow-wrap">
      <div class="glow glow-blue hero-glow-b" aria-hidden="true" />
      <div class="glow glow-purple hero-glow-p" aria-hidden="true" />
      <div class="wrap studio-hero-inner">
        <Reveal><p class="kicker on-dark"><span class="ast">✳</span> {{ page.studio.eyebrow }}</p></Reveal>
        <Reveal :delay="80"><h1 class="serif studio-title">{{ page.studio.title }}</h1></Reveal>
      </div>
    </section>

    <!-- Intro -->
    <section class="section studio-intro-sec">
      <div class="wrap studio-intro-inner">
        <Reveal><p class="serif studio-p1">{{ page.studio.p1 }}</p></Reveal>
        <Reveal :delay="120"><p class="studio-p2">{{ page.studio.p2 }}</p></Reveal>
        <div class="studio-facts">
          <Reveal v-for="(f, i) in page.studio.facts" :key="i" :delay="i * 90">
            <div class="studio-fact">
              <p class="tag">{{ f.label }}</p>
              <p class="serif studio-fact-v">{{ f.value }}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { page } = useSiteContent()

useHead({ title: () => `${page.value.studio.title} — Werkero Studio` })
</script>

<style scoped>
.studio-hero { position: relative; background: #0a0a0e; color: var(--paper); padding: 10rem 0 6rem; overflow: hidden; }
.studio-hero .hero-glow-b { width: 46vw; height: 46vw; right: -12vw; top: -8vw; opacity: 0.5; }
.studio-hero .hero-glow-p { width: 40vw; height: 40vw; left: 28vw; bottom: -18vw; opacity: 0.4; }
.studio-hero-inner { text-align: center; position: relative; z-index: 1; max-width: 760px; margin: 0 auto; padding-top: 2rem; }
.kicker.on-dark { color: rgba(250, 247, 240, 0.72); }
.studio-title { font-size: clamp(3.4rem, 9vw, 7rem); line-height: 1.02; letter-spacing: -0.01em; color: #faf7f0; margin: 1.2rem 0 0; font-weight: 500; }

.studio-intro-sec { padding-top: clamp(3rem, 6vw, 5rem); }
.studio-intro-inner { max-width: 880px; }
.studio-p1 { font-size: clamp(1.5rem, 2.8vw, 2.2rem); line-height: 1.5; font-weight: 500; letter-spacing: -0.01em; margin: 0 0 1.8rem; color: #1c1a17; }
.studio-p2 { font-size: 1.08rem; line-height: 1.75; color: #4a463d; margin: 0 0 3.5rem; max-width: 62ch; }
.studio-facts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.6rem; border-top: 1px solid rgba(11, 11, 14, 0.12); padding-top: 2.2rem; }
.studio-fact-v { font-size: 1.25rem; font-weight: 600; margin: 0.6rem 0 0; }

@media (max-width: 720px) {
  .studio-facts { grid-template-columns: 1fr; gap: 1.2rem; }
}
</style>
