<template>
  <footer class="footer" v-if="foot">
    <div class="wrap">
      <div class="cols">
        <div class="col-brand">
          <div class="brand"><LogoMark :size="28" /><span class="brand-word">WERKERO</span></div>
          <p class="intro">{{ foot.intro }}</p>
        </div>
        <div class="col">
          <p class="col-h">{{ foot.explore }}</p>
          <a :href="anchor('#services')">{{ nav.services }}</a>
          <a :href="anchor('#work')">{{ nav.work }}</a>
          <a :href="anchor('#process')">{{ nav.workflow }}</a>
          <a :href="anchor('#about')">{{ nav.about }}</a>
        </div>
        <div class="col">
          <p class="col-h">{{ foot.services }}</p>
          <span v-for="(s, i) in foot.serviceList" :key="i">{{ s }}</span>
        </div>
        <div class="col">
          <p class="col-h">{{ foot.connect }}</p>
          <a href="https://github.com/adlerdler" target="_blank" rel="noopener">{{ foot.github }} ↗</a>
          <a :href="anchor('#contact')">{{ foot.contact }}</a>
          <span class="muted">{{ foot.location }}</span>
        </div>
      </div>
      <div class="legal">
        <p>{{ foot.copyright }}</p>
        <a href="#top" @click.prevent="toTop">{{ foot.backToTop }} ↑</a>
      </div>
    </div>
    <div class="footer-crop" aria-hidden="true"><div class="giant-word">WERKERO</div></div>
  </footer>
</template>

<script setup lang="ts">
const { nav, footer: foot } = useSiteContent()
const localePath = useLocalePath()
const anchor = (hash: string) => localePath({ path: '/', hash })
const toTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
</script>

<style scoped>
.footer { background: #060609; color: var(--paper); padding: 5rem 0 0; overflow: hidden; }
.cols { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 2.4rem; padding-bottom: 3.4rem; }
.brand { display: inline-flex; align-items: center; gap: 0.6rem; margin-bottom: 1.2rem; }
.brand-word { font-weight: 800; letter-spacing: 0.14em; font-size: 0.98rem; }
.intro { color: rgba(250, 247, 240, 0.6); line-height: 1.65; margin: 0; max-width: 34ch; font-size: 0.95rem; }
.col { display: flex; flex-direction: column; gap: 0.7rem; }
.col-h { font-size: 0.75rem; letter-spacing: 0.16em; font-weight: 700; color: rgba(250, 247, 240, 0.5); margin: 0 0 0.6rem; }
.col a { color: rgba(250, 247, 240, 0.82); text-decoration: none; font-size: 0.95rem; }
.col a:hover { color: var(--lime); }
.col span { color: rgba(250, 247, 240, 0.82); font-size: 0.95rem; }
.col .muted { color: rgba(250, 247, 240, 0.5); }
.legal { display: flex; justify-content: space-between; align-items: center; gap: 2rem; border-top: 1px solid var(--line-dark); padding: 1.6rem 0; }
.legal p { margin: 0; font-size: 0.82rem; color: rgba(250, 247, 240, 0.5); max-width: 80ch; line-height: 1.6; }
.legal a { color: rgba(250, 247, 240, 0.7); text-decoration: none; font-size: 0.8rem; letter-spacing: 0.12em; font-weight: 700; white-space: nowrap; }
.legal a:hover { color: var(--lime); }
.footer-crop { margin-top: 1rem; }
@media (max-width: 860px) { .cols { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .cols { grid-template-columns: 1fr; } .legal { flex-direction: column; align-items: flex-start; } }
</style>
