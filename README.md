# Werkero Studio — Nuxt 3 + CMS

Personal studio site for Werkero. **All copy lives in Markdown** — edit a file,
rebuild, redeploy. No database, no backend, pure static output.

## The CMS: `content/`

```
content/
  en/  zh-cn/  zh-tw/  fr/  de/  ru/  ja/
    index.md            ← homepage copy (nav, hero, ticker, services, works, faq, cta, footer)
    works/
      laurero.md        ← case: frontmatter (title, tagline, role, services, order,
      ai-archives.md       overview, highlights) + markdown body (detail paragraphs)
      awarely.md
      aether.md
      arkhyx-blog.md
      kyvero.md
```

- Every page section reads from these files; components contain **zero hardcoded copy**.
- Content shape is typed via Zod schemas in `content.config.ts`
  (`site` collection ← `*/index.md`, `works` collection ← `*/works/*.md`).
- Copy rules: one-liners, factual only — no invented clients, testimonials, or numbers.

## Commands

```bash
npm install          # includes better-sqlite3 (build-time only, required by @nuxt/content v3)
npx nuxi dev         # local dev
npx nuxi generate    # static build → .output/public  (49 pages: 7 locales × 7 pages)
```

## Deploy (Cloudflare Pages)

- Build command: `npx nuxi generate`
- Output directory: `.output/public`
- Real `/works/[slug]/` paths work via directory index — no server needed.

## i18n

7 locales, `en` default (no prefix), others prefixed (`/zh-cn/`, …).
`@nuxtjs/i18n` `prefix_except_default`. Flags via the `flag-icons` npm package
(`fi fi-cn` / `fi-hk` / `fi-gb` / `fi-fr` / `fi-de` / `fi-ru` / `fi-jp`).
Language choice persists in `localStorage` (`werkero-locale`).

## Design tokens

- Dark `#0A0A0E` · warm white `#FAF7F0` · acid lime `#F2FE67`
- Headings: Playfair Display · Body/nav: Inter (Google Fonts)
- Motion: fade+rise reveals, lime trailing cursor, marquee ticker, 14s rotating badge
