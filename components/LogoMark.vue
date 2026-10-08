<template>
  <!-- Werkero one-line W monogram. Main stroke follows currentColor; dot is fixed acid lime. -->
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" :width="size" :height="size" aria-label="Werkero logo" role="img">
    <path d="M48 64 L92 176 L120 104 L148 176 L192 64" fill="none" stroke="currentColor" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="192" cy="64" r="13" fill="#F2FE67" />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: number }>(), { size: 30 })
</script>
