<template>
  <div>
    <!-- Hero welcome -->
    <el-card shadow="never" class="dash-hero">
      <div class="dash-hero-inner">
        <div>
          <div class="dash-hero-title">{{ t('welcomeBack') }}{{ userName ? ', ' + userName : '' }} 👋</div>
          <div class="dash-hero-sub">{{ todayStr }}</div>
        </div>
        <el-button type="primary" @click="navigateTo('/admin/works')">+ {{ t('newWork') }}</el-button>
      </div>
    </el-card>

    <!-- Stat cards -->
    <el-row :gutter="16" style="margin-bottom: 8px;">
      <el-col v-for="c in cards" :key="c.key" :xs="12" :sm="8" :lg="6" style="margin-bottom: 16px;">
        <NuxtLink :to="c.to" style="text-decoration: none;">
          <el-card shadow="hover" class="dash-stat">
            <div class="dash-stat-head">
              <span class="dash-stat-icon">{{ c.icon }}</span>
              <span class="dash-stat-bar" :style="{ background: c.color }" />
            </div>
            <div class="dash-stat-num">{{ c.count === null ? '—' : c.count }}</div>
            <div class="dash-stat-label">{{ c.label }}</div>
            <div v-if="c.trend" class="dash-stat-trend">{{ c.trend }}</div>
          </el-card>
        </NuxtLink>
      </el-col>
    </el-row>

    <!-- Quick actions -->
    <el-card shadow="never" style="margin-bottom: 16px;">
      <template #header>
        <span style="font-weight: 600;">{{ t('quickActions') }}</span>
      </template>
      <div class="dash-actions">
        <el-button type="primary" plain @click="navigateTo('/admin/works')">+ {{ t('newWork') }}</el-button>
        <el-button plain @click="navigateTo('/admin/services')">+ {{ t('newService') }}</el-button>
        <el-button plain @click="navigateTo('/admin/media')">⤴ {{ t('uploadMedia') }}</el-button>
        <el-button plain @click="navigateTo('/admin/inquiries')">📨 {{ t('viewInquiries') }}</el-button>
      </div>
    </el-card>

    <el-row :gutter="16">
      <!-- Recent inquiries (2/3) -->
      <el-col :xs="24" :lg="16" style="margin-bottom: 16px;">
        <el-card shadow="never">
          <template #header>
            <div class="dash-card-head">
              <span style="font-weight: 600;">{{ t('recentInquiries') }}</span>
              <NuxtLink to="/admin/inquiries" style="font-size: 13px; color: #909399; text-decoration: none;">
                {{ t('viewAll') }} →
              </NuxtLink>
            </div>
          </template>
          <ul v-if="recent.length" class="dash-list">
            <li v-for="q in recent" :key="q.id" class="dash-list-item">
              <div class="dash-avatar">{{ (q.name || '?').slice(0, 1).toUpperCase() }}</div>
              <div class="dash-list-main">
                <div class="dash-list-title">{{ q.name }}</div>
                <div class="dash-list-sub">{{ q.email }} · {{ fmtDate(q.created_at) }}</div>
              </div>
              <el-tag :type="statusType(q.status)" size="small">{{ statusText(q.status) }}</el-tag>
            </li>
          </ul>
          <div v-else class="dash-empty">
            <div class="dash-empty-icon">📭</div>
            <div class="dash-empty-title">{{ t('emptyInboxTitle') }}</div>
            <div class="dash-empty-desc">{{ t('emptyInboxDesc') }}</div>
          </div>
        </el-card>
      </el-col>

      <!-- Right column (1/3): system status -->
      <el-col :xs="24" :lg="8" style="margin-bottom: 16px;">
        <el-card shadow="never">
          <template #header>
            <div class="dash-card-head">
              <span style="font-weight: 600;">{{ t('systemStatus') }}</span>
              <el-tag :type="queueHealthy ? 'success' : 'danger'" size="small">
                {{ queueHealthy ? t('allHealthy') : t('needsAttention') }}
              </el-tag>
            </div>
          </template>

          <div class="dash-status-row">
            <span>{{ t('transQueue') }}</span>
          </div>
          <div class="dash-queue">
            <div class="dash-queue-item">
              <span class="dash-queue-num" style="color: #e6a23c;">{{ pendingTrans ?? '—' }}</span>
              <span class="dash-queue-label">{{ t('status.pending') }}</span>
            </div>
            <div class="dash-queue-item">
              <span class="dash-queue-num" style="color: #409eff;">{{ processingTrans ?? '—' }}</span>
              <span class="dash-queue-label">{{ t('status.processing') }}</span>
            </div>
            <div class="dash-queue-item">
              <span class="dash-queue-num" :style="{ color: failedCount ? '#f56c6c' : '#67c23a' }">{{ failedCount ?? '—' }}</span>
              <span class="dash-queue-label">{{ t('status.failed') }}</span>
            </div>
          </div>

          <div style="margin-top: 16px; text-align: right;">
            <NuxtLink to="/admin/translations" style="font-size: 13px; color: #909399; text-decoration: none;">
              {{ t('translations') }} →
            </NuxtLink>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ADMIN_RESOURCE_LIST } from '~/utils/admin-resources'
import { useAdminApi } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: 'admin' })

const { t, uiLang } = useAdminLocale()
const api = useAdminApi()
const me = useState<any>('admin-me', () => null)

