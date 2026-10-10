<template>
  <div class="adm-ep">
    <div class="adm-ep-shell">
      <!-- Sidebar -->
      <aside class="adm-ep-side" :class="{ 'is-collapsed': sidebarCollapsed }">
        <div class="adm-ep-brand">
          <div class="adm-ep-logo">W</div>
          <div v-show="!sidebarCollapsed" class="adm-ep-brand-text">
            <div class="adm-ep-brand-name">Werkero</div>
          </div>
        </div>

        <nav class="adm-ep-nav">
          <template v-for="m in navMenus" :key="m.slug">
            <!-- leaf item -->
            <el-tooltip
              v-if="!m.children"
              :content="m.label"
              placement="right"
              :disabled="!sidebarCollapsed"
              :show-after="300"
            >
              <el-button
                text
                class="adm-ep-nav-btn"
                :class="{ 'is-active': isActive(m.path!) }"
                @click="navigateTo(m.path!)"
              >
                <span class="adm-ep-nav-icon"><AdminNavIcon :name="m.icon" /></span>
                <span v-show="!sidebarCollapsed" class="adm-ep-nav-label">{{ m.label }}</span>
              </el-button>
            </el-tooltip>
            <!-- parent with submenu -->
            <div v-else class="adm-ep-submenu">
              <el-tooltip
                :content="m.label"
                placement="right"
                :disabled="!sidebarCollapsed"
                :show-after="300"
              >
                <el-button
                  text
                  class="adm-ep-nav-btn"
                  :class="{ 'is-active-parent': isChildActive(m) }"
                  @click="onParentClick(m, $event)"
                >
                  <span class="adm-ep-nav-icon"><AdminNavIcon :name="m.icon" /></span>
                  <span v-show="!sidebarCollapsed" class="adm-ep-nav-label">{{ m.label }}</span>
                  <span v-show="!sidebarCollapsed" class="adm-ep-caret" :class="{ 'is-open': isOpen(m.slug) }">▾</span>
                </el-button>
              </el-tooltip>
              <!-- inline children (expanded sidebar) -->
              <div v-if="!sidebarCollapsed" class="adm-ep-children" :class="{ 'is-open': isOpen(m.slug) }">
                <div class="adm-ep-children-inner">
                  <el-button
                    v-for="c in m.children"
                    :key="c.slug"
                    text
                    class="adm-ep-nav-btn adm-ep-child-btn"
                    :class="{ 'is-active': isActive(c.path) }"
                    @click="navigateTo(c.path)"
                  >
                    <span class="adm-ep-nav-icon adm-ep-child-icon"><AdminNavIcon :name="c.icon" /></span>
                    <span class="adm-ep-nav-label">{{ c.label }}</span>
                  </el-button>
                </div>
              </div>
            </div>
          </template>
        </nav>
        <!-- flyout submenu (collapsed sidebar) -->
        <teleport to="body">
          <div v-if="flyout" class="adm-ep-flyout-mask" @click="flyout = null" />
          <div
            v-if="flyout"
            class="adm-ep-flyout"
            :style="{ top: flyoutPos.top + 'px', left: flyoutPos.left + 'px' }"
          >
            <div class="adm-ep-flyout-title">{{ flyoutMenu?.label }}</div>
            <el-button
              v-for="c in flyoutMenu?.children || []"
              :key="c.slug"
              text
              class="adm-ep-nav-btn"
              :class="{ 'is-active': isActive(c.path) }"
              @click="goFlyout(c.path)"
            >
              <span class="adm-ep-nav-icon"><AdminNavIcon :name="c.icon" /></span>
              <span class="adm-ep-nav-label">{{ c.label }}</span>
            </el-button>
          </div>
        </teleport>

      </aside>

      <!-- Main -->
      <div class="adm-ep-main">
        <header class="adm-ep-top">
          <el-button text class="adm-ep-collapse" @click="sidebarCollapsed = !sidebarCollapsed">
            <span class="adm-ep-collapse-icon" :class="{ 'is-collapsed': sidebarCollapsed }">
              <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="3" width="14" height="12" rx="2.5" />
                <line x1="7" y1="3" x2="7" y2="15" />
                <polyline class="adm-ep-collapse-chev" points="11,7.5 9.5,9 11,10.5" />
              </svg>
            </span>
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

          <el-tooltip :content="t('backToSite')" placement="bottom" :show-after="300">
            <el-button text class="adm-ep-top-iconbtn" @click="goSite">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </el-button>
          </el-tooltip>

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
  dashboard: 'dashboard',
  works: 'works',
  products: 'products',
  services: 'services',
  faqs: 'faqs',
  testimonials: 'testimonials',
  'process-steps': 'process-steps',
  'position-principles': 'position-principles',
  seo: 'seo',
  inquiries: 'inquiries',
  media: 'media',
  translations: 'translations',
  settings: 'settings',
  users: 'users',
  roles: 'roles',
  logs: 'logs',
}

