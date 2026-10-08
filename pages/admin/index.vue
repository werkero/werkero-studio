<template>
  <div>
    <div class="adm-hint">{{ t('currentLocaleOnly') }}</div>
    <div class="adm-cards">
      <div v-for="c in cards" :key="c.key" class="adm-card" :class="{ warn: c.warn }">
        <div class="n">{{ c.count === null ? '—' : c.count }}</div>
        <div class="l"><NuxtLink :to="c.to">{{ c.label }}</NuxtLink></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
      <div class="adm-panel">
        <h2>{{ t('recentInquiries') }}</h2>
        <table v-if="recent.length" class="adm-table">
          <thead><tr><th>{{ t('name') }}</th><th>{{ t('email') }}</th><th>{{ t('status') }}</th></tr></thead>
          <tbody>
            <tr v-for="q in recent" :key="q.id">
              <td>{{ q.name }}</td><td>{{ q.email }}</td>
              <td><span class="adm-badge" :class="statusClass(q.status)">{{ q.status }}</span></td>
            </tr>
          </tbody>
        </table>
        <p v-else style="color:#6b7280">{{ t('noData') }}</p>
      </div>
      <div class="adm-panel">
        <h2>{{ t('failedTranslations') }}</h2>
        <p style="font-size:28px;font-weight:700;margin:0" :style="{ color: failedCount ? '#dc2626' : '#15803d' }">
          {{ failedCount === null ? '—' : failedCount }}
        </p>
        <p style="margin-top:8px"><NuxtLink to="/admin/translations">{{ t('translations') }} →</NuxtLink></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ADMIN_RESOURCE_LIST } from '~/utils/admin-resources'
import { useAdminApi, adminErrorMessage } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: 'admin' })

const { t, uiLang } = useAdminLocale()
const api = useAdminApi()
const uiZh = computed(() => uiLang.value === 'zh-cn')

const counts = ref<Record<string, number | null>>({})
const recent = ref<any[]>([])
const failedCount = ref<number | null>(null)

const cards = computed(() =>
  ADMIN_RESOURCE_LIST.map((r) => ({
    key: r.slug,
    label: uiZh.value ? r.nameZh : r.name,
    to: `/admin/${r.slug}`,
    count: counts.value[r.slug] ?? null,
    warn: false,
  })).concat([
    { key: 'inquiries', label: t('inquiries'), to: '/admin/inquiries', count: counts.value['inquiries'] ?? null, warn: false },
  ]),
)

function statusClass(s: string) {
  return s === 'new' ? 'blue' : s === 'spam' ? 'red' : s === 'closed' ? 'gray' : 'amber'
}

onMounted(async () => {
  const jobs: Promise<void>[] = []
  for (const r of ADMIN_RESOURCE_LIST) {
    jobs.push(
      api.get(`/api/admin/${r.slug}`, { pageSize: 1 }).then(
        (res: any) => { counts.value[r.slug] = res.pagination?.total ?? 0 },
        () => { counts.value[r.slug] = null },
      ),
    )
  }
  jobs.push(
    api.get('/api/admin/inquiries', { pageSize: 1 }).then(
      (res: any) => { counts.value['inquiries'] = res.pagination?.total ?? 0 },
      () => { counts.value['inquiries'] = null },
    ),
  )
  jobs.push(
    api.get('/api/admin/inquiries', { pageSize: 5 }).then(
      (res: any) => { recent.value = res.data || [] },
      () => {},
    ),
  )
  jobs.push(
    api.get('/api/admin/translation-jobs', { status: 'failed', pageSize: 1 }).then(
      (res: any) => { failedCount.value = res.pagination?.total ?? 0 },
      () => { failedCount.value = null },
    ),
  )
  await Promise.all(jobs)
})
</script>
