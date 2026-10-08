<template>
  <div>
    <div class="adm-toolbar"><div class="spacer" />
      <button class="adm-btn primary" @click="openNewRole">+ {{ t('new') }}</button>
    </div>
    <div class="adm-tablewrap">
      <table class="adm-table">
        <thead><tr><th>Slug</th><th>{{ t('name') }}</th><th>{{ t('permissions') }}</th><th>{{ t('users') }}</th><th>{{ t('actions') }}</th></tr></thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td><code>{{ r.slug }}</code> <span v-if="r.is_system" class="adm-badge gray">{{ t('systemRole') }}</span></td>
            <td>{{ r.name }}</td><td>{{ r.perm_count }}</td><td>{{ r.user_count }}</td>
            <td><button v-if="!r.is_system" class="adm-btn sm" @click="openEdit(r)">{{ t('permissions') }}</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- new role -->
    <div v-if="newRole" class="adm-modal-mask" @click.self="newRole = null">
      <div class="adm-modal" style="width:480px">
        <h2>{{ t('new') }} — {{ t('roles') }}</h2>
        <div v-if="nrError" class="adm-error">{{ nrError }}</div>
        <div class="adm-form-grid">
          <div class="adm-field"><label>Slug<span class="req"> *</span></label><input v-model="nr.slug" class="adm-input" /></div>
          <div class="adm-field"><label>{{ t('name') }}<span class="req"> *</span></label><input v-model="nr.name" class="adm-input" /></div>
        </div>
        <div class="adm-modal-foot">
          <button class="adm-btn" @click="newRole = null">{{ t('cancel') }}</button>
          <button class="adm-btn primary" @click="createRole">{{ t('create') }}</button>
        </div>
      </div>
    </div>

    <!-- permission editor -->
    <div v-if="editing" class="adm-modal-mask" @click.self="editing = null">
      <div class="adm-modal">
        <h2>{{ editing.slug }} — {{ t('permissions') }}</h2>
        <p class="adm-hint">Checkboxes pre-filled from the role's initial assignment; saving replaces the full set.</p>
        <div v-if="permError" class="adm-error">{{ permError }}</div>
        <div class="adm-checks">
          <template v-for="g in PERMISSION_CATALOG" :key="g.module">
            <div class="adm-module">{{ g.module }}</div>
            <label v-for="p in g.perms" :key="p" class="adm-check">
              <input type="checkbox" :value="p" v-model="selected" /> {{ p }}
            </label>
          </template>
        </div>
        <div class="adm-modal-foot">
          <button class="adm-btn" @click="editing = null">{{ t('cancel') }}</button>
          <button class="adm-btn primary" :disabled="saving" @click="savePerms">{{ t('savePermissions') }}</button>
        </div>
      </div>
    </div>
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
