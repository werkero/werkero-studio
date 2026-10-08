<template>
  <div>
    <div class="adm-tabs">
      <button :class="{ active: tab === 'logins' }" @click="tab = 'logins'; page = 1; load()">{{ t('loginLogs') }}</button>
      <button :class="{ active: tab === 'ops' }" @click="tab = 'ops'; page = 1; load()">{{ t('operationLogs') }}</button>
    </div>

    <div v-if="tab === 'logins'" class="adm-tablewrap">
      <table class="adm-table">
        <thead><tr><th>{{ t('time') }}</th><th>{{ t('user') }}</th><th>{{ t('ip') }}</th><th>{{ t('success') }}</th><th>{{ t('reason') }}</th></tr></thead>
        <tbody>
          <tr v-for="l in rows" :key="l.id">
            <td style="white-space:nowrap">{{ fmtDate(l.created_at) }}</td>
            <td>{{ l.username }}</td><td>{{ l.ip_address }}</td>
            <td><span class="adm-badge" :class="l.success ? 'green' : 'red'">{{ l.success ? '✓' : '✗' }}</span></td>
            <td>{{ l.failure_reason || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="tab === 'ops'" class="adm-tablewrap">
      <table class="adm-table">
        <thead><tr><th>{{ t('time') }}</th><th>{{ t('user') }}</th><th>{{ t('action') }}</th><th>{{ t('resource') }}</th><th>{{ t('detail') }}</th></tr></thead>
        <tbody>
          <tr v-for="l in rows" :key="l.id">
            <td style="white-space:nowrap">{{ fmtDate(l.created_at) }}</td>
            <td>{{ l.username }}</td><td><code>{{ l.action }}</code></td>
            <td>{{ l.resource_type }}<br /><span style="font-size:11px;color:#6b7280">{{ shortId(l.resource_id) }}</span></td>
            <td><div class="adm-ellipsis" :title="detailOf(l)">{{ detailOf(l) }}</div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="adm-tablewrap" style="margin-top:0;border-top:0;border-radius:0 0 10px 10px">
      <div class="adm-pager">
        <button class="adm-btn sm" :disabled="page <= 1" @click="page--; load()">‹</button>
        <span>{{ t('page') }} {{ page }} / {{ totalPages }} · {{ t('total') }} {{ total }}</span>
        <button class="adm-btn sm" :disabled="page >= totalPages" @click="page++; load()">›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAdminApi } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: 'admin' })

const { t, uiLang } = useAdminLocale()
const api = useAdminApi()
const tab = ref('logins')
const rows = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const totalPages = ref(1)

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(uiLang.value === 'zh-cn' ? 'zh-CN' : 'en-US', { hour12: false }) : '—'
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
  totalPages.value = r.pagination?.totalPages || 1
}
onMounted(load)
</script>
