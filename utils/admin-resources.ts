/** Admin panel resource registry — drives the generic list + form UI.
 *  Field types: text | textarea | markdown | number | select | json
 *  - i18n: true  → JSONB multilingual field, edited per current admin locale
 *  - i18n: false → plain column, locale-independent
 */

export type AdminFieldType = 'text' | 'textarea' | 'markdown' | 'number' | 'select' | 'json'

export interface AdminField {
  key: string
  type: AdminFieldType
  label: string
  i18n: boolean
  required?: boolean
  list?: boolean // show as a column in the list table
  options?: { value: string; label: string }[]
  placeholder?: string
  /** for json fields holding string arrays: edit as one-item-per-line */
  lines?: boolean
}

export interface AdminResource {
  slug: string // URL segment + API path under /api/admin/
  name: string // English label
  nameZh: string // Chinese label
  perm: string // permission prefix, e.g. 'works'
  titleField: string // i18n/plain field used as the row title
  statuses: string[] // publish-flow statuses
  fields: AdminField[]
}

const STATUS = ['draft', 'published', 'archived']

export const ADMIN_RESOURCES: Record<string, AdminResource> = {
  works: {
    slug: 'works', name: 'Works', nameZh: '作品', perm: 'works',
    titleField: 'title', statuses: STATUS,
    fields: [
      { key: 'title', type: 'text', label: 'Title', i18n: true, required: true, list: true },
      { key: 'slug', type: 'text', label: 'Slug', i18n: false, required: true, placeholder: 'my-project' },
      { key: 'tagline', type: 'text', label: 'Tagline', i18n: true },
      { key: 'role', type: 'text', label: 'Role', i18n: true },
      { key: 'services', type: 'json', label: 'Services', i18n: true, lines: true, placeholder: 'one per line' },
      { key: 'overview', type: 'textarea', label: 'Overview', i18n: true },
      { key: 'highlights', type: 'json', label: 'Highlights', i18n: true, lines: true, placeholder: 'one per line' },
      { key: 'body', type: 'markdown', label: 'Body (Markdown)', i18n: true },
      { key: 'meta', type: 'json', label: 'Meta (JSON)', i18n: true, placeholder: '{"key":"value"}' },
      { key: 'cover_asset_id', type: 'text', label: 'Cover asset ID', i18n: false },
      { key: 'sort_order', type: 'number', label: 'Sort order', i18n: false },
      { key: 'status', type: 'select', label: 'Status', i18n: false, list: true, options: STATUS.map((s) => ({ value: s, label: s })) },
    ],
  },
  products: {
    slug: 'products', name: 'Products', nameZh: '产品', perm: 'products',
    titleField: 'name', statuses: STATUS,
    fields: [
      { key: 'name', type: 'text', label: 'Name', i18n: true, required: true, list: true },
      { key: 'slug', type: 'text', label: 'Slug', i18n: false, required: true },
      { key: 'tagline', type: 'text', label: 'Tagline', i18n: true },
      { key: 'description', type: 'textarea', label: 'Description', i18n: true },
      { key: 'specs', type: 'json', label: 'Specs (JSON)', i18n: true },
      { key: 'body', type: 'markdown', label: 'Body (Markdown)', i18n: true },
      { key: 'meta', type: 'json', label: 'Meta (JSON)', i18n: true },
      { key: 'cover_asset_id', type: 'text', label: 'Cover asset ID', i18n: false },
      { key: 'sort_order', type: 'number', label: 'Sort order', i18n: false },
      { key: 'status', type: 'select', label: 'Status', i18n: false, list: true, options: STATUS.map((s) => ({ value: s, label: s })) },
    ],
  },
  services: {
    slug: 'services', name: 'Services', nameZh: '服务', perm: 'services',
    titleField: 'title', statuses: STATUS,
    fields: [
      { key: 'title', type: 'text', label: 'Title', i18n: true, required: true, list: true },
      { key: 'slug', type: 'text', label: 'Slug', i18n: false, required: true },
      { key: 'description', type: 'textarea', label: 'Description', i18n: true },
      { key: 'points', type: 'json', label: 'Points', i18n: true, lines: true, placeholder: 'one per line' },
      { key: 'icon', type: 'text', label: 'Icon', i18n: false },
      { key: 'sort_order', type: 'number', label: 'Sort order', i18n: false },
      { key: 'status', type: 'select', label: 'Status', i18n: false, list: true, options: STATUS.map((s) => ({ value: s, label: s })) },
    ],
  },
  faqs: {
    slug: 'faqs', name: 'FAQs', nameZh: '常见问题', perm: 'faqs',
    titleField: 'question', statuses: STATUS,
    fields: [
      { key: 'question', type: 'text', label: 'Question', i18n: true, required: true, list: true },
      { key: 'answer', type: 'textarea', label: 'Answer', i18n: true },
      { key: 'category', type: 'text', label: 'Category', i18n: false },
      { key: 'sort_order', type: 'number', label: 'Sort order', i18n: false },
      { key: 'status', type: 'select', label: 'Status', i18n: false, list: true, options: STATUS.map((s) => ({ value: s, label: s })) },
    ],
  },
  testimonials: {
    slug: 'testimonials', name: 'Testimonials', nameZh: '评价', perm: 'testimonials',
    titleField: 'content',
    // NOTE: DB check constrains testimonials.status to pending/approved/rejected,
    // but the generic PATCH publish flow only accepts draft/published/archived.
    // Status is therefore edited via the form (PUT) only — no quick-action buttons.
    statuses: [],
    fields: [
      { key: 'content', type: 'textarea', label: 'Content', i18n: true, required: true, list: true },
      { key: 'client_name', type: 'text', label: 'Client name', i18n: false, required: true },
      { key: 'client_title', type: 'text', label: 'Client title', i18n: true },
      { key: 'rating', type: 'select', label: 'Rating', i18n: false, options: ['1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v })) },
      { key: 'avatar_asset_id', type: 'text', label: 'Avatar asset ID', i18n: false },
      { key: 'sort_order', type: 'number', label: 'Sort order', i18n: false },
      { key: 'status', type: 'select', label: 'Status', i18n: false, list: true, options: ['pending', 'approved', 'rejected'].map((s) => ({ value: s, label: s })) },
    ],
  },
  'process-steps': {
    slug: 'process-steps', name: 'Process steps', nameZh: '流程步骤', perm: 'process_steps',
    titleField: 'title', statuses: STATUS,
    fields: [
      { key: 'title', type: 'text', label: 'Title', i18n: true, required: true, list: true },
      { key: 'description', type: 'textarea', label: 'Description', i18n: true },
      { key: 'step_no', type: 'number', label: 'Step no.', i18n: false },
      { key: 'sort_order', type: 'number', label: 'Sort order', i18n: false },
      { key: 'status', type: 'select', label: 'Status', i18n: false, list: true, options: STATUS.map((s) => ({ value: s, label: s })) },
    ],
  },
  'position-principles': {
    slug: 'position-principles', name: 'Position principles', nameZh: '定位原则', perm: 'position_principles',
    titleField: 'title', statuses: STATUS,
    fields: [
      { key: 'title', type: 'text', label: 'Title', i18n: true, required: true, list: true },
      { key: 'description', type: 'textarea', label: 'Description', i18n: true },
      { key: 'sort_order', type: 'number', label: 'Sort order', i18n: false },
      { key: 'status', type: 'select', label: 'Status', i18n: false, list: true, options: STATUS.map((s) => ({ value: s, label: s })) },
    ],
  },
  seo: {
    slug: 'seo', name: 'SEO', nameZh: 'SEO', perm: 'seo',
    titleField: 'page_key', statuses: [],
    fields: [
      { key: 'page_key', type: 'text', label: 'Page key', i18n: false, required: true, list: true, placeholder: 'home' },
      { key: 'meta', type: 'json', label: 'Meta (JSON)', i18n: true, placeholder: '{"title":{"en":"…"}}' },
      { key: 'noindex', type: 'select', label: 'Noindex', i18n: false, options: [{ value: 'false', label: 'false' }, { value: 'true', label: 'true' }] },
    ],
  },
}

export const ADMIN_RESOURCE_LIST = Object.values(ADMIN_RESOURCES)

/** The 7 working locales (matches DB locales table). */
export const ADMIN_LOCALES = [
  { code: 'en', name: 'English', flag: 'gb' },
  { code: 'zh-cn', name: '简体中文', flag: 'cn' },
  { code: 'zh-tw', name: '繁體中文', flag: 'tw' },
  { code: 'fr', name: 'Français', flag: 'fr' },
  { code: 'de', name: 'Deutsch', flag: 'de' },
  { code: 'ru', name: 'Русский', flag: 'ru' },
  { code: 'ja', name: '日本語', flag: 'jp' },
] as const

/** Permission catalog grouped by module (mirrors the DB seed). */
export const PERMISSION_CATALOG: { module: string; perms: string[] }[] = [
  { module: 'works', perms: ['works.view', 'works.create', 'works.edit', 'works.delete', 'works.publish'] },
  { module: 'products', perms: ['products.view', 'products.create', 'products.edit', 'products.delete', 'products.publish'] },
  { module: 'services', perms: ['services.view', 'services.create', 'services.edit', 'services.delete', 'services.publish'] },
  { module: 'faqs', perms: ['faqs.view', 'faqs.create', 'faqs.edit', 'faqs.delete', 'faqs.publish'] },
  { module: 'process_steps', perms: ['process_steps.view', 'process_steps.create', 'process_steps.edit', 'process_steps.delete', 'process_steps.publish'] },
  { module: 'position_principles', perms: ['position_principles.view', 'position_principles.create', 'position_principles.edit', 'position_principles.delete', 'position_principles.publish'] },
  { module: 'testimonials', perms: ['testimonials.view', 'testimonials.moderate', 'testimonials.delete'] },
  { module: 'media', perms: ['media.view', 'media.upload', 'media.delete'] },
  { module: 'inquiries', perms: ['inquiries.view', 'inquiries.update'] },
  { module: 'translation', perms: ['translation.trigger', 'translation.retry'] },
  { module: 'settings', perms: ['settings.view', 'settings.edit'] },
  { module: 'seo', perms: ['seo.view', 'seo.edit'] },
  { module: 'credentials', perms: ['credentials.view', 'credentials.edit'] },
  { module: 'users', perms: ['users.view', 'users.create', 'users.edit', 'users.delete'] },
  { module: 'roles', perms: ['roles.view', 'roles.edit'] },
  { module: 'logs', perms: ['logs.view'] },
]

/** Count locales that have a non-empty value in a JSONB i18n field. */
export function i18nCompleteness(value: unknown): number {
  if (!value || typeof value !== 'object') return 0
  return Object.values(value as Record<string, unknown>).filter(
    (v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
  ).length
}

/** Pick the display string for the current locale from a JSONB i18n field. */
export function i18nPick(value: unknown, locale: string): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return String(value)
  const o = value as Record<string, unknown>
  const v = o[locale] ?? o.en ?? Object.values(o)[0]
  if (Array.isArray(v)) return v.join(' / ')
  if (typeof v === 'object' && v !== null) return JSON.stringify(v)
  return v == null ? '' : String(v)
}
