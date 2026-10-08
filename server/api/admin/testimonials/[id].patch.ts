import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "testimonials", "perm": "testimonials", "i18nFields": ["client_title", "content"], "plainFields": ["client_name", "rating", "avatar_asset_id", "status", "sort_order"], "listColumns": "id, client_name, content, rating, status, sort_order, updated_at", "orderBy": "sort_order ASC"})

// PATCH /api/admin/<resource>/:id { status } — publish workflow
export default defineEventHandler(async (event) => h.publish(event))
