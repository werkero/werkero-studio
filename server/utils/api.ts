import { useDb } from './db'

/** Resolve brand slug → brand_id. Defaults to BRAND_SLUG env or 'werkero'. */
export async function getBrandId(event: any): Promise<string> {
  const q = getQuery(event)
  const slug = String(q.brand || process.env.BRAND_SLUG || 'werkero')
  const { rows } = await useDb().query('SELECT id FROM brands WHERE slug = $1 AND deleted_at IS NULL LIMIT 1', [slug])
  if (!rows.length) throw createError({ statusCode: 404, data: { error: { code: 'BRAND_NOT_FOUND', message: `Brand not found: ${slug}` } } })
  return rows[0].id
}

/** Pagination: ?page=1&pageSize=20 → { limit, offset, page, pageSize } */
export function getPagination(event: any) {
  const q = getQuery(event)
  const page = Math.max(1, parseInt(String(q.page || '1'), 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(String(q.pageSize || '20'), 10) || 1))
  return { limit: pageSize, offset: (page - 1) * pageSize, page, pageSize }
}

export function paginated<T>(data: T[], total: number, page: number, pageSize: number) {
  return { data, pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) } }
}

/** Unified error shape: { error: { code, message } } */
export function apiError(statusCode: number, code: string, message: string): never {
  throw createError({ statusCode, data: { error: { code, message } } })
}
