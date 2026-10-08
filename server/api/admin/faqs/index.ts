import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "faqs", "perm": "faqs", "i18nFields": ["question", "answer"], "plainFields": ["category", "sort_order", "status"], "listColumns": "id, category, question, status, sort_order, updated_at", "orderBy": "sort_order ASC"})

export default defineEventHandler(async (event) => {
  if (event.method === 'POST') return h.create(event)
  return h.list(event)
})
