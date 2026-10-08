import crypto from 'crypto'

// AES-256-GCM for service_credentials. Key from env (32 bytes).
function getKey(): Buffer {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY || ''
  if (raw.length < 32) throw new Error('CREDENTIALS_ENCRYPTION_KEY must be at least 32 chars')
  return Buffer.from(raw.slice(0, 32))
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

export function decryptSecret(blob: string): string {
  const buf = Buffer.from(blob, 'base64')
  const iv = buf.subarray(0, 12)
  const tag = buf.subarray(12, 28)
  const enc = buf.subarray(28)
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
}

/** Mask for display: show last 4 chars only. */
export function maskSecret(plain: string): string {
  if (plain.length <= 4) return '****'
  return '****' + plain.slice(-4)
}
