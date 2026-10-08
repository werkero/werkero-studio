import { makeAdminResource } from '../../../utils/crud'

const h = makeAdminResource({"table": "process_steps", "perm": "process_steps", "i18nFields": ["title", "description"], "plainFields": ["step_no", "sort_order", "status"], "listColumns": "id, step_no, title, status, sort_order, updated_at", "orderBy": "sort_order ASC"})

export default defineEventHandler(async (event) => h.update(event))