interface NavChild {
  slug: string
  label: string
  path: string
  icon: string
}

interface NavEntry {
  slug: string
  label: string
  icon: string
  path?: string
  children?: NavChild[]
}

const contentNav = computed(() => ADMIN_RESOURCE_LIST)

/** Two-level sidebar menu. */
const navMenus = computed<NavEntry[]>(() => {
  const menus: NavEntry[] = [
    { slug: 'dashboard', label: t('dashboard'), path: '/admin', icon: NAV_ICONS.dashboard },
  ]
  // 内容管理： resources (except seo) + media + translations
  const contentChildren: NavChild[] = []
  for (const r of contentNav.value) {
    if (r.slug === 'seo') continue
    if (!can(r.perm + '.view')) continue
    contentChildren.push({ slug: r.slug, label: t('res.' + r.slug), path: `/admin/${r.slug}`, icon: NAV_ICONS[r.slug] || '•' })
  }
  if (can('media.view')) contentChildren.push({ slug: 'media', label: t('media'), path: '/admin/media', icon: NAV_ICONS.media })
  if (can('translation.trigger')) contentChildren.push({ slug: 'translations', label: t('translations'), path: '/admin/translations', icon: NAV_ICONS.translations })
  if (contentChildren.length) menus.push({ slug: 'content', label: t('content'), icon: 'folder', children: contentChildren })

  // 客户询盘：一级菜单
  if (can('inquiries.view')) menus.push({ slug: 'inquiries', label: t('inquiries'), path: '/admin/inquiries', icon: NAV_ICONS.inquiries })

  // 用户管理： users + roles
  const userDefs: Array<[string, string, string, string]> = [
    ['users', t('users'), '/admin/users', 'users.view'],
    ['roles', t('roles'), '/admin/roles', 'roles.view'],
  ]
  const userChildren: NavChild[] = userDefs
    .filter(([, , , perm]) => can(perm))
    .map(([slug, label, path]) => ({ slug, label, path, icon: NAV_ICONS[slug] || 'dot' }))
  if (userChildren.length) menus.push({ slug: 'userManagement', label: t('userManagement'), icon: 'user', children: userChildren })

  // 系统管理： settings + seo + logs
  const systemDefs: Array<[string, string, string, string]> = [
    ['settings', t('settings'), '/admin/settings', 'settings.view'],
    ['seo', t('res.seo'), '/admin/seo', 'seo.view'],
    ['logs', t('logs'), '/admin/logs', 'logs.view'],
  ]
  const systemChildren: NavChild[] = systemDefs
    .filter(([, , , perm]) => can(perm))
    .map(([slug, label, path]) => ({ slug, label, path, icon: NAV_ICONS[slug] || 'dot' }))
  if (systemChildren.length) menus.push({ slug: 'system', label: t('system'), icon: 'sliders', children: systemChildren })

  return menus
})

/** Expanded submenu slugs (accordion: at most one open). */
const openMenus = ref<string[]>([])
const isOpen = (slug: string) => openMenus.value.includes(slug)
function toggleMenu(slug: string) {
  openMenus.value = isOpen(slug) ? [] : [slug]
}
const isChildActive = (m: NavEntry) => !!m.children?.some((c) => isActive(c.path))