const counts = ref<Record<string, number | null>>({})
const recent = ref<any[]>([])
const failedCount = ref<number | null>(null)
const pendingTrans = ref<number | null>(null)
const processingTrans = ref<number | null>(null)
const newInquiries = ref<number | null>(null)

const userName = computed(() => me.value?.username || '')
const dateLocale = computed(() => {
  const map: Record<string, string> = { 'en': 'en-US', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'fr': 'fr-FR', 'de': 'de-DE', 'ru': 'ru-RU', 'ja': 'ja-JP' }
  return map[uiLang.value] || 'en-US'
})
const todayStr = computed(() =>
  new Date().toLocaleDateString(dateLocale.value, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
)
const queueHealthy = computed(() => (failedCount.value ?? 0) === 0)

const ICONS: Record<string, string> = {
  works: '💼', products: '📦', services: '🛠️', faqs: '❓',
  testimonials: '💬', 'process-steps': '🪜', 'position-principles': '🧭',
  seo: '🔍', inquiries: '📨',
}
const COLORS: Record<string, string> = {
  works: '#409eff', products: '#67c23a', services: '#e6a23c', faqs: '#909399',
  testimonials: '#f56c6c', 'process-steps': '#9b59b6', 'position-principles': '#00bcd4',
  seo: '#ff9800', inquiries: '#409eff',
}

const cards = computed(() =>
  ADMIN_RESOURCE_LIST.map((r) => ({
    key: r.slug,
    label: t('res.' + r.slug),
    to: `/admin/${r.slug}`,
    count: counts.value[r.slug] ?? null,
    icon: ICONS[r.slug] || '📄',
    color: COLORS[r.slug] || '#909399',
    trend: null as string | null,
  })).concat([
    {
      key: 'inquiries',
      label: t('inquiries'),
      to: '/admin/inquiries',
      count: counts.value['inquiries'] ?? null,
      icon: ICONS['inquiries'],
      color: COLORS['inquiries'],
      trend: (newInquiries.value ?? 0) > 0 ? `+${newInquiries.value} ${t('status.pending')}` : null,
    },
  ]),
)

function statusType(s: string) {
  return s === 'new' ? 'primary' : s === 'spam' ? 'danger' : s === 'closed' ? 'info' : 'warning'
}
function statusText(s: string) {
  const k = `st${s.charAt(0).toUpperCase()}${s.slice(1)}`
  const v = t(k)
  return v === k ? s : v
}
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(dateLocale.value, { hour12: false }) : '—'
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
    api.get('/api/admin/inquiries', { status: 'new', pageSize: 1 }).then(
      (res: any) => { newInquiries.value = res.pagination?.total ?? 0 },
      () => { newInquiries.value = null },
    ),
  )
  jobs.push(
    api.get('/api/admin/inquiries', { pageSize: 5 }).then(
      (res: any) => { recent.value = res.data || [] },
      () => {},
    ),
  )
  for (const [st, ref] of [['failed', failedCount], ['pending', pendingTrans], ['processing', processingTrans]] as const) {
    jobs.push(
      api.get('/api/admin/translation-jobs', { status: st, pageSize: 1 }).then(
        (res: any) => { ref.value = res.pagination?.total ?? 0 },
        () => { ref.value = null },
      ),
    )
  }
  await Promise.all(jobs)
})
</script>

<style scoped>
.dash-hero {
  margin-bottom: 16px;
  background: linear-gradient(120deg, rgba(64, 158, 255, 0.16), rgba(64, 158, 255, 0) 55%), #1d1e1f;
  border: 1px solid #2e2e2e;
}
.dash-hero-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.dash-hero-title {
  font-size: 22px;
  font-weight: 700;
  color: #f5f5f5;
}
.dash-hero-sub {
  font-size: 13px;
  color: #909399;
  margin-top: 6px;
}
.dash-stat {
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.dash-stat:hover {
  transform: translateY(-4px);
}
.dash-stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.dash-stat-icon {
  font-size: 22px;
}
.dash-stat-bar {
  width: 28px;
  height: 4px;
  border-radius: 2px;
}
.dash-stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #f5f5f5;
}
.dash-stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}
.dash-stat-trend {
  font-size: 12px;
  color: #e6a23c;
  margin-top: 6px;
  font-weight: 600;
}
.dash-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.dash-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dash-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.dash-list-item {
  padding: 12px 0;
  border-bottom: 1px solid #2e2e2e;
  display: flex;
  align-items: center;
  gap: 12px;
}
.dash-list-item:last-child {
  border-bottom: none;
}
.dash-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #2e2e2e;
  color: #c0c4cc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  flex-shrink: 0;
}
.dash-list-main {
  min-width: 0;
  flex: 1;
}
.dash-list-title {
  font-size: 14px;
  font-weight: 500;
  color: #e5e5e5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dash-list-sub {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dash-empty {
  text-align: center;
  padding: 40px 16px;
}
.dash-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.dash-empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #e5e5e5;
}
.dash-empty-desc {
  font-size: 13px;
  color: #909399;
  margin-top: 6px;
}
.dash-status-row {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}
.dash-queue {
  display: flex;
  gap: 8px;
}
.dash-queue-item {
  flex: 1;
  background: #141414;
  border: 1px solid #2e2e2e;
  border-radius: 8px;
  padding: 12px 8px;
  text-align: center;
}
.dash-queue-num {
  font-size: 22px;
  font-weight: 700;
  display: block;
}
.dash-queue-label {
  font-size: 12px;
  color: #909399;
  display: block;
  margin-top: 4px;
}
</style>
