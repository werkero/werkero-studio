<template>
  <div class="adm-ep">
    <div class="adm-ep-shell">
      <!-- Sidebar -->
      <aside class="adm-ep-side">
        <div class="adm-ep-brand">
          <div class="adm-ep-brand-name">Werkero</div>
          <div class="adm-ep-brand-sub">Admin Console</div>
        </div>
        <nav class="adm-ep-nav">
          <div class="adm-ep-nav-group">{{ t('content') }}</div>
          <el-button text class="adm-ep-nav-btn" :class="{ 'is-active': route.path === '/admin' }" @click="navigateTo('/admin')">
            {{ t('dashboard') }}
          </el-button>
          <template v-for="r in contentNav" :key="r.slug">
            <el-button
              v-if="can(r.perm + '.view')"
              text
              class="adm-ep-nav-btn"
              :class="{ 'is-active': route.path === `/admin/${r.slug}` }"
              @click="navigateTo(`/admin/${r.slug}`)"
            >
              {{ uiZh ? r.nameZh : r.name }}
            </el-button>
          </template>
          <el-button v-if="can('inquiries.view')" text class="adm-ep-nav-btn" :class="{ 'is-active': route.path === '/admin/inquiries' }" @click="navigateTo('/admin/inquiries')">{{ t('inquiries') }}</el-button>
          <el-button v-if="can('media.view')" text class="adm-ep-nav-btn" :class="{ 'is-active': route.path === '/admin/media' }" @click="navigateTo('/admin/media')">{{ t('media') }}</el-button>
          <el-button v-if="can('translation.trigger')" text class="adm-ep-nav-btn" :class="{ 'is-active': route.path === '/admin/translations' }" @click="navigateTo('/admin/translations')">{{ t('translations') }}</el-button>
          <div class="adm-ep-nav-group">{{ t('system') }}</div>
          <el-button v-if="can('settings.view')" text class="adm-ep-nav-btn" :class="{ 'is-active': route.path === '/admin/settings' }" @click="navigateTo('/admin/settings')">{{ t('settings') }}</el-button>
          <el-button v-if="can('users.view')" text class="adm-ep-nav-btn" :class="{ 'is-active': route.path === '/admin/users' }" @click="navigateTo('/admin/users')">{{ t('users') }}</el-button>
          <el-button v-if="can('roles.view')" text class="adm-ep-nav-btn" :class="{ 'is-active': route.path === '/admin/roles' }" @click="navigateTo('/admin/roles')">{{ t('roles') }}</el-button>
          <el-button v-if="can('logs.view')" text class="adm-ep-nav-btn" :class="{ 'is-active': route.path === '/admin/logs' }" @click="navigateTo('/admin/logs')">{{ t('logs') }}</el-button>
        </nav>
        <div class="adm-ep-side-foot">
          <el-button text class="adm-ep-nav-btn" @click="goSite">← {{ t('backToSite') }}</el-button>
        </div>
      </aside>

      <!-- Main -->
      <div class="adm-ep-main">
        <header class="adm-ep-top">
          <h1 class="adm-ep-title">{{ pageTitle }}</h1>
          <div class="adm-ep-spacer" />
          <el-select v-model="localeModel" class="adm-ep-locale" placeholder="Language">
            <el-option v-for="l in locales" :key="l.code" :label="l.name" :value="l.code" />
          </el-select>
          <span v-if="me" class="adm-ep-user"><b>{{ me.username }}</b> · {{ me.role }}</span>
          <el-button @click="logout">{{ t('logout') }}</el-button>
        </header>
        <main class="adm-ep-body">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import 'element-plus/theme-chalk/dark/css-vars.css'
import { ADMIN_RESOURCE_LIST } from '~/utils/admin-resources'
import { setAdminToken, useAdminApi } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

// Admin console is always dark — enable Element Plus dark CSS vars
useHead({ htmlAttrs: { class: 'dark' } })

const route = useRoute()
const { t, locale, locales, setLocale, uiLang } = useAdminLocale()
const uiZh = computed(() => uiLang.value === 'zh-cn')

const me = useState<any>('admin-me', () => null)
const api = useAdminApi()

const localeModel = computed({
  get: () => locale.value,
  set: (v: string) => setLocale(v),
})

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

<style scoped>
.adm-ep {
  min-height: 100vh;
  background: #141414;
  color: #e5e5e5;
}
.adm-ep-shell {
  display: flex;
  min-height: 100vh;
}
.adm-ep-side {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #1d1e1f;
  border-right: 1px solid #2e2e2e;
  min-height: 100vh;
}
.adm-ep-brand {
  padding: 18px 20px;
  border-bottom: 1px solid #2e2e2e;
}
.adm-ep-brand-name {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.04em;
  color: #f5f5f5;
}
.adm-ep-brand-sub {
  font-size: 12px;
  color: #8a8a8a;
  margin-top: 2px;
}
.adm-ep-nav {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
}
.adm-ep-nav-group {
  padding: 10px 12px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #8a8a8a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.adm-ep-nav-btn {
  width: 100%;
  justify-content: flex-start;
  margin-bottom: 2px;
  color: #cfcfcf;
}
.adm-ep-nav-btn:hover {
  color: #ffffff;
}
.adm-ep-nav-btn.is-active {
  background: #2e2e2e;
  color: #ffffff;
}
.adm-ep-side-foot {
  padding: 12px;
  border-top: 1px solid #2e2e2e;
}
.adm-ep-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.adm-ep-top {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #2e2e2e;
}
.adm-ep-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #f5f5f5;
}
.adm-ep-spacer {
  flex: 1;
}
.adm-ep-locale {
  width: 150px;
}
.adm-ep-user {
  font-size: 14px;
  color: #8a8a8a;
  white-space: nowrap;
}
.adm-ep-user b {
  color: #e5e5e5;
}
.adm-ep-body {
  padding: 24px;
  flex: 1;
}
</style>
