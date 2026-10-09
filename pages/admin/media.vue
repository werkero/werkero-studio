<template>
  <div>
    <!-- Upload panel -->
    <div class="adm-panel">
      <h2>{{ t('register') }} / Upload</h2>
      <div v-if="formError" class="adm-error">{{ formError }}</div>
      <div class="adm-form-grid">
        <div class="adm-field full">
          <label>Upload file<span class="req"> *</span></label>
          <input ref="fileInput" type="file" class="adm-input" accept="image/*,video/*,.pdf,.svg,.webp" @change="onFilePick" />
          <span v-if="pickedName" class="ph">{{ pickedName }} ({{ pickedSize }})</span>
        </div>
        <div class="adm-field">
          <label>{{ t('alt') }}<span class="i18ntag">[{{ locale }}]</span></label>
          <input v-model="alt" class="adm-input" />
        </div>
        <div class="adm-field" style="justify-content:flex-end">
          <div><button class="adm-btn primary" :disabled="saving || !pickedFile" @click="upload">{{ saving ? t('loading') : 'Upload' }}</button></div>
        </div>
      </div>
      <p class="adm-hint" style="margin:12px 0 0">Upload goes to Vercel Blob (CDN).</p>
    </div>

    <!-- Filter bar -->
    <div class="adm-toolbar" style="margin:16px 0 12px">
      <div class="adm-filter-group">
        <button v-for="f in typeFilters" :key="f.value" class="adm-btn sm" :class="{ primary: typeFilter === f.value }" @click="typeFilter = f.value; page = 1; load()">{{ f.label }}</button>
      </div>
      <div class="spacer" />
      <input v-model="search" class="adm-input sm" :placeholder="t('search')" style="width:200px" @input="page = 1; load()" />
    </div>

    <!-- Grid -->
    <div class="media-grid">
      <div v-for="m in rows" :key="m.id" class="media-card" @click="openPreview(m)">
        <div class="media-thumb">
          <img v-if="isImage(m)" :src="m.file_url" :alt="altOf(m)" loading="lazy" />
          <video v-else-if="isVideo(m)" :src="m.file_url" preload="metadata" />
          <div v-else class="media-fileicon">{{ fileIcon(m) }}</div>
        </div>
        <div class="media-meta">
          <div class="media-name" :title="fileName(m)">{{ fileName(m) }}</div>
          <div class="media-sub">{{ fmtSize(m.size_bytes) }} · {{ fmtDate(m.created_at) }}</div>
        </div>
      </div>
      <div v-if="!rows.length" class="media-empty">{{ t('noData') }}</div>
    </div>

    <div class="adm-pager" style="margin-top:12px">
      <button class="adm-btn sm" :disabled="page <= 1" @click="page--; load()">‹</button>
      <span>{{ t('page') }} {{ page }} / {{ totalPages }} · {{ t('total') }} {{ total }}</span>
      <button class="adm-btn sm" :disabled="page >= totalPages" @click="page++; load()">›</button>
    </div>

    <!-- Preview modal -->
    <div v-if="preview" class="adm-modal-mask" @click.self="preview = null">
      <div class="adm-modal" style="width:720px;max-width:94vw">
        <h2>{{ uiZh ? '媒体预览' : 'Preview' }}</h2>
        <div class="media-preview-body">
          <img v-if="isImage(preview)" :src="preview.file_url" :alt="altOf(preview)" class="media-preview-img" />
          <video v-else-if="isVideo(preview)" :src="preview.file_url" controls class="media-preview-img" />
          <div v-else class="media-preview-file"><span style="font-size:48px">{{ fileIcon(preview) }}</span><p>{{ fileName(preview) }}</p></div>
        </div>
        <div class="adm-form-grid" style="margin-top:12px">
          <div class="adm-field full"><label>URL</label>
            <div style="display:flex;gap:8px"><input :value="preview.file_url" readonly class="adm-input" /><button class="adm-btn sm" @click="copyUrl">{{ copied ? '✓' : (uiZh ? '复制' : 'Copy') }}</button></div>
          </div>
          <div class="adm-field"><label>{{ t('alt') }} [{{ locale }}]</label><div>{{ altOf(preview) }}</div></div>
          <div class="adm-field"><label>Size</label><div>{{ fmtSize(preview.size_bytes) }}</div></div>
          <div class="adm-field"><label>MIME</label><div>{{ preview.mime || '—' }}</div></div>
          <div class="adm-field"><label>{{ t('time') }}</label><div>{{ fmtDate(preview.created_at) }}</div></div>
        </div>
        <div class="adm-modal-foot">
          <button class="adm-btn danger" @click="delMedia">{{ t('delete') }}</button>
          <div class="spacer" />
          <button class="adm-btn" @click="preview = null">{{ t('cancel') }}</button>
          <a :href="preview.file_url" target="_blank" class="adm-btn primary">{{ uiZh ? '在新标签页打开' : 'Open' }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { i18nPick } from '~/utils/admin-resources'
import { useAdminApi, adminAuthHeaders, adminErrorMessage } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: 'admin' })

