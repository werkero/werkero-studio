<template>
  <div class="adm-ep">
    <div class="adm-ep-shell">
      <!-- Sidebar -->
      <aside class="adm-ep-side" :class="{ 'is-collapsed': sidebarCollapsed }">
        <div class="adm-ep-brand">
          <div class="adm-ep-logo">W</div>
          <div v-show="!sidebarCollapsed" class="adm-ep-brand-text">
            <div class="adm-ep-brand-name">Werkero</div>
            <div class="adm-ep-brand-sub">Admin Console</div>
          </div>
        </div>

        <nav class="adm-ep-nav">
          <div v-show="!sidebarCollapsed" class="adm-ep-nav-group">{{ t('content') }}</div>
          <el-tooltip
            v-for="item in contentItems"
            :key="item.slug"
            :content="item.label"
            placement="right"
            :disabled="!sidebarCollapsed"
            :show-after="300"
          >
            <el-button
              text
              class="adm-ep-nav-btn"
              :class="{ 'is-active': isActive(item.path) }"
              @click="navigateTo(item.path)"
            >
              <span class="adm-ep-nav-icon">{{ item.icon }}</span>
              <span v-show="!sidebarCollapsed" class="adm-ep-nav-label">{{ item.label }}</span>
            </el-button>
          </el-tooltip>

          <div v-show="!sidebarCollapsed" class="adm-ep-nav-group">{{ t('system') }}</div>
          <el-tooltip
            v-for="item in systemItems"
            :key="item.slug"
            :content="item.label"
            placement="right"
            :disabled="!sidebarCollapsed"
            :show-after="300"
          >
            <el-button
              text
              class="adm-ep-nav-btn"
              :class="{ 'is-active': isActive(item.path) }"
              @click="navigateTo(item.path)"
            >
              <span class="adm-ep-nav-icon">{{ item.icon }}</span>
              <span v-show="!sidebarCollapsed" class="adm-ep-nav-label">{{ item.label }}</span>
            </el-button>
          </el-tooltip>
        </nav>

        <div class="adm-ep-side-foot">
          <el-tooltip :content="t('backToSite')" placement="right" :disabled="!sidebarCollapsed" :show-after="300">
            <el-button text class="adm-ep-nav-btn" @click="goSite">
              <span class="adm-ep-nav-icon">←</span>
              <span v-show="!sidebarCollapsed" class="adm-ep-nav-label">{{ t('backToSite') }}</span>
            </el-button>
          </el-tooltip>
        </div>
      </aside>

      <!-- Main -->
      <div class="adm-ep-main">
        <header class="adm-ep-top">
          <el-button text class="adm-ep-collapse" :title="t('content')" @click="sidebarCollapsed = !sidebarCollapsed">
            <span class="adm-ep-nav-icon" style="margin: 0">{{ sidebarCollapsed ? '→' : '←' }}</span>
          </el-button>

          <el-breadcrumb separator="/" class="adm-ep-crumb">
            <el-breadcrumb-item v-for="(c, i) in breadcrumbs" :key="i">
              <a v-if="c.path" class="adm-ep-crumb-link" @click.prevent="navigateTo(c.path)">{{ c.label }}</a>
              <span v-else>{{ c.label }}</span>
            </el-breadcrumb-item>
          </el-breadcrumb>

          <div class="adm-ep-spacer" />

          <el-select v-model="localeModel" class="adm-ep-locale" size="small" :aria-label="t('content')">
            <el-option v-for="l in locales" :key="l.code" :label="l.name" :value="l.code" />
          </el-select>

          <el-divider direction="vertical" class="adm-ep-div" />

          <el-dropdown v-if="me" trigger="click" @command="onUserCommand">
            <el-avatar :size="32" class="adm-ep-avatar adm-ep-avatar-clickable">{{ avatarInitial }}</el-avatar>
            <template #dropdown>
              <div class="adm-ep-user-card">
                <div class="adm-ep-user-name">{{ me.username }}</div>
                <el-tag size="small" type="info" effect="plain">{{ me.role }}</el-tag>
              </div>
              <el-dropdown-menu>
                <el-dropdown-item command="password">
                  <span>🔑</span> {{ t('changePassword') }}
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <span>🚪</span> {{ t('logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </header>

        <main class="adm-ep-body">
          <slot />
        </main>

        <!-- Change password dialog -->
        <el-dialog v-model="pwDialogVisible" :title="t('changePassword')" width="420px">
          <el-alert v-if="pwError" :title="pwError" type="error" :closable="false" show-icon style="margin-bottom: 16px;" />
          <el-form label-position="top">
            <el-form-item :label="t('currentPassword')">
              <el-input v-model="pwForm.current" type="password" show-password />
            </el-form-item>
            <el-form-item :label="t('newPassword')">
              <el-input v-model="pwForm.new" type="password" show-password />
            </el-form-item>
            <el-form-item :label="t('confirmPassword')">
              <el-input v-model="pwForm.confirm" type="password" show-password />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="pwDialogVisible = false">{{ t('cancel') }}</el-button>
            <el-button type="primary" :loading="pwSaving" @click="changePassword">{{ t('save') }}</el-button>
          </template>
        </el-dialog>
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

const SIDEBAR_KEY = 'werkero_admin_sidebar'
const sidebarCollapsed = ref(false)

const localeModel = computed({
  get: () => locale.value,
  set: (v: string) => setLocale(v),
})

const can = (perm: string) => {
  const p: string[] = me.value?.permissions || []
  return p.includes(perm)
}

const NAV_ICONS: Record<string, string> = {
  dashboard: '▦',
  works: '◈',
  products: '⬢',
  services: '✦',
  faqs: '?',
  testimonials: '❝',
  'process-steps': '☰',
  'position-principles': '◎',
  seo: '⌕',
  inquiries: '✉',
  media: '◫',
  translations: '⇄',
  settings: '⚙',
  users: '●',
  roles: '⬣',
  logs: '▤',
}

interface NavItem {
  slug: string
  label: string
  path: string
  icon: string
}

const contentNav = computed(() => ADMIN_RESOURCE_LIST)

const contentItems = computed<NavItem[]>(() => {
  const items: NavItem[] = [
    { slug: 'dashboard', label: t('dashboard'), path: '/admin', icon: NAV_ICONS.dashboard },
  ]
  for (const r of contentNav.value) {
    if (!can(r.perm + '.view')) continue
    items.push({ slug: r.slug, label: t('res.' + r.slug), path: `/admin/${r.slug}`, icon: NAV_ICONS[r.slug] || '•' })
  }
  if (can('inquiries.view')) items.push({ slug: 'inquiries', label: t('inquiries'), path: '/admin/inquiries', icon: NAV_ICONS.inquiries })
  if (can('media.view')) items.push({ slug: 'media', label: t('media'), path: '/admin/media', icon: NAV_ICONS.media })
  if (can('translation.trigger')) items.push({ slug: 'translations', label: t('translations'), path: '/admin/translations', icon: NAV_ICONS.translations })
  return items
})

const systemItems = computed<NavItem[]>(() => {
  const defs: Array<[string, string, string, string]> = [
    ['settings', t('settings'), '/admin/settings', 'settings.view'],
    ['users', t('users'), '/admin/users', 'users.view'],
    ['roles', t('roles'), '/admin/roles', 'roles.view'],
    ['logs', t('logs'), '/admin/logs', 'logs.view'],
  ]
  return defs
    .filter(([, , , perm]) => can(perm))
    .map(([slug, label, path]) => ({ slug, label, path, icon: NAV_ICONS[slug] || '•' }))
})

const isActive = (p: string) => route.path === p

const pageTitle = computed(() => {
  const seg = route.path.split('/').filter(Boolean).pop() || ''
  if (seg === 'admin') return t('dashboard')
  const r = ADMIN_RESOURCE_LIST.find((x) => x.slug === seg)
  if (r) return t('res.' + r.slug)
  const map: Record<string, string> = {
    inquiries: t('inquiries'), media: t('media'), translations: t('translations'),
    settings: t('settings'), users: t('users'), roles: t('roles'), logs: t('logs'),
  }
  return map[seg] || seg
})

const breadcrumbs = computed(() => {
  const seg = route.path.split('/').filter(Boolean).pop() || ''
  const crumbs: Array<{ label: string; path: string }> = [{ label: t('dashboard'), path: '/admin' }]
  if (!seg || seg === 'admin') return crumbs
  const r = ADMIN_RESOURCE_LIST.find((x) => x.slug === seg)
  if (r) return [...crumbs, { label: t('content'), path: '' }, { label: t('res.' + r.slug), path: '' }]
  const contentMap: Record<string, string> = {
    inquiries: t('inquiries'), media: t('media'), translations: t('translations'),
  }
  const systemMap: Record<string, string> = {
    settings: t('settings'), users: t('users'), roles: t('roles'), logs: t('logs'),
  }
  if (contentMap[seg]) return [...crumbs, { label: t('content'), path: '' }, { label: contentMap[seg], path: '' }]
  if (systemMap[seg]) return [...crumbs, { label: t('system'), path: '' }, { label: systemMap[seg], path: '' }]
  return [...crumbs, { label: seg, path: '' }]
})

const avatarInitial = computed(() => (String(me.value?.username || 'A').charAt(0) || 'A').toUpperCase())

async function loadMe() {
  if (me.value) return
  try {
    me.value = await api.get('/api/admin/me')
  } catch { /* middleware/api will redirect on 401 */ }
}

const pwDialogVisible = ref(false)
const pwError = ref('')
const pwSaving = ref(false)
const pwForm = ref({ current: '', new: '', confirm: '' })

function onUserCommand(cmd: string) {
  if (cmd === 'logout') logout()
  else if (cmd === 'password') {
    pwForm.value = { current: '', new: '', confirm: '' }
    pwError.value = ''
    pwDialogVisible.value = true
  }
}
async function changePassword() {
  pwError.value = ''
  if (!pwForm.value.current || !pwForm.value.new) { pwError.value = t('fillAll'); return }
  if (pwForm.value.new !== pwForm.value.confirm) { pwError.value = t('passwordMismatch'); return }
  if (pwForm.value.new.length < 8) { pwError.value = t('passwordTooShort'); return }
  pwSaving.value = true
  try {
    await api.post('/api/admin/password/change', {
      currentPassword: pwForm.value.current,
      newPassword: pwForm.value.new,
    })
    pwDialogVisible.value = false
    ElMessage.success(t('passwordChanged'))
  } catch (e: any) {
    pwError.value = adminErrorMessage(e)
  } finally {
    pwSaving.value = false
  }
}
function logout() {
  setAdminToken(null)
  me.value = null
  navigateTo('/admin/login')
}

function goSite() {
  navigateTo('/')
}

onMounted(() => {
  loadMe()
  try {
    sidebarCollapsed.value = localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch { /* ignore */ }
})

watch(sidebarCollapsed, (v) => {
  try {
    localStorage.setItem(SIDEBAR_KEY, v ? '1' : '0')
  } catch { /* ignore */ }
})
</script>

<style scoped>
.adm-ep {
  min-height: 100vh;
  background: #0f0f11;
  color: #e4e4e7;
}
.adm-ep-shell {
  display: flex;
  min-height: 100vh;
}

/* ---------- Sidebar ---------- */
.adm-ep-side {
  width: 232px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: #161618;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  height: 100vh;
  position: sticky;
  top: 0;
  transition: width 0.2s ease;
  z-index: 20;
}
.adm-ep-side.is-collapsed {
  width: 68px;
}
.adm-ep-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 65px;
  overflow: hidden;
}
.adm-ep-logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, #5b8cff, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 18px;
  color: #fff;
  box-shadow: 0 2px 12px rgba(91, 140, 255, 0.35);
}
.adm-ep-brand-text {
  overflow: hidden;
  white-space: nowrap;
}
.adm-ep-brand-name {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.02em;
  color: #fafafa;
}
.adm-ep-brand-sub {
  font-size: 11px;
  color: #71717a;
  margin-top: 1px;
}
.adm-ep-nav {
  flex: 1;
  padding: 12px 10px;
  overflow-y: auto;
  overflow-x: hidden;
}
.adm-ep-nav::-webkit-scrollbar {
  width: 4px;
}
.adm-ep-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
}
.adm-ep-nav-group {
  padding: 12px 12px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #63636b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.adm-ep-nav-btn {
  width: 100%;
  justify-content: flex-start;
  margin-bottom: 2px;
  color: #a1a1aa;
  border-radius: 8px;
  padding: 9px 12px;
  height: auto;
  position: relative;
  border: 0;
  transition: color 0.2s ease, background-color 0.2s ease;
}
.adm-ep-nav-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.04);
}
.adm-ep-nav-btn.is-active {
  background: rgba(255, 255, 255, 0.07);
  color: #ffffff;
  font-weight: 500;
}
.adm-ep-nav-btn.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: linear-gradient(180deg, #5b8cff, #8b5cf6);
}
.adm-ep-nav-icon {
  width: 22px;
  font-size: 15px;
  line-height: 1;
  text-align: center;
  flex-shrink: 0;
  margin-right: 10px;
}
.is-collapsed .adm-ep-nav-btn {
  justify-content: center;
  padding: 10px 0;
}
.is-collapsed .adm-ep-nav-icon {
  margin-right: 0;
}
.is-collapsed .adm-ep-nav {
  padding: 12px 8px;
}
.is-collapsed .adm-ep-brand {
  justify-content: center;
  padding: 14px 0;
}
.adm-ep-nav-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13.5px;
}
.adm-ep-side-foot {
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ---------- Main / top bar ---------- */
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
  gap: 14px;
  height: 60px;
  padding: 0 20px;
  background: rgba(15, 15, 17, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}
.adm-ep-collapse {
  color: #a1a1aa;
  padding: 8px;
  border-radius: 8px;
  transition: color 0.2s ease, background-color 0.2s ease;
}
.adm-ep-collapse:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}
.adm-ep-crumb :deep(.el-breadcrumb__inner) {
  color: #a1a1aa;
  font-weight: 400;
  font-size: 13.5px;
  transition: color 0.2s ease;
}
.adm-ep-crumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #fafafa;
  font-weight: 500;
}
.adm-ep-crumb-link {
  cursor: pointer;
}
.adm-ep-crumb-link:hover {
  color: #ffffff;
}
.adm-ep-crumb :deep(.el-breadcrumb__separator) {
  color: #52525b;
  margin: 0 8px;
}
.adm-ep-spacer {
  flex: 1;
}
.adm-ep-locale {
  width: 132px;
}
.adm-ep-div {
  border-color: rgba(255, 255, 255, 0.1);
  height: 22px;
}
.adm-ep-user-card {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  margin-bottom: 4px;
}
.adm-ep-user-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 6px;
  color: #e5e7eb;
}
.adm-ep-avatar-clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.adm-ep-avatar-clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.4);
}
.adm-ep-avatar {
  background: linear-gradient(135deg, #5b8cff, #8b5cf6);
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}
.adm-ep-user-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.adm-ep-username {
  font-size: 13px;
  color: #e4e4e7;
  font-weight: 500;
  white-space: nowrap;
}
.adm-ep-role {
  text-transform: capitalize;
}
.adm-ep-logout-unused {
  padding: 8px 10px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}
.adm-ep-logout:hover {
  background: rgba(245, 108, 108, 0.1);
}
.adm-ep-body {
  padding: 24px;
  flex: 1;
}

/* Layered card surface to match the refined dark theme */
.adm-ep-body :deep(.el-card) {
  background: #1a1a1e;
  border-color: rgba(255, 255, 255, 0.06);
}
.adm-ep-body :deep(.el-card__header) {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}
</style>
