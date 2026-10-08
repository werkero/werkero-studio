import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "services", "perm": "services", "i18nFields": ["title", "description", "points"], "plainFields": ["slug", "icon", "sort_order", "status"], "listColumns": "id, slug, title, status, sort_order, updated_at", "orderBy": "sort_order ASC"})

export default defineEventHandler(async (event) => h.update(event))
