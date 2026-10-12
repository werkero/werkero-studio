<template>
  <main class="studio-page">
    <!-- 1. Hero — dark full-screen, centered serif + script -->
    <section class="hero-full">
      <div class="hero-bg" aria-hidden="true" />
      <div class="hero-content">
        <Reveal>
          <h1 class="hero-title">
            <span class="script hero-line2">{{ heroScript }}</span>
          </h1>
        </Reveal>
        <Reveal :delay="140">
          <p class="hero-intro">{{ heroIntro }}</p>
        </Reveal>
      </div>
      <div class="scroll-line" aria-hidden="true">
        <svg class="clover" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><ellipse cx="12" cy="8" rx="3.2" ry="4"/><ellipse cx="12" cy="15" rx="3.2" ry="4"/><ellipse cx="8" cy="11.5" rx="4" ry="3.2"/><ellipse cx="16" cy="11.5" rx="4" ry="3.2"/><path d="M12 18.5c0 2-.8 3.2-2.2 4.5" stroke-linecap="round"/></svg>
        <span />
      </div>
    </section>

    <!-- 2. About — illustration left, text right -->
    <section class="section about-sec">
      <div class="wrap about-grid">
        <Reveal class="about-ill">
          <svg viewBox="0 0 320 320" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <rect x="70" y="60" width="180" height="180" rx="8" transform="rotate(-6 160 160)"/>
            <circle cx="130" cy="130" r="18" fill="currentColor" stroke="none"/>
            <circle cx="190" cy="130" r="18" fill="currentColor" stroke="none"/>
            <circle cx="130" cy="190" r="18" fill="currentColor" stroke="none"/>
            <circle cx="190" cy="190" r="18" fill="currentColor" stroke="none"/>
            <path d="M40 280 Q 160 270 280 280" stroke-linecap="round"/>
            <path d="M60 40 q 10 -14 22 -8" stroke-linecap="round"/>
            <path d="M250 50 q 12 -10 20 2" stroke-linecap="round"/>
          </svg>
        </Reveal>
        <div class="about-text">
          <Reveal><h2 class="serif about-title">{{ t.aboutLabel }}</h2></Reveal>
          <Reveal :delay="100"><p class="about-p" v-html="aboutText"></p></Reveal>
        </div>
      </div>
    </section>

    <!-- 3. Services — three columns with illustrations -->
    <section class="section svc-sec">
      <div class="wrap">
        <Reveal><h2 class="serif svc-title">{{ servicesTitle }}</h2></Reveal>
        <div class="svc-cols">
          <Reveal v-for="(s, i) in services" :key="i" :delay="i * 100">
            <NuxtLink :to="localePath('/#services')" class="svc-item">
              <span class="svc-ill" v-html="svcArt[i % svcArt.length]" />
              <span class="serif svc-name">{{ s.title }}</span>
              <span class="svc-go" aria-hidden="true">→</span>
            </NuxtLink>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- 4. CTA -->
    <section class="section cta-sec">
      <div class="wrap">
        <Reveal><h2 class="serif cta-title">{{ ctaTitle }}</h2></Reveal>
        <Reveal :delay="100"><p class="cta-text">{{ ctaText }}</p></Reveal>
        <Reveal :delay="160">
          <NuxtLink :to="localePath('/contact')" class="btn-lime btn-big">
            {{ ctaButton }}
            <svg class="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 L17 7 M8 7 h9 v9" /></svg>
          </NuxtLink>
        </Reveal>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { page } = useSiteContent()
const localePath = useLocalePath()
const { locale } = useI18n()

// Studio copy from site_settings, fallback to L1 JSON
const { settings } = await useSiteSettings()
const pickSetting = (key: string, fallback = '') => {
  const v = (settings.value as any)?.[key]
  if (v == null) return fallback
  if (typeof v === 'string') return v
  return v[locale.value] ?? v.en ?? fallback
}
const t = computed(() => page.value.studio ?? {})

// Brand name/tagline from brands table (editable in admin Settings → Brand tab)
const { data: brand } = await useFetch('/api/brand', { key: 'brand-studio', query: { locale } })
const heroScript = computed(() => (brand.value as any)?.name || t.value.heroScript || 'Werkero')
const heroIntro = computed(() => (brand.value as any)?.tagline || t.value.heroIntro || '')
const aboutText = computed(() => {
  const v = pickSetting('studio.about_p1', t.value.aboutP1 || '')
  return String(v).replace(/\n/g, '<br><br>')
})
const servicesTitle = computed(() => page.value.services?.title ?? '')
const services = computed(() => (page.value.services?.items ?? []).slice(0, 3))
const ctaTitle = computed(() => page.value.cta?.title ?? '')
const ctaText = computed(() => page.value.cta?.text ?? '')
const ctaButton = computed(() => page.value.cta?.button ?? '')

