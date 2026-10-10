<template>
  <div>
    <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
      <el-button type="primary" @click="openNew">+ {{ t('createUser') }}</el-button>
    </div>
    <el-card>
      <el-table :data="rows" style="width: 100%">
        <el-table-column :label="t('username')" min-width="160">
          <template #default="{ row }"><b>{{ row.username }}</b></template>
        </el-table-column>
        <el-table-column :label="t('email')" prop="email" min-width="200" />
        <el-table-column :label="t('role')" prop="role" width="140" />
        <el-table-column :label="t('active')" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'" size="small">{{ row.is_active ? '✓' : '✗' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('lastLogin')" width="180">
          <template #default="{ row }">{{ fmtDate(row.last_login_at) }}</template>
        </el-table-column>
        <el-table-column :label="t('actions')" width="120" fixed="right">
          <template #default="{ row }"><el-button size="small" @click="openEdit(row)">{{ t('edit') }}</el-button></template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="editing" :title="editing?.isNew ? t('createUser') : `${t('edit')} — ${editing?.row?.username || ''}`" width="560px">
      <el-alert v-if="formError" type="error" :closable="false" :title="formError" style="margin-bottom: 16px;" />
      <el-form label-width="120px" label-position="left">
        <el-form-item v-if="editing?.isNew" :label="t('username')" required>
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item v-if="editing?.isNew" :label="t('email')" required>
          <el-input v-model="form.email" type="email" />
        </el-form-item>
        <el-form-item :label="t('role')">
          <el-select v-model="form.role" style="width: 100%;">
            <el-option v-for="r in roles" :key="r.slug" :value="r.slug" :label="`${r.slug} — ${r.name}`" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('password')" :required="editing?.isNew">
          <el-input v-model="form.password" type="password" autocomplete="new-password" :placeholder="t('min8chars')" show-password />
          <div v-if="!editing?.isNew" style="font-size: 12px; color: #909399; margin-top: 4px;">{{ t('resetPassword') }}</div>
        </el-form-item>
        <el-form-item v-if="!editing?.isNew" :label="t('active')">
          <el-select v-model="form.is_active" style="width: 100%;">
            <el-option :value="true" :label="t('activate')" />
            <el-option :value="false" :label="t('deactivate')" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editing = null">{{ t('cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="save">{{ t('save') }}</el-button>
      </template>
    </el-dialog>
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
const rows = ref<any[]>([])
const roles = ref<any[]>([])
const editing = ref<any | null>(null)
const form = ref({ username: '', email: '', role: 'editor', password: '', is_active: true })
const formError = ref('')
const saving = ref(false)

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(dateLocale.value, { hour12: false }) : '—'
}
async function load() {
  const r: any = await api.get('/api/admin/users', { pageSize: 100 })
  rows.value = r.data || []
  roles.value = await api.get('/api/admin/roles')
}
function openNew() {
  editing.value = { isNew: true }
  form.value = { username: '', email: '', role: 'editor', password: '', is_active: true }
  formError.value = ''
}
function openEdit(u: any) {
  editing.value = { isNew: false, row: u }
  form.value = { username: u.username, email: u.email, role: u.role, password: '', is_active: u.is_active }
  formError.value = ''
}
async function save() {
  formError.value = ''
  saving.value = true
  try {
    if (editing.value.isNew) {
      await api.post('/api/admin/users', {
        username: form.value.username.trim(), email: form.value.email.trim(),
        password: form.value.password, role: form.value.role,
      })
    } else {
      const body: any = { role: form.value.role, is_active: form.value.is_active }
      if (form.value.password) body.password = form.value.password
      await api.patch(`/api/admin/users/${editing.value.row.id}`, body)
    }
    editing.value = null
    await load()
  } catch (e: any) { formError.value = adminErrorMessage(e) }
  finally { saving.value = false }
}
onMounted(load)
</script>
