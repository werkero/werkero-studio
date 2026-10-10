import bcrypt from 'bcrypt'
import { requireAdmin } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { apiError } from '../../../utils/api'
import { hashPassword } from '../../../utils/auth'

// Change own password (logged-in user).
// Body: { currentPassword, newPassword }
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  const body = await readBody(event)
  const currentPassword = String(body.currentPassword || '')
  const newPassword = String(body.newPassword || '')
  if (!currentPassword || !newPassword) apiError(400, 'VALIDATION', 'current and new password required')
  if (newPassword.length < 8) apiError(400, 'VALIDATION', 'new password must be at least 8 characters')

  const { rows } = await useDb().query(
    `SELECT password_hash FROM admin_users WHERE id=$1 AND deleted_at IS NULL LIMIT 1`, [s.uid])
  if (!rows.length) apiError(404, 'NOT_FOUND', 'user not found')
  const ok = await bcrypt.compare(currentPassword, rows[0].password_hash)
  if (!ok) apiError(401, 'AUTH_FAILED', 'current password incorrect')

  const hash = await hashPassword(newPassword)
  await useDb().query(`UPDATE admin_users SET password_hash=$1, updated_at=now() WHERE id=$2`, [hash, s.uid])
  return { ok: true }
})
