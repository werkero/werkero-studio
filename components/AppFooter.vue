<template>
  <footer class="footer" v-if="foot">
    <div class="wrap">
      <div class="cols">
        <div class="col-brand">
          <NuxtLink :to="localePath('/')" class="brand" aria-label="Werkero Studio home">
            <LogoMark :size="34" />
            <span class="brand-word">WERKERO</span>
          </NuxtLink>
          <p class="tagline">{{ foot.tagline }}</p>
        </div>
        <div class="col">
          <h4>{{ foot.nav_title }}</h4>
          <a :href="anchor('#services')">{{ nav.services }}</a>
          <a :href="anchor('#work')">{{ nav.work }}</a>
          <a :href="anchor('#faq')">{{ nav.faq }}</a>
        </div>
        <div class="col">
          <h4>{{ foot.contact_title }}</h4>
          <a :href="`mailto:${foot.email}`">{{ foot.email }}</a>
          <a :href="foot.github" target="_blank" rel="noopener">GitHub</a>
        </div>
        <div class="col">
          <h4>Language</h4>
          <LangSwitcher />
        </div>
      </div>
    </div>
    <div class="footer-crop" aria-hidden="true">
      <div class="giant-word">WERKERO</div>
    </div>
    <div class="wrap bottom">
      <span>{{ foot.rights }}</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const anchor = (hash: string) => localePath({ path: '/', hash })

const { data: page } = await useAsyncData(`site-${locale.value}`, () =>
  queryCollection('site').path(`/${locale.value}`).first()
)
const foot = computed(() => (page.value as any)?.footer ?? null)
const nav = computed(() => (page.value as any)?.nav ?? {})
</script>

<style scoped>
.footer { background: #050508; border-top: 1px solid var(--line); padding: 4.5rem 0 0; margin-top: 2rem; }
.cols { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 2.5rem; padding-bottom: 4rem; }
.brand { display: inline-flex; align-items: center; gap: 0.7rem; text-decoration: none; }
.brand-word { font-weight: 800; letter-spacing: 0.12em; }
.tagline { color: var(--muted); line-height: 1.6; margin: 1.2rem 0 0; max-width: 30ch; }
.col h4 { font-family: var(--font-sans); font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin: 0 0 1.1rem; }
.col a { display: block; color: var(--paper); text-decoration: none; margin-bottom: 0.7rem; font-size: 0.95rem; }
.col a:hover { color: var(--lime); }
.footer-crop { margin-top: 1rem; }
.bottom {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.4rem 0 1.8rem; color: var(--muted); font-size: 0.85rem;
  border-top: 1px solid var(--line);
  width: min(1200px, 92vw); margin: 0 auto;
}
@media (max-width: 860px) { .cols { grid-template-columns: 1fr 1fr; } }
</style>
