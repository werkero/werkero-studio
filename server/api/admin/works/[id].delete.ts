import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "works", "perm": "works", "i18nFields": ["title", "tagline", "role", "services", "overview", "highlights", "body", "meta"], "plainFields": ["slug", "sort_order", "status", "cover_asset_id"], "listColumns": "id, slug, title, status, sort_order, updated_at", "orderBy": "sort_order ASC"})

export default defineEventHandler(async (event) => h.remove(event))
