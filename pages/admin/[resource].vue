<template>
  <div>
    <div v-if="!res" class="adm-panel"><p>Unknown resource.</p></div>
    <div v-else>
      <div class="adm-hint">{{ t('currentLocaleOnly') }}</div>
      <div class="adm-toolbar">
        <div class="spacer" />
        <button v-if="canEdit" class="adm-btn primary" @click="openNew">+ {{ t('new') }}</button>
      </div>

      <div class="adm-tablewrap">
        <table class="adm-table">
          <thead>
            <tr>
              <th>{{ t('title') }}</th>
              <th>7 <span style="text-transform:none">locales</span></th>
              <th>{{ t('status') }}</th>
              <th>{{ t('updated') }}</th>
              <th>{{ t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td>
                <div class="adm-ellipsis"><b>{{ titleOf(row) }}</b></div>
                <span v-if="!translated(row)" class="adm-badge amber">{{ t('untranslated') }}</span>
              </td>
              <td><span class="adm-badge" :class="completeOf(row) === 7 ? 'green' : 'gray'">{{ completeOf(row) }}/7</span></td>
              <td><span v-if="row.status" class="adm-badge" :class="statusClass(row.status)">{{ row.status }}</span></td>
              <td style="white-space:nowrap">{{ fmtDate(row.updated_at) }}</td>
              <td>
                <div class="adm-row-actions">
                  <button v-if="canEdit" class="adm-btn sm" @click="openEdit(row)">{{ t('edit') }}</button>
                  <template v-if="canPublish && res.statuses.length">
                    <button v-if="row.status !== 'published'" class="adm-btn sm" @click="setStatus(row, 'published')">{{ t('publish') }}</button>
                    <button v-if="row.status === 'published'" class="adm-btn sm" @click="setStatus(row, 'draft')">{{ t('unpublish') }}</button>
                  </template>
                  <button v-if="canDelete" class="adm-btn sm danger" @click="remove(row)">{{ t('delete') }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="adm-pager">
          <button class="adm-btn sm" :disabled="page <= 1" @click="goPage(page - 1)">‹</button>
          <span>{{ t('page') }} {{ page }} / {{ totalPages }} · {{ t('total') }} {{ total }}</span>
          <button class="adm-btn sm" :disabled="page >= totalPages" @click="goPage(page + 1)">›</button>
        </div>
      </div>

      <!-- edit modal -->
      <div v-if="editing" class="adm-modal-mask" @click.self="closeEdit">
        <div class="adm-modal">
          <h2>{{ editing.id ? t('edit') : t('new') }} — {{ uiZh ? res.nameZh : res.name }}</h2>
          <p class="adm-hint">{{ t('currentLocaleOnly') }}</p>
          <div v-if="formError" class="adm-error">{{ formError }}</div>
          <div class="adm-form-grid">
            <div v-for="f in res.fields" :key="f.key" class="adm-field" :class="{ full: ['textarea','markdown','json'].includes(f.type) }">
              <label>
                {{ f.label }}<span v-if="f.required" class="req"> *</span>
                <span v-if="f.i18n" class="i18ntag">[{{ locale }}]</span>
              </label>
              <input v-if="f.type === 'text'" v-model="form[f.key]" class="adm-input" :placeholder="f.placeholder" />
              <input v-if="f.type === 'number'" v-model="form[f.key]" type="number" class="adm-input" />
              <select v-if="f.type === 'select'" v-model="form[f.key]" class="adm-select">
                <option value="">—</option>
                <option v-for="o in f.options" :key="o.value" :value="o.value">{{ o.label }}</option>
              </select>
              <textarea v-if="f.type === 'textarea'" v-model="form[f.key]" class="adm-textarea" :placeholder="f.placeholder" />
              <textarea v-if="f.type === 'markdown'" v-model="form[f.key]" class="adm-textarea code" rows="8" placeholder="Markdown…" />
              <textarea v-if="f.type === 'json'" v-model="form[f.key]" class="adm-textarea code" rows="4" :placeholder="f.placeholder || (f.lines ? 'one per line' : 'JSON')" />
              <span v-if="f.placeholder && f.type !== 'json'" class="ph">{{ f.placeholder }}</span>
            </div>
          </div>
          <div class="adm-modal-foot">
            <button class="adm-btn" @click="closeEdit">{{ t('cancel') }}</button>
            <button class="adm-btn primary" :disabled="saving" @click="save">{{ saving ? t('loading') : t('save') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ADMIN_RESOURCES, i18nCompleteness, i18nPick, type AdminField } from '~/utils/admin-resources'
import { useAdminApi, adminErrorMessage } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: 'admin' })

const route = useRoute()
const { t, locale, uiLang } = useAdminLocale()
const uiZh = computed(() => uiLang.value === 'zh-cn')
const api = useAdminApi()

const res = computed(() => ADMIN_RESOURCES[route.params.resource as string])
const me = useState<any>('admin-me')
const can = (p: string) => (me.value?.permissions || []).includes(p)
const canEdit = computed(() => res.value && can(`${res.value.perm}.edit`))
const canPublish = computed(() => res.value && (can(`${res.value.perm}.publish`) || can(`${res.value.perm}.moderate`)))
const canDelete = computed(() => res.value && can(`${res.value.perm}.delete`))

const rows = ref<any[]>([])
const page = ref(1)
const pageSize = 20
const total = ref(0)
const totalPages = ref(1)

const editing = ref<any | null>(null) // row or {id:null}
const form = ref<Record<string, any>>({})
const formError = ref('')
const saving = ref(false)

function titleOf(row: any) {
  const f = res.value.titleField
  const v = row[f]
  const s = i18nPick(v, locale.value)
  return s || row.slug || row.page_key || row.id.slice(0, 8)
}
function translated(row: any) {
  const v = row[res.value.titleField]
  if (v == null) return false
  if (typeof v === 'string') return v !== ''
  return (v as any)[locale.value] != null && (v as any)[locale.value] !== ''
}
function completeOf(row: any) {
  return i18nCompleteness(row[res.value.titleField])
}
function statusClass(s: string) {
  return s === 'published' || s === 'approved' ? 'green' : s === 'archived' || s === 'rejected' || s === 'spam' ? 'gray' : 'amber'
}
function fmtDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleString(uiZh.value ? 'zh-CN' : 'en-US', { hour12: false })
}

async function load() {
  if (!res.value) return
  const r: any = await api.get(`/api/admin/${res.value.slug}`, { page: page.value, pageSize, locale: locale.value })
  rows.value = r.data || []
  total.value = r.pagination?.total || 0
  totalPages.value = r.pagination?.totalPages || 1
}
function goPage(p: number) { page.value = p; load() }

/** Convert a stored value into an editable string for the form. */
function toForm(f: AdminField, row: any): string {
  const raw = row[f.key]
  if (raw == null) return ''
  if (f.i18n && typeof raw === 'object') {
    const v = (raw as any)[locale.value]
    if (v == null) return ''
    if (f.lines && Array.isArray(v)) return v.join('\n')
    if (typeof v === 'object') return JSON.stringify(v, null, 2)
    return String(v)
  }
  if (f.type === 'json') {
    if (f.lines && Array.isArray(raw)) return raw.join('\n')
    return typeof raw === 'object' ? JSON.stringify(raw, null, 2) : String(raw)
  }
  if (typeof raw === 'boolean') return String(raw)
  return String(raw)
}

/** Convert a form string back into the API value. */
function fromForm(f: AdminField, s: string): any {
  const str = (s ?? '').trim()
  if (str === '') return undefined // skip → don't overwrite other locales
  if (f.type === 'number') { const n = Number(str); return Number.isNaN(n) ? undefined : n }
  if (f.type === 'json') {
    if (f.lines) return str.split('\n').map((x) => x.trim()).filter(Boolean)
    return JSON.parse(str) // throws on invalid JSON → caught by save()
  }
  if (f.key === 'noindex') return str === 'true'
  return str
}

function openNew() {
  editing.value = { id: null }
  form.value = {}
  formError.value = ''
  for (const f of res.value.fields) {
    form.value[f.key] = f.type === 'select' && f.key === 'status' ? 'draft' : ''
  }
}
function openEdit(row: any) {
  editing.value = row
  form.value = {}
  formError.value = ''
  for (const f of res.value.fields) form.value[f.key] = toForm(f, row)
}
function closeEdit() { editing.value = null }

async function save() {
  formError.value = ''
  const data: Record<string, any> = {}
  try {
    for (const f of res.value.fields) {
      if (f.required && !String(form.value[f.key] ?? '').trim() && !editing.value.id) {
        formError.value = `${f.label} ${t('required')}`
        return
      }
      const v = fromForm(f, form.value[f.key] ?? '')
      if (v !== undefined) data[f.key] = v
    }
  } catch {
    formError.value = 'Invalid JSON'
    return
  }
  saving.value = true
  try {
    const body = { locale: locale.value, data }
    if (editing.value.id) await api.put(`/api/admin/${res.value.slug}/${editing.value.id}`, body)
    else await api.post(`/api/admin/${res.value.slug}`, body)
    closeEdit()
    await load()
  } catch (e: any) {
    formError.value = adminErrorMessage(e)
  } finally {
    saving.value = false
  }
}

async function setStatus(row: any, status: string) {
  try {
    await api.patch(`/api/admin/${res.value.slug}/${row.id}`, { status })
    await load()
  } catch (e: any) {
    alert(adminErrorMessage(e))
  }
}

async function remove(row: any) {
  if (!confirm(t('confirmDelete'))) return
  try {
    await api.del(`/api/admin/${res.value.slug}/${row.id}`)
    await load()
  } catch (e: any) {
    alert(adminErrorMessage(e))
  }
}

watch([() => route.params.resource, locale], () => { page.value = 1; load() })
onMounted(load)
</script>