const { t, locale, uiLang } = useAdminLocale()
const uiZh = computed(() => uiLang.value === 'zh-cn')
const api = useAdminApi()
const rows = ref<any[]>([])
const page = ref(1)
const pageSize = 24
const total = ref(0)
const totalPages = ref(1)
const alt = ref('')
const saving = ref(false)
const formError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const pickedFile = ref<File | null>(null)
const pickedName = ref('')
const pickedSize = ref('')
const typeFilter = ref('all')
const search = ref('')
const preview = ref<any | null>(null)
const copied = ref(false)

const typeFilters = computed(() => [
  { value: 'all', label: uiZh.value ? '全部' : 'All' },
  { value: 'image', label: uiZh.value ? '图片' : 'Images' },
  { value: 'video', label: uiZh.value ? '视频' : 'Videos' },
  { value: 'other', label: uiZh.value ? '其他' : 'Other' },
])

function altOf(m: any) { return i18nPick(m.alt_text, locale.value) || '—' }
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(uiLang.value === 'zh-cn' ? 'zh-CN' : 'en-US', { hour12: false }) : '—'
}
function fmtSize(b: any) {
  if (!b) return '—'
  const n = Number(b)
  return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'
}
function fileName(m: any) {
  try {
    const u = new URL(m.file_url)
    return decodeURIComponent(u.pathname.split('/').pop() || m.file_url)
  } catch { return m.file_url }
}
function isImage(m: any) { return (m.mime || '').startsWith('image/') }
function isVideo(m: any) { return (m.mime || '').startsWith('video/') }
function fileIcon(m: any) {
  const mt = m.mime || ''
  if (mt.includes('pdf')) return '📄'
  if (mt.includes('zip') || mt.includes('archive')) return '📦'
  return '📁'
}
async function load() {
  const r: any = await api.get('/api/admin/media', { page: page.value, pageSize, type: typeFilter.value, q: search.value || undefined })
  rows.value = r.data || []
  total.value = r.pagination?.total || 0
  totalPages.value = r.pagination?.totalPages || 1
}
function onFilePick() {
  const f = fileInput.value?.files?.[0] || null
  pickedFile.value = f
  pickedName.value = f ? f.name : ''
  pickedSize.value = f ? (f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(f.size / 1024)) + ' KB') : ''
}
async function upload() {
  formError.value = ''
  if (!pickedFile.value) return
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('file', pickedFile.value)
    fd.append('alt', alt.value.trim())
    fd.append('locale', locale.value)
    await $fetch('/api/admin/media/upload', { method: 'POST', body: fd, headers: adminAuthHeaders() })
    alt.value = ''
    pickedFile.value = null; pickedName.value = ''; pickedSize.value = ''
    if (fileInput.value) fileInput.value.value = ''
    await load()
  } catch (e: any) { formError.value = adminErrorMessage(e) }
  finally { saving.value = false }
}
function openPreview(m: any) { preview.value = m; copied.value = false }
async function copyUrl() {
  try { await navigator.clipboard.writeText(preview.value.file_url); copied.value = true } catch {}
}
async function delMedia() {
  if (!preview.value || !confirm(t('confirmDelete'))) return
  try {
    await api.del(`/api/admin/media/${preview.value.id}`)
    preview.value = null
    await load()
  } catch (e: any) { formError.value = adminErrorMessage(e) }
}
onMounted(load)
</script>

<style scoped>
.media-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
.media-card { border: 1px solid var(--adm-border, #2a2a35); border-radius: 10px; overflow: hidden; cursor: pointer; background: var(--adm-panel, #16161d); transition: transform .15s, box-shadow .15s; }
.media-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.35); }
.media-thumb { aspect-ratio: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #0d0d12; }
.media-thumb img, .media-thumb video { width: 100%; height: 100%; object-fit: cover; }
.media-fileicon { font-size: 40px; }
.media-meta { padding: 8px 10px; }
.media-name { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.media-sub { font-size: 11px; opacity: .55; margin-top: 2px; }
.media-empty { grid-column: 1 / -1; text-align: center; padding: 40px; opacity: .5; }
.media-preview-body { display: flex; align-items: center; justify-content: center; background: #0d0d12; border-radius: 8px; min-height: 200px; max-height: 50vh; overflow: hidden; }
.media-preview-img { max-width: 100%; max-height: 50vh; object-fit: contain; }
.media-preview-file { text-align: center; padding: 32px; }
.adm-filter-group { display: flex; gap: 6px; }
</style>
