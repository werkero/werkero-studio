import { useDb } from './db'
import { decryptSecret } from './crypto'

// Get Resend API key: service_credentials table first (admin-editable),
// fallback to env (Vercel integration).
async function getResendKey(brandId: string): Promise<string | null> {
  try {
    const { rows } = await useDb().query(
      `SELECT key_encrypted FROM service_credentials WHERE brand_id=$1 AND provider='resend' AND is_active=true LIMIT 1`,
      [brandId])
    if (rows.length && rows[0].key_encrypted) {
      return decryptSecret(rows[0].key_encrypted)
    }
  } catch { /* fall through to env */ }
  return process.env.RESEND_API_KEY || null
}

interface InquiryMail {
  name: string
  email: string
  company?: string | null
  budget?: string | null
  message: string
}

// Get sender address from site_settings (mail.from), fallback to default.
async function getFromAddress(brandId: string): Promise<string> {
  try {
    const { rows } = await useDb().query(
      `SELECT value FROM site_settings WHERE brand_id=$1 AND key='mail.from' LIMIT 1`,
      [brandId])
    const v = typeof rows[0]?.value === 'string' ? rows[0].value.trim() : ''
    if (v) return v
  } catch { /* use default */ }
  return 'Werkero Studio <noreply@email.a1l.xyz>'
}

// Send new-inquiry notification email. Fire-and-forget: never throws.
export async function sendInquiryNotification(
  brandId: string,
  to: string,
  inquiry: InquiryMail,
): Promise<void> {
  try {
    const apiKey = await getResendKey(brandId)
    if (!apiKey || !to) return

    const from = await getFromAddress(brandId)

    const subject = `New inquiry from ${inquiry.name}`
    const lines = [
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      inquiry.company ? `Company: ${inquiry.company}` : null,
      inquiry.budget ? `Budget: ${inquiry.budget}` : null,
      '',
      'Message:',
      inquiry.message,
    ].filter((l) => l !== null)

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text: lines.join('\n'),
        reply_to: inquiry.email,
      }),
    })
  } catch {
    // notification failure must not break the inquiry submission
  }
}
