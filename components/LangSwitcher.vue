<template>
  <div class="lang-wrap" ref="wrap">
    <button class="lang-btn" @click="open = !open" :aria-expanded="open" aria-label="Language">
      <span :class="['fi', flagOf(locale)]" />
      <span class="lang-name">{{ nameOf(locale) }}</span>
      <span class="caret">▾</span>
    </button>
    <div v-if="open" class="lang-menu">
      <button
        v-for="l in locales"
        :key="l.code"
        :class="{ active: l.code === locale }"
        @click="choose(l.code)"
      >
        <span :class="['fi', flagOf(l.code)]" />
        <span>{{ l.name }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const open = ref(false)
const wrap = ref<HTMLElement | null>(null)

const FLAGS: Record<string, string> = {
  en: 'fi-gb',
  'zh-cn': 'fi-cn',
  'zh-tw': 'fi-hk',
  fr: 'fi-fr',
  de: 'fi-de',
  ru: 'fi-ru',
  ja: 'fi-jp',
}
const flagOf = (code: string) => FLAGS[code] ?? 'fi-gb'
const nameOf = (code: string) => {
  const found = (locales.value as { code: string; name: string }[]).find((l) => l.code === code)
  return found?.name ?? code
}

const choose = (code: string) => {
  try { localStorage.setItem('werkero-locale', code) } catch { /* ignore */ }
  open.value = false
  const target = switchLocalePath(code)
  if (target) navigateTo(target)
}

onMounted(() => {
  const onDoc = (e: MouseEvent) => {
    if (wrap.value && !wrap.value.contains(e.target as Node)) open.value = false
  }
  document.addEventListener('click', onDoc)
  onUnmounted(() => document.removeEventListener('click', onDoc))
})
</script>

<style scoped>
.lang-wrap { position: relative; }
.lang-btn {
  display: inline-flex; align-items: center; gap: 0.55rem;
  background: transparent; border: none; cursor: pointer;
  color: inherit; font-family: inherit; font-size: 0.85rem; font-weight: 600;
  letter-spacing: 0.06em; padding: 0.4rem 0.2rem;
}
.lang-btn .fi { font-size: 1.05rem; }
.caret { font-size: 0.7rem; opacity: 0.7; }
.lang-name { max-width: 92px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 720px) { .lang-name { display: none; } }
</style>
