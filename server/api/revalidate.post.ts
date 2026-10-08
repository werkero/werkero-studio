import { useDb } from '../utils/db'
import { apiError } from '../utils/api'

// Content publish → trigger Vercel Deploy Hook. Machine-to-machine via ADMIN_TOKEN.
export default defineEventHandler(async (event) => {
  const token = getRequestHeader(event, 'authorization')?.replace('Bearer ', '')
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) apiError(401, 'NO_TOKEN', 'invalid admin token')
  const hook = process.env.VERCEL_DEPLOY_HOOK
  if (!hook) return { ok: true, note: 'VERCEL_DEPLOY_HOOK not configured' }
  const res = await fetch(hook, { method: 'POST' })
  await useDb().query(`INSERT INTO operation_logs (action, resource_type, changes) VALUES ('revalidate','deploy',$1::jsonb)`,
    [JSON.stringify({ status: res.status })])
  return { ok: res.ok, status: res.status }
})
