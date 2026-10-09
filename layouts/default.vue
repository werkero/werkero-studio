<template>
  <div>
    <CustomCursor />
    <AppNav />
    <slot />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// Remember the visitor's language choice across visits.
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

onMounted(() => {
  try {
    const saved = localStorage.getItem('werkero-locale')
    if (saved && saved !== locale.value && !sessionStorage.getItem('werkero-locale-applied')) {
      sessionStorage.setItem('werkero-locale-applied', '1')
      const target = switchLocalePath(saved)
      if (target) navigateTo(target)
    }
  } catch { /* storage unavailable — stay on current locale */ }
})
</script>
