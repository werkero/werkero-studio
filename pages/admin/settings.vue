<template>
  <div>
    <el-tabs v-model="tab">
      <el-tab-pane :label="t('settings')" name="settings" />
      <el-tab-pane :label="t('brand')" name="brand" />
      <el-tab-pane :label="`${t('provider')} / API`" name="credentials" />
    </el-tabs>

    <!-- site settings -->
    <template v-if="tab === 'settings'">
      <!-- Basic site settings form -->
      <el-card style="margin-bottom: 16px">
        <template #header>
          <span style="font-weight: 600">{{ t('basicSiteSettings') }}</span>
        </template>

        <el-alert v-if="basicError" type="error" :title="basicError" show-icon style="margin-bottom: 16px" />

        <el-form label-position="top">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px">
            <el-form-item :label="t('siteName')" required>
              <el-input v-model="basicForm['site.name']" style="width: 100%" />
            </el-form-item>
            <el-form-item :label="t('siteUrl')">
              <el-input v-model="basicForm['site.url']" placeholder="https://…" style="width: 100%" />
            </el-form-item>
            <el-form-item :label="t('siteDesc')">
              <el-input v-model="basicForm['site.description']" style="width: 100%" />
            </el-form-item>
            <el-form-item :label="t('siteTimezone')">
              <el-select v-model="basicForm['site.timezone']" style="width: 100%">
                <el-option v-for="tz in timezoneOptions" :key="tz" :label="tz" :value="tz" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('siteCopyright')" style="grid-column: span 2">
              <el-input v-model="basicForm['site.copyright']" style="width: 100%" />
            </el-form-item>
          </div>
        </el-form>

        <el-button type="primary" :loading="basicSaving" @click="saveBasic">{{ t('save') }}</el-button>
      </el-card>

      <!-- Key-value table -->
      <el-card>
        <template #header>
          <div style="display: flex; align-items: center; justify-content: space-between">
            <span style="font-weight: 600">{{ t('settings') }}</span>
            <el-button type="primary" @click="openNew">+ {{ t('new') }}</el-button>
          </div>
        </template>

        <el-table :data="settings" style="width: 100%">
          <el-table-column prop="key" :label="t('key')">
            <template #default="{ row }"><code>{{ row.key }}</code></template>
          </el-table-column>
          <el-table-column prop="value" :label="t('value')">
            <template #default="{ row }">
              <div style="max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ fmtVal(row.value) }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="description" :label="t('description')">
            <template #default="{ row }">{{ row.description || '—' }}</template>
          </el-table-column>
          <el-table-column :label="t('actions')" width="100">
            <template #default="{ row }">
              <el-button size="small" @click="openEdit(row)">{{ t('edit') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Edit modal -->
      <el-dialog v-model="editingOpen" :title="`${editing?.isNew ? t('new') : t('edit')} — ${t('settings')}`" width="640px">
        <el-alert v-if="formError" type="error" :title="formError" show-icon style="margin-bottom: 16px" />
        <el-form label-position="top">
          <el-form-item :label="t('key')" required>
            <el-input v-model="form.key" :disabled="!editing?.isNew" style="font-family: monospace" />
          </el-form-item>
          <el-form-item :label="t('value')">
            <el-input v-model="form.value" type="textarea" :rows="4" placeholder="text or JSON" style="font-family: monospace" />
          </el-form-item>
          <el-form-item :label="t('description')">
            <el-input v-model="form.description" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="editing = null">{{ t('cancel') }}</el-button>
          <el-button type="primary" :loading="saving" @click="saveSetting">{{ t('save') }}</el-button>
        </template>
      </el-dialog>
    </template>

    <!-- brand -->
    <template v-if="tab === 'brand'">
      <el-card>
        <template #header>
          <span style="font-weight: 600">{{ t('brand') }}</span>
        </template>
        <el-alert v-if="brandError" type="error" :title="brandError" show-icon style="margin-bottom: 16px" />
        <el-form label-position="top">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px">
            <el-form-item :label="t('brandName')" required>
              <el-input v-model="brandForm.name" style="width: 100%" />
            </el-form-item>
            <el-form-item :label="t('contactEmail')">
              <el-input v-model="brandForm.contact_email" type="email" placeholder="hello@…" style="width: 100%" />
            </el-form-item>
            <el-form-item :label="t('domain')">
              <el-input v-model="brandForm.domain" placeholder="https://…" style="width: 100%" />
            </el-form-item>
            <el-form-item :label="t('defaultLocale')">
              <el-select v-model="brandForm.default_locale" style="width: 100%">
                <el-option v-for="l in localeOptions" :key="l" :label="l" :value="l" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('tagline')" style="grid-column: span 2">
              <el-input v-model="brandForm.tagline" type="textarea" :rows="3" placeholder='{"en": "…", "zh-cn": "…"}' style="font-family: monospace; width: 100%" />
            </el-form-item>
            <el-form-item :label="t('socialLinks')" style="grid-column: span 2">
              <el-input v-model="brandForm.social_links" type="textarea" :rows="3" placeholder='{"github": "https://…", "x": "https://…"}' style="font-family: monospace; width: 100%" />
            </el-form-item>
          </div>
        </el-form>
        <el-button type="primary" :loading="brandSaving" @click="saveBrand">{{ t('save') }}</el-button>
      </el-card>
    </template>

    <!-- credentials -->
    <template v-if="tab === 'credentials'">
      <el-card style="margin-bottom: 16px">
        <template #header>
          <span style="font-weight: 600">{{ t('provider') }} / API</span>
        </template>
        <el-table :data="creds" style="width: 100%">
          <el-table-column prop="provider" :label="t('provider')">
            <template #default="{ row }"><code>{{ row.provider }}</code></template>
          </el-table-column>
          <el-table-column prop="label" :label="t('label')">
            <template #default="{ row }">{{ row.label || '—' }}</template>
          </el-table-column>
          <el-table-column prop="masked" :label="t('masked')">
            <template #default="{ row }"><code>{{ row.masked }}</code></template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card>
        <template #header>
          <span style="font-weight: 600">{{ t('saveCredential') }}</span>
        </template>
        <el-alert v-if="credError" type="error" :title="credError" show-icon style="margin-bottom: 16px" />
        <el-form label-position="top">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px">
            <el-form-item :label="t('provider')" required>
              <el-input v-model="cred.provider" placeholder="deepl" style="font-family: monospace" />
            </el-form-item>
            <el-form-item :label="t('label')">
              <el-input v-model="cred.label" />
            </el-form-item>
            <el-form-item :label="t('secret')" required style="grid-column: span 2">
              <el-input v-model="cred.secret" type="password" autocomplete="new-password" />
              <div style="font-size: 12px; color: #909399; margin-top: 4px">{{ t('credHint') }}</div>
            </el-form-item>
          </div>
        </el-form>
        <el-button type="primary" :loading="credSaving" @click="saveCred">{{ t('saveCredential') }}</el-button>
      </el-card>
    </template>
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
const tab = ref('settings')
const settings = ref<any[]>([])
const creds = ref<any[]>([])
const editing = ref<any | null>(null)
const editingOpen = computed({
  get: () => !!editing.value,
  set: (v: boolean) => { if (!v) editing.value = null },
})
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

const timezoneOptions = [
  'UTC',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Europe/Berlin',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
]

function fmtVal(v: any) {
  return typeof v === 'string' ? v : JSON.stringify(v)
}
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(dateLocale.value, { hour12: false }) : '—'
}
async function load() {
  settings.value = await api.get('/api/admin/settings')
  // Populate basic form from settings (independent of credentials load)
  const map: Record<string, string> = {}
  for (const s of settings.value) {
    if (BASIC_KEYS.includes(s.key)) {
      map[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value)
    }
  }
  for (const k of BASIC_KEYS) if (!(k in map)) map[k] = ''
  basicForm.value = map
  try {
    creds.value = await api.get('/api/admin/credentials')
  } catch {
    creds.value = []
  }
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
// Brand tab (brands table)
const brandForm = ref({ name: '', contact_email: '', domain: '', default_locale: 'en', tagline: '', social_links: '' })
const brandError = ref('')
const brandSaving = ref(false)
const localeOptions = ['en', 'zh-cn', 'zh-tw', 'fr', 'de', 'ru', 'ja']
async function loadBrand() {
  try {
    const b = await api.get('/api/admin/brand')
    if (b) {
      brandForm.value = {
        name: b.name || '',
        contact_email: b.contact_email || '',
        domain: b.domain || '',
        default_locale: b.default_locale || 'en',
        tagline: b.tagline ? JSON.stringify(b.tagline, null, 2) : '',
        social_links: b.social_links ? JSON.stringify(b.social_links, null, 2) : '',
      }
    }
  } catch { /* keep form empty; save will surface errors */ }
}
function parseJsonField(s: string, label: string) {
  const t = s.trim()
  if (!t) return {}
  try { return JSON.parse(t) } catch { throw new Error(`${label}: invalid JSON`) }
}
async function saveBrand() {
  brandError.value = ''
  if (!brandForm.value.name.trim()) { brandError.value = `${t('brandName')} ${t('required')}`; return }
  brandSaving.value = true
  try {
    await api.put('/api/admin/brand', {
      name: brandForm.value.name.trim(),
      contact_email: brandForm.value.contact_email.trim(),
      domain: brandForm.value.domain.trim(),
      default_locale: brandForm.value.default_locale,
      tagline: parseJsonField(brandForm.value.tagline, t('tagline')),
      social_links: parseJsonField(brandForm.value.social_links, t('socialLinks')),
    })
    await loadBrand()
  } catch (e: any) {
    brandError.value = e?.message && !String(e.message).startsWith('[') ? e.message : adminErrorMessage(e)
  } finally { brandSaving.value = false }
}
onMounted(() => { load(); loadBrand() })
</script>
