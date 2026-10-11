<template>
  <main>
    <!-- Hero — same dark full-bleed style as works/testimonials -->
    <section class="studio-hero glow-wrap">
      <div class="glow glow-red hero-glow-r" aria-hidden="true" />
      <div class="glow glow-blue hero-glow-b" aria-hidden="true" />
      <div class="glow glow-purple hero-glow-p" aria-hidden="true" />
      <div class="wrap studio-hero-inner">
        <Reveal><p class="kicker on-dark"><span class="ast lime">✳</span> {{ page.studio.aboutLabel }}</p></Reveal>
        <Reveal :delay="80"><h1 class="serif studio-title">{{ page.studio.heroTitle }}</h1></Reveal>
        <Reveal :delay="140"><p class="studio-hero-intro">{{ page.studio.heroIntro }}</p></Reveal>
      </div>
    </section>

    <!-- Intro -->
    <section class="section">
      <div class="wrap">
        <Reveal><p class="kicker"><span class="ast">✳</span> {{ page.studio.introEyebrow }}</p></Reveal>
        <Reveal :delay="80">
          <h2 class="display intro-headline">{{ page.studio.aboutP1 }}</h2>
        </Reveal>
        <Reveal :delay="140">
          <p class="intro-body">{{ page.studio.aboutP2 }}</p>
        </Reveal>
      </div>
    </section>

    <!-- Services — reuse homepage services module -->
    <section class="section" style="padding-top: 0">
      <div class="wrap">
        <Reveal><p class="kicker"><span class="ast">✳</span> {{ page.services.eyebrow }}</p></Reveal>
        <div class="sec-head">
          <Reveal :delay="80">
            <h2 class="display">{{ page.services.title }} <Doodle type="smile" :size="44" class="inline-doodle" /></h2>
          </Reveal>
          <Reveal :delay="140"><p class="side-note">{{ page.services.sideNote }}</p></Reveal>
        </div>
        <div class="svc-grid">
          <Reveal v-for="(s, i) in page.services.items.filter((x: any) => !x.wide)" :key="i" :delay="i * 90">
            <div class="card-white svc-card">
              <div class="svc-stage"><WorkArt :type="s.doodle" class="svc-doodle" /></div>
              <h3 class="serif">{{ s.title }}</h3>
              <p class="svc-t">{{ s.text }}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- Principles — reuse homepage position module -->
    <section class="section" style="padding-top: 0">
      <div class="wrap">
        <Reveal><p class="kicker"><span class="ast">✳</span> {{ page.position.eyebrow }}</p></Reveal>
        <Reveal :delay="80">
          <h2 class="display pos-headline" v-html="rich(page.position.headline)" />
        </Reveal>
        <div class="pos-grid">
          <Reveal v-for="(p, i) in page.position.principles" :key="i" :delay="i * 100">
            <div class="pos-cell">
              <p class="pos-n"><span class="ast">✳</span> / {{ p.n }}</p>
              <h3 class="serif">{{ p.title }}</h3>
              <p class="pos-t">{{ p.text }}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="section cta-sec">
      <div class="wrap">
        <Reveal><p class="kicker"><span class="ast">✳</span> {{ page.cta.eyebrow }}</p></Reveal>
        <Reveal :delay="80"><h2 class="display">{{ page.cta.title }}</h2></Reveal>
        <Reveal :delay="140"><p class="cta-text">{{ page.cta.text }}</p></Reveal>
        <Reveal :delay="200">
          <NuxtLink :to="localePath('/contact')" class="btn-lime btn-big">
            {{ page.cta.button }}
            <svg class="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 L17 7 M8 7 h9 v9" /></svg>
          </NuxtLink>
        </Reveal>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { page, rich } = useSiteContent()
const localePath = useLocalePath()

useHead({ title: () => `${page.value.studio.heroTitle} — Werkero Studio` })
</script>

<style scoped>
/* hero — matches works/testimonials inner pages */
.studio-hero { position: relative; background: #0a0a0e; color: var(--paper); padding: 10rem 0 6rem; overflow: hidden; }
.studio-hero .hero-glow-r { width: 52vw; height: 52vw; left: -14vw; top: -10vw; opacity: 0.55; }
.studio-hero .hero-glow-b { width: 46vw; height: 46vw; right: -12vw; top: 6vw; opacity: 0.5; }
.studio-hero .hero-glow-p { width: 40vw; height: 40vw; left: 30vw; bottom: -16vw; opacity: 0.4; }
.studio-hero-inner { text-align: center; position: relative; z-index: 1; max-width: 760px; margin: 0 auto; padding-top: 2rem; }
.kicker.on-dark { color: rgba(250, 247, 240, 0.72); }
.kicker .ast.lime { color: var(--lime); }
.studio-title { font-size: clamp(3.4rem, 9vw, 7rem); line-height: 1.02; letter-spacing: -0.01em; color: #faf7f0; margin: 1.2rem 0 0; font-weight: 500; }
.studio-hero-intro { margin: 1.6rem auto 0; color: rgba(250, 247, 240, 0.68); font-size: 1.1rem; line-height: 1.7; max-width: 48ch; }

/* intro */
.intro-headline { max-width: 22ch; }
.intro-body { font-size: 1.08rem; line-height: 1.8; color: var(--muted); max-width: 62ch; margin: 2rem 0 0; }

/* services — same as homepage */
.sec-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem; margin-bottom: 2.6rem; }
.side-note { color: var(--muted); max-width: 32ch; margin: 0; }
.svc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.4rem; }
.svc-card { padding: 2.2rem; }
.svc-stage { height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 1.6rem; }
.svc-doodle { max-height: 110px; }
.svc-card h3 { font-size: 1.4rem; margin: 0 0 0.8rem; }
.svc-t { color: var(--muted); line-height: 1.7; margin: 0; }

/* position — same as homepage */
.pos-headline { max-width: 20ch; }
.pos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.4rem; margin-top: 3rem; }
.pos-cell { border-top: 2px solid var(--ink); padding-top: 1.4rem; }
.pos-n { font-size: 0.78rem; letter-spacing: 0.12em; font-weight: 600; color: var(--muted); margin: 0 0 1rem; }
.pos-cell h3 { font-size: 1.35rem; margin: 0 0 0.8rem; }
.pos-t { color: var(--muted); line-height: 1.7; margin: 0; font-size: 0.98rem; }

/* cta */
.cta-sec { text-align: center; }
.cta-sec .kicker { justify-content: center; display: flex; }
.cta-text { color: var(--muted); margin: 1.6rem auto 0; max-width: 52ch; line-height: 1.7; }
.btn-big { font-size: 1.15rem; padding: 1.35rem 3rem; margin-top: 2.8rem; display: inline-flex; }

@media (max-width: 860px) {
  .svc-grid { grid-template-columns: 1fr; }
  .pos-grid { grid-template-columns: 1fr; gap: 1.8rem; }
  .sec-head { flex-direction: column; align-items: flex-start; }
}
</style>
