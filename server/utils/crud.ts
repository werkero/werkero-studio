import { useDb, normLocale } from './db'
import { getPagination, paginated, apiError } from './api'
import { requireAdmin, requirePermission, logOperation, AdminSession } from './auth'

export interface ResourceConfig {
  table: string
  /** permission prefix, e.g. 'works' → checks works.view/create/edit/delete/publish */
  perm: string
  /** JSONB multilingual fields — written per-locale */
  i18nFields: string[]
  /** plain columns writable on create/update */
  plainFields: string[]
  /** columns for list view */
  listColumns: string
  orderBy: string
}

/**
 * Single-language write: body = { locale, data: { field: value } }.
 * Only writes data.<field> into jsonb field -> locale. Plain fields written directly.
 * Creates translation jobs for other locales (text fields only).
 */
async function applyWrite(table: string, cfg: ResourceConfig, id: string | null,
  session: AdminSession, body: any, brandId: string) {
  const locale = normLocale(body.locale || 'en')
  const data = body.data || {}
  // For INSERT, i18n exprs use '{}' base (no column ref); for UPDATE, COALESCE with existing
  const i18nExpr = (f: string, p: number, forInsert: boolean) =>
    forInsert
      ? `jsonb_set('{}'::jsonb, '{${locale}}', $${p}::jsonb)`
      : `jsonb_set(COALESCE(${f}, '{}'::jsonb), '{${locale}}', $${p}::jsonb)`
  const fieldDefs: { col: string; expr: (forInsert: boolean) => string; paramIdx: number }[] = []
  const params: any[] = []
  let i = 1

  for (const f of cfg.i18nFields) {
    if (data[f] === undefined) continue
    params.push(JSON.stringify(data[f]))
    const p = i++
    fieldDefs.push({ col: f, expr: (fi) => i18nExpr(f, p, fi), paramIdx: p })
  }
  for (const f of cfg.plainFields) {
    if (data[f] === undefined) continue
    params.push(data[f])
    const p = i++
    fieldDefs.push({ col: f, expr: () => `$${p}`, paramIdx: p })
  }
  if (!fieldDefs.length) apiError(400, 'VALIDATION', 'nothing to update')

  let rowId = id
  let before: any = null
  if (id) {
    const cur = await useDb().query(`SELECT * FROM ${table} WHERE id = $1`, [id])
    if (!cur.rows.length) apiError(404, 'NOT_FOUND', 'not found')
    before = cur.rows[0]
    params.push(id)
    const sets = fieldDefs.map((d) => `${d.col} = ${d.expr(false)}`)
    sets.push(`updated_at = now()`)
    await useDb().query(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${i}`, params)
  } else {
    params.push(brandId)
    const cols = fieldDefs.map((d) => d.col)
    const exprs = fieldDefs.map((d) => d.expr(true))
    const ins = await useDb().query(
      `INSERT INTO ${table} (${cols.join(', ')}, updated_at, brand_id) VALUES (${exprs.join(', ')}, now(), $${params.length}) RETURNING *`, params)
    rowId = ins.rows[0].id
    before = null
  }

  const after = (await useDb().query(`SELECT * FROM ${table} WHERE id = $1`, [rowId])).rows[0]
  await logOperation(session, id ? 'update' : 'create', table, rowId, before, after, null)

  // Queue translation jobs for other locales (text fields only, skip if human-edited later)
  if (id || rowId) {
    const { rows: locales } = await useDb().query(`SELECT code FROM locales WHERE is_active AND code <> $1`, [locale])
    for (const f of cfg.i18nFields) {
      if (data[f] === undefined || typeof data[f] !== 'string') continue
      for (const l of locales) {
        await useDb().query(
          `INSERT INTO translation_jobs (brand_id, resource_type, resource_id, field, source_locale, target_locale, status)
           VALUES ($1,$2,$3,$4,$5,$6,'pending')
           ON CONFLICT DO NOTHING`,
          [brandId, table, rowId, f, locale, l.code])
      }
    }
  }
  return after
}

export function makeAdminResource(cfg: ResourceConfig) {
  const list = async (event: any) => {
    const s = await requireAdmin(event)
    requirePermission(s, `${cfg.perm}.view`)
    const locale = normLocale(getQuery(event).locale)
    const { limit, offset, page, pageSize } = getPagination(event)
    const total = await useDb().query(
      `SELECT count(*)::int AS n FROM ${cfg.table} WHERE brand_id=$1 AND deleted_at IS NULL`, [s.brandId])
    const { rows } = await useDb().query(
      `SELECT ${cfg.listColumns} FROM ${cfg.table}
        WHERE brand_id=$1 AND deleted_at IS NULL ORDER BY ${cfg.orderBy} LIMIT $2 OFFSET $3`,
      [s.brandId, limit, offset])
    return paginated(rows, total.rows[0].n, page, pageSize)
  }

  const create = async (event: any) => {
    const s = await requireAdmin(event)
    requirePermission(s, `${cfg.perm}.create`)
    const body = await readBody(event)
    const row = await applyWrite(cfg.table, cfg, null, s, body, s.brandId)
    return { ok: true, id: row.id }
  }

  const update = async (event: any) => {
    const s = await requireAdmin(event)
    requirePermission(s, `${cfg.perm}.edit`)
    const body = await readBody(event)
    const id = getRouterParam(event, 'id') as string
    // brand isolation
    const chk = await useDb().query(`SELECT id FROM ${cfg.table} WHERE id=$1 AND brand_id=$2`, [id, s.brandId])
    if (!chk.rows.length) apiError(404, 'NOT_FOUND', 'not found')
    const row = await applyWrite(cfg.table, cfg, id, s, body, s.brandId)
    return { ok: true, id: row.id }
  }

  const remove = async (event: any) => {
    const s = await requireAdmin(event)
    requirePermission(s, `${cfg.perm}.delete`)
    const id = getRouterParam(event, 'id') as string
    const cur = await useDb().query(`SELECT * FROM ${cfg.table} WHERE id=$1 AND brand_id=$2`, [id, s.brandId])
    if (!cur.rows.length) apiError(404, 'NOT_FOUND', 'not found')
    await useDb().query(`UPDATE ${cfg.table} SET deleted_at=now(), updated_at=now() WHERE id=$1`, [id])
    await logOperation(s, 'delete', cfg.table, id, cur.rows[0], null, getRequestIP(event))
    return { ok: true }
  }

  const publish = async (event: any) => {
    const s = await requireAdmin(event)
    requirePermission(s, `${cfg.perm}.publish`)
    const id = getRouterParam(event, 'id') as string
    const body = await readBody(event)
    const status = String(body.status || '')
    // Status flow per resource: testimonials use moderation flow, others use draft/published/archived
    const validStatuses = cfg.table === 'testimonials'
      ? ['pending', 'approved', 'rejected']
      : ['draft', 'published', 'archived']
    if (!validStatuses.includes(status)) apiError(400, 'VALIDATION', `bad status, expected one of: ${validStatuses.join('/')}`)
    const cur = await useDb().query(`SELECT status FROM ${cfg.table} WHERE id=$1 AND brand_id=$2`, [id, s.brandId])
    if (!cur.rows.length) apiError(404, 'NOT_FOUND', 'not found')
    await useDb().query(`UPDATE ${cfg.table} SET status=$1, updated_at=now() WHERE id=$2`, [status, id])
    await logOperation(s, 'publish', cfg.table, id, { status: cur.rows[0].status }, { status }, getRequestIP(event))
    return { ok: true }
  }

  return { list, create, update, remove, publish }
}