/** Auto-expand the parent of the active route (also after permissions load). */
watch([() => route.path, navMenus], ([p, menus]) => {
  const parent = (menus as NavEntry[]).find((m) => m.children?.some((c) => c.path === p))
  if (parent && !isOpen(parent.slug)) openMenus.value = [parent.slug]
}, { immediate: true })

/** Flyout submenu for the collapsed sidebar (teleported to body). */
const flyout = ref<string | null>(null)
const flyoutPos = ref({ top: 0, left: 0 })
const flyoutMenu = computed(() => navMenus.value.find((m) => m.slug === flyout.value))
function onParentClick(m: NavEntry, ev: MouseEvent) {
  if (!sidebarCollapsed.value) { toggleMenu(m.slug); return }
  if (flyout.value === m.slug) { flyout.value = null; return }
  const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  const estH = (m.children?.length || 0) * 40 + 52
  flyoutPos.value = {
    top: Math.max(8, Math.min(r.top - 4, window.innerHeight - estH - 8)),
    left: r.right + 10,
  }
  flyout.value = m.slug
}
function goFlyout(path: string) {
  flyout.value = null
  navigateTo(path)
}
watch(() => route.path, () => { flyout.value = null })
watch(sidebarCollapsed, () => { flyout.value = null })

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
  if (seg === 'inquiries') return [...crumbs, { label: t('inquiries'), path: '' }]
  const r = ADMIN_RESOURCE_LIST.find((x) => x.slug === seg)
  if (r && r.slug !== 'seo') return [...crumbs, { label: t('content'), path: '' }, { label: t('res.' + r.slug), path: '' }]
  const contentMap: Record<string, string> = {
    media: t('media'), translations: t('translations'),
  }
  const userMap: Record<string, string> = {
    users: t('users'), roles: t('roles'),
  }
  const systemMap: Record<string, string> = {
    settings: t('settings'), seo: t('res.seo'), logs: t('logs'),
  }
  if (contentMap[seg]) return [...crumbs, { label: t('content'), path: '' }, { label: contentMap[seg], path: '' }]
  if (userMap[seg]) return [...crumbs, { label: t('userManagement'), path: '' }, { label: userMap[seg], path: '' }]
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
  document.addEventListener('keydown', closeFlyoutOnEsc)
})
onUnmounted(() => {
  document.removeEventListener('keydown', closeFlyoutOnEsc)
})
function closeFlyoutOnEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') flyout.value = null
}

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
  transition: width 0.28s cubic-bezier(0.4, 0, 0.2, 1);
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
  min-height: 60px;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
.adm-ep-collapse-icon {
  display: inline-flex;
  color: inherit;
}
.adm-ep-collapse-icon svg {
  display: block;
  width: 18px;
  height: 18px;
}
.adm-ep-collapse-chev {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  transform-box: fill-box;
  transform-origin: center;
}
.adm-ep-collapse-icon.is-collapsed .adm-ep-collapse-chev {
  transform: rotate(180deg);
}
/* topbar icon buttons (collapse, back-to-site) */
.adm-ep-top-iconbtn {
  color: #a1a1aa;
  padding: 8px;
  border-radius: 8px;
  transition: color 0.2s ease, background-color 0.2s ease;
}
.adm-ep-top-iconbtn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}
.adm-ep-top-iconbtn svg {
  display: block;
  width: 17px;
  height: 17px;
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

/* ---------- Two-level submenu ---------- */
.adm-ep-submenu {
  margin-bottom: 2px;
}
.adm-ep-caret {
  margin-left: auto;
  font-size: 11px;
  color: #63636b;
  transition: transform 0.24s ease;
  flex-shrink: 0;
}
.adm-ep-caret.is-open {
  transform: rotate(180deg);
}
.adm-ep-nav-btn .adm-ep-caret {
  margin-right: 2px;
}
/* inline children: smooth height animation */
.adm-ep-children {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}
.adm-ep-children.is-open {
  grid-template-rows: 1fr;
}
.adm-ep-children-inner {
  overflow: hidden;
  min-height: 0;
}
/* parent of the active route: subtle hint, the child keeps the active bar */
.adm-ep-nav-btn.is-active-parent {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}
.adm-ep-nav-btn.is-active-parent .adm-ep-caret {
  color: #a1a1aa;
}
.adm-ep-child-btn {
  font-size: 13px;
  color: #8e8e96;
  margin-bottom: 1px;
}
.adm-ep-child-icon {
  color: #63636b;
  transition: color 0.2s ease;
}
.adm-ep-child-btn:hover .adm-ep-child-icon {
  color: #a1a1aa;
}
.adm-ep-child-btn.is-active .adm-ep-child-icon {
  color: #a5b4fc;
}
/* label fade-in when expanding the sidebar */
.adm-ep-side:not(.is-collapsed) .adm-ep-nav-label,
.adm-ep-side:not(.is-collapsed) .adm-ep-brand-text,
.adm-ep-side:not(.is-collapsed) .adm-ep-caret {
  animation: admNavIn 0.22s ease;
}
@keyframes admNavIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}

