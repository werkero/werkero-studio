<template>
  <NuxtLink :to="to" class="work-card" :class="{ featured }">
    <div class="work-visual">
      <i class="wv-b1" /><i class="wv-b2" />
      <span class="work-letter">{{ title.charAt(0) }}</span>
      <RotatingBadge v-if="featured" class="badge" />
    </div>
    <div class="work-meta">
      <div>
        <h3>{{ title }}</h3>
        <p>{{ tagline }}</p>
      </div>
      <span class="link-arrow">
        {{ viewCase }} <Doodle type="arrow" :size="22" />
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
defineProps<{
  to: string
  title: string
  tagline: string
  viewCase: string
  featured?: boolean
}>()
</script>

<style scoped>
.work-card { display: block; text-decoration: none; color: inherit; }
.work-visual {
  position: relative; border-radius: 26px; overflow: hidden;
  background: #000; aspect-ratio: 16 / 10;
  display: flex; align-items: center; justify-content: center;
}
.work-card.featured .work-visual { aspect-ratio: 16 / 8; border-radius: 32px; }
.work-visual i { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.5; }
.wv-b1 { width: 60%; height: 120%; left: -10%; top: -30%; background: radial-gradient(circle, #4d7cff, transparent 70%); }
.wv-b2 { width: 55%; height: 110%; right: -8%; bottom: -35%; background: radial-gradient(circle, #a855f7, transparent 70%); }
.work-letter {
  font-family: var(--font-serif); font-weight: 600;
  font-size: clamp(5rem, 10vw, 9rem); color: var(--paper); opacity: 0.92;
  position: relative; z-index: 1;
}
.badge { position: absolute; top: 1.4rem; right: 1.4rem; z-index: 2; }
.work-meta { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1.3rem 0.2rem 0; }
.work-meta h3 { margin: 0 0 0.4rem; font-size: 1.45rem; }
.work-meta p { margin: 0; color: var(--muted); font-size: 0.95rem; line-height: 1.55; max-width: 44ch; }
.work-meta .link-arrow { flex: none; padding-top: 0.3rem; color: var(--lime); }
</style>
