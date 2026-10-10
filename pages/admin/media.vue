<template>
  <div class="media-lib">
    <!-- Toolbar -->
    <div class="media-toolbar">
      <el-radio-group v-model="typeFilter" size="default" @change="page = 1; load()">
        <el-radio-button v-for="f in typeFilters" :key="f.value" :value="f.value">
          {{ f.label }}
        </el-radio-button>
      </el-radio-group>
      <div class="toolbar-spacer" />
      <el-input
        v-model="search"
        :placeholder="t('search')"
        clearable
        class="media-search"
        @update:model-value="page = 1; load()"
      >
        <template #prefix><span class="search-icon">🔍</span></template>
      </el-input>
      <el-button type="primary" class="upload-btn" @click="uploadDialogVisible = true">
        <span class="upload-plus">＋</span> {{ t('upload') }}
      </el-button>
    </div>

    <!-- Selection bar -->
    <transition name="slide-down">
      <div v-if="selected.size" class="selection-bar">
        <el-tag type="primary" effect="dark" round>{{ selected.size }} {{ t('selectedItems') }}</el-tag>
        <el-button type="danger" size="small" :loading="batchDeleting" @click="batchDelete">
          {{ t('batchDelete') }}
        </el-button>
        <el-button size="small" text @click="selected.clear()">{{ t('clearSelection') }}</el-button>
      </div>
    </transition>

    <!-- Grid -->
    <div v-if="rows.length" class="media-grid">
      <div
        v-for="m in rows"
        :key="m.id"
        class="media-card"
        :class="{ selected: selected.has(m.id) }"
        @click="toggleSelect(m)"
      >
        <div class="thumb">
          <img v-if="isImage(m)" :src="m.url" :alt="altOf(m)" loading="lazy" />
          <video v-else-if="isVideo(m)" :src="m.url" preload="metadata" />
          <div v-else class="file-glyph">{{ fileIcon(m) }}</div>

          <!-- video play overlay -->
          <div v-if="isVideo(m)" class="play-badge"><span>▶</span></div>
          <!-- extension badge for non-media -->
          <div v-if="!isImage(m) && !isVideo(m)" class="ext-badge">{{ extOf(m) }}</div>

          <!-- selection checkbox -->
          <div class="check" :class="{ on: selected.has(m.id) }" @click.stop="toggleSelect(m)">
            <span v-if="selected.has(m.id)">✓</span>
          </div>

          <!-- hover quick actions -->
          <div class="overlay" @click.stop>
            <button class="icon-btn" :title="t('mediaPreview')" @click="openPreview(m)">👁</button>
            <button class="icon-btn" :title="t('copy')" @click="copyQuick(m, $event)">
              {{ copiedId === m.id ? '✓' : '⧉' }}
            </button>
            <button class="icon-btn danger" :title="t('delete')" @click="delQuick(m)">🗑</button>
          </div>
        </div>
        <div class="meta">
          <div class="name" :title="fileName(m)">{{ fileName(m) }}</div>
          <div class="sub">{{ fmtDate(m.created_at) }}</div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">🖼️</div>
      <h3 class="empty-title">{{ t('emptyTitle') }}</h3>
      <p class="empty-hint">{{ t('emptyHint') }}</p>
      <el-button type="primary" size="large" @click="uploadDialogVisible = true">
        <span class="upload-plus">＋</span> {{ t('upload') }}
      </el-button>
    </div>

    <!-- Pagination -->
    <div v-if="rows.length" class="media-pagination">
      <p class="total-line">{{ t('total') }} {{ total }}</p>
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        @current-change="load"
      />
    </div>

    <!-- Upload dialog -->
    <el-dialog v-model="uploadDialogVisible" :title="t('upload')" width="520px" :close-on-click-modal="false" class="media-dialog">
      <el-alert v-if="formError" :title="formError" type="error" :closable="false" show-icon class="dialog-alert" />

      <el-upload
        ref="uploadRef"
        drag
        :auto-upload="false"
        :show-file-list="true"
        :limit="1"
        :on-change="onFileChange"
        :on-remove="onFileRemove"
        accept="image/*,video/*,.pdf,.svg,.webp"
        class="upload-drop"
      >
        <div class="drop-inner">
          <div class="drop-icon">📁</div>
          <div class="drop-hint">{{ t('dragDropHint') }}</div>
          <div class="drop-sub">{{ t('orClickHint') }}</div>
        </div>
      </el-upload>

      <el-form label-position="top">
        <el-form-item :label="t('alt') + ' [' + locale + ']'">
          <el-input v-model="alt" :placeholder="t('altPlaceholder')" />
        </el-form-item>
      </el-form>

      <el-progress v-if="uploadProgress > 0 && uploadProgress < 100" :percentage="uploadProgress" class="upload-progress" />

      <template #footer>
        <el-button @click="uploadDialogVisible = false">{{ t('close') }}</el-button>
        <el-button type="primary" :loading="saving" :disabled="!pickedFile" @click="upload">
          {{ t('upload') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- Preview dialog -->
    <el-dialog v-model="previewVisible" :title="t('mediaPreview')" width="720px" class="media-dialog">
      <div v-if="preview">
        <div class="preview-stage">
          <img v-if="isImage(preview)" :src="preview.url" :alt="altOf(preview)" />
          <video v-else-if="isVideo(preview)" :src="preview.url" controls />
          <div v-else class="preview-file">
            <span class="preview-glyph">{{ fileIcon(preview) }}</span>
            <p class="preview-name">{{ fileName(preview) }}</p>
          </div>
        </div>

        <div class="preview-meta">
          <div class="meta-row span-2">
            <label>URL</label>
            <div class="url-row">
              <el-input :model-value="preview.url" readonly class="url-input" />
              <el-button @click="copyUrl">{{ copied ? '✓' : t('copy') }}</el-button>
            </div>
          </div>
          <div class="meta-row">
            <label>{{ t('alt') }} [{{ locale }}]</label>
            <p>{{ altOf(preview) }}</p>
          </div>
          <div class="meta-row">
            <label>MIME</label>
            <p>{{ preview.mime_type || '—' }}</p>
          </div>
          <div class="meta-row">
            <label>{{ t('time') }}</label>
            <p>{{ fmtDate(preview.created_at) }}</p>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="preview-footer">
          <el-button type="danger" plain @click="delMedia">{{ t('delete') }}</el-button>
          <div class="footer-spacer" />
          <el-button @click="preview = null">{{ t('cancel') }}</el-button>
          <a :href="preview?.url" target="_blank" rel="noopener">
            <el-button type="primary">{{ t('openInNewTab') }}</el-button>
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
import { upload as uploadToBlob } from '@vercel/blob/client'

definePageMeta({ layout: 'admin' })

const { t, locale, uiLang } = useAdminLocale()
const dateLocale = computed(() => {
  const map: Record<string, string> = { 'en': 'en-US', 'zh-cn': 'zh-CN', 'zh-tw': 'zh-TW', 'fr': 'fr-FR', 'de': 'de-DE', 'ru': 'ru-RU', 'ja': 'ja-JP' }
  return map[uiLang.value] || 'en-US'
})
const api = useAdminApi()
const rows = ref<any[]>([])
const page = ref(1)
const pageSize = 24
const total = ref(0)
const alt = ref('')
const saving = ref(false)
const formError = ref('')
const pickedFile = ref<File | null>(null)
const pickedName = ref('')
const pickedSize = ref('')
const typeFilter = ref('all')
const search = ref('')
const preview = ref<any | null>(null)
const copied = ref(false)
const copiedId = ref<string | null>(null)
const selected = ref(new Set<string>())
const batchDeleting = ref(false)

const uploadDialogVisible = ref(false)
const uploadRef = ref()
const uploadProgress = ref(0)
const previewVisible = computed({
  get: () => !!preview.value,
  set: (v: boolean) => { if (!v) preview.value = null },
})

const typeFilters = computed(() => [
  { value: 'all', label: t('filterAll') },
  { value: 'image', label: t('filterImages') },
  { value: 'video', label: t('filterVideos') },
  { value: 'other', label: t('filterOther') },
])

function altOf(m: any) { return i18nPick(m.alt_text, locale.value) || '—' }
function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(dateLocale.value, { hour12: false }) : '—'
}
function fileName(m: any) {
  try {
    const u = new URL(m.url)
    return decodeURIComponent(u.pathname.split('/').pop() || m.url)
  } catch { return m.url }
}
function extOf(m: any) {
  const n = fileName(m)
  const i = n.lastIndexOf('.')
  return i > 0 ? n.slice(i + 1, i + 5).toUpperCase() : 'FILE'
}
function isImage(m: any) { return (m.mime_type || '').startsWith('image/') }
function isVideo(m: any) { return (m.mime_type || '').startsWith('video/') }
function fileIcon(m: any) {
  const mt = m.mime_type || ''
  if (mt.includes('pdf')) return '📄'
  if (mt.includes('zip') || mt.includes('archive')) return '📦'
  return '📁'
}
async function load() {
  const r: any = await api.get('/api/admin/media', { page: page.value, pageSize, type: typeFilter.value, q: search.value || undefined })
  rows.value = r.data || []
  total.value = r.pagination?.total || 0
}
function toggleSelect(m: any) {
  const s = selected.value
  if (s.has(m.id)) s.delete(m.id)
  else s.add(m.id)
}
function onFileChange(file: any) {
  pickedFile.value = file.raw || null
  pickedName.value = file.name || ''
  const sz = file.size || 0
  pickedSize.value = sz > 1048576 ? (sz / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(sz / 1024)) + ' KB'
}
function onFileRemove() {
  pickedFile.value = null
  pickedName.value = ''
  pickedSize.value = ''
}
async function upload() {
  formError.value = ''
  if (!pickedFile.value) return
  saving.value = true
  try {
    // Direct browser-to-Blob upload (bypasses server 4.5MB limit)
    const filename = pickedFile.value.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    uploadProgress.value = 10
    const blob = await uploadToBlob(`media/${Date.now()}-${filename}`, pickedFile.value, {
      access: 'public',
      handleUploadUrl: '/api/admin/media/client-token',
      headers: adminAuthHeaders(),
    })
    uploadProgress.value = 80
    // Register metadata (tiny JSON payload, no 413)
    await api.post('/api/admin/media/register', {
      url: blob.url,
      pathname: blob.pathname,
      mime: pickedFile.value.type || null,
      alt: alt.value.trim(),
      locale: locale.value,
    })
    alt.value = ''
    pickedFile.value = null; pickedName.value = ''; pickedSize.value = ''
    uploadProgress.value = 0
    uploadRef.value?.clearFiles()
    uploadDialogVisible.value = false
    await load()
  } catch (e: any) { formError.value = adminErrorMessage(e) }
  finally { saving.value = false }
}
function openPreview(m: any) { preview.value = m; copied.value = false }
async function copyUrl() {
  try { await navigator.clipboard.writeText(preview.value.url); copied.value = true } catch {}
}
async function copyQuick(m: any, e: Event) {
  e.stopPropagation()
  try {
    await navigator.clipboard.writeText(m.url)
    copiedId.value = m.id
    setTimeout(() => { if (copiedId.value === m.id) copiedId.value = null }, 1500)
  } catch {}
}
async function delQuick(m: any) {
  if (!confirm(t('confirmDelete'))) return
  try {
    await api.del(`/api/admin/media/${m.id}`)
    selected.value.delete(m.id)
    await load()
  } catch (e: any) { formError.value = adminErrorMessage(e) }
}
async function batchDelete() {
  const n = selected.value.size
  if (!n) return
  if (!confirm(t('confirmBatchDelete').replace('{n}', String(n)))) return
  batchDeleting.value = true
  try {
    await api.post('/api/admin/media/batch-delete', { ids: [...selected.value] })
    selected.value.clear()
    await load()
  } catch (e: any) { formError.value = adminErrorMessage(e) }
  finally { batchDeleting.value = false }
}
async function delMedia() {
  if (!preview.value || !confirm(t('confirmDelete'))) return
  try {
    await api.del(`/api/admin/media/${preview.value.id}`)
    selected.value.delete(preview.value.id)
    preview.value = null
    await load()
  } catch (e: any) { formError.value = adminErrorMessage(e) }
}
onMounted(load)
</script>

<style scoped>
.media-lib {
  max-width: 1400px;
}

/* ---------- Toolbar ---------- */
.media-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}
.toolbar-spacer { flex: 1; }
.media-search { width: 240px; }
.search-icon { font-size: 13px; opacity: .7; }
.upload-btn {
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(64, 158, 255, .35);
  transition: transform .15s ease, box-shadow .15s ease;
}
.upload-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(64, 158, 255, .45); }
.upload-plus { font-weight: 700; margin-right: 2px; }

