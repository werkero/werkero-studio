<template>
  <footer class="footer" v-if="foot">
    <div class="wrap">
      <div class="cols cols-slim">
        <div class="col-brand">
          <div class="brand"><LogoMark :size="36" /><span class="brand-word">{{ siteName }}</span></div>
        </div>
        <div class="col col-right">
          <a :href="githubUrl" target="_blank" rel="noopener" class="github-link" aria-label="GitHub">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.27 5.66.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.67.8.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>
          </a>
        </div>
      </div>
      <div class="legal">
        <p>{{ siteCopyright || foot.copyright }}</p>
        <span class="remote-note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>
          喜欢远程办公和虚拟币
        </span>
      </div>
    </div>
    <div class="footer-crop" aria-hidden="true"><div class="giant-word"><span v-for="(c, i) in nameChars" :key="i">{{ c }}</span></div></div>
  </footer>
</template>

<script setup lang="ts">
const { footer: foot } = useSiteContent()
const { get: getSetting } = await useSiteSettings()
const siteName = computed(() => getSetting('site.name', 'WERKERO'))
const siteCopyright = computed(() => getSetting('site.copyright', ''))
// GitHub URL from brands.social_links (editable in admin Settings → Brand tab)
const { data: brand } = await useFetch('/api/brand', { key: 'brand-footer' })
const githubUrl = computed(() => (brand.value as any)?.social_links?.github || 'https://github.com/werkero')
// split brand name into chars for justified giant word
const nameChars = computed(() => siteName.value.split(''))
</script>

<style scoped>
.footer { background: #060609; color: var(--paper); padding: 5rem 0 0; overflow: hidden; }
.cols { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 2.4rem; padding-bottom: 3.4rem; }
.cols-slim { grid-template-columns: 1fr auto; align-items: center; }
.col-right { display: flex; justify-content: flex-end; }
.brand { display: inline-flex; align-items: center; gap: 0.7rem; margin-bottom: 1.2rem; }
.brand-word { font-weight: 800; letter-spacing: 0.14em; font-size: 1.35rem; }
.intro { color: rgba(250, 247, 240, 0.6); line-height: 1.65; margin: 0; max-width: 34ch; font-size: 0.95rem; }
.col { display: flex; flex-direction: column; gap: 0.7rem; }
.col-h { font-size: 0.75rem; letter-spacing: 0.16em; font-weight: 700; color: rgba(250, 247, 240, 0.5); margin: 0 0 0.6rem; }
.col a { color: rgba(250, 247, 240, 0.82); text-decoration: none; font-size: 0.95rem; }
.col a:hover { color: var(--lime); }
.col a.github-link { display: inline-flex; color: rgba(250, 247, 240, 0.82); }
.col a.github-link:hover { color: var(--lime); }
.col span { color: rgba(250, 247, 240, 0.82); font-size: 0.95rem; }
.col .muted { color: rgba(250, 247, 240, 0.5); }
.legal { display: flex; justify-content: space-between; align-items: center; gap: 2rem; padding: 1.6rem 0; }
.legal p { margin: 0; font-size: 0.82rem; color: rgba(250, 247, 240, 0.5); max-width: 80ch; line-height: 1.6; }
.legal a { color: rgba(250, 247, 240, 0.7); text-decoration: none; font-size: 0.8rem; letter-spacing: 0.12em; font-weight: 700; white-space: nowrap; }
.legal a:hover { color: var(--lime); }
.remote-note { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: rgba(250, 247, 240, 0.55); white-space: nowrap; }
.remote-note svg { flex-shrink: 0; }
.footer-crop { margin-top: 1rem; }
@media (max-width: 860px) { .cols { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .cols { grid-template-columns: 1fr; } .legal { flex-direction: column; align-items: flex-start; } }
</style>
