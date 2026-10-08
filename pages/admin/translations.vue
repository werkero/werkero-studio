<template>
  <div>
    <div class="adm-toolbar">
      <div class="adm-tabs" style="margin:0">
        <button v-for="s in ['all','pending','processing','done','failed','skipped']" :key="s"
          :class="{ active: filter === s }" @click="filter = s; page = 1; load()">
          {{ s === 'all' ? t('all') : s }}
        </button>
      </div>
      <div class="spacer" />
      <button class="adm-btn primary" :disabled="processing" @click="processNow">{{ t('processNow') }}</button>
    </div>
    <div class="adm-tablewrap">
      <table class="adm-table">
        <thead><tr>
          <th>{{ t('time') }}</th><th>{{ t('resource') }}</th><th>{{ t('field') }}</th>
          <th>{{ t('from') }} → {{ t('to') }}</th><th>{{ t('status') }}</th>
          <th>{{ t('attempts') }}</th><th>{{ t('error') }}</th><th>{{ t('actions') }}</th>
        </tr></thead>
        <tbody>
          <tr v-for="j in rows" :key="j.id">
            <td style="white-space:nowrap">{{ fmtDate(j.created_at) }}</td>
            <td>{{ j.resource_type }}<br /><span style="font-size:11px;color:#6b7280">{{ shortId(j.resource_id) }}</span></td>
            <td><code>{{ j.field }}</code></td>
            <td>{{ j.source_locale }} → {{ j.target_locale }}</td>
            <td><span class="adm-badge" :class="statusClass(j.status)">{{ j.status }}</span></td>
            <td>{{ j.attempts }}</td>
            <td><div class="adm-ellipsis" :title="j.error || ''">{{ j.error || '—' }}</div></td>
            <td><button v-if="j.status === 'failed'" class="adm-btn sm" @click="retry(j)">{{ t('retry') }}</button></td>
          </tr>
        </tbody>
      </table>
      <div class="adm-pager">
        <button class="adm-btn sm" :disabled="page <= 1" @click="page--; load()">‹</button>
        <span>{{ t('page') }} {{ page }} / {{ totalPages }} · {{ t('total') }} {{ total }}</span>
        <button class="adm-btn sm" :disabled="page >= totalPages" @click="page++; load()">›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminApi, adminErrorMessage } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: 'admin' })

const { t, uiLang } = useAdminLocale()
const api = useAdminApi()
const rows = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const totalPages = ref(1)
const filter = ref('all')
const processing = ref(false)

function statusClass(s: string) {
  return s === 'done' ? 'green' : s === 'failed' ? 'red' : s === 'pending' ? 'amber' : 'gray'
}
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(uiLang.value === 'zh-cn' ? 'zh-CN' : 'en-US', { hour12: false }) : '—'
}
function shortId(id: string) { return id ? String(id).slice(0, 8) : '' }
async function load() {
  const q: any = { page: page.value, pageSize }
  if (filter.value !== 'all') q.status = filter.value
  const r: any = await api.get('/api/admin/translation-jobs', q)
  rows.value = r.data || []
  total.value = r.pagination?.total || 0
  totalPages.value = r.pagination?.totalPages || 1
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
