<template>
  <main v-if="page">
    <!-- HERO (dark) -->
    <section class="hero-dark glow-wrap">
      <div class="glow glow-red hero-glow-r" aria-hidden="true" />
      <div class="glow glow-blue hero-glow-b" aria-hidden="true" />
      <div class="glow glow-purple hero-glow-p" aria-hidden="true" />
      <div class="wrap hero-grid">
        <div>
          <p class="kicker on-dark-k rise in"><span class="ast lime">✳</span> {{ page.hero.eyebrow }}</p>
          <h1 class="hero-title">
            <span class="rise in" style="transition-delay: 120ms">{{ page.hero.line1 }}</span>
            <span class="rise in" style="transition-delay: 240ms">{{ page.hero.line2a }} <em class="acc">{{ page.hero.line2b }}</em></span>
          </h1>
        </div>
        <div class="hero-side rise in" style="transition-delay: 380ms">
          <p>{{ page.hero.description }}</p>
          <div class="hero-cta">
            <a :href="anchor('#work')" class="btn-lime">
              {{ page.hero.ctaPrimary }}
              <svg class="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 L17 7 M8 7 h9 v9" /></svg>
            </a>
            <a :href="anchor('#contact')" class="btn-outline">{{ page.hero.ctaSecondary }}</a>
          </div>
        </div>
      </div>
      <div class="wrap hero-strip rise in" style="transition-delay: 520ms">
        <NuxtLink
          v-for="(w, i) in showcaseWorks"
          :key="w.slug"
          :to="localePath(`/works/${w.slug}`)"
          class="strip-cell"
        >
          <span class="strip-n">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="strip-t">{{ w.title }}</span>
          <span class="strip-d">{{ w.tagline }}</span>
        </NuxtLink>
      </div>
    </section>

    <!-- TICKER -->
    <Ticker :label="page.ticker.label" :items="page.ticker.items" />

    <!-- POSITION -->
    <section class="section">
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

    <!-- SERVICES -->
    <section id="services" class="section" style="padding-top: 0">
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
              <button class="svc-details" type="button"><span class="svc-arrow">↓</span> {{ page.services.details }}</button>
            </div>
          </Reveal>
        </div>
        <Reveal :delay="120">
          <div class="card-white svc-wide" v-if="wideService">
            <WorkArt :type="wideService.doodle" class="svc-doodle" />
            <div>
              <h3 class="serif">{{ wideService.title }}</h3>
              <p class="svc-t">{{ wideService.text }}</p>
              <button class="svc-details" type="button"><span class="svc-arrow">↓</span> {{ page.services.details }}</button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- WORKS -->
    <section id="work" class="section" style="padding-top: 0">
      <div class="wrap">
        <Reveal><p class="kicker"><span class="ast">✳</span> {{ page.works.eyebrow }}</p></Reveal>
        <div class="sec-head">
          <Reveal :delay="80"><h2 class="display">{{ page.works.title }} <span class="ast-star">✳</span></h2></Reveal>
          <Reveal :delay="140"><p class="side-note">{{ page.works.sideNote }}</p></Reveal>
        </div>

        <!-- featured: Laurero dashboard card -->
        <Reveal :delay="120" v-if="featured">
          <NuxtLink :to="localePath(`/works/${featured.slug}`)" class="feat-card">
            <div class="feat-dash">
              <div class="feat-browser">
                <span class="fb-dot" /><span class="fb-dot" /><span class="fb-dot lime" />
                <span class="fb-bar" />
              </div>
              <div class="feat-grid">
                <div class="feat-panel">
                  <span class="fb-line w80" /><span class="fb-line w60" /><span class="fb-line w50 lime-bg" />
                </div>
                <div class="feat-panel">
                  <p class="feat-cap">ADMISSION PROBABILITY</p>
                  <span class="fb-meter"><i class="lime-bg" style="width: 82%" /></span>
                  <span class="fb-meter"><i class="blue-bg" style="width: 58%" /></span>
                  <span class="fb-meter"><i class="red-bg" style="width: 38%" /></span>
                  <p class="feat-rms">Reach · Match · Safety</p>
                </div>
              </div>
              <div class="feat-banner">
                <span>{{ page.works.banner }}</span>
                <svg width="46" height="26" viewBox="0 0 46 26" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 13 h40 M30 3 l12 10 -12 10" /></svg>
              </div>
              <div class="feat-badge spin-slow">
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <defs><path id="circ" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" /></defs>
                  <text><textPath href="#circ">{{ page.works.badge }}</textPath></text>
                </svg>
                <span class="feat-badge-star">✳</span>
              </div>
            </div>
            <div class="feat-body">
              <p class="tag">{{ featured.category }}</p>
              <h3 class="serif">{{ featured.title }}</h3>
              <p class="feat-tagline">{{ featured.tagline }}</p>
              <p class="feat-desc">{{ featured.description }}</p>
              <span class="link-arrow lime-arrow">{{ page.works.viewCase }}
                <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7 h22 M16 1 l7 6 -7 6" /></svg>
              </span>
            </div>
          </NuxtLink>
        </Reveal>

        <!-- rest: pastel doodle cards -->
        <div class="work-grid">
          <Reveal v-for="(w, i) in rest" :key="w.slug" :delay="(i % 3) * 90">
            <NuxtLink :to="localePath(`/works/${w.slug}`)" class="card-white work-card">
              <div class="work-art" :style="{ background: w.bg }">
                <WorkArt :type="w.doodle" class="work-doodle" />
              </div>
              <div class="work-body">
                <p class="tag">{{ w.category }}</p>
                <h3 class="serif">{{ w.title }}</h3>
                <p class="work-tagline">{{ w.tagline }}</p>
                <p class="work-desc">{{ w.description }}</p>
                <span class="link-arrow">{{ page.works.viewCase }}
                  <svg width="26" height="14" viewBox="0 0 26 14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7 h22 M16 1 l7 6 -7 6" /></svg>
                </span>
              </div>
            </NuxtLink>
          </Reveal>
        </div>
      </div>
    </section>

    <!-- PROCESS -->
    <section id="process" class="section" style="padding-top: 0">
      <div class="wrap">
        <Reveal><p class="kicker"><span class="ast">✳</span> {{ page.process.eyebrow }}</p></Reveal>
        <div class="sec-head">
          <Reveal :delay="80"><h2 class="display">{{ page.process.title }}</h2></Reveal>
          <Reveal :delay="140"><p class="side-note">{{ page.process.sideNote }}</p></Reveal>
        </div>
        <Reveal :delay="120">
          <div class="proc-list">
            <div v-for="(s, i) in page.process.steps" :key="i" class="proc-row" :class="{ 'acc-open': openStep === i }">
              <button class="proc-head" @click="openStep = openStep === i ? -1 : i" :aria-expanded="openStep === i">
                <span class="proc-n serif">{{ s.n }}</span>
                <span class="proc-t serif">{{ s.title }}</span>
                <span class="proc-tag">{{ s.tag }}</span>
                <span class="proc-btn">{{ openStep === i ? '×' : '+' }}</span>
              </button>
              <div class="acc-body">
                <div class="acc-inner">
                  <div class="proc-detail">
                    <p class="proc-text">{{ s.text }}</p>
                    <p class="proc-out"><span class="tag">{{ page.process.output }}</span><span>{{ s.output }}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    <!-- ABOUT -->
    <section id="about" class="section" style="padding-top: 0">
      <div class="wrap">
        <Reveal><p class="kicker"><span class="ast">✳</span> {{ page.about.eyebrow }}</p></Reveal>
        <Reveal :delay="80"><h2 class="display">{{ page.about.title }}</h2></Reveal>
        <div class="about-grid">
          <Reveal :delay="120">
            <div class="about-bio">
              <h3 class="serif about-name">{{ page.about.name }}</h3>
              <p class="about-role"><em>{{ page.about.role }}</em></p>
              <p class="about-p" v-html="rich(page.about.p1)" />
              <p class="about-p" v-html="rich(page.about.p2)" />
            </div>
          </Reveal>
          <div class="about-cards">
            <Reveal v-for="(c, i) in page.about.cards" :key="i" :delay="140 + i * 90">
              <div class="card-white about-card">
                <p class="tag">{{ c.label }}</p>
                <h3 class="serif" :class="{ 'stack-list': c.compact }">{{ c.title }}</h3>
                <p v-if="c.text" class="about-card-t">{{ c.text }}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section" style="padding-top: 0">
      <div class="wrap narrow">
        <Reveal><p class="kicker"><span class="ast">✳</span> {{ page.faq.eyebrow }}</p></Reveal>
        <Reveal :delay="80"><h2 class="display">{{ page.faq.title }}</h2></Reveal>
        <Reveal :delay="140">
          <div class="faq-list">
            <FaqItem v-for="(f, i) in page.faq.items" :key="i" :q="f.q" :a="f.a" :open-by-default="i === 0" />
          </div>
        </Reveal>
      </div>
    </section>

    <!-- CTA (dark) -->
    <section id="contact" class="cta-dark glow-wrap">
      <div class="glow glow-blue cta-glow-b" aria-hidden="true" />
      <div class="glow glow-purple cta-glow-p" aria-hidden="true" />
      <div class="wrap cta-inner">
        <Reveal>
          <Doodle type="star" :size="56" class="cta-doodle" />
          <h2 class="display cta-title">{{ page.cta.titleA }} <em class="acc">{{ page.cta.titleB }}</em></h2>
          <p class="cta-text">{{ page.cta.text }}</p>
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
const { locale, page, showcaseWorks } = useSiteContent()
const { rich } = useRichText()
const localePath = useLocalePath()
const anchor = (hash: string) => localePath({ path: '/', hash })
const openStep = ref(0)

