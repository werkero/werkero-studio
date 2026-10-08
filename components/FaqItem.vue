<template>
  <div class="faq" :class="{ 'acc-open': open }">
    <button class="faq-q" @click="open = !open" :aria-expanded="open">
      <span class="acc-icon">✳</span>
      <span>{{ q }}</span>
    </button>
    <div class="acc-body">
      <div class="acc-inner">
        <p>{{ a }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ q: string; a: string }>()
const open = ref(false)
</script>

<style scoped>
.faq { border-bottom: 1px solid var(--line); }
.faq-q {
  display: flex; align-items: center; gap: 1rem; width: 100%;
  background: none; border: none; cursor: pointer; color: var(--paper);
  font-family: var(--font-serif); font-size: 1.35rem; text-align: left;
  padding: 1.5rem 0;
}
.faq-q .acc-icon { color: var(--lime); font-size: 1.2rem; flex: none; }
.faq p { color: var(--muted); line-height: 1.7; margin: 0; padding: 0 0 1.6rem 2.4rem; max-width: 70ch; }
</style>
