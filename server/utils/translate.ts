import { useDb } from './db'
import { decryptSecret } from './crypto'

const DEEPL_API = 'https://api-free.deepl.com/v2/translate'

// Our locale → DeepL target lang. zh-tw: translate to ZH then OpenCC to traditional.
const DEEPL_LANG: Record<string, string> = {
  'en': 'EN', 'zh-cn': 'ZH', 'zh-tw': 'ZH', 'fr': 'FR', 'de': 'DE', 'ru': 'RU', 'ja': 'JA',
}

async function getDeepLKey(brandId: string): Promise<string | null> {
  const { rows } = await useDb().query(
    `SELECT encrypted_value FROM service_credentials WHERE brand_id=$1 AND provider='deepl' LIMIT 1`, [brandId])
  if (!rows.length) return null
  try { return decryptSecret(rows[0].encrypted_value) } catch { return null }
}

async function getGlossary(brandId: string): Promise<Record<string, string>> {
  const { rows } = await useDb().query(
    `SELECT value FROM site_settings WHERE brand_id=$1 AND key='translation.glossary' LIMIT 1`, [brandId])
  try { return JSON.parse(rows[0]?.value || '{}') } catch { return {} }
}

function protectGlossary(text: string, glossary: Record<string, string>): { text: string; restore: (t: string) => string } {
  const tokens: string[] = []
  let out = text
  for (const term of Object.keys(glossary)) {
    if (!term || !out.includes(term)) continue
    const tok = `__G${tokens.length}__`
    tokens.push(term)
    out = out.split(term).join(tok)
  }
  return { text: out, restore: (t: string) => { let r = t; tokens.forEach((term, i) => { r = r.split(`__G${i}__`).join(glossary[term] || term) }); return r } }
}

async function deeplTranslate(key: string, text: string, source: string, target: string): Promise<string> {
  const params = new URLSearchParams({
    auth_key: key, text,
    source_lang: DEEPL_LANG[source] || 'EN',
    target_lang: DEEPL_LANG[target] || 'EN',
  })
  const res = await fetch(DEEPL_API, { method: 'POST', body: params })
  if (res.status === 456) throw Object.assign(new Error('DeepL quota exhausted (HTTP 456)'), { quota: true })
  if (!res.ok) throw new Error(`DeepL HTTP ${res.status}`)
  const data = await res.json()
  const t = data?.translations?.[0]?.text
  if (!t) throw new Error('DeepL empty response')
  return t
}

/** Human-edited check: was field+locale manually edited after source update? */
async function humanEdited(brandId: string, resourceType: string, resourceId: string,
  field: string, targetLocale: string, jobCreatedAt: Date): Promise<boolean> {
  const { rows } = await useDb().query(
    `SELECT 1 FROM operation_logs
      WHERE brand_id=$1 AND resource_type=$2 AND resource_id=$3
        AND action='update' AND created_at > $4 LIMIT 1`,
    [brandId, resourceType, resourceId, jobCreatedAt])
  // Conservative: if any manual update happened after job creation, skip auto-overwrite
  return rows.length > 0
}

/** Process up to 20 pending jobs. Called after save (async) or manual trigger. */
export async function processTranslationJobs(brandId: string): Promise<{ done: number; failed: number; skipped: number }> {
  let done = 0, failed = 0, skipped = 0
  const { rows: jobs } = await useDb().query(
    `SELECT * FROM translation_jobs
      WHERE brand_id=$1 AND status='pending' ORDER BY created_at ASC LIMIT 20
      FOR UPDATE SKIP LOCKED`, [brandId])
  if (!jobs.length) return { done, failed, skipped }

  const key = await getDeepLKey(brandId)
  const glossary = await getGlossary(brandId)

  for (const job of jobs) {
    await useDb().query(`UPDATE translation_jobs SET status='processing', updated_at=now() WHERE id=$1`, [job.id])
    try {
      if (!key) throw Object.assign(new Error('DeepL key 未配置'), { noRetry: true })

      // Read source text
      const { rows: src } = await useDb().query(
        `SELECT ${job.field} AS f FROM ${job.resource_type} WHERE id=$1`, [job.resource_id])
      const fieldVal = src[0]?.f
      const sourceText: string | null = fieldVal?.[job.source_locale] ?? null
      if (sourceText == null) throw Object.assign(new Error('source text missing'), { noRetry: true })

      // Skip if human edited after job creation
      if (await humanEdited(brandId, job.resource_type, job.resource_id, job.field, job.target_locale, job.created_at)) {
        await useDb().query(`UPDATE translation_jobs SET status='skipped', updated_at=now() WHERE id=$1`, [job.id])
        skipped++
        continue
      }

      const { text, restore } = protectGlossary(sourceText, glossary)
      let translated = await deeplTranslate(key, text, job.source_locale, job.target_locale)
      translated = restore(translated)

      // zh-tw: simplified → traditional (OpenCC). Fallback: keep simplified.
      if (job.target_locale === 'zh-tw') {
        try {
          const { Converter } = await import('opencc-js')
          translated = Converter({ from: 'cn', to: 'tw' })(translated)
        } catch { /* keep simplified */ }
      }

      await useDb().query(
        `UPDATE ${job.resource_type} SET ${job.field} = jsonb_set(COALESCE(${job.field}, '{}'::jsonb), '{${job.target_locale}}', to_jsonb($1::text)), updated_at=now() WHERE id=$2`,
        [translated, job.resource_id])
      await useDb().query(`UPDATE translation_jobs SET status='done', updated_at=now() WHERE id=$1`, [job.id])
      await useDb().query(
        `INSERT INTO operation_logs (brand_id, action, resource_type, resource_id, changes)
         VALUES ($1,'auto_translate',$2,$3,$4::jsonb)`,
        [brandId, job.resource_type, job.resource_id, JSON.stringify({ field: job.field, locale: job.target_locale })])
      done++
    } catch (e: any) {
      const attempts = (job.attempts || 0) + 1
      if (e.quota || e.noRetry || attempts >= 3) {
        await useDb().query(`UPDATE translation_jobs SET status='failed', attempts=$1, error=$2, updated_at=now() WHERE id=$3`,
          [attempts, String(e.message).slice(0, 500), job.id])
        failed++
      } else {
        await useDb().query(`UPDATE translation_jobs SET status='pending', attempts=$1, error=$2, updated_at=now() WHERE id=$3`,
          [attempts, String(e.message).slice(0, 500), job.id])
      }
    }
  }
  return { done, failed, skipped }
}
