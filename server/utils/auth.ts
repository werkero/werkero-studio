import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { useDb } from './db'
import { apiError } from './api'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret-change-in-production'
const JWT_TTL = '24h'

export interface AdminSession {
  uid: string
  brandId: string
  roleId: string
  roleSlug: string
  permissions: string[]
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10)
}

/** Verify credentials, enforce lockout. Returns user row on success. */
export async function verifyLogin(username: string, password: string, ip: string | null) {
  const { rows } = await useDb().query(
    `SELECT u.*, r.slug AS role_slug FROM admin_users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.username = $1 AND u.deleted_at IS NULL LIMIT 1`, [username])

  const fail = async (reason: string) => {
    if (rows.length) {
      const u = rows[0]
      const attempts = (u.failed_attempts || 0) + 1
      const lock = attempts >= 5 ? `, locked_until = now() + interval '30 minutes'` : ''
      await useDb().query(
        `UPDATE admin_users SET failed_attempts = $1${lock}, updated_at = now() WHERE id = $2`,
        [attempts, u.id])
      await useDb().query(
        `INSERT INTO login_logs (admin_user_id, username_attempted, ip_address, status, failure_reason) VALUES ($1,$2,$3,'failed',$4)`,
        [u.id, username, ip, reason])
    }
    apiError(401, 'AUTH_FAILED', reason)
  }

  if (!rows.length) return fail('用户不存在')
  const u = rows[0]
  if (!u.is_active) return fail('账号已禁用')
  if (u.locked_until && new Date(u.locked_until) > new Date()) return fail('账号已锁定，请稍后再试')
  const ok = await bcrypt.compare(password, u.password_hash)
  if (!ok) return fail('密码错误')

  await useDb().query(
    `UPDATE admin_users SET failed_attempts = 0, locked_until = NULL, last_login_at = now(), updated_at = now() WHERE id = $1`,
    [u.id])
  await useDb().query(
    `INSERT INTO login_logs (admin_user_id, username_attempted, ip_address, status) VALUES ($1,$2,$3,'success')`, [u.id, username, ip])
  return u
}

export function signToken(u: { id: string; brand_id: string; role_id: string; role_slug: string }): string {
  return jwt.sign({ uid: u.id, brandId: u.brand_id, roleId: u.role_id, roleSlug: u.role_slug }, JWT_SECRET, { expiresIn: JWT_TTL })
}

function getToken(event: any): string | null {
  const h = getRequestHeader(event, 'authorization')
  if (h?.startsWith('Bearer ')) return h.slice(7)
  return null
}

/** Load session from JWT; verifies user still active (instant revoke on disable). */
export async function requireAdmin(event: any): Promise<AdminSession> {
  const token = getToken(event)
  if (!token) apiError(401, 'NO_TOKEN', 'missing token')
  let payload: any
  try { payload = jwt.verify(token!, JWT_SECRET) } catch { apiError(401, 'BAD_TOKEN', 'invalid or expired token') }
  const { rows } = await useDb().query(
    `SELECT u.id, u.brand_id, u.role_id, u.is_active, r.slug AS role_slug
       FROM admin_users u JOIN roles r ON r.id = u.role_id
      WHERE u.id = $1 AND u.deleted_at IS NULL LIMIT 1`, [payload.uid])
  if (!rows.length || !rows[0].is_active) apiError(401, 'REVOKED', 'account disabled')
  const perms = await useDb().query(
    `SELECT p.slug FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
     WHERE rp.role_id = $1`, [rows[0].role_id])
  return {
    uid: rows[0].id, brandId: rows[0].brand_id, roleId: rows[0].role_id,
    roleSlug: rows[0].role_slug, permissions: perms.rows.map((r) => r.slug),
  }
}

/** Enforce one permission, e.g. requirePermission(session, 'works.edit') */
export function requirePermission(s: AdminSession, perm: string): void {
  if (!s.permissions.includes(perm)) apiError(403, 'FORBIDDEN', `missing permission: ${perm}`)
}

/** Write operation log with before/after diff. */
export async function logOperation(session: AdminSession, action: string, resourceType: string,
  resourceId: string | null, before: any, after: any, ip: string | null) {
  const changes = JSON.stringify({ before: before ?? null, after: after ?? null })
  await useDb().query(
    `INSERT INTO operation_logs (admin_user_id, brand_id, action, resource_type, resource_id, changes, ip_address)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`,
    [session.uid, session.brandId, action, resourceType, resourceId, changes, ip])
}
