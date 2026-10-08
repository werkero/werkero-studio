import { requireAdmin } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  await useDb().query(`INSERT INTO login_logs (admin_user_id, ip_address, status, failure_reason) VALUES ($1,$2,'success','logout')`,
    [s.uid, getRequestIP(event)])
  return { ok: true }
})
