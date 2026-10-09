/** Admin working locale + tiny en/zh-cn UI dictionary (§9.2 single-language mode). */
import { ADMIN_LOCALES } from '~/utils/admin-resources'

export const ADMIN_LOCALE_KEY = 'werkero_admin_locale'

const DICT: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard', inquiries: 'Inquiries', media: 'Media', translations: 'Translations',
    settings: 'Settings', users: 'Users', roles: 'Roles', logs: 'Logs', logout: 'Logout',
    content: 'Content', system: 'System',
    total: 'Total', new: 'New', create: 'Create', edit: 'Edit', save: 'Save', cancel: 'Cancel',
    delete: 'Delete', actions: 'Actions', title: 'Title', status: 'Status', updated: 'Updated',
    page: 'Page', of: 'of', search: 'Search', all: 'All',
    untranslated: 'Untranslated', login: 'Login', username: 'Username', password: 'Password',
    signIn: 'Sign in', loginFailed: 'Login failed', backToSite: 'Back to site',
    recentInquiries: 'Recent inquiries', failedTranslations: 'Failed translations',
    noData: 'No data', confirmDelete: 'Delete this item? This is a soft delete.',
    name: 'Name', email: 'Email', role: 'Role', active: 'Active', lastLogin: 'Last login',
    createUser: 'Create user', resetPassword: 'Reset password', deactivate: 'Deactivate', activate: 'Activate',
    permissions: 'Permissions', savePermissions: 'Save permissions', systemRole: 'System role',
    provider: 'Provider', label: 'Label', masked: 'Masked value', secret: 'Secret key', saveCredential: 'Save credential',
    key: 'Key', value: 'Value', description: 'Description',
    fileUrl: 'File URL', alt: 'Alt text', register: 'Register',
    loginLogs: 'Login logs', operationLogs: 'Operation logs', time: 'Time', user: 'User',
    ip: 'IP', success: 'Success', reason: 'Reason', action: 'Action', resource: 'Resource', detail: 'Detail',
    field: 'Field', from: 'From', to: 'To', targetLocale: 'Target', attempts: 'Attempts', error: 'Error',
    processNow: 'Process now', retry: 'Retry', message: 'Message', company: 'Company', budget: 'Budget', source: 'Source',
    markContacted: 'Mark contacted', markClosed: 'Mark closed', markSpam: 'Mark spam', reopen: 'Reopen',
    publish: 'Publish', unpublish: 'Unpublish', archive: 'Archive', draft: 'Draft',
    saved: 'Saved', loading: 'Loading…', required: 'Required',
    currentLocaleOnly: 'Editing only the current language version.',
  },
  'zh-cn': {
    dashboard: '仪表盘', inquiries: '询盘', media: '媒体库', translations: '翻译任务',
    settings: '设置', users: '用户', roles: '角色', logs: '日志', logout: '退出登录',
    content: '内容', system: '系统',
    total: '总数', new: '新建', create: '创建', edit: '编辑', save: '保存', cancel: '取消',
    delete: '删除', actions: '操作', title: '标题', status: '状态', updated: '更新时间',
    page: '页', of: '共', search: '搜索', all: '全部',
    untranslated: '未翻译', login: '登录', username: '用户名', password: '密码',
    signIn: '登录', loginFailed: '登录失败', backToSite: '返回网站',
    recentInquiries: '最近询盘', failedTranslations: '失败的翻译任务',
    noData: '暂无数据', confirmDelete: '删除这一项？（软删除）',
    name: '姓名', email: '邮箱', role: '角色', active: '启用', lastLogin: '上次登录',
    createUser: '新建用户', resetPassword: '重置密码', deactivate: '停用', activate: '启用',
    permissions: '权限', savePermissions: '保存权限', systemRole: '系统角色',
    provider: '服务商', label: '备注', masked: '掩码值', secret: '密钥', saveCredential: '保存凭证',
    key: '键', value: '值', description: '说明',
    fileUrl: '文件 URL', alt: '替代文本', register: '登记',
    loginLogs: '登录日志', operationLogs: '操作日志', time: '时间', user: '用户',
    ip: 'IP', success: '成功', reason: '原因', action: '动作', resource: '资源', detail: '详情',
    field: '字段', from: '源语言', to: '目标语言', targetLocale: '目标', attempts: '尝试次数', error: '错误',
    processNow: '立即处理', retry: '重试', message: '留言', company: '公司', budget: '预算', source: '来源',
    markContacted: '标为已联系', markClosed: '标为已关闭', markSpam: '标为垃圾', reopen: '重新打开',
    publish: '发布', unpublish: '取消发布', archive: '归档', draft: '草稿',
    saved: '已保存', loading: '加载中…', required: '必填',
    currentLocaleOnly: '仅编辑当前语言版本。',
  },
}

/** Module-level singleton: guarantees layout and pages share the exact same ref.
 * (useState('admin-locale') was not propagating across layout/page boundary.) */
const _adminLocale = ref('en')
let _adminLocaleInit = false

export function useAdminLocale() {
  // Init once from localStorage on client
  if (!_adminLocaleInit && typeof localStorage !== 'undefined') {
    _adminLocaleInit = true
    const saved = localStorage.getItem(ADMIN_LOCALE_KEY)
    if (saved && ADMIN_LOCALES.some((l) => l.code === saved)) _adminLocale.value = saved
  }
  const locale = _adminLocale

  const setLocale = (code: string) => {
    locale.value = code
    if (typeof localStorage !== 'undefined') localStorage.setItem(ADMIN_LOCALE_KEY, code)
  }

  /** UI chrome language: zh-cn when working in Chinese, else en. */
  const uiLang = computed(() => (locale.value === 'zh-cn' || locale.value === 'zh-tw' ? 'zh-cn' : 'en'))
  const t = (key: string): string => DICT[uiLang.value]?.[key] ?? DICT.en[key] ?? key

  const current = computed(() => ADMIN_LOCALES.find((l) => l.code === locale.value) ?? ADMIN_LOCALES[0])

  return { locale, setLocale, t, current, locales: ADMIN_LOCALES, uiLang }
}
