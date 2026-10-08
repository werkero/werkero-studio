<template>
  <header class="nav" :class="{ scrolled }">
    <div class="nav-inner">
      <nav class="nav-links">
        <a :href="anchor('#services')">{{ nav.services }}</a>
        <a :href="anchor('#work')">{{ nav.work }}</a>
        <a :href="anchor('#faq')">{{ nav.faq }}</a>
      </nav>
      <NuxtLink :to="localePath('/')" class="brand" aria-label="Werkero Studio home">
        <LogoMark :size="30" />
        <span class="brand-word">WERKERO</span>
      </NuxtLink>
      <div class="nav-right">
        <a :href="anchor('#contact')" class="contact-link">{{ nav.contact }}</a>
        <LangSwitcher />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const localePath = useLocalePath()
const anchor = (hash: string) => localePath({ path: '/', hash })

const { data: page } = await useAsyncData(`site-${locale.value}`, () =>
  queryCollection('site').path(`/${locale.value}`).first()
)
const nav = computed(() => (page.value as any)?.nav ?? { services: '', work: '', faq: '', contact: '' })
const scrolled = ref(false)

onMounted(() => {
  const onScroll = () => { scrolled.value = window.scrollY > 60 }
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>

<style scoped>
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
  color: var(--paper);
}
.nav-inner {
  display: flex; align-items: center; justify-content: space-between;
  width: min(1200px, 94vw); margin: 0 auto;
  padding: 1.1rem 0.4rem;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.nav-links, .nav-right { display: flex; align-items: center; gap: 1.6rem; }
.nav a { text-decoration: none; font-size: 0.85rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }
.nav-links a { position: relative; }
.nav-links a::after {
  content: ''; position: absolute; left: 0; bottom: -4px; height: 1px; width: 0;
  background: currentColor; transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.nav-links a:hover::after { width: 100%; }
.brand { display: inline-flex; align-items: center; gap: 0.6rem; }
.brand-word { font-weight: 800; letter-spacing: 0.12em; font-size: 0.95rem; }
.contact-link {
  border: 1px solid currentColor; border-radius: 64px; padding: 0.55rem 1.2rem;
  transition: background 0.3s, color 0.3s;
}
.contact-link:hover { background: var(--lime); border-color: var(--lime); color: var(--ink); }

/* scrolled: white floating pill */
.nav.scrolled { color: var(--ink); }
.nav.scrolled .nav-inner {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border-radius: 64px;
  margin-top: 0.8rem; padding: 0.7rem 1.6rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  width: min(860px, 94vw);
}
@media (max-width: 720px) {
  .nav-links { display: none; }
  .brand-word { display: none; }
}
</style>
