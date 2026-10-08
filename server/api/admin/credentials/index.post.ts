import { requireAdmin, requirePermission, logOperation } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { encryptSecret, maskSecret } from '../../../utils/crypto'
import { apiError } from '../../../utils/api'

// Create/update a credential. Full key required every time; stored AES-256-GCM.
export default defineEventHandler(async (event) => {
  const s = await requireAdmin(event)
  requirePermission(s, 'credentials.edit')
  const body = await readBody(event)
  const provider = String(body.provider || '').trim()
  const secret = String(body.secret || '')
  if (!provider || !secret) apiError(400, 'VALIDATION', 'provider and secret required')
  const encrypted = encryptSecret(secret)
  const masked = maskSecret(secret)
  const cur = await useDb().query(`SELECT id FROM service_credentials WHERE brand_id=$1 AND provider=$2`,
    [s.brandId, provider])
  if (cur.rows.length) {
    await useDb().query(
      `UPDATE service_credentials SET encrypted_value=$1, masked=$2, label=$3, updated_at=now() WHERE id=$4`,
      [encrypted, masked, String(body.label || ''), cur.rows[0].id])
    await logOperation(s, 'update', 'service_credentials', cur.rows[0].id, { provider }, { provider, masked }, getRequestIP(event))
  } else {
    const ins = await useDb().query(
      `INSERT INTO service_credentials (brand_id, provider, label, encrypted_value, masked, config)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [s.brandId, provider, String(body.label || ''), encrypted, masked, JSON.stringify(body.config || {})])
    await logOperation(s, 'create', 'service_credentials', ins.rows[0].id, null, { provider, masked }, getRequestIP(event))
  }
  return { ok: true, masked }
})