/* ---------- Collapsed flyout submenu ---------- */
.adm-ep-flyout-mask {
  position: fixed;
  inset: 0;
  z-index: 60;
  background: transparent;
}
.adm-ep-flyout {
  position: fixed;
  z-index: 61;
  min-width: 212px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: #1c1c21;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
  animation: admFlyIn 0.16s ease;
}
@keyframes admFlyIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}
.adm-ep-flyout-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #63636b;
  padding: 8px 12px 6px;
}
.adm-ep-flyout .adm-ep-nav-btn {
  margin-bottom: 2px;
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

<style>
/* ===== Werkero admin: Element Plus dark polish =====
   el-table / el-pagination / el-loading are only rendered by /admin pages
   (verified 2026-10-10 — the public site uses none of them), so these
   global rules cannot leak into the storefront. */

/* ---- table ---- */
.el-table {
  --el-table-border-color: rgba(255, 255, 255, 0.07);
  --el-table-header-bg-color: rgba(255, 255, 255, 0.025);
  --el-table-header-text-color: #8e8e96;
  --el-table-text-color: #d4d4d8;
  --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.035);
  --el-table-current-row-bg-color: rgba(91, 140, 255, 0.08);
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  font-size: 13.5px;
}
.el-table th.el-table__cell > .cell {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.el-table .cell { line-height: 1.55; }
.el-table td.el-table__cell { padding: 12px 0; }
.el-table__empty-text { color: #63636b; }
.el-table__body tr:last-child td.el-table__cell { border-bottom: 0; }
.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell {
  background: rgba(255, 255, 255, 0.018);
}

/* ---- pagination ---- */
.el-pagination {
  --el-pagination-font-size: 13px;
  --el-text-color-regular: #a1a1aa;
  flex-wrap: wrap;
  row-gap: 10px;
  column-gap: 10px;
}
.el-pagination .el-pager {
  display: flex;
  gap: 6px;
  padding: 0;
  margin: 0;
}
.el-pagination .el-pager li,
.el-pagination .btn-prev,
.el-pagination .btn-next {
  background-color: transparent;
  color: #8e8e96;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 8px;
  min-width: 30px;
  height: 30px;
  line-height: 28px;
  padding: 0 6px;
  font-weight: 500;
  margin: 0;
  transition: color 0.15s ease, border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}
.el-pagination .el-pager li:hover,
.el-pagination .btn-prev:hover:not(:disabled),
.el-pagination .btn-next:hover:not(:disabled) {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.22);
  background-color: rgba(255, 255, 255, 0.04);
}
.el-pagination .el-pager li.is-active {
  background: linear-gradient(135deg, #5b8cff, #8b5cf6);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(91, 140, 255, 0.4);
}
.el-pagination .btn-prev:disabled,
.el-pagination .btn-next:disabled {
  color: #3f3f46;
  border-color: rgba(255, 255, 255, 0.05);
}
.el-pagination__total,
.el-pagination__sizes,
.el-pagination__jump { color: #8e8e96; }
.el-pagination .el-select .el-input__wrapper,
.el-pagination .el-input__wrapper {
  background-color: transparent;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.12) inset;
  border-radius: 8px;
  transition: box-shadow 0.15s ease;
}
.el-pagination .el-input__inner { color: #e4e4e7; }
.el-pagination .el-select .el-input__wrapper:hover,
.el-pagination .el-input__wrapper:hover { box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.24) inset; }
.el-pagination .el-select .el-input__wrapper.is-focus,
.el-pagination .el-input__wrapper.is-focus { box-shadow: 0 0 0 1px #5b8cff inset; }

/* ---- pagination layout: total left, controls right ---- */
.adm-ep-pager {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}
.adm-ep-pager-total {
  font-size: 13px;
  color: #8e8e96;
  white-space: nowrap;
}
.adm-ep-pager .el-pagination {
  margin: 0;
}

/* ---- tabs (logs / inquiries / settings) ---- */
.el-tabs__header {
  margin-bottom: 18px;
}
.el-tabs__nav-wrap::after {
  background-color: rgba(255, 255, 255, 0.07);
  height: 1px;
}
.el-tabs__item {
  color: #8e8e96;
  font-size: 13.5px;
  font-weight: 500;
  padding: 0 18px;
  height: 42px;
  line-height: 42px;
  transition: color 0.18s ease;
}
.el-tabs__item:hover {
  color: #e4e4e7;
}
.el-tabs__item.is-active {
  color: #ffffff;
  font-weight: 600;
}
.el-tabs__active-bar {
  background: linear-gradient(90deg, #5b8cff, #8b5cf6);
  height: 2px;
  border-radius: 2px;
}
.el-tabs__nav-next,
.el-tabs__nav-prev {
  color: #8e8e96;
  line-height: 42px;
}
.el-tabs__nav-next:hover,
.el-tabs__nav-prev:hover {
  color: #fff;
}

/* ---- filter controls: button group (translations) / radio buttons (media) ---- */
.el-button-group .el-button--default {
  --el-button-bg-color: transparent;
  --el-button-border-color: rgba(255, 255, 255, 0.1);
  --el-button-text-color: #8e8e96;
  --el-button-hover-bg-color: rgba(255, 255, 255, 0.05);
  --el-button-hover-border-color: rgba(255, 255, 255, 0.22);
  --el-button-hover-text-color: #ffffff;
}
.el-button-group .el-button--primary {
  background: linear-gradient(135deg, #5b8cff, #8b5cf6);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(91, 140, 255, 0.35);
}
.el-radio-button .el-radio-button__inner {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.1);
  color: #8e8e96;
  box-shadow: none;
  font-weight: 500;
  transition: color 0.18s ease, border-color 0.18s ease, background 0.18s ease;
}
.el-radio-button .el-radio-button__inner:hover {
  color: #ffffff;
}
.el-radio-button.is-active .el-radio-button__inner {
  background: linear-gradient(135deg, #5b8cff, #8b5cf6);
  border-color: transparent;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(91, 140, 255, 0.35);
}

/* ---- loading mask over dark tables ---- */
.el-loading-mask { --el-mask-color: rgba(20, 20, 24, 0.72); }
.el-loading-spinner .path { stroke: #5b8cff; }
.el-loading-spinner .el-loading-text { color: #a1a1aa; }

/* ---- tags / code inside dark tables ---- */
.el-table .el-tag--info {
  --el-tag-bg-color: rgba(255, 255, 255, 0.06);
  --el-tag-border-color: rgba(255, 255, 255, 0.1);
  --el-tag-text-color: #a1a1aa;
}
.el-table code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12.5px;
  background: rgba(165, 180, 252, 0.1);
  color: #a5b4fc;
  padding: 2px 8px;
  border-radius: 6px;
}
</style>
