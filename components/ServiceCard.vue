<template>
  <div class="svc" :class="{ 'acc-open': open }">
    <Doodle type="star" :size="44" class="svc-doodle" />
    <h3>{{ item.title }}</h3>
    <p class="svc-text">{{ item.text }}</p>
    <button class="svc-toggle" @click="open = !open" :aria-expanded="open">
      <span class="acc-icon">✳</span>
    </button>
    <div class="acc-body">
      <div class="acc-inner">
        <ul>
          <li v-for="(p, i) in item.points" :key="i">{{ p }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ item: { title: string; text: string; points: string[] } }>()
const open = ref(false)
</script>

<style scoped>
.svc {
  border: 1px solid var(--line); border-radius: 22px;
  padding: 2.2rem; background: rgba(250, 247, 240, 0.025);
  position: relative;
  transition: border-color 0.4s, transform 0.5s var(--ease);
}
.svc:hover { border-color: rgba(242, 254, 103, 0.45); transform: translateY(-4px); }
.svc-doodle { color: var(--lime); margin-bottom: 1.4rem; }
.svc h3 { font-size: 1.7rem; margin: 0 0 0.8rem; }
.svc-text { color: var(--muted); line-height: 1.6; margin: 0 0 1rem; }
.svc-toggle {
  background: none; border: none; cursor: pointer; color: var(--lime);
  font-size: 1.5rem; padding: 0.2rem 0; line-height: 1;
}
.svc ul { list-style: none; margin: 0.4rem 0 0; padding: 0; }
.svc li { padding: 0.55rem 0; border-top: 1px solid var(--line); color: var(--paper); opacity: 0.85; font-size: 0.95rem; }
.svc li::before { content: '— '; color: var(--lime); }
</style>
