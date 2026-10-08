<template>
  <div class="ticker-block">
    <p class="kicker wrap tick-label"><span class="ast">✳</span> {{ label }}</p>
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <template v-for="n in 2" :key="n">
          <span v-for="(item, i) in items" :key="`${n}-${i}`" class="tick-unit">
            <span class="tick-item" :class="{ alt: i % 2 === 1 }">{{ item }}</span><span class="tick-sep">✳</span>
          </span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; items: string[] }>()
</script>

<style scoped>
.ticker-block { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 2rem 0 2.4rem; background: var(--cream); }
.tick-label { justify-content: center; margin-bottom: 1.8rem; }
.tick-unit { display: inline-flex; align-items: center; }
.tick-item { font-size: 1.45rem; letter-spacing: 0.02em; padding: 0 1.7rem; color: var(--ink); font-weight: 600; white-space: nowrap; }
.tick-item.alt { font-family: var(--font-serif); font-style: italic; font-weight: 500; }
.tick-sep { font-size: 1rem; color: var(--ink); opacity: 0.7; }
</style>
