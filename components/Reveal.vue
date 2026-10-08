<template>
  <div ref="el" class="rise" :style="{ transitionDelay: `${delay}ms` }">
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ delay?: number }>(), { delay: 0 })
const el = ref<HTMLElement | null>(null)

onMounted(() => {
  const node = el.value
  if (!node) return
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          node.classList.add('in')
          io.disconnect()
        }
      })
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  io.observe(node)
  onUnmounted(() => io.disconnect())
})
</script>
