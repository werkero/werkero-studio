import { D } from './gen-locales.mjs'
import { D2 } from './gen-locales2.mjs'
import { D3 } from './gen-locales3.mjs'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const merged = { ...D, ...D2, ...D3 }
const root = join(here, '..', 'app', 'locales')
const LOCALES = ['en', 'zh-cn', 'zh-tw', 'fr', 'de', 'ru', 'ja']
for (const [ns, perLocale] of Object.entries(merged)) {
  for (const loc of LOCALES) {
    const data = perLocale[loc] ?? perLocale['en']
    const dir = join(root, loc)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `${ns}.json`), JSON.stringify(data, null, 2) + '\n')
  }
}
console.log('wrote', Object.keys(merged).length, 'namespaces x', LOCALES.length, 'locales')
