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
const props = defineProps<{ q: string; a: string; openByDefault?: boolean }>()
const open = ref(!!props.openByDefault)
</script>

<style scoped>
.faq { border-bottom: 1px solid var(--line); }
.faq-q {
  display: flex; align-items: center; gap: 1.1rem; width: 100%;
  background: none; border: none; cursor: pointer; color: var(--ink);
  font-family: var(--font-sans); font-size: 1.12rem; font-weight: 600; text-align: left;
  padding: 1.5rem 0;
}
.faq-q .acc-icon { color: var(--ink); font-size: 1.1rem; flex: none; }
.faq p { color: var(--muted); line-height: 1.7; margin: 0; padding: 0 0 1.6rem 2.4rem; max-width: 70ch; }
</style>
