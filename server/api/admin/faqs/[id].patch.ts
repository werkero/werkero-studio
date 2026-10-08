import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "faqs", "perm": "faqs", "i18nFields": ["question", "answer"], "plainFields": ["category", "sort_order", "status"], "listColumns": "id, category, question, status, sort_order, updated_at", "orderBy": "sort_order ASC"})

// PATCH /api/admin/<resource>/:id { status } — publish workflow
export default defineEventHandler(async (event) => h.publish(event))