const featured = computed(() => showcaseWorks.value[0] ?? null)
const rest = computed(() => showcaseWorks.value.slice(1))
const wideService = computed(() => (page.value as any)?.services?.items?.find((x: any) => x.wide) ?? null)

useHead({
  title: () => 'Werkero Studio',
})
</script>

<style scoped>
/* ---------- HERO (dark) ---------- */
.hero-dark { position: relative; background: #0a0a0e; color: var(--paper); padding: 10rem 0 0; overflow: hidden; }
.hero-glow-r { width: 52vw; height: 52vw; left: -14vw; top: -10vw; opacity: 0.55; }
.hero-glow-b { width: 46vw; height: 46vw; right: -12vw; top: 6vw; opacity: 0.5; }
.hero-glow-p { width: 40vw; height: 40vw; left: 30vw; bottom: -16vw; opacity: 0.4; }
.hero-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 3rem; align-items: end; position: relative; z-index: 1; }
.kicker.on-dark-k { color: rgba(250, 247, 240, 0.72); }
.kicker .ast.lime { color: var(--lime); }
.hero-title { font-size: clamp(3.2rem, 8.4vw, 8rem); line-height: 1.02; letter-spacing: -0.01em; margin: 1.4rem 0 0; color: #faf7f0; font-weight: 500; }
.hero-title span { display: block; }
.hero-side p { color: rgba(250, 247, 240, 0.72); line-height: 1.65; margin: 0 0 1.8rem; max-width: 38ch; }
.hero-cta { display: flex; gap: 1rem; flex-wrap: wrap; }
.hero-strip {
  position: relative; z-index: 1;
  display: grid; grid-template-columns: repeat(6, 1fr);
  margin-top: 5rem; border-top: 1px solid var(--line-dark);
}
.strip-cell { display: block; text-decoration: none; padding: 1.4rem 1.2rem 2rem; border-left: 1px solid var(--line-dark); transition: background 0.3s; }
.strip-cell:first-child { border-left: none; }
.strip-cell:hover { background: rgba(250, 247, 240, 0.05); }
.strip-n { display: block; font-size: 0.72rem; letter-spacing: 0.14em; color: var(--lime); font-weight: 700; margin-bottom: 0.6rem; }
.strip-t { display: block; font-weight: 700; color: var(--paper); font-size: 0.95rem; margin-bottom: 0.4rem; }
.strip-d { display: block; font-size: 0.8rem; line-height: 1.5; color: rgba(250, 247, 240, 0.55); }

/* ---------- POSITION ---------- */
.pos-headline { max-width: 20ch; }
.pos-headline :deep(.hl) { font-style: italic; background: linear-gradient(transparent 6%, var(--lime) 6%, var(--lime) 94%, transparent 94%); padding: 0 0.1em; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.pos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.4rem; margin-top: 3.4rem; }
.pos-cell { border-top: 2px solid var(--ink); padding-top: 1.4rem; }
.pos-n { font-size: 0.78rem; letter-spacing: 0.12em; font-weight: 600; color: var(--muted); margin: 0 0 1rem; }
.pos-n .ast { font-size: 1em; }
.pos-cell h3 { font-size: 1.5rem; margin: 0 0 0.8rem; font-weight: 600; }
.pos-t { color: var(--muted); line-height: 1.65; margin: 0; font-size: 0.98rem; }

/* ---------- SERVICES ---------- */
.inline-doodle { display: inline-block; vertical-align: -8px; margin-left: 0.5rem; }
.svc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4rem; margin-top: 3rem; align-items: stretch; }
.svc-grid > div { display: flex; flex-direction: column; }
.svc-card { padding: 2.2rem; display: flex; flex-direction: column; flex: 1; }
/* fixed doodle stage: identical box for every card */
.svc-stage { height: 96px; display: flex; align-items: center; margin-bottom: 1.6rem; }
.svc-doodle { width: 120px; height: 90px; flex: none; }
.svc-card h3, .svc-wide h3 { font-size: 1.6rem; margin: 0 0 0.8rem; font-weight: 600; }
.svc-t { color: var(--muted); line-height: 1.65; margin: 0 0 1.8rem; flex: 1; }
.svc-details { display: inline-flex; align-items: center; gap: 0.8rem; background: none; border: none; cursor: pointer; font: inherit; font-weight: 600; color: var(--ink); padding: 0; align-self: flex-start; }
.svc-arrow { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border: 1.5px solid var(--ink); border-radius: 50%; font-size: 1.1rem; transition: background 0.3s, color 0.3s; }
.svc-details:hover .svc-arrow { background: var(--lime); border-color: var(--lime); }
.svc-wide { margin-top: 1.4rem; padding: 2.2rem; display: grid; grid-template-columns: 200px 1fr; gap: 2.4rem; align-items: center; }
.svc-wide .svc-doodle { margin-bottom: 0; width: 190px; }
.ast-star { color: var(--ink); font-size: 0.7em; vertical-align: 0.35em; }

