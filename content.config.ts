import { defineContentConfig, defineCollection, z } from '@nuxt/content'

// Homepage copy per locale — every string the homepage renders lives here.
const indexSchema = z.object({
  nav: z.object({
    services: z.string(),
    work: z.string(),
    process: z.string(),
    about: z.string(),
    contact: z.string(),
  }),
  hero: z.object({
    eyebrow: z.string(),
    line1: z.string(),
    line2: z.string(),
    line3: z.string(),
    accent: z.string(), // lime italic serif final line
    description: z.string(),
    cta_primary: z.string(),
    cta_secondary: z.string(),
  }),
  ticker: z.object({
    items: z.array(z.string()),
  }),
  position: z.object({
    eyebrow: z.string(),
    title_before: z.string(),
    title_accent: z.string(), // lime highlighter mark
    title_after: z.string(),
    items: z.array(
      z.object({
        num: z.string(),
        title: z.string(),
        text: z.string(),
      })
    ),
  }),
  services: z.object({
    eyebrow: z.string(),
    title: z.string(),
    note: z.string(),
    details: z.string(),
    items: z.array(
      z.object({
        icon: z.string(), // browser | globe | gear | palette
        title: z.string(),
        text: z.string(),
        points: z.array(z.string()),
      })
    ),
  }),
  works: z.object({
    eyebrow: z.string(),
    title: z.string(),
    note: z.string(),
    view_case: z.string(),
  }),
  process: z.object({
    eyebrow: z.string(),
    title: z.string(),
    note: z.string(),
    output: z.string(),
    steps: z.array(
      z.object({
        num: z.string(),
        title: z.string(),
        label: z.string(),
        text: z.string(),
        output: z.string(),
      })
    ),
  }),
  about: z.object({
    eyebrow: z.string(),
    title: z.string(),
    name: z.string(),
    role_line: z.string(),
    paragraphs: z.array(z.string()),
    cards: z.array(
      z.object({
        label: z.string(),
        title: z.string(),
        text: z.string(),
      })
    ),
  }),
  faq: z.object({
    eyebrow: z.string(),
    title: z.string(),
    items: z.array(
      z.object({
        q: z.string(),
        a: z.string(),
      })
    ),
  }),
  cta: z.object({
    title_before: z.string(),
    title_accent: z.string(), // lime italic serif
    note: z.string(),
    button: z.string(),
    browse_text: z.string(),
    github_label: z.string(),
  }),
  work_detail: z.object({
    back: z.string(),
    overview: z.string(),
    role: z.string(),
    scope: z.string(),
    showcase: z.string(),
    detail_title: z.string(),
    key_points: z.string(),
    next: z.string(),
    view: z.string(),
  }),
  footer: z.object({
    tagline: z.string(),
    explore_title: z.string(),
    services_title: z.string(),
    connect_title: z.string(),
    github_label: z.string(),
    contact_label: z.string(),
    location: z.string(),
    email: z.string(),
    github: z.string(),
    name_meaning: z.string(),
    back_to_top: z.string(),
    rights: z.string(),
  }),
})

// Project case copy per locale.
const workSchema = z.object({
  tagline: z.string(),
  blurb: z.string(), // one-liner for the hero strip
  category: z.string(), // e.g. "AI PRODUCT · FLAGSHIP"
  card_text: z.string(), // short body on the works card
  showcase_quote: z.string(), // lime banner line on the detail page
  role: z.string(),
  services: z.array(z.string()),
  order: z.number(),
  overview: z.string(),
  highlights: z.array(z.string()),
})

export default defineContentConfig({
  collections: {
    site: defineCollection({
      type: 'page',
      source: '*/index.md',
      schema: indexSchema,
    }),
    works: defineCollection({
      type: 'page',
      source: '*/works/*.md',
      schema: workSchema,
    }),
  },
})
