<template>
  <div id="cursor-dot" ref="dot" />
</template>

<script setup lang="ts">
const dot = ref<HTMLElement | null>(null)

onMounted(() => {
  if (window.matchMedia('(hover: none)').matches) return
  let x = -100, y = -100, tx = -100, ty = -100
  let raf = 0

  const onMove = (e: MouseEvent) => {
    tx = e.clientX
    ty = e.clientY
    const t = e.target as HTMLElement | null
    const interactive = t?.closest?.('a, button, [data-hover]')
    dot.value?.classList.toggle('big', !!interactive)
  }
  const loop = () => {
    x += (tx - x) * 0.16
    y += (ty - y) * 0.16
    if (dot.value) dot.value.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    raf = requestAnimationFrame(loop)
  }
  window.addEventListener('mousemove', onMove, { passive: true })
  raf = requestAnimationFrame(loop)
  onUnmounted(() => {
    window.removeEventListener('mousemove', onMove)
    cancelAnimationFrame(raf)
  })
})
</script>
