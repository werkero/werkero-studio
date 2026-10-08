import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "products", "perm": "products", "i18nFields": ["name", "tagline", "description", "specs", "body", "meta"], "plainFields": ["slug", "sort_order", "status", "cover_asset_id"], "listColumns": "id, slug, name, status, sort_order, updated_at", "orderBy": "sort_order ASC"})

// PATCH /api/admin/<resource>/:id { status } — publish workflow
export default defineEventHandler(async (event) => h.publish(event))
