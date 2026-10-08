import { requireAdmin, requirePermission } from '../../../utils/auth'
import { processTranslationJobs } from '../../../utils/translate'

// Manual trigger: process pending jobs now (also called internally after save).
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'translation.trigger')
  // Run async — return immediately
  const result = await processTranslationJobs(s.brandId)
  return { ok: true, ...result }
})
