import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "process_steps", "perm": "process_steps", "i18nFields": ["title", "description"], "plainFields": ["sort_order", "status"], "listColumns": "id, title, description, status, sort_order, updated_at", "orderBy": "sort_order ASC"})

export default defineEventHandler(async (event) => {
  if (event.method === 'POST') return h.create(event)
  return h.list(event)
})
