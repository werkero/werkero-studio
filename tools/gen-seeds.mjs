// Generates db/seed-services.sql and db/seed-faqs.sql from L1 JSON (single source of truth).
// Artifact copy; 7 locales.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const appRoot = join(here, '..', 'app')
const dbRoot = join(here, '..', 'db')
const LOCALES = ['en', 'zh-cn', 'zh-tw', 'fr', 'de', 'ru', 'ja']
const read = (loc, ns) => JSON.parse(readFileSync(join(appRoot, 'locales', loc, `${ns}.json`), 'utf8'))
const sqlStr = (s) => `'${String(s ?? '').replace(/'/g, "''")}'`
const jsonb = (obj) => sqlStr(JSON.stringify(obj))

// fix e-commerce doodle key in L1 (globe -> eglobe) for all locales
for (const loc of LOCALES) {
  const p = join(appRoot, 'locales', loc, 'services.json')
  const j = JSON.parse(readFileSync(p, 'utf8'))
  const item = j.items.find((x) => x.title && /commerce|电商|電商|e-commerce|EC/i.test(x.title))
  if (item && item.doodle === 'globe') {
    item.doodle = 'eglobe'
    writeFileSync(p, JSON.stringify(j, null, 2) + '\n')
  }
}
console.log('doodle key fixed')

// ---------- services ----------
const SLUGS = ['full-stack-web-apps', 'ai-product-engineering', 'e-commerce-systems', 'brand-web-design']
const en = read('en', 'services')
let svc = `-- Seed: services（artifact 文案，4 服务 x 7 语言）\n-- icon 字段存 doodle 类型；brand-web-design 为宽卡（前端按 slug 识别）\n`
en.items.forEach((ref, i) => {
  const title = {}, desc = {}
  for (const loc of LOCALES) {
    const it = read(loc, 'services').items[i]
    title[loc] = it.title
    desc[loc] = it.text
  }
  svc += `INSERT INTO services (brand_id, slug, icon, sort_order, status, title, description, points)\nVALUES (\n  (SELECT id FROM brands WHERE slug='werkero'),\n  ${sqlStr(SLUGS[i])},\n  ${sqlStr(ref.doodle)},\n  ${i + 1},\n  'published',\n  ${jsonb(title)},\n  ${jsonb(desc)},\n  '{}'\n) ON CONFLICT (brand_id, slug) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, icon=EXCLUDED.icon, status='published', sort_order=EXCLUDED.sort_order;\n\n`
})
writeFileSync(join(dbRoot, 'seed-services.sql'), svc)

// ---------- faqs ----------
const fq = read('en', 'faq')
let faqs = `-- Seed: faqs（artifact 文案，3 问答 x 7 语言）\n`
fq.items.forEach((ref, i) => {
  const q = {}, a = {}
  for (const loc of LOCALES) {
    const it = read(loc, 'faq').items[i]
    q[loc] = it.q
    a[loc] = it.a
  }
  faqs += `INSERT INTO faqs (brand_id, sort_order, status, question, answer)\nVALUES (\n  (SELECT id FROM brands WHERE slug='werkero'),\n  ${i + 1},\n  'published',\n  ${jsonb(q)},\n  ${jsonb(a)}\n);\n\n`
})
writeFileSync(join(dbRoot, 'seed-faqs.sql'), faqs)
console.log('seed-services.sql + seed-faqs.sql written')
