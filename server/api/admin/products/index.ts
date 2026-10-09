import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "products", "perm": "products", "i18nFields": ["name", "tagline", "description", "specs", "body", "meta"], "plainFields": ["slug", "sort_order", "status", "cover_asset_id"], "listColumns": "id, slug, name, tagline, description, specs, body, meta, cover_asset_id, status, sort_order, updated_at", "orderBy": "sort_order ASC"})

export default defineEventHandler(async (event) => {
  if (event.method === 'POST') return h.create(event)
  return h.list(event)
})
