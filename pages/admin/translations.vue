<template>
  <div>
    <div style="display: flex; align-items: center; margin-bottom: 16px;">
      <el-button-group>
        <el-button v-for="s in ['all','pending','processing','done','failed','skipped']" :key="s"
          :type="filter === s ? 'primary' : 'default'"
          @click="filter = s; page = 1; load()">
          {{ s === 'all' ? t('all') : t('status.' + s) }}
        </el-button>
      </el-button-group>
      <div style="flex: 1;" />
      <el-button type="primary" :loading="processing" @click="processNow">{{ t('processNow') }}</el-button>
    </div>
    <el-card>
      <el-table :data="rows" style="width: 100%">
        <el-table-column :label="t('time')" min-width="170">
          <template #default="{ row }"><span style="white-space: nowrap;">{{ fmtDate(row.created_at) }}</span></template>
        </el-table-column>
        <el-table-column :label="t('resource')" min-width="160">
          <template #default="{ row }">
            {{ row.resource_type }}<br />
            <span style="font-size: 11px; color: #909399;">{{ shortId(row.resource_id) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('field')" width="160">
          <template #default="{ row }"><code>{{ row.field }}</code></template>
        </el-table-column>
        <el-table-column :label="t('from') + ' → ' + t('to')" width="150">
          <template #default="{ row }">{{ row.source_locale }} → {{ row.target_locale }}</template>
        </el-table-column>
        <el-table-column :label="t('status')" width="120">
          <template #default="{ row }"><el-tag :type="statusType(row.status)" size="small">{{ t('status.' + row.status) }}</el-tag></template>
        </el-table-column>
        <el-table-column :label="t('attempts')" width="100" prop="attempts" />
        <el-table-column :label="t('error')" min-width="200">
          <template #default="{ row }">
            <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px;" :title="row.error || ''">{{ row.error || '—' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="t('actions')" width="120" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'failed'" size="small" @click="retry(row)">{{ t('retry') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="load" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useAdminApi, adminErrorMessage } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: 'admin' })

const { t, uiLang } = useAdminLocale()
const dateLocale = computed(() => {
  const map: Record<string, string> = { 'en': 'en-US', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'fr': 'fr-FR', 'de': 'de-DE', 'ru': 'ru-RU', 'ja': 'ja-JP' }
  return map[uiLang.value] || 'en-US'
})
const api = useAdminApi()
const rows = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const filter = ref('all')
const processing = ref(false)

function statusType(s: string) {
  return s === 'done' ? 'success' : s === 'failed' ? 'danger' : s === 'pending' ? 'warning' : 'info'
}
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(dateLocale.value, { hour12: false }) : '—'
}
function shortId(id: string) { return id ? String(id).slice(0, 8) : '' }
async function load() {
  const q: any = { page: page.value, pageSize }
  if (filter.value !== 'all') q.status = filter.value
  const r: any = await api.get('/api/admin/translation-jobs', q)
  rows.value = r.data || []
  total.value = r.pagination?.total || 0
}
async function processNow() {
  processing.value = true
  try {
    await api.post('/api/admin/translation-jobs/process')
    await load()
  } catch (e: any) { alert(adminErrorMessage(e)) }
  finally { processing.value = false }
}
async function retry(j: any) {
  try {
    await api.post('/api/admin/translation-jobs/retry', { id: j.id })
    await load()
  } catch (e: any) { alert(adminErrorMessage(e)) }
}
onMounted(load)
</script>
