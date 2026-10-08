import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "seo", "perm": "seo", "i18nFields": ["meta"], "plainFields": ["page_key", "noindex"], "listColumns": "id, page_key, noindex, updated_at", "orderBy": "page_key ASC"})

// PATCH /api/admin/<resource>/:id { status } — publish workflow
export default defineEventHandler(async (event) => h.publish(event))
