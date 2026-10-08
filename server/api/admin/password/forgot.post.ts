import jwt from 'jsonwebtoken'
import { useDb } from '../../../utils/db'
import { apiError, getBrandId } from '../../../utils/api'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production'

// One-time JWT (purpose=password_reset, 1h). Emailed in production;
// in Phase 1 without Resend key, the token is returned for manual delivery.
export default defineEventHandler(async (event) => {
  const brandId = await getBrandId(event)
  const body = await readBody(event)
  const email = String(body.email || '').trim().toLowerCase()
  if (!email) apiError(400, 'VALIDATION', 'email required')
  const { rows } = await useDb().query(
    `SELECT id FROM admin_users WHERE email=$1 AND brand_id=$2 AND deleted_at IS NULL LIMIT 1`, [email, brandId])
  // Always return ok to avoid email enumeration
  if (!rows.length) return { ok: true }
  const token = jwt.sign({ uid: rows[0].id, purpose: 'password_reset' }, JWT_SECRET, { expiresIn: '1h' })
  await useDb().query(`INSERT INTO login_logs (admin_user_id, ip_address, status, failure_reason) VALUES ($1,$2,'success','password reset requested')`,
    [rows[0].id, getRequestIP(event)])
  // TODO: send via Resend when service_credentials has resend key
  return { ok: true, debug_token: process.env.NODE_ENV === 'production' ? undefined : token }
})
