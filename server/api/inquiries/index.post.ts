import { useDb } from '../../utils/db'
import { getBrandId, apiError } from '../../utils/api'

// POST /api/inquiries — public contact form.
// Anti-spam: IP rate limit (5/hour, 20/day) + honeypot → spam.
export default defineEventHandler(async (event) => {
  const brandId = await getBrandId(event)
  const body = await readBody(event)
  const ip = getRequestIP(event) || 'unknown'

  const name = String(body.name || '').slice(0, 100).trim()
  const email = String(body.email || '').slice(0, 200).trim()
  const message = String(body.message || '').slice(0, 5000).trim()
  if (!name || !email || !message) apiError(400, 'VALIDATION', 'name, email and message are required')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) apiError(400, 'VALIDATION', 'invalid email')

  // Honeypot: bots fill the hidden field → mark as spam, still "succeed"
  const isHoneypot = !!body.company_website
  let status = isHoneypot ? 'spam' : 'new'

  if (!isHoneypot) {
    const { rows } = await useDb().query(
      `SELECT
         count(*) FILTER (WHERE created_at > now() - interval '1 hour')::int AS h,
         count(*) FILTER (WHERE created_at > now() - interval '1 day')::int AS d
       FROM inquiries WHERE ip_address = $1`, [ip])
    if (rows[0].h >= 5 || rows[0].d >= 20) apiError(429, 'RATE_LIMITED', 'too many inquiries from this IP')
  }

  await useDb().query(
    `INSERT INTO inquiries (brand_id, name, email, company, budget, message, source, ip_address, user_agent, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [brandId, name, email, String(body.company || '').slice(0, 200) || null,
     String(body.budget || '').slice(0, 100) || null, message,
     String(body.source || '').slice(0, 100) || null, ip,
     getRequestHeader(event, 'user-agent')?.slice(0, 500) || null, status])

  // TODO: Resend email notification to brands.contact_email (needs service_credentials)
  return { ok: true }
})
