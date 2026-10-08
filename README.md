# Werkero Foundation

Reusable enterprise-grade brand-site foundation: Nuxt 3 + i18n (7 locales) + Postgres (Neon) + CMS API + admin panel.

- `db/` — migration v1 (21 tables) + works seed (6 works × 7 locales)
- App reads content from Postgres via `server/api/`; page copy from Nuxt Content Markdown (L2 JSON migration pending)

See `werkero-foundation-architecture.md` (v2.19) for the full design doc.
