<template>
  <div class="adm">
    <div class="adm-shell">
      <aside class="adm-side">
        <div class="adm-brand">Werkero<small>Admin Console</small></div>
        <nav class="adm-nav">
          <div class="adm-nav-group">{{ t('content') }}</div>
          <NuxtLink to="/admin">{{ t('dashboard') }}</NuxtLink>
          <template v-for="r in contentNav" :key="r.slug">
            <NuxtLink v-if="can(r.perm + '.view')" :to="`/admin/${r.slug}`">
              {{ uiZh ? r.nameZh : r.name }}
            </NuxtLink>
          </template>
          <NuxtLink v-if="can('inquiries.view')" to="/admin/inquiries">{{ t('inquiries') }}</NuxtLink>
          <NuxtLink v-if="can('media.view')" to="/admin/media">{{ t('media') }}</NuxtLink>
          <NuxtLink v-if="can('translation.trigger')" to="/admin/translations">{{ t('translations') }}</NuxtLink>
          <div class="adm-nav-group">{{ t('system') }}</div>
          <NuxtLink v-if="can('settings.view')" to="/admin/settings">{{ t('settings') }}</NuxtLink>
          <NuxtLink v-if="can('users.view')" to="/admin/users">{{ t('users') }}</NuxtLink>
          <NuxtLink v-if="can('roles.view')" to="/admin/roles">{{ t('roles') }}</NuxtLink>
          <NuxtLink v-if="can('logs.view')" to="/admin/logs">{{ t('logs') }}</NuxtLink>
        </nav>
        <div class="adm-side-foot">
          <button @click="goSite">← {{ t('backToSite') }}</button>
        </div>
      </aside>
      <div class="adm-main">
        <header class="adm-top">
          <h1>{{ pageTitle }}</h1>
          <div class="spacer" />
          <div class="adm-locale">
            <span v-for="l in locales" :key="l.code" class="adm-flag" :title="l.name">
              <span
                :class="['fi', `fi-${l.flag}`]"
                :style="{ opacity: l.code === locale ? 1 : 0.35, cursor: 'pointer' }"
                @click="setLocale(l.code)"
              />
            </span>
            <select :value="locale" @change="setLocale(($event.target as HTMLSelectElement).value)">
              <option v-for="l in locales" :key="l.code" :value="l.code">{{ l.name }}</option>
            </select>
          </div>
          <span class="adm-user" v-if="me"><b>{{ me.username }}</b> · {{ me.role }}</span>
          <button class="adm-btn sm" @click="logout">{{ t('logout') }}</button>
        </header>
        <main class="adm-body">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/admin.css'
import { ADMIN_RESOURCE_LIST } from '~/utils/admin-resources'
import { setAdminToken, useAdminApi } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

const route = useRoute()
const { t, locale, locales, setLocale, uiLang } = useAdminLocale()
const uiZh = computed(() => uiLang.value === 'zh-cn')

const me = useState<any>('admin-me', () => null)
const api = useAdminApi()

const can = (perm: string) => {
  const p: string[] = me.value?.permissions || []
  return p.includes(perm)
}

const contentNav = computed(() => ADMIN_RESOURCE_LIST)

const pageTitle = computed(() => {
  const seg = route.path.split('/').filter(Boolean).pop() || ''
  if (seg === 'admin') return t('dashboard')
  const r = ADMIN_RESOURCE_LIST.find((x) => x.slug === seg)
  if (r) return uiZh.value ? r.nameZh : r.name
  const map: Record<string, string> = {
    inquiries: t('inquiries'), media: t('media'), translations: t('translations'),
    settings: t('settings'), users: t('users'), roles: t('roles'), logs: t('logs'),
  }
  return map[seg] || seg
})

async function loadMe() {
  if (me.value) return
  try {
    me.value = await api.get('/api/admin/me')
  } catch { /* middleware/api will redirect on 401 */ }
}

function logout() {
  setAdminToken(null)
  me.value = null
  navigateTo('/admin/login')
}

function goSite() {
  navigateTo('/')
}

onMounted(loadMe)
</script>
