<template>
  <div class="media-field">
    <div v-if="modelValue" class="media-field-preview">
      <img v-if="isImage" :src="previewUrl" alt="" />
      <video v-else-if="isVideo" :src="previewUrl" preload="metadata" />
      <div v-else class="media-field-file">{{ fileName }}</div>
      <div class="media-field-id">{{ modelValue }}</div>
    </div>
    <div v-else class="media-field-empty">{{ t('noMediaSelected') }}</div>
    <div class="media-field-actions">
      <el-button size="small" type="primary" plain @click="pickerOpen = true">
        {{ modelValue ? t('changeMedia') : t('selectMedia') }}
      </el-button>
      <el-button v-if="modelValue" size="small" text @click="$emit('update:modelValue', '')">
        {{ t('clear') }}
      </el-button>
    </div>

    <el-dialog
      v-model="pickerOpen"
      :title="t('selectMedia')"
      width="860px"
      append-to-body
      class="media-picker-dialog"
    >
      <div class="picker-toolbar">
        <el-input
          v-model="search"
          :placeholder="t('search')"
          clearable
          style="width: 240px"
          @update:model-value="page = 1; load()"
        />
      </div>
      <div v-loading="loading" class="picker-grid">
        <div
          v-for="m in rows"
          :key="m.id"
          class="picker-card"
          :class="{ selected: picked === m.id }"
          @click="picked = m.id"
        >
          <div class="picker-thumb">
            <img v-if="isImg(m)" :src="m.url" loading="lazy" />
            <video v-else-if="isVid(m)" :src="m.url" preload="metadata" />
            <div v-else class="picker-glyph">📄</div>
          </div>
          <div class="picker-name" :title="nameOf(m)">{{ nameOf(m) }}</div>
        </div>
      </div>
      <div v-if="!rows.length && !loading" class="picker-empty">{{ t('emptyTitle') }}</div>
      <div class="picker-pager">
        <el-pagination
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          small
          background
          @current-change="load"
        />
      </div>
      <template #footer>
        <el-button @click="pickerOpen = false">{{ t('cancel') }}</el-button>
        <el-button type="primary" :disabled="!picked" @click="confirm">{{ t('confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useAdminApi } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits(['update:modelValue'])

const { t } = useAdminLocale()
const api = useAdminApi()

const pickerOpen = ref(false)
const loading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 24
const search = ref('')
const picked = ref('')
const previewUrl = ref('')
const previewKind = ref('')

const isImage = computed(() => previewKind.value === 'image')
const isVideo = computed(() => previewKind.value === 'video')
const fileName = computed(() => previewUrl.value.split('/').pop() || '')

function kindOf(m: any): string {
  const mt = (m.mime_type || '').toLowerCase()
  if (mt.startsWith('image/')) return 'image'
  if (mt.startsWith('video/')) return 'video'
  return 'file'
}
const isImg = (m: any) => kindOf(m) === 'image'
const isVid = (m: any) => kindOf(m) === 'video'
const nameOf = (m: any) => m.filename || m.url?.split('/').pop() || m.id

async function loadPreview() {
  if (!props.modelValue) { previewUrl.value = ''; return }
  try {
    const m = await api.get<any>(`/api/admin/media/${props.modelValue}`)
    previewUrl.value = m.url || ''
    previewKind.value = kindOf(m)
  } catch { previewUrl.value = ''; previewKind.value = '' }
}
watch(() => props.modelValue, loadPreview, { immediate: true })

async function load() {
  loading.value = true
  try {
    const r = await api.get<any>('/api/admin/media', {
      page: page.value, pageSize, search: search.value || undefined,
    })
    rows.value = r.items || r.rows || []
    total.value = r.total || 0
  } catch { rows.value = [] } finally { loading.value = false }
}
watch(pickerOpen, (v) => { if (v) { picked.value = props.modelValue; page.value = 1; load() } })

function confirm() {
  emit('update:modelValue', picked.value)
  pickerOpen.value = false
}
</script>

<style scoped>
.media-field-preview {
  display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px; padding: 8px 12px; margin-bottom: 8px;
}
.media-field-preview img, .media-field-preview video {
  width: 56px; height: 56px; object-fit: cover; border-radius: 8px; flex-shrink: 0;
}
.media-field-file { font-size: 13px; color: #d4d7dc; }
.media-field-id { font-size: 11px; color: #8b8f98; font-family: monospace; word-break: break-all; }
.media-field-empty { font-size: 13px; color: #8b8f98; margin-bottom: 8px; }
.media-field-actions { display: flex; gap: 8px; }
.picker-toolbar { margin-bottom: 14px; }
.picker-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px; max-height: 46vh; overflow-y: auto; padding: 2px;
}
.picker-card {
  border: 2px solid transparent; border-radius: 12px; overflow: hidden;
  cursor: pointer; background: #1a1a1e; transition: all .15s ease;
}
.picker-card:hover { border-color: rgba(255,255,255,0.25); transform: translateY(-2px); }
.picker-card.selected { border-color: #5b8cff; box-shadow: 0 0 0 2px rgba(91,140,255,.4); }
.picker-thumb { aspect-ratio: 1; background: #0b0b0d; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.picker-thumb img, .picker-thumb video { width: 100%; height: 100%; object-fit: cover; }
.picker-glyph { font-size: 28px; }
.picker-name { font-size: 11px; color: #b8bcc4; padding: 6px 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.picker-empty { text-align: center; color: #8b8f98; padding: 40px 0; }
.picker-pager { display: flex; justify-content: center; margin-top: 14px; }
</style>
