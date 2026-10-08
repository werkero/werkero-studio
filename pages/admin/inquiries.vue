<template>
  <div>
    <div class="adm-tabs">
      <button v-for="s in ['all','new','contacted','closed','spam']" :key="s"
        :class="{ active: filter === s }" @click="filter = s; page = 1; load()">
        {{ s === 'all' ? t('all') : s }}
      </button>
    </div>
    <div class="adm-tablewrap">
      <table class="adm-table">
        <thead><tr><th>{{ t('time') }}</th><th>{{ t('name') }}</th><th>{{ t('email') }}</th><th>{{ t('company') }}</th><th>{{ t('message') }}</th><th>{{ t('status') }}</th><th>{{ t('actions') }}</th></tr></thead>
        <tbody>
          <tr v-for="q in rows" :key="q.id">
            <td style="white-space:nowrap">{{ fmtDate(q.created_at) }}</td>
            <td>{{ q.name }}</td>
            <td>{{ q.email }}</td>
            <td>{{ q.company || '—' }}</td>
            <td><div class="adm-ellipsis" :title="q.message">{{ q.message }}</div>
              <div v-if="q.budget || q.source" style="font-size:11.5px;color:#6b7280">{{ q.budget }} {{ q.source }}</div></td>
            <td><span class="adm-badge" :class="statusClass(q.status)">{{ q.status }}</span></td>
            <td><div class="adm-row-actions">
              <button v-if="q.status === 'new'" class="adm-btn sm" @click="setStatus(q, 'contacted')">{{ t('markContacted') }}</button>
              <button v-if="q.status === 'contacted'" class="adm-btn sm" @click="setStatus(q, 'closed')">{{ t('markClosed') }}</button>
              <button v-if="q.status !== 'spam' && q.status !== 'closed'" class="adm-btn sm danger" @click="setStatus(q, 'spam')">{{ t('markSpam') }}</button>
              <button v-if="q.status === 'closed' || q.status === 'spam'" class="adm-btn sm" @click="setStatus(q, 'new')">{{ t('reopen') }}</button>
            </div></td>
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

function statusClass(s: string) {
  return s === 'new' ? 'blue' : s === 'spam' ? 'red' : s === 'closed' ? 'gray' : 'amber'
}
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(uiLang.value === 'zh-cn' ? 'zh-CN' : 'en-US', { hour12: false }) : '—'
}
async function load() {
  const q: any = { page: page.value, pageSize }
  if (filter.value !== 'all') q.status = filter.value
  const r: any = await api.get('/api/admin/inquiries', q)
  rows.value = r.data || []
  total.value = r.pagination?.total || 0
  totalPages.value = r.pagination?.totalPages || 1
}
async function setStatus(q: any, status: string) {
  try {
    await api.patch(`/api/admin/inquiries/${q.id}`, { status })
    await load()
  } catch (e: any) { alert(adminErrorMessage(e)) }
}
onMounted(load)
</script>
