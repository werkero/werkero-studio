<template>
  <div>
    <el-tabs v-model="filter" @tab-change="page = 1; load()">
      <el-tab-pane :label="t('all')" name="all" />
      <el-tab-pane :label="t('new')" name="new" />
      <el-tab-pane :label="t('stContacted')" name="contacted" />
      <el-tab-pane :label="t('stClosed')" name="closed" />
      <el-tab-pane :label="t('stSpam')" name="spam" />
    </el-tabs>

    <el-card>
      <el-table :data="rows" style="width: 100%">
        <el-table-column :label="t('time')" min-width="170">
          <template #default="{ row }"><span style="white-space: nowrap">{{ fmtDate(row.created_at) }}</span></template>
        </el-table-column>
        <el-table-column prop="name" :label="t('name')" min-width="120" />
        <el-table-column prop="email" :label="t('email')" min-width="160" />
        <el-table-column :label="t('company')" min-width="120">
          <template #default="{ row }">{{ row.company || '—' }}</template>
        </el-table-column>
        <el-table-column :label="t('message')" min-width="220">
          <template #default="{ row }">
            <div :title="row.message" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px">{{ row.message }}</div>
            <div v-if="row.budget || row.source" style="font-size: 11.5px; color: #909399">{{ row.budget }} {{ row.source }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="t('status')" width="120">
          <template #default="{ row }"><el-tag :type="statusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag></template>
        </el-table-column>
        <el-table-column :label="t('actions')" width="300" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'new'" size="small" @click="setStatus(row, 'contacted')">{{ t('markContacted') }}</el-button>
            <el-button v-if="row.status === 'contacted'" size="small" @click="setStatus(row, 'closed')">{{ t('markClosed') }}</el-button>
            <el-button v-if="row.status !== 'spam' && row.status !== 'closed'" size="small" type="danger" plain @click="setStatus(row, 'spam')">{{ t('markSpam') }}</el-button>
            <el-button v-if="row.status === 'closed' || row.status === 'spam'" size="small" @click="setStatus(row, 'new')">{{ t('reopen') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="display: flex; justify-content: flex-end; margin-top: 16px">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper" background @current-change="load" @size-change="onSizeChange" />
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
const pageSize = ref(20)
const total = ref(0)
const filter = ref('all')

function statusType(s: string) {
  return s === 'new' ? 'primary' : s === 'spam' ? 'danger' : s === 'closed' ? 'info' : 'warning'
}
function statusText(s: string) {
  return s === 'new' ? t('new') : s === 'contacted' ? t('stContacted') : s === 'closed' ? t('stClosed') : s === 'spam' ? t('stSpam') : s
}
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(dateLocale.value, { hour12: false }) : '—'
}
async function load() {
  const q: any = { page: page.value, pageSize: pageSize.value }
  if (filter.value !== 'all') q.status = filter.value
  const r: any = await api.get('/api/admin/inquiries', q)
  rows.value = r.data || []
  total.value = r.pagination?.total || 0
}
function onSizeChange(v: number) {
  pageSize.value = v
  page.value = 1
  load()
}

async function setStatus(q: any, status: string) {
  try {
    await api.patch(`/api/admin/inquiries/${q.id}`, { status })
    await load()
  } catch (e: any) { alert(adminErrorMessage(e)) }
}
onMounted(load)
</script>
