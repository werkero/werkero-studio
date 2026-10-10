/** Admin working locale + UI dictionary loaded from locales/<lang>/admin.json (§9.2 single-language mode). */
import { ADMIN_LOCALES } from '~/utils/admin-resources'

export const ADMIN_LOCALE_KEY = 'werkero_admin_locale'

// Load admin UI strings from JSON files (same convention as frontend L1)
const adminModules = import.meta.glob('~/locales/*/admin.json', { eager: true }) as Record<string, { default: Record<string, string> }>
const DICT: Record<string, Record<string, string>> = {}
for (const [path, mod] of Object.entries(adminModules)) {
  const m = path.match(/locales\/([^/]+)\/admin\.json/)
  if (m) DICT[m[1]] = mod.default
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

  /** UI chrome language: use the working locale directly; t() falls back to en for missing keys. */
  const uiLang = computed(() => (DICT[locale.value] ? locale.value : 'en'))
  const t = (key: string): string => DICT[uiLang.value]?.[key] ?? DICT.en[key] ?? key

  /**
   * Translate a DB status value for display. The database keeps English
   * values untouched — this only maps them to the UI language, falling
   * back to the raw value when no translation exists.
   */
  const st = (s: string): string => {
    if (!s) return s
    const key = 'status.' + s
    return DICT[uiLang.value]?.[key] ?? DICT.en[key] ?? s
  }

  const current = computed(() => ADMIN_LOCALES.find((l) => l.code === locale.value) ?? ADMIN_LOCALES[0])

  return { locale, setLocale, t, st, current, locales: ADMIN_LOCALES, uiLang }
}