/* ---------- WORKS ---------- */
.feat-card { display: block; text-decoration: none; color: var(--paper); background: #0c0c11; border-radius: 30px; overflow: hidden; margin-top: 3rem; }
.feat-dash { position: relative; padding: 2.6rem 2.6rem 0; }
.feat-browser { display: flex; align-items: center; gap: 0.6rem; background: #15151c; border-radius: 16px 16px 0 0; padding: 1rem 1.4rem; }
.fb-dot { width: 12px; height: 12px; border-radius: 50%; background: #3a3a46; }
.fb-dot.lime { background: var(--lime); }
.fb-bar { flex: 1; max-width: 320px; height: 14px; border-radius: 8px; background: #23232c; margin-left: 1rem; }
.feat-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 1.2rem; background: #101016; padding: 1.6rem; border-radius: 0 0 16px 16px; }
.feat-panel { background: #17171e; border-radius: 14px; padding: 1.4rem; }
.fb-line { display: block; height: 16px; border-radius: 9px; background: #2b2b36; margin-bottom: 1rem; }
.fb-line.w80 { width: 80%; } .fb-line.w60 { width: 60%; } .fb-line.w50 { width: 50%; }
.lime-bg { background: var(--lime) !important; }
.blue-bg { background: #7c8cf8 !important; }
.red-bg { background: #f07878 !important; }
.feat-cap { font-size: 0.8rem; letter-spacing: 0.18em; color: rgba(250,247,240,0.75); margin: 0 0 1.1rem; font-weight: 600; }
.fb-meter { display: block; height: 16px; border-radius: 9px; background: #2b2b36; margin-bottom: 1rem; overflow: hidden; }
.fb-meter i { display: block; height: 100%; border-radius: 9px; }
.feat-rms { font-family: var(--font-serif); font-size: 1.5rem; color: var(--paper); margin: 1.2rem 0 0; }
.feat-banner { display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: var(--lime); color: var(--ink); border-radius: 16px; padding: 1.5rem 2rem; margin-top: 1.2rem; font-family: var(--font-serif); font-size: 1.6rem; }
.feat-badge { position: absolute; top: 1.4rem; right: 3.4rem; width: 104px; height: 104px; }
.feat-badge svg { width: 100%; height: 100%; }
.feat-badge text { font-size: 11.5px; letter-spacing: 2.5px; fill: var(--ink); font-weight: 700; font-family: var(--font-sans); }
.feat-badge svg { background: var(--lime); border-radius: 50%; }
.feat-badge-star { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--ink); }
.feat-body { padding: 2.6rem; }
.feat-body h3 { font-size: 2.6rem; margin: 0.9rem 0 0.4rem; font-weight: 600; color: var(--paper); }
.feat-tagline { color: rgba(250,247,240,0.6); margin: 0 0 1.4rem; }
.feat-desc { color: rgba(250,247,240,0.78); line-height: 1.7; max-width: 62ch; margin: 0 0 1.8rem; }
.lime-arrow { color: var(--lime); }
.work-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.6rem; margin-top: 1.6rem; }
.work-grid > div { display: flex; flex-direction: column; }
.work-card { display: flex; flex-direction: column; flex: 1; text-decoration: none; overflow: hidden; transition: transform 0.45s var(--ease), box-shadow 0.45s var(--ease); }
.work-card:hover { transform: translateY(-6px); box-shadow: 0 22px 60px rgba(11, 11, 14, 0.14); }
.work-art { padding: 2.4rem; display: flex; align-items: center; justify-content: center; min-height: 230px; }
.work-doodle { width: 100%; max-width: 240px; height: auto; }
.work-body { padding: 1.8rem 1.8rem 2rem; display: flex; flex-direction: column; flex: 1; }
.work-body h3 { font-size: 1.7rem; margin: 0.8rem 0 0.3rem; font-weight: 600; }
.work-tagline { color: var(--muted); font-size: 0.95rem; margin: 0 0 1rem; }
.work-desc { color: #4a463d; line-height: 1.65; font-size: 0.95rem; margin: 0 0 1.6rem; flex: 1; }

/* ---------- PROCESS ---------- */
.proc-list { margin-top: 3rem; border-top: 1px solid var(--line); }
.proc-row { border-bottom: 1px solid var(--line); }
.proc-head { display: grid; grid-template-columns: 90px 1fr auto 56px; align-items: center; gap: 1.6rem; width: 100%; background: none; border: none; cursor: pointer; padding: 1.9rem 0; text-align: left; color: var(--ink); font: inherit; }
.proc-n { font-size: 1.7rem; font-style: italic; color: var(--muted); }
.proc-t { font-size: 2rem; font-weight: 600; }
.proc-tag { font-size: 0.75rem; letter-spacing: 0.14em; font-weight: 600; color: var(--muted); text-transform: uppercase; }
.proc-btn { width: 52px; height: 52px; border: 1.5px solid rgba(11,11,14,0.3); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 300; transition: background 0.3s, border-color 0.3s; }
.proc-row.acc-open .proc-btn { background: var(--lime); border-color: var(--lime); }
.proc-detail { display: grid; grid-template-columns: 90px 1fr; gap: 1.6rem; padding: 0 0 2.2rem; }
.proc-detail::before { content: ''; }
.proc-text { color: #4a463d; line-height: 1.7; max-width: 62ch; margin: 0 0 1.2rem; grid-column: 2; }
.proc-out { grid-column: 2; display: flex; gap: 1.2rem; align-items: baseline; margin: 0; color: var(--muted); font-size: 0.95rem; }

/* ---------- ABOUT ---------- */
.about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 3rem; align-items: start; }
.about-name { font-size: 1.4rem; margin: 0 0 0.3rem; font-weight: 600; }
.about-role { color: var(--muted); margin: 0 0 2rem; }
.about-p { font-size: 1.12rem; line-height: 1.75; color: #3d3a33; max-width: 52ch; }
.about-p strong { color: var(--ink); }
.about-cards { display: grid; gap: 1.2rem; }
.about-card { padding: 1.8rem 2rem; }
.about-card h3 { font-size: 1.5rem; margin: 0.7rem 0 0.4rem; font-weight: 600; }
.about-card h3.stack-list { font-size: 1.02rem; line-height: 1.7; font-weight: 500; font-family: var(--font-sans); }
.about-card-t { color: var(--muted); margin: 0; font-size: 0.95rem; }

/* ---------- FAQ ---------- */
.narrow { max-width: 860px; }
.faq-list { margin-top: 2.4rem; border-top: 1px solid var(--line); }

/* ---------- CTA (dark) ---------- */
.cta-dark { position: relative; background: #07070b; color: var(--paper); overflow: hidden; text-align: center; }
.cta-glow-b { width: 36vw; height: 36vw; left: -12vw; top: -8vw; opacity: 0.5; }
.cta-glow-p { width: 30vw; height: 30vw; right: -10vw; bottom: -10vw; opacity: 0.4; }
.cta-inner { position: relative; z-index: 1; padding: 8rem 0; }
.cta-doodle { color: var(--lime); margin: 0 auto 2rem; }
.cta-title { color: #faf7f0; }
.cta-text { color: rgba(250, 247, 240, 0.6); margin: 1.6rem 0 0; }
.btn-big { font-size: 1.15rem; padding: 1.35rem 3rem; margin-top: 2.8rem; }

/* ---------- responsive ---------- */
@media (max-width: 1000px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-strip { grid-template-columns: repeat(3, 1fr); }
  .strip-cell:nth-child(4) { border-left: none; }
  .strip-cell { border-top: 1px solid var(--line-dark); }
  .strip-cell:nth-child(-n+3) { border-top: none; }
  .pos-grid { grid-template-columns: 1fr; }
  .svc-grid { grid-template-columns: 1fr; }
  .svc-wide { grid-template-columns: 1fr; }
  .work-grid { grid-template-columns: 1fr 1fr; }
  .about-grid { grid-template-columns: 1fr; }
  .proc-head { grid-template-columns: 56px 1fr 52px; }
  .proc-tag { display: none; }
  .proc-detail { grid-template-columns: 1fr; }
  .proc-text, .proc-out { grid-column: 1; }
  .feat-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .work-grid { grid-template-columns: 1fr; }
  .hero-strip { grid-template-columns: 1fr 1fr; }
}
</style>
