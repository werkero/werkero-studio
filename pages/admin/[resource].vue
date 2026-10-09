<template>
  <div>
    <div v-if="!res">
      <el-card><p>Unknown resource.</p></el-card>
    </div>
    <div v-else>
      <p style="margin-bottom: 16px; color: #909399; font-size: 13px;">
        {{ t('currentLocaleOnly') }} <el-tag type="info" size="small">[{{ locale }}]</el-tag>
      </p>
      <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
        <el-button v-if="canEdit" type="primary" @click="openNew">+ {{ t('new') }}</el-button>
      </div>

      <el-card>
        <el-table :data="rows" style="width: 100%">
          <el-table-column :label="t('title')" min-width="220">
            <template #default="{ row }">
              <div style="font-weight: 600;">{{ titleOf(row) }}</div>
              <el-tag v-if="!translated(row)" type="warning" size="small" style="margin-top: 4px;">{{ t('untranslated') }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="7 locales" width="100">
            <template #default="{ row }">
              <el-tag :type="completeOf(row) === 7 ? 'success' : 'info'" size="small">{{ completeOf(row) }}/7</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('status')" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.status" :type="statusType(row.status)" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('updated')" width="170">
            <template #default="{ row }">
              <span style="white-space: nowrap;">{{ fmtDate(row.updated_at) }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('actions')" width="260" fixed="right">
            <template #default="{ row }">
              <el-button v-if="canEdit" size="small" @click="openEdit(row)">{{ t('edit') }}</el-button>
              <template v-if="canPublish && res.statuses.length">
                <el-button v-if="row.status !== 'published'" size="small" @click="setStatus(row, 'published')">{{ t('publish') }}</el-button>
                <el-button v-if="row.status === 'published'" size="small" @click="setStatus(row, 'draft')">{{ t('unpublish') }}</el-button>
              </template>
              <el-button v-if="canDelete" size="small" type="danger" @click="remove(row)">{{ t('delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="display: flex; justify-content: center; margin-top: 16px;">
          <el-pagination
            v-model:current-page="page"
            :page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="load"
          />
        </div>
      </el-card>

      <!-- edit dialog -->
      <el-dialog
        v-model="showModal"
        :title="`${editing?.id ? t('edit') : t('new')} — ${uiZh ? res.nameZh : res.name}`"
        width="720px"
      >
        <p style="color: #909399; font-size: 13px; margin-bottom: 12px;">
          {{ t('currentLocaleOnly') }} <el-tag type="info" size="small">[{{ locale }}]</el-tag>
        </p>
        <el-alert v-if="formError" type="error" :closable="false" :title="formError" style="margin-bottom: 16px;" />
        <el-form label-position="top">
          <el-row :gutter="16">
            <el-col v-for="f in res.fields" :key="f.key" :span="['textarea','markdown','json'].includes(f.type) ? 24 : 12">
              <el-form-item>
                <template #label>
                  {{ f.label }}<span v-if="f.required" style="color: #f56c6c;"> *</span>
                  <el-tag v-if="f.i18n" type="info" size="small" style="margin-left: 4px;">[{{ locale }}]</el-tag>
                </template>
                <el-input v-if="f.type === 'text'" v-model="form[f.key]" :placeholder="f.placeholder" />
                <el-input v-if="f.type === 'number'" v-model="form[f.key]" type="number" />
                <el-select v-if="f.type === 'select'" v-model="form[f.key]" style="width: 100%;">
                  <el-option label="—" value="" />
                  <el-option v-for="o in f.options" :key="o.value" :label="o.label" :value="o.value" />
                </el-select>
                <el-input v-if="f.type === 'textarea'" v-model="form[f.key]" type="textarea" :rows="3" :placeholder="f.placeholder" />
                <el-input
                  v-if="f.type === 'markdown'"
                  v-model="form[f.key]"
                  type="textarea"
                  :rows="8"
                  placeholder="Markdown…"
                  :input-style="{ fontFamily: 'monospace' }"
                />
                <el-input
                  v-if="f.type === 'json'"
                  v-model="form[f.key]"
                  type="textarea"
                  :rows="4"
                  :placeholder="f.placeholder || (f.lines ? 'one per line' : 'JSON')"
                  :input-style="{ fontFamily: 'monospace' }"
                />
                <div v-if="f.placeholder && f.type !== 'json'" style="color: #909399; font-size: 12px; margin-top: 4px;">{{ f.placeholder }}</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <template #footer>
          <el-button @click="closeEdit">{{ t('cancel') }}</el-button>
          <el-button type="primary" :loading="saving" @click="save">{{ t('save') }}</el-button>
        </template>
      </el-dialog>
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

const editing = ref<any | null>(null)
const showModal = computed({
  get: () => !!editing.value,
  set: (v: boolean) => { if (!v) closeEdit() },
})
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
function statusType(s: string) {
  return s === 'published' || s === 'approved' ? 'success' : s === 'archived' || s === 'rejected' || s === 'spam' ? 'info' : 'warning'
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
}

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
