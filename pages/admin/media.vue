<template>
  <div class="space-y-4">
    <!-- Upload panel -->
    <el-card>
      <template #header>
        <span class="text-base font-semibold">{{ t('register') }} / Upload</span>
      </template>

      <el-alert v-if="formError" :title="formError" type="error" :closable="false" show-icon class="mb-4" />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">
            Upload file <span class="text-red-500">*</span>
          </label>
          <input ref="fileInput" type="file" accept="image/*,video/*,.pdf,.svg,.webp" class="media-file-input" @change="onFilePick" />
          <p v-if="pickedName" class="text-xs text-gray-500 mt-1.5">{{ pickedName }} ({{ pickedSize }})</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1.5">
            {{ t('alt') }} <span class="text-xs text-gray-500">[{{ locale }}]</span>
          </label>
          <el-input v-model="alt" />
        </div>
        <div class="flex items-end justify-end">
          <el-button type="primary" :loading="saving" :disabled="!pickedFile" @click="upload">
            Upload
          </el-button>
        </div>
      </div>

      <p class="text-xs text-gray-500 mt-3">Upload goes to Vercel Blob (CDN).</p>
    </el-card>

    <!-- Filter bar -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="flex gap-1.5">
        <el-button
          v-for="f in typeFilters"
          :key="f.value"
          size="small"
          :type="typeFilter === f.value ? 'primary' : ''"
          @click="typeFilter = f.value; page = 1; load()"
        >
          {{ f.label }}
        </el-button>
      </div>
      <div class="flex-1" />
      <el-input
        v-model="search"
        :placeholder="t('search')"
        clearable
        class="w-52"
        @update:model-value="page = 1; load()"
      />
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <div
        v-for="m in rows"
        :key="m.id"
        class="rounded-xl overflow-hidden cursor-pointer bg-gray-900 border border-gray-800 transition hover:-translate-y-0.5 hover:shadow-xl"
        @click="openPreview(m)"
      >
        <div class="aspect-square flex items-center justify-center overflow-hidden bg-black/40">
          <img v-if="isImage(m)" :src="m.file_url" :alt="altOf(m)" loading="lazy" class="w-full h-full object-cover" />
          <video v-else-if="isVideo(m)" :src="m.file_url" preload="metadata" class="w-full h-full object-cover" />
          <div v-else class="text-4xl">{{ fileIcon(m) }}</div>
        </div>
        <div class="px-2.5 py-2">
          <div class="text-xs truncate text-gray-200" :title="fileName(m)">{{ fileName(m) }}</div>
          <div class="text-[11px] text-gray-500 mt-0.5">{{ fmtSize(m.size_bytes) }} · {{ fmtDate(m.created_at) }}</div>
        </div>
      </div>
      <div v-if="!rows.length" class="col-span-full text-center py-10 text-gray-500">
        {{ t('noData') }}
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-500">{{ t('total') }} {{ total }}</p>
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="load"
      />
    </div>

    <!-- Preview dialog -->
    <el-dialog v-model="previewVisible" :title="uiZh ? '媒体预览' : 'Preview'" width="720px">
      <div v-if="preview">
        <div class="flex items-center justify-center bg-black/60 rounded-lg min-h-48 max-h-[50vh] overflow-hidden">
          <img v-if="isImage(preview)" :src="preview.file_url" :alt="altOf(preview)" class="max-w-full max-h-[50vh] object-contain" />
          <video v-else-if="isVideo(preview)" :src="preview.file_url" controls class="max-w-full max-h-[50vh]" />
          <div v-else class="text-center p-8">
            <span class="text-5xl">{{ fileIcon(preview) }}</span>
            <p class="text-sm text-gray-400 mt-2 break-all">{{ fileName(preview) }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-300 mb-1.5">URL</label>
            <div class="flex gap-2">
              <el-input :model-value="preview.file_url" readonly class="flex-1" />
              <el-button @click="copyUrl">
                {{ copied ? '✓' : (uiZh ? '复制' : 'Copy') }}
              </el-button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ t('alt') }} [{{ locale }}]</label>
            <p class="text-sm text-gray-400">{{ altOf(preview) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">Size</label>
            <p class="text-sm text-gray-400">{{ fmtSize(preview.size_bytes) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">MIME</label>
            <p class="text-sm text-gray-400">{{ preview.mime || '—' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-1.5">{{ t('time') }}</label>
            <p class="text-sm text-gray-400">{{ fmtDate(preview.created_at) }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex w-full gap-2">
          <el-button type="danger" plain @click="delMedia">{{ t('delete') }}</el-button>
          <div class="flex-1" />
          <el-button @click="preview = null">{{ t('cancel') }}</el-button>
          <a :href="preview?.file_url" target="_blank">
            <el-button type="primary">{{ uiZh ? '在新标签页打开' : 'Open' }}</el-button>
          </a>
        </div>
      </template>
    </el-dialog>
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

const previewVisible = computed({
  get: () => !!preview.value,
  set: (v: boolean) => { if (!v) preview.value = null },
})

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
function fileInputEl(): HTMLInputElement | null {
  return fileInput.value
}
async function load() {
  const r: any = await api.get('/api/admin/media', { page: page.value, pageSize, type: typeFilter.value, q: search.value || undefined })
  rows.value = r.data || []
  total.value = r.pagination?.total || 0
}
function onFilePick(e: Event) {
  const input = (e.target as HTMLInputElement) || fileInputEl()
  const f = input?.files?.[0] || null
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
    const el = fileInputEl()
    if (el) el.value = ''
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
.media-file-input {
  display: block;
  width: 100%;
  font-size: 13px;
  color: #d1d5db;
}
.media-file-input::file-selector-button {
  margin-right: 12px;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid #4b5563;
  background: #1f2937;
  color: #e5e7eb;
  font-size: 13px;
  cursor: pointer;
}
.media-file-input::file-selector-button:hover {
  background: #374151;
}
</style>