/* ---------- Selection bar ---------- */
.selection-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(64, 158, 255, .08);
  border: 1px solid rgba(64, 158, 255, .35);
  border-radius: 12px;
  padding: 9px 14px;
  margin-bottom: 16px;
}
.slide-down-enter-active, .slide-down-leave-active { transition: all .2s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-8px); }

/* ---------- Grid & cards ---------- */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.media-card {
  background: #1a1a1e;
  border: 1px solid rgba(255, 255, 255, .08);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
  position: relative;
}
.media-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, .5);
  border-color: rgba(255, 255, 255, .18);
}
.media-card.selected {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, .55), 0 8px 22px rgba(0, 0, 0, .4);
}
.thumb {
  aspect-ratio: 1 / 1;
  background: #0a0a0c;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.thumb img, .thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.file-glyph { font-size: 46px; filter: drop-shadow(0 4px 10px rgba(0,0,0,.5)); }
.play-badge {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.play-badge span {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(0, 0, 0, .6);
  border: 1.5px solid rgba(255, 255, 255, .45);
  color: #fff;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 3px;
  backdrop-filter: blur(2px);
}
.ext-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, .68);
  border: 1px solid rgba(255, 255, 255, .16);
  color: #e5e7eb;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: .6px;
  padding: 3px 8px;
  border-radius: 7px;
  backdrop-filter: blur(2px);
}
.check {
  position: absolute;
  top: 9px;
  left: 9px;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, .55);
  background: rgba(0, 0, 0, .45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  opacity: 0;
  transition: opacity .15s ease, background .15s ease, border-color .15s ease;
  z-index: 2;
}
.media-card:hover .check, .check.on { opacity: 1; }
.check.on { background: #409eff; border-color: #409eff; }
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,.25) 55%, rgba(0,0,0,.35) 100%);
  opacity: 0;
  transition: opacity .18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 1;
}
.media-card:hover .overlay { opacity: 1; }
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .14);
  border: 1px solid rgba(255, 255, 255, .25);
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s ease, transform .15s ease;
  backdrop-filter: blur(3px);
}
.icon-btn:hover { background: #409eff; border-color: #409eff; transform: scale(1.08); }
.icon-btn.danger:hover { background: #f56c6c; border-color: #f56c6c; }
.meta { padding: 10px 13px 11px; }
.name {
  font-size: 12.5px;
  font-weight: 500;
  color: #e8eaed;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sub { font-size: 11px; color: #8b8f98; margin-top: 4px; }

/* ---------- Empty state ---------- */
.empty-state {
  text-align: center;
  padding: 70px 24px;
  border: 1.5px dashed rgba(255, 255, 255, .14);
  border-radius: 18px;
  background: rgba(255, 255, 255, .015);
}
.empty-icon { font-size: 60px; margin-bottom: 18px; filter: drop-shadow(0 6px 16px rgba(0,0,0,.4)); }
.empty-title { font-size: 17px; font-weight: 600; color: #e8eaed; margin: 0 0 8px; }
.empty-hint { font-size: 13.5px; color: #8b8f98; margin: 0 0 22px; }

/* ---------- Pagination ---------- */
.media-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22px;
  flex-wrap: wrap;
  gap: 10px;
}
.total-line { font-size: 13px; color: #8b8f98; margin: 0; }

/* ---------- Upload dialog ---------- */
.dialog-alert { margin-bottom: 16px; }
.upload-drop { margin-bottom: 16px; }
.drop-inner { padding: 22px 0; }
.drop-icon { font-size: 50px; margin-bottom: 12px; }
.drop-hint { font-size: 14px; color: #c0c4cc; font-weight: 500; }
.drop-sub { font-size: 12px; color: #909399; margin-top: 5px; }
.upload-progress { margin-bottom: 16px; }

/* ---------- Preview dialog ---------- */
.preview-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0c;
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 12px;
  min-height: 200px;
  max-height: 50vh;
  overflow: hidden;
  margin-bottom: 18px;
}
.preview-stage img, .preview-stage video { max-width: 100%; max-height: 50vh; object-fit: contain; }
.preview-file { text-align: center; padding: 36px; }
.preview-glyph { font-size: 52px; }
.preview-name { font-size: 13px; color: #9ca3af; margin-top: 10px; word-break: break-all; }
.preview-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 18px;
}
.meta-row.span-2 { grid-column: span 2; }
.meta-row label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: .4px;
}
.meta-row p { font-size: 13.5px; color: #d4d7dc; margin: 0; word-break: break-all; }
.url-row { display: flex; gap: 8px; }
.url-input { flex: 1; }
.preview-footer { display: flex; width: 100%; gap: 8px; align-items: center; }
.footer-spacer { flex: 1; }
.preview-footer a { text-decoration: none; }

/* ---------- Element Plus dark tweaks ---------- */
.media-dialog :deep(.el-dialog) {
  background: #1a1a1e;
  border: 1px solid rgba(255, 255, 255, .09);
  border-radius: 16px;
}
.media-dialog :deep(.el-dialog__title) { color: #e8eaed; font-weight: 600; }
.media-toolbar :deep(.el-radio-button__inner) {
  background: #1a1a1e;
  border-color: rgba(255, 255, 255, .1);
  color: #9ca3af;
}
.media-toolbar :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: rgba(64, 158, 255, .16);
  border-color: rgba(64, 158, 255, .5);
  color: #79bbff;
  box-shadow: none;
}
@media (max-width: 640px) {
  .preview-meta { grid-template-columns: 1fr; }
  .meta-row.span-2 { grid-column: span 1; }
  .media-search { width: 100%; }
}
</style>
