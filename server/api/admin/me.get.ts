import { requireAdmin } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  return { uid: s.uid, brandId: s.brandId, role: s.roleSlug, permissions: s.permissions }
})
