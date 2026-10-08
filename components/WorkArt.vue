<template>
  <!-- Hand-drawn doodle illustrations for work cards (artifact parity) -->
  <svg v-if="type === 'doc'" viewBox="0 0 200 160" fill="none" stroke="#141414" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="55" y="12" width="95" height="136" />
    <path d="M72 40 h61 M72 62 h61 M72 84 h40" />
    <circle cx="82" cy="122" r="12" />
    <path d="M82 116 v12 M76 122 h12" />
    <g transform="rotate(-8 150 120)">
      <rect x="118" y="106" width="64" height="28" stroke="#c0392b" />
      <text x="150" y="125" text-anchor="middle" font-family="monospace" font-size="14" fill="#c0392b" stroke="none" letter-spacing="2">GEHEIM</text>
    </g>
  </svg>
  <svg v-else-if="type === 'globe'" viewBox="0 0 200 160" fill="none" stroke="#141414" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="80" cy="80" r="52" />
    <ellipse cx="80" cy="80" rx="24" ry="52" />
    <path d="M28 80 h104 M32 56 h96 M32 104 h96" stroke-width="3" />
    <path d="M128 96 l22 -18 22 18 v30 h-44 Z" />
    <path d="M150 118 c-6 -8 -20 -4 -16 6 c3 7 12 8 16 2 c4 6 13 5 16 -2 c4 -10 -10 -14 -16 -6 Z" fill="#e6f542" stroke-width="3" />
    <path d="M40 22 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z" fill="#141414" stroke="none" />
  </svg>
  <svg v-else-if="type === 'spark'" viewBox="0 0 200 160" fill="none" stroke="#141414" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M100 18 C 106 52, 112 62, 148 70 C 112 78, 106 88, 100 122 C 94 88, 88 78, 52 70 C 88 62, 94 52, 100 18 Z" fill="#e6f542" />
    <circle cx="48" cy="42" r="10" />
    <circle cx="156" cy="118" r="8" />
    <path d="M36 118 q14 -8 30 -2 M134 34 q16 -6 30 2" stroke-dasharray="2 8" />
  </svg>
  <svg v-else-if="type === 'tri'" viewBox="0 0 200 160" fill="none" stroke="#141414" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M100 24 L162 132 H38 Z" />
    <path d="M78 92 h44" />
    <path d="M30 132 h140" />
    <path d="M164 30 l2.5 7 7 2.5 -7 2.5 -2.5 7 -2.5 -7 -7 -2.5 7 -2.5 Z" fill="#e6f542" stroke="none" />
    <path d="M28 44 q10 -6 22 -2 M28 58 q10 -6 22 -2" stroke-dasharray="2 7" stroke-width="3" />
  </svg>
  <svg v-else-if="type === 'frames'" viewBox="0 0 200 160" fill="none" stroke="#141414" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="62" y="26" width="76" height="108" />
    <rect x="82" y="48" width="44" height="64" />
    <circle cx="138" cy="80" r="10" fill="#e6f542" />
    <path d="M138 70 v-8 M138 98 v-8 M128 80 h-8 M156 80 h-8" stroke-width="3" />
    <path d="M30 132 q12 -6 26 0 M144 132 q12 6 26 0" stroke-dasharray="2 8" stroke-width="3" />
  </svg>
  <!-- service doodles -->
  <svg v-else-if="type === 'browser'" viewBox="0 0 120 90" fill="none" stroke="#1a1a1a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M30 26 C 50 24, 72 27, 90 25 C 92 38, 88 54, 90 64 C 72 66, 50 63, 30 65 C 28 52, 32 38, 30 26 Z" />
    <path d="M30 34 C 50 32, 72 35, 90 33" />
    <circle cx="37" cy="30" r="2" fill="#1a1a1a" stroke="none" />
    <circle cx="43" cy="30" r="2" fill="#1a1a1a" stroke="none" />
    <circle cx="49" cy="30" r="2" fill="#1a1a1a" stroke="none" />
    <path d="M49 43 l-7 6 7 6" />
    <path d="M60 36 l-5 22" />
    <path d="M69 43 l7 6 -7 6" />
    <path d="M86 58 l8 2 -6 7 Z" fill="#e6f542" />
  </svg>
  <svg v-else-if="type === 'sparkles'" viewBox="0 0 120 90" fill="none" stroke="#1a1a1a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M60 18 C 63 30, 66 35, 80 41 C 66 47, 63 52, 60 64 C 57 52, 54 47, 36 41 C 54 35, 57 30, 60 18 Z" fill="#e6f542" />
    <path d="M86 24 l2.2 6 6 2.2 -6 2.2 -2.2 6 -2.2 -6 -6 -2.2 6 -2.2 Z" />
    <path d="M32 54 l2 5.4 5.4 2 -5.4 2 -2 5.4 -2 -5.4 -5.4 -2 5.4 -2 Z" fill="#1a1a1a" stroke="none" />
    <path d="M30 70 Q 60 66, 90 70" stroke-width="3" stroke-dasharray="0.5 6.5" />
  </svg>
  <svg v-else-if="type === 'eglobe'" viewBox="0 0 120 90" fill="none" stroke="#1a1a1a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="50" cy="45" r="23" />
    <ellipse cx="50" cy="45" rx="9" ry="23" />
    <path d="M27 45 h46" />
    <path d="M84 30 l-3 17" />
    <path d="M81 49 h18 l-4 15 h-11 Z" fill="#e6f542" />
    <circle cx="86" cy="70" r="2.6" fill="#1a1a1a" stroke="none" />
    <circle cx="95" cy="70" r="2.6" fill="#1a1a1a" stroke="none" />
  </svg>
  <svg v-else-if="type === 'shapes'" viewBox="0 0 200 130" fill="none" stroke="#141414" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="52" cy="52" r="18" />
    <rect x="86" y="34" width="36" height="36" />
    <path d="M148 32 L172 96 H124 Z" />
    <circle cx="164" cy="104" r="6" fill="#e6f542" />
    <path d="M36 106 q13 -7 28 -2 M94 110 q15 -6 32 0" stroke-dasharray="2 7" stroke-width="2.5" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ type: 'doc' | 'globe' | 'spark' | 'tri' | 'frames' | 'browser' | 'sparkles' | 'eglobe' | 'shapes' }>()
</script>
