<template>
  <div>
    <div class="adm-tabs">
      <button :class="{ active: tab === 'settings' }" @click="tab = 'settings'">{{ t('settings') }}</button>
      <button :class="{ active: tab === 'credentials' }" @click="tab = 'credentials'">{{ t('provider') }} / API</button>
    </div>

    <!-- site settings -->
    <div v-if="tab === 'settings'">
      <!-- Basic site settings form -->
      <div class="adm-panel" style="margin-bottom:18px">
        <h2>{{ uiZh ? '网站基础设置' : 'Basic Site Settings' }}</h2>
        <div v-if="basicError" class="adm-error">{{ basicError }}</div>
        <div class="adm-form-grid">
          <div class="adm-field">
            <label>{{ uiZh ? '网站名称' : 'Site Name' }}<span class="req"> *</span></label>
            <input v-model="basicForm['site.name']" class="adm-input" />
          </div>
          <div class="adm-field">
            <label>{{ uiZh ? '站点地址' : 'Site URL' }}</label>
            <input v-model="basicForm['site.url']" class="adm-input" placeholder="https://…" />
          </div>
          <div class="adm-field">
            <label>{{ uiZh ? '网站描述' : 'Site Description' }}</label>
            <input v-model="basicForm['site.description']" class="adm-input" />
          </div>
          <div class="adm-field">
            <label>{{ uiZh ? '时区' : 'Timezone' }}</label>
            <select v-model="basicForm['site.timezone']" class="adm-select">
              <option value="UTC">UTC</option>
              <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="Europe/London">Europe/London</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
            </select>
          </div>
          <div class="adm-field full">
            <label>{{ uiZh ? '版权信息' : 'Copyright' }}</label>
            <input v-model="basicForm['site.copyright']" class="adm-input" />
          </div>
        </div>
        <div style="margin-top:12px">
          <button class="adm-btn primary" :disabled="basicSaving" @click="saveBasic">{{ basicSaving ? t('loading') : t('save') }}</button>
        </div>
      </div>

      <div class="adm-toolbar"><div class="spacer" />
        <button class="adm-btn primary" @click="openNew">+ {{ t('new') }}</button>
      </div>
      <div class="adm-tablewrap">
        <table class="adm-table">
          <thead><tr><th>{{ t('key') }}</th><th>{{ t('value') }}</th><th>{{ t('description') }}</th><th>{{ t('actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="s in settings" :key="s.key">
              <td><code>{{ s.key }}</code></td>
              <td><div class="adm-ellipsis">{{ fmtVal(s.value) }}</div></td>
              <td>{{ s.description || '—' }}</td>
              <td><button class="adm-btn sm" @click="openEdit(s)">{{ t('edit') }}</button></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="editing" class="adm-modal-mask" @click.self="editing = null">
        <div class="adm-modal" style="width:640px">
          <h2>{{ editing.isNew ? t('new') : t('edit') }} — {{ t('settings') }}</h2>
          <div v-if="formError" class="adm-error">{{ formError }}</div>
          <div class="adm-form-grid">
            <div class="adm-field full"><label>{{ t('key') }}<span class="req"> *</span></label>
              <input v-model="form.key" class="adm-input" :disabled="!editing.isNew" /></div>
            <div class="adm-field full"><label>{{ t('value') }}</label>
              <textarea v-model="form.value" class="adm-textarea code" rows="4" placeholder='text or JSON' /></div>
            <div class="adm-field full"><label>{{ t('description') }}</label>
              <input v-model="form.description" class="adm-input" /></div>
          </div>
          <div class="adm-modal-foot">
            <button class="adm-btn" @click="editing = null">{{ t('cancel') }}</button>
            <button class="adm-btn primary" :disabled="saving" @click="saveSetting">{{ t('save') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- credentials -->
    <div v-if="tab === 'credentials'">
      <div class="adm-tablewrap" style="margin-bottom:18px">
        <table class="adm-table">
          <thead><tr><th>{{ t('provider') }}</th><th>{{ t('label') }}</th><th>{{ t('masked') }}</th><th>{{ t('updated') }}</th></tr></thead>
          <tbody>
            <tr v-for="c in creds" :key="c.id">
              <td><code>{{ c.provider }}</code></td><td>{{ c.label || '—' }}</td>
              <td><code>{{ c.masked }}</code></td><td>{{ fmtDate(c.updated_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="adm-panel">
        <h2>{{ t('saveCredential') }}</h2>
        <div v-if="credError" class="adm-error">{{ credError }}</div>
        <div class="adm-form-grid">
          <div class="adm-field"><label>{{ t('provider') }}<span class="req"> *</span></label>
            <input v-model="cred.provider" class="adm-input" placeholder="deepl" /></div>
          <div class="adm-field"><label>{{ t('label') }}</label>
            <input v-model="cred.label" class="adm-input" /></div>
          <div class="adm-field full"><label>{{ t('secret') }}<span class="req"> *</span></label>
            <input v-model="cred.secret" type="password" class="adm-input" autocomplete="new-password" />
            <span class="ph">Full key required every time. Stored AES-256-GCM encrypted.</span></div>
        </div>
        <div style="margin-top:14px"><button class="adm-btn primary" :disabled="credSaving" @click="saveCred">{{ t('saveCredential') }}</button></div>
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
const tab = ref('settings')
const settings = ref<any[]>([])
const creds = ref<any[]>([])
const editing = ref<any | null>(null)
const form = ref({ key: '', value: '', description: '' })
const formError = ref('')
const saving = ref(false)
const cred = ref({ provider: '', label: '', secret: '' })
const credError = ref('')
const credSaving = ref(false)
// Basic site settings form (maps to site_settings keys)
const BASIC_KEYS = ['site.name', 'site.url', 'site.description', 'site.timezone', 'site.copyright']
const basicForm = ref<Record<string, string>>({})
const basicError = ref('')
const basicSaving = ref(false)
const uiZh = computed(() => uiLang.value === 'zh-cn')

function fmtVal(v: any) {
  return typeof v === 'string' ? v : JSON.stringify(v)
}
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(uiLang.value === 'zh-cn' ? 'zh-CN' : 'en-US', { hour12: false }) : '—'
}
async function load() {
  settings.value = await api.get('/api/admin/settings')
  creds.value = await api.get('/api/admin/credentials')
  // Populate basic form from settings
  const map: Record<string, string> = {}
  for (const s of settings.value) {
    if (BASIC_KEYS.includes(s.key)) {
      map[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value)
    }
  }
  for (const k of BASIC_KEYS) if (!(k in map)) map[k] = ''
  basicForm.value = map
}
async function saveBasic() {
  basicError.value = ''
  if (!basicForm.value['site.name']?.trim()) { basicError.value = 'Site Name required'; return }
  basicSaving.value = true
  try {
    for (const k of BASIC_KEYS) {
      await api.put('/api/admin/settings', { key: k, value: basicForm.value[k] || '' })
    }
    await load()
  } catch (e: any) { basicError.value = adminErrorMessage(e) }
  finally { basicSaving.value = false }
}
function openNew() { editing.value = { isNew: true }; form.value = { key: '', value: '', description: '' }; formError.value = '' }
function openEdit(s: any) {
  editing.value = { isNew: false }
  form.value = { key: s.key, value: fmtVal(s.value), description: s.description || '' }
  formError.value = ''
}
function parseVal(s: string) {
  const t = s.trim()
  if (!t) return null
  try { return JSON.parse(t) } catch { return t }
}
async function saveSetting() {
  formError.value = ''
  if (!form.value.key.trim()) { formError.value = `${t('key')} ${t('required')}`; return }
  saving.value = true
  try {
    await api.put('/api/admin/settings', { key: form.value.key.trim(), value: parseVal(form.value.value), description: form.value.description.trim() || null })
    editing.value = null
    await load()
  } catch (e: any) { formError.value = adminErrorMessage(e) }
  finally { saving.value = false }
}
async function saveCred() {
  credError.value = ''
  if (!cred.value.provider.trim() || !cred.value.secret) { credError.value = `${t('secret')} ${t('required')}`; return }
  credSaving.value = true
  try {
    await api.post('/api/admin/credentials', { provider: cred.value.provider.trim(), label: cred.value.label.trim(), secret: cred.value.secret })
    cred.value = { provider: '', label: '', secret: '' }
    await load()
  } catch (e: any) { credError.value = adminErrorMessage(e) }
  finally { credSaving.value = false }
}
onMounted(load)
</script>
