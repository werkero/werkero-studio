<template>
  <div>
    <div class="adm-panel">
      <h2>{{ t('register') }} URL</h2>
      <div v-if="formError" class="adm-error">{{ formError }}</div>
      <div class="adm-form-grid">
        <div class="adm-field full">
          <label>{{ t('fileUrl') }}<span class="req"> *</span></label>
          <input v-model="fileUrl" class="adm-input" placeholder="https://…" />
        </div>
        <div class="adm-field">
          <label>{{ t('alt') }}<span class="i18ntag">[{{ locale }}]</span></label>
          <input v-model="alt" class="adm-input" />
        </div>
        <div class="adm-field" style="justify-content:flex-end">
          <div><button class="adm-btn primary" :disabled="saving" @click="register">{{ saving ? t('loading') : t('register') }}</button></div>
        </div>
      </div>
      <p class="adm-hint" style="margin:12px 0 0">Phase 1: upload the file to object storage yourself, then register its URL here.</p>
    </div>

    <div class="adm-tablewrap">
      <table class="adm-table">
        <thead><tr><th>URL</th><th>{{ t('alt') }}</th><th>{{ t('time') }}</th></tr></thead>
        <tbody>
          <tr v-for="m in rows" :key="m.id">
            <td><div class="adm-ellipsis"><a :href="m.file_url" target="_blank">{{ m.file_url }}</a></div></td>
            <td>{{ altOf(m) }}</td>
            <td style="white-space:nowrap">{{ fmtDate(m.created_at) }}</td>
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
import { i18nPick } from '~/utils/admin-resources'
import { useAdminApi, adminErrorMessage } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: 'admin' })

const { t, locale, uiLang } = useAdminLocale()
const api = useAdminApi()
const rows = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const totalPages = ref(1)
const fileUrl = ref('')
const alt = ref('')
const saving = ref(false)
const formError = ref('')

function altOf(m: any) { return i18nPick(m.alt_text, locale.value) || '—' }
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(uiLang.value === 'zh-cn' ? 'zh-CN' : 'en-US', { hour12: false }) : '—'
}
async function load() {
  const r: any = await api.get('/api/admin/media', { page: page.value, pageSize })
  rows.value = r.data || []
  total.value = r.pagination?.total || 0
  totalPages.value = r.pagination?.totalPages || 1
}
async function register() {
  formError.value = ''
  if (!fileUrl.value.trim()) { formError.value = `${t('fileUrl')} ${t('required')}`; return }
  saving.value = true
  try {
    await api.post('/api/admin/media', { locale: locale.value, file_url: fileUrl.value.trim(), alt: alt.value.trim() || undefined })
    fileUrl.value = ''; alt.value = ''
    await load()
  } catch (e: any) { formError.value = adminErrorMessage(e) }
  finally { saving.value = false }
}
onMounted(load)
</script>
