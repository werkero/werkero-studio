<template>
  <div class="ticker-block">
    <p class="eyebrow wrap" style="margin-bottom: 1.6rem">{{ label }}</p>
    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">
        <template v-for="n in 2" :key="n">
          <span v-for="(item, i) in items" :key="i" class="tick-unit">
            <span class="tick-item">{{ item }}</span><span class="tick-sep" />
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
.ticker-block { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 2.2rem 0; }
.tick-unit { display: inline-flex; align-items: center; }
.tick-item { font-family: var(--font-serif); font-size: 1.5rem; color: var(--paper); opacity: 0.85; }
</style>
