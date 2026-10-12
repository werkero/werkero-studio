<template>
  <header class="nav" :class="{ scrolled }">
    <div class="nav-inner">
      <nav class="nav-links">
        <NuxtLink :to="localePath('/studio')">{{ nav.studio }}</NuxtLink>
        <NuxtLink :to="localePath('/works')">{{ nav.work }}</NuxtLink>
        <NuxtLink :to="localePath('/testimonials')">{{ nav.testimonials }}</NuxtLink>
      </nav>
      <NuxtLink :to="localePath('/')" class="brand" aria-label="Werkero Studio home">
        <LogoMark :size="30" />
        <span class="brand-word">{{ siteName }}</span>
      </NuxtLink>
      <div class="nav-right">
        <NuxtLink :to="localePath('/contact')" class="contact-pill">
          {{ nav.contact }}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 L17 7 M8 7 h9 v9" /></svg>
        </NuxtLink>
        <LangSwitcher />
        <button class="burger" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen" aria-label="Menu">
          <span /><span /><span />
        </button>
      </div>
    </div>
    <Transition name="mmenu">
      <nav v-if="menuOpen" class="mobile-menu">
        <NuxtLink :to="localePath('/studio')" @click="menuOpen = false">{{ nav.studio }}</NuxtLink>
        <NuxtLink :to="localePath('/works')" @click="menuOpen = false">{{ nav.work }}</NuxtLink>
        <NuxtLink :to="localePath('/testimonials')" @click="menuOpen = false">{{ nav.testimonials }}</NuxtLink>
        <NuxtLink :to="localePath('/contact')" @click="menuOpen = false" class="mm-contact">{{ nav.contact }}</NuxtLink>
      </nav>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const { nav } = useSiteContent()
const { get: getSetting } = await useSiteSettings()
const siteName = computed(() => getSetting('site.name', 'WERKERO'))
const localePath = useLocalePath()
const scrolled = ref(false)
const menuOpen = ref(false)

// close mobile menu on route change
const route = useRoute()
watch(() => route.fullPath, () => { menuOpen.value = false })

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
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  color: var(--paper);
}
.nav-inner {
  display: flex; align-items: center; justify-content: space-between;
  width: min(1240px, 94vw); margin: 0 auto;
  padding: 1.15rem 0.4rem;
  transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.nav-links, .nav-right { display: flex; align-items: center; gap: 1.7rem; }
.nav a { text-decoration: none; font-size: 0.86rem; font-weight: 600; letter-spacing: 0.04em; }
.nav-links a { position: relative; opacity: 0.92; }
.nav-links a::after {
  content: ''; position: absolute; left: 0; bottom: -4px; height: 1px; width: 0;
  background: currentColor; transition: width 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.nav-links a:hover::after { width: 100%; }
.brand { display: inline-flex; align-items: center; gap: 0.6rem; }
.brand-word { font-weight: 800; letter-spacing: 0.14em; font-size: 0.98rem; }
.contact-pill {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: var(--lime); color: var(--ink) !important;
  border-radius: 64px; padding: 0.62rem 1.35rem; font-weight: 700 !important;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.contact-pill:hover { transform: translateY(-2px); }

/* scrolled: white floating pill */
.nav.scrolled { color: var(--ink); }
.nav.scrolled .nav-inner {
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border-radius: 64px;
  margin-top: 0.8rem; padding: 0.65rem 1.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
  width: min(920px, 94vw);
}
@media (max-width: 860px) {
  .nav-links { display: none; }
  .burger { display: flex; }
  .contact-pill { display: none; }
}
@media (max-width: 560px) {
  .brand-word { display: none; }
}

/* burger */
.burger {
  display: none; flex-direction: column; justify-content: center; gap: 5px;
  width: 40px; height: 40px; background: none; border: none; cursor: pointer;
  padding: 8px; align-items: center;
}
.burger span {
  display: block; width: 22px; height: 2px; border-radius: 2px;
  background: currentColor; transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.burger.open span:nth-child(2) { opacity: 0; }
.burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* mobile menu */
.mobile-menu {
  display: none;
  flex-direction: column; gap: 0.2rem;
  width: min(920px, 94vw); margin: 0.4rem auto 0;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border-radius: 20px; padding: 0.8rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}
@media (max-width: 860px) {
  .mobile-menu { display: flex; }
}
.mobile-menu a {
  color: var(--ink); font-size: 1rem; font-weight: 600;
  padding: 0.85rem 1.2rem; border-radius: 12px; text-decoration: none;
}
.mobile-menu a:hover { background: rgba(0, 0, 0, 0.05); }
.mobile-menu a.mm-contact {
  background: var(--lime); color: var(--ink) !important;
  text-align: center; margin-top: 0.4rem; font-weight: 700;
}
.mmenu-enter-active, .mmenu-leave-active { transition: all 0.25s ease; }
.mmenu-enter-from, .mmenu-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
