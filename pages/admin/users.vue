<template>
  <div>
    <div class="adm-toolbar"><div class="spacer" />
      <button class="adm-btn primary" @click="openNew">+ {{ t('createUser') }}</button>
    </div>
    <div class="adm-tablewrap">
      <table class="adm-table">
        <thead><tr><th>{{ t('username') }}</th><th>{{ t('email') }}</th><th>{{ t('role') }}</th><th>{{ t('active') }}</th><th>{{ t('lastLogin') }}</th><th>{{ t('actions') }}</th></tr></thead>
        <tbody>
          <tr v-for="u in rows" :key="u.id">
            <td><b>{{ u.username }}</b></td><td>{{ u.email }}</td><td>{{ u.role }}</td>
            <td><span class="adm-badge" :class="u.is_active ? 'green' : 'gray'">{{ u.is_active ? '✓' : '✗' }}</span></td>
            <td>{{ fmtDate(u.last_login_at) }}</td>
            <td><div class="adm-row-actions">
              <button class="adm-btn sm" @click="openEdit(u)">{{ t('edit') }}</button>
            </div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="editing" class="adm-modal-mask" @click.self="editing = null">
      <div class="adm-modal" style="width:560px">
        <h2>{{ editing.isNew ? t('createUser') : t('edit') }} — {{ editing.isNew ? '' : editing.row.username }}</h2>
        <div v-if="formError" class="adm-error">{{ formError }}</div>
        <div class="adm-form-grid">
          <div v-if="editing.isNew" class="adm-field"><label>{{ t('username') }}<span class="req"> *</span></label>
            <input v-model="form.username" class="adm-input" /></div>
          <div v-if="editing.isNew" class="adm-field"><label>{{ t('email') }}<span class="req"> *</span></label>
            <input v-model="form.email" type="email" class="adm-input" /></div>
          <div class="adm-field"><label>{{ t('role') }}</label>
            <select v-model="form.role" class="adm-select">
              <option v-for="r in roles" :key="r.slug" :value="r.slug">{{ r.slug }} — {{ r.name }}</option>
            </select></div>
          <div class="adm-field"><label>{{ t('password') }}{{ editing.isNew ? ' *' : ` (${t('resetPassword')})` }}</label>
            <input v-model="form.password" type="password" class="adm-input" autocomplete="new-password" placeholder="min 8 chars" /></div>
          <div v-if="!editing.isNew" class="adm-field"><label>{{ t('active') }}</label>
            <select v-model="form.is_active" class="adm-select">
              <option :value="true">{{ t('activate') }}</option>
              <option :value="false">{{ t('deactivate') }}</option>
            </select></div>
        </div>
        <div class="adm-modal-foot">
          <button class="adm-btn" @click="editing = null">{{ t('cancel') }}</button>
          <button class="adm-btn primary" :disabled="saving" @click="save">{{ t('save') }}</button>
        </div>
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
const rows = ref<any[]>([])
const roles = ref<any[]>([])
const editing = ref<any | null>(null)
const form = ref({ username: '', email: '', role: 'editor', password: '', is_active: true })
const formError = ref('')
const saving = ref(false)

function fmtDate(d: string) {
  return d ? new Date(d).toLocaleString(uiLang.value === 'zh-cn' ? 'zh-CN' : 'en-US', { hour12: false }) : '—'
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
