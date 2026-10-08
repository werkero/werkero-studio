import jwt from 'jsonwebtoken'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'
import { hashPassword } from '../../../utils/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = String(body.token || '')
  const password = String(body.new_password || '')
  if (!token || password.length < 8) apiError(400, 'VALIDATION', 'token and new_password (min 8 chars) required')
  let payload: any
  try {
    payload = jwt.verify(token, JWT_SECRET)
    if (payload.purpose !== 'password_reset') throw new Error('wrong purpose')
  } catch { apiError(400, 'BAD_TOKEN', 'invalid or expired reset token') }
  const hash = await hashPassword(password)
  await useDb().query(`UPDATE admin_users SET password_hash=$1, failed_attempts=0, locked_until=NULL, updated_at=now() WHERE id=$2`,
    [hash, payload.uid])
  await useDb().query(`INSERT INTO login_logs (admin_user_id, ip_address, status, failure_reason) VALUES ($1,$2,'success','password reset completed')`,
    [payload.uid, getRequestIP(event)])
  return { ok: true }
})
