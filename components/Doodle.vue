<template>
  <!-- Hand-drawn doodle accents: starburst / smiley / arrow -->
  <svg v-if="type === 'star'" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" :width="size" :height="size" aria-hidden="true">
    <path d="M50 6 L58 38 L90 30 L66 52 L92 68 L58 64 L50 96 L42 64 L8 68 L34 52 L10 30 L42 38 Z" stroke-linejoin="round"/>
  </svg>
  <svg v-else-if="type === 'smile'" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" :width="size" :height="size" aria-hidden="true">
    <circle cx="50" cy="50" r="42" />
    <path d="M32 42 q3 4 6 0 M62 42 q3 4 6 0" />
    <path d="M30 62 q20 16 40 0" />
  </svg>
  <svg v-else viewBox="0 0 120 60" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" :width="size * 2" :height="size" aria-hidden="true">
    <path d="M6 30 C 40 26, 70 34, 104 30 M88 16 L106 30 L88 44" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ type?: 'star' | 'smile' | 'arrow'; size?: number }>(),
  { type: 'star', size: 40 }
)
</script>
