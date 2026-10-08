import { verifyLogin, signToken } from '../../utils/auth'
import { apiError } from '../../utils/api'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const username = String(body.username || '').trim()
  const password = String(body.password || '')
  if (!username || !password) apiError(400, 'VALIDATION', 'username and password required')
  const u = await verifyLogin(username, password, getRequestIP(event))
  const token = signToken(u)
  return {
    token,
    user: { id: u.id, username: u.username, email: u.email, role: u.role_slug },
  }
})
