<template>
  <div>
    <el-tabs v-model="tab" @tab-change="page = 1; load()">
      <el-tab-pane :label="t('loginLogs')" name="logins" />
      <el-tab-pane :label="t('operationLogs')" name="ops" />
    </el-tabs>

    <el-card v-if="tab === 'logins'">
      <el-table :data="rows" style="width: 100%">
        <el-table-column :label="t('time')" min-width="170">
          <template #default="{ row }"><span style="white-space: nowrap">{{ fmtDate(row.created_at) }}</span></template>
        </el-table-column>
        <el-table-column prop="username" :label="t('user')" min-width="140" />
        <el-table-column prop="ip_address" :label="t('ip')" min-width="140" />
        <el-table-column :label="t('success')" width="100">
          <template #default="{ row }"><el-tag :type="row.success ? 'success' : 'danger'" size="small">{{ row.success ? '✓' : '✗' }}</el-tag></template>
        </el-table-column>
        <el-table-column :label="t('reason')" min-width="200">
          <template #default="{ row }">{{ row.failure_reason || '—' }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card v-if="tab === 'ops'">
      <el-table :data="rows" style="width: 100%">
        <el-table-column :label="t('time')" min-width="170">
          <template #default="{ row }"><span style="white-space: nowrap">{{ fmtDate(row.created_at) }}</span></template>
        </el-table-column>
        <el-table-column prop="username" :label="t('user')" min-width="140" />
        <el-table-column :label="t('action')" min-width="140">
          <template #default="{ row }"><code>{{ row.action }}</code></template>
        </el-table-column>
        <el-table-column :label="t('resource')" min-width="160">
          <template #default="{ row }">
            {{ row.resource_type }}<br /><span style="font-size: 11px; color: #909399">{{ shortId(row.resource_id) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('detail')" min-width="240">
          <template #default="{ row }">
            <div :title="detailOf(row)" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px">{{ detailOf(row) }}</div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <div style="display: flex; justify-content: flex-end; margin-top: 16px">
      <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" layout="prev, pager, next" @current-change="load" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminApi } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: 'admin' })

const { t, uiLang } = useAdminLocale()
const dateLocale = computed(() => {
  const map: Record<string, string> = { 'en': 'en-US', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'fr': 'fr-FR', 'de': 'de-DE', 'ru': 'ru-RU', 'ja': 'ja-JP' }
  return map[uiLang.value] || 'en-US'
})
const api = useAdminApi()
const tab = ref('logins')
const rows = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(dateLocale.value, { hour12: false }) : '—'
}
function shortId(id: string) { return id ? String(id).slice(0, 8) : '' }
function detailOf(l: any) {
  const d = l.after_data ?? l.before_data
  try { return JSON.stringify(d) } catch { return String(d ?? '') }
}
async function load() {
  const path = tab.value === 'logins' ? '/api/admin/logs/logins' : '/api/admin/logs/operations'
  const r: any = await api.get(path, { page: page.value, pageSize })
  rows.value = r.data || []
  total.value = r.pagination?.total || 0
}
onMounted(load)
</script>
