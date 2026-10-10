<template>
  <div>
    <div style="display: flex; justify-content: flex-end; margin-bottom: 16px;">
      <el-button type="primary" @click="openNewRole">+ {{ t('new') }}</el-button>
    </div>
    <el-card>
      <el-table :data="rows" style="width: 100%">
        <el-table-column :label="t('slug')" width="180">
          <template #default="{ row }">
            <code>{{ row.slug }}</code>
            <el-tag v-if="row.is_system" type="info" size="small" style="margin-left: 8px;">{{ t('systemRole') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('name')" prop="name" min-width="160" />
        <el-table-column :label="t('permissions')" prop="perm_count" width="140" />
        <el-table-column :label="t('users')" prop="user_count" width="120" />
        <el-table-column :label="t('actions')" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.is_system" size="small" @click="openEdit(row)">{{ t('permissions') }}</el-button>
            <el-button v-if="!row.is_system" size="small" @click="openRename(row)">{{ t('edit') }}</el-button>
            <el-button v-if="!row.is_system" size="small" type="danger" @click="doDelete(row)">{{ t('delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- new role -->
    <el-dialog v-model="newRole" :title="`${t('new')} — ${t('roles')}`" width="480px">
      <el-alert v-if="nrError" type="error" :closable="false" :title="nrError" style="margin-bottom: 16px;" />
      <el-form label-width="100px" label-position="left">
        <el-form-item :label="t('slug')" required>
          <el-input v-model="nr.slug" />
        </el-form-item>
        <el-form-item :label="t('name')" required>
          <el-input v-model="nr.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="newRole = false">{{ t('cancel') }}</el-button>
        <el-button type="primary" @click="createRole">{{ t('create') }}</el-button>
      </template>
    </el-dialog>

    <!-- rename role -->
    <el-dialog v-model="renameVisible" :title="`${t('edit')} — ${t('roles')}`" width="480px">
      <el-alert v-if="rnError" type="error" :closable="false" :title="rnError" style="margin-bottom: 16px;" />
      <el-form label-width="100px" label-position="left">
        <el-form-item :label="t('name')" required>
          <el-input v-model="rn.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renameVisible = false">{{ t('cancel') }}</el-button>
        <el-button type="primary" :loading="rnSaving" @click="doRename">{{ t('save') }}</el-button>
      </template>
    </el-dialog>

    <!-- permission editor -->
    <el-dialog v-model="permDialogVisible" :title="`${editing?.slug || ''} — ${t('permissions')}`" width="640px">
      <p style="font-size: 13px; color: #909399; margin-bottom: 16px;">{{ t('permHint') }}</p>
      <el-alert v-if="permError" type="error" :closable="false" :title="permError" style="margin-bottom: 16px;" />
      <el-checkbox-group v-model="selected">
        <div v-for="g in PERMISSION_CATALOG" :key="g.module" style="margin-bottom: 16px;">
          <div style="font-weight: 600; font-size: 13px; color: #909399; margin-bottom: 8px; text-transform: uppercase;">{{ g.module }}</div>
          <el-checkbox v-for="p in g.perms" :key="p" :label="p" style="margin-right: 16px; margin-bottom: 8px;" />
        </div>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="permDialogVisible = false">{{ t('cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="savePerms">{{ t('savePermissions') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { PERMISSION_CATALOG } from '~/utils/admin-resources'
import { useAdminApi, adminErrorMessage } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: 'admin' })

const { t } = useAdminLocale()
const api = useAdminApi()
const rows = ref<any[]>([])
const editing = ref<any | null>(null)
const selected = ref<string[]>([])
const permError = ref('')
const saving = ref(false)
const newRole = ref(false)
const nr = ref({ slug: '', name: '' })
const nrError = ref('')

/** Controls the permission editor dialog visibility (editing holds the role object). */
const permDialogVisible = computed({
  get: () => !!editing.value,
  set: (v: boolean) => { if (!v) editing.value = null },
})

const allPerms = PERMISSION_CATALOG.flatMap((g) => g.perms)

/** Seed-derived defaults (mirrors db/migration-v1.sql role assignment). */
function defaultPerms(slug: string): string[] {
  if (slug === 'superadmin') return [...allPerms]
  if (slug === 'admin') return PERMISSION_CATALOG.filter((g) => !['users', 'roles'].includes(g.module)).flatMap((g) => g.perms)
  if (slug === 'editor') {
    const view = PERMISSION_CATALOG.filter((g) =>
      ['works', 'products', 'services', 'faqs', 'process_steps', 'position_principles'].includes(g.module),
    ).flatMap((g) => g.perms.filter((p) => p.endsWith('.view')))
    return [...new Set([...view,
      'works.create', 'works.edit', 'products.create', 'products.edit',
      'services.create', 'services.edit', 'faqs.create', 'faqs.edit',
      'process_steps.create', 'process_steps.edit',
      'position_principles.create', 'position_principles.edit',
      'testimonials.view', 'media.view', 'media.upload', 'inquiries.view', 'translation.trigger'])]
  }
  return []
}

async function load() {
  rows.value = await api.get('/api/admin/roles')
}
function openNewRole() { newRole.value = true; nr.value = { slug: '', name: '' }; nrError.value = '' }
async function createRole() {
  nrError.value = ''
  try {
    await api.post('/api/admin/roles', { slug: nr.value.slug.trim(), name: nr.value.name.trim() })
    newRole.value = false
    await load()
  } catch (e: any) { nrError.value = adminErrorMessage(e) }
}
function openEdit(r: any) {
  editing.value = r
  selected.value = defaultPerms(r.slug)
  permError.value = ''
}
const renameVisible = ref(false)
const rn = ref({ id: '', name: '' })
const rnError = ref('')
const rnSaving = ref(false)
function openRename(r: any) {
  rn.value = { id: r.id, name: r.name }
  rnError.value = ''
  renameVisible.value = true
}
async function doRename() {
  rnError.value = ''
  if (!rn.value.name.trim()) { rnError.value = t('nameRequired'); return }
  rnSaving.value = true
  try {
    await api.put(`/api/admin/roles/${rn.value.id}/rename`, { name: rn.value.name.trim() })
    renameVisible.value = false
    await load()
  } catch (e: any) { rnError.value = adminErrorMessage(e) }
  finally { rnSaving.value = false }
}
async function doDelete(r: any) {
  try {
    await ElMessageBox.confirm(t('confirmDeleteRole', { name: r.name }), t('delete'), { type: 'warning' })
  } catch { return }
  try {
    await api.delete(`/api/admin/roles/${r.id}`)
    await load()
  } catch (e: any) { ElMessage.error(adminErrorMessage(e)) }
}
async function savePerms() {
  permError.value = ''
  saving.value = true
  try {
    await api.put(`/api/admin/roles/${editing.value.id}`, { permissions: selected.value })
    editing.value = null
    await load()
  } catch (e: any) { permError.value = adminErrorMessage(e) }
  finally { saving.value = false }
}
onMounted(load)
</script>
