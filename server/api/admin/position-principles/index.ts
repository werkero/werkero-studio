import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "position_principles", "perm": "position_principles", "i18nFields": ["title", "description"], "plainFields": ["sort_order", "status"], "listColumns": "id, title, status, sort_order, updated_at", "orderBy": "sort_order ASC"})

export default defineEventHandler(async (event) => {
  if (event.method === 'POST') return h.create(event)
  return h.list(event)
})
