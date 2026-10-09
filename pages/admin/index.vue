<template>
  <div>
    <p style="font-size: 13px; color: #909399; margin-bottom: 16px;">{{ t('currentLocaleOnly') }}</p>

    <!-- Stat cards -->
    <el-row :gutter="16" style="margin-bottom: 24px;">
      <el-col v-for="c in cards" :key="c.key" :xs="12" :sm="8" :lg="6" style="margin-bottom: 16px;">
        <NuxtLink :to="c.to" style="text-decoration: none;">
          <el-card shadow="hover" style="cursor: pointer;">
            <div style="font-size: 28px; font-weight: bold;">{{ c.count === null ? '—' : c.count }}</div>
            <div style="font-size: 13px; color: #909399; margin-top: 4px;">{{ c.label }}</div>
          </el-card>
        </NuxtLink>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <!-- Recent inquiries -->
      <el-col :xs="24" :lg="12" style="margin-bottom: 16px;">
        <el-card>
          <template #header>
            <span style="font-weight: 600;">{{ t('recentInquiries') }}</span>
          </template>
          <ul v-if="recent.length" style="list-style: none; margin: 0; padding: 0;">
            <li v-for="q in recent" :key="q.id" style="padding: 10px 0; border-bottom: 1px solid #ebeef5; display: flex; align-items: center; gap: 12px;">
              <div style="min-width: 0; flex: 1;">
                <div style="font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ q.name }}</div>
                <div style="font-size: 12px; color: #909399; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">{{ q.email }}</div>
              </div>
              <el-tag :type="statusType(q.status)" size="small">{{ q.status }}</el-tag>
            </li>
          </ul>
          <p v-else style="font-size: 13px; color: #909399;">{{ t('noData') }}</p>
        </el-card>
      </el-col>

      <!-- Failed translations -->
      <el-col :xs="24" :lg="12" style="margin-bottom: 16px;">
        <el-card>
          <template #header>
            <span style="font-weight: 600;">{{ t('failedTranslations') }}</span>
          </template>
          <p style="font-size: 36px; font-weight: bold; margin: 0;" :style="{ color: failedCount ? '#f56c6c' : '#67c23a' }">
            {{ failedCount === null ? '—' : failedCount }}
          </p>
          <p style="margin: 12px 0 0;">
            <NuxtLink to="/admin/translations" style="font-size: 13px; color: #909399; text-decoration: none;">
              {{ t('translations') }} →
            </NuxtLink>
          </p>
        </el-card>
      </el-col>
    </el-row>
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

function statusType(s: string) {
  return s === 'new' ? 'primary' : s === 'spam' ? 'danger' : s === 'closed' ? 'info' : 'warning'
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
