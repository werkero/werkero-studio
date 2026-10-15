<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Werkero Studio',
        url: 'https://werkero.vercel.app',
        logo: 'https://werkero.vercel.app/favicon.svg',
        description: 'Independent digital product studio — design and engineering, end to end.',
        sameAs: ['https://github.com/werkero'],
      }),
    },
  ],
})
</script>