// abstract line illustrations for services (original)
const svcArt = [
  `<svg viewBox="0 0 200 160" fill="none" stroke="currentColor" stroke-width="2"><path d="M40 30 h60 v30 h-30 v30 h40 v40 h-70 z"/><circle cx="150" cy="100" r="16" fill="currentColor" stroke="none"/><path d="M20 140 h160" stroke-linecap="round"/></svg>`,
  `<svg viewBox="0 0 200 160" fill="none" stroke="currentColor" stroke-width="2"><rect x="55" y="35" width="90" height="70" rx="4"/><path d="M55 50 h90 M70 70 h40 M70 85 h60"/><path d="M100 105 c -20 10 -30 25 -25 40 M100 105 c 20 10 30 25 25 40" stroke-linecap="round"/></svg>`,
  `<svg viewBox="0 0 200 160" fill="none" stroke="currentColor" stroke-width="2"><circle cx="100" cy="80" r="40"/><path d="M100 40 v80 M60 80 h80 M72 52 l56 56 M128 52 l-56 56"/><text x="100" y="145" text-anchor="middle" font-size="20" fill="currentColor" stroke="none">01</text></svg>`,
]

useHead({ title: () => `Studio — Werkero Studio` })
</script>

<style scoped>
.studio-page { background: #fff; }

/* ---------- 1. hero ---------- */
.hero-full {
  position: relative;
  min-height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0e;
  color: #faf7f0;
  overflow: hidden;
  text-align: center;
}
.hero-bg {
  position: absolute; inset: 0;
  background:
    radial-gradient(60vw 60vw at 20% 10%, rgba(120, 40, 40, 0.35), transparent 60%),
    radial-gradient(50vw 50vw at 85% 80%, rgba(40, 60, 120, 0.3), transparent 60%),
    radial-gradient(40vw 40vw at 60% 40%, rgba(80, 50, 120, 0.22), transparent 60%),
    #0a0a0e;
}
.hero-content { position: relative; z-index: 1; max-width: 860px; padding: 6rem 2rem 4rem; }
.hero-title { margin: 0; line-height: 1.05; }
.hero-line1 { display: block; font-size: clamp(3rem, 8vw, 6.5rem); font-weight: 500; letter-spacing: -0.01em; }
.hero-line2 {
  display: block; font-size: clamp(3.4rem, 9vw, 7.5rem); margin-top: 0.2rem;
  font-family: 'Segoe Script', 'Brush Script MT', cursive; font-style: italic;
  color: #faf7f0; transform: rotate(-2deg);
}
.hero-intro {
  margin: 2.2rem auto 0; max-width: 52ch;
  color: rgba(250, 247, 240, 0.72); font-size: 1.12rem; line-height: 1.75;
}
.scroll-line { position: absolute; bottom: 2rem; left: 50%; transform: translateX(-50%); z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 0.7rem; }
.scroll-line .clover { color: var(--lime); }
.scroll-line span { display: block; width: 1px; height: 48px; background: rgba(250, 247, 240, 0.35); }

/* ---------- 2. about ---------- */
.about-sec { padding: clamp(4rem, 8vw, 7rem) 0; }
.about-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: clamp(2rem, 6vw, 5rem); align-items: center; }
.about-ill { color: #1c1a17; display: flex; justify-content: center; }
.about-ill svg { width: min(320px, 80%); height: auto; }
.about-title { font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 500; margin: 0 0 1.8rem; letter-spacing: -0.01em; }
.about-p { font-size: 1.06rem; line-height: 1.85; color: #2c2a25; margin: 0 0 1.4rem; max-width: 58ch; text-align: justify; }

/* ---------- 3. services ---------- */
.svc-sec { padding-top: 0; padding-bottom: clamp(4rem, 8vw, 7rem); }
.svc-title { font-size: clamp(2.4rem, 5vw, 3.8rem); font-weight: 500; margin: 0 0 3.5rem; letter-spacing: -0.01em; }
.svc-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
.svc-item {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  text-decoration: none; color: inherit; padding: 1rem;
  transition: transform 0.2s ease;
}
.svc-item:hover { transform: translateY(-6px); }
.svc-ill { color: #1c1a17; display: block; margin-bottom: 1.8rem; }
.svc-ill svg { width: 180px; height: auto; }
.svc-name { font-size: 1.5rem; font-weight: 500; margin-bottom: 1rem; }
.svc-go { font-size: 1.3rem; color: #9a958a; transition: transform 0.2s ease, color 0.2s ease; }
.svc-item:hover .svc-go { transform: translateX(6px); color: #1c1a17; }

/* ---------- 4. cta ---------- */
.cta-sec { background: #0a0a0e; color: #faf7f0; text-align: center; padding: clamp(5rem, 10vw, 8rem) 0; }
.cta-title { font-size: clamp(2.4rem, 5.5vw, 4rem); font-weight: 500; margin: 0 0 1.4rem; letter-spacing: -0.01em; }
.cta-text { color: rgba(250, 247, 240, 0.62); font-size: 1.05rem; line-height: 1.7; max-width: 52ch; margin: 0 auto 2.6rem; }
.btn-big { font-size: 1.15rem; padding: 1.35rem 3rem; display: inline-flex; }

@media (max-width: 860px) {
  .about-grid { grid-template-columns: 1fr; }
  .about-ill { order: -1; }
  .svc-cols { grid-template-columns: 1fr; gap: 3rem; }
}
</style>
