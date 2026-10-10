<template>
  <main v-if="page">
    <!-- HERO (dark, centered) -->
    <section class="contact-hero glow-wrap">
      <div class="glow glow-red hero-glow-r" aria-hidden="true" />
      <div class="glow glow-blue hero-glow-b" aria-hidden="true" />
      <div class="glow glow-purple hero-glow-p" aria-hidden="true" />
      <div class="wrap contact-hero-inner">
        <h1 class="serif contact-title rise in">{{ t.heroTitle }}</h1>
        <p class="contact-hero-sub rise in" style="transition-delay: 160ms">{{ t.heroSubtitle }}</p>
      </div>
    </section>

    <!-- INTRO + FORM -->
    <section class="section">
      <div class="wrap contact-grid">
        <!-- Left: intro -->
        <div>
          <Reveal>
            <h2 class="serif contact-office">{{ t.officeLabel }}</h2>
            <p class="contact-addr">{{ address }}</p>
            <p class="contact-mail">
              <span class="contact-label">{{ t.emailLabel }}</span><br />
              <a :href="`mailto:${email}`">{{ email }}</a>
            </p>
          </Reveal>
          <Reveal :delay="120">
            <p class="contact-intro">{{ teamIntro }}</p>
          </Reveal>
        </div>

        <!-- Right: form -->
        <Reveal :delay="80">
          <div class="contact-card">
            <h3 class="serif contact-form-title">{{ t.formTitle }}</h3>
            <p class="contact-form-text">{{ t.formText }}</p>

            <form v-if="!sent" @submit.prevent="submit">
              <div class="frow frow-2">
                <label class="field">
                  <span>{{ t.name }} *</span>
                  <input v-model="form.name" type="text" maxlength="100" required />
                </label>
                <label class="field">
                  <span>{{ t.email }} *</span>
                  <input v-model="form.email" type="email" maxlength="200" required />
                </label>
              </div>
              <div class="frow frow-2">
                <label class="field">
                  <span>{{ t.company }} <em>({{ t.optional }})</em></span>
                  <input v-model="form.company" type="text" maxlength="200" />
                </label>
                <label class="field">
                  <span>{{ t.budget }} <em>({{ t.optional }})</em></span>
                  <input v-model="form.budget" type="text" maxlength="100" />
                </label>
              </div>
              <label class="field">
                <span>{{ t.message }} *</span>
                <textarea v-model="form.message" rows="5" maxlength="5000" required />
              </label>
              <!-- honeypot -->
              <input v-model="form.company_website" type="text" class="hp" tabindex="-1" autocomplete="off" />
              <p v-if="error" class="contact-error">{{ error }}</p>
              <button type="submit" class="btn-lime contact-submit" :disabled="sending">
                {{ sending ? t.sending : t.submit }}
                <svg class="arr" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 L17 7 M8 7 h9 v9" /></svg>
              </button>
            </form>

            <div v-else class="contact-success">
              <p class="serif contact-success-title">✳</p>
              <p>{{ t.success }}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
const { locale, page } = useSiteContent()
const { settings } = await useSiteSettings()
// Brand contact email (brands.contact_email), editable in admin Settings → Brand tab.
const { data: brand } = await useFetch('/api/brand', { key: 'brand-contact' })
const t = computed(() => page.value.contact ?? {})

// site_settings JSONB values: { en: '…', 'zh-cn': '…' } — pick current locale
const pickSetting = (key: string) => {
  const v = (settings.value as any)?.[key]
  if (v == null) return ''
  if (typeof v === 'string') return v
  return v[locale.value] ?? v.en ?? ''
}
const address = computed(() => pickSetting('contact.address'))
const teamIntro = computed(() => pickSetting('contact.team_intro'))
// Brand contact email first; falls back to the footer email from locale JSON.
const email = computed(() => (brand.value as any)?.contact_email || page.value.footer.email)

const form = reactive({ name: '', email: '', company: '', budget: '', message: '', company_website: '' })
const sending = ref(false)
const sent = ref(false)
const error = ref('')

async function submit() {
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    error.value = t.value.required
    return
  }
  sending.value = true
  error.value = ''
  try {
    await $fetch('/api/inquiries', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim() || undefined,
        budget: form.budget.trim() || undefined,
        message: form.message.trim(),
        source: 'contact-page',
        company_website: form.company_website || undefined,
      },
    })
    sent.value = true
  } catch (e: any) {
    error.value = e?.data?.message || t.value.error
  } finally {
    sending.value = false
  }
}

useHead({ title: () => `${t.value.heroTitle} — Werkero Studio` })
</script>

<style scoped>
/* ---------- HERO ---------- */
.contact-hero { position: relative; background: #0a0a0e; color: var(--paper); padding: 10rem 0 7rem; overflow: hidden; }
.contact-hero .hero-glow-r { width: 52vw; height: 52vw; left: -14vw; top: -10vw; opacity: 0.55; }
.contact-hero .hero-glow-b { width: 46vw; height: 46vw; right: -12vw; top: 6vw; opacity: 0.5; }
.contact-hero .hero-glow-p { width: 40vw; height: 40vw; left: 30vw; bottom: -16vw; opacity: 0.4; }
.contact-hero-inner { text-align: center; position: relative; z-index: 1; padding-top: 4rem; }
.contact-hero .contact-title { font-size: clamp(3.4rem, 9vw, 8.5rem); line-height: 1.02; letter-spacing: -0.01em; color: #faf7f0; margin: 0; font-weight: 500; }
.contact-hero-sub { color: rgba(250, 247, 240, 0.72); font-size: clamp(1.05rem, 1.6vw, 1.35rem); margin: 1.6rem 0 0; letter-spacing: 0.02em; }

/* ---------- INTRO + FORM ---------- */
.contact-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: clamp(2.5rem, 6vw, 5.5rem); align-items: start; }
.contact-office { font-size: clamp(2.4rem, 4.5vw, 4rem); margin: 0 0 1.2rem; letter-spacing: -0.01em; }
.contact-addr { font-size: 1.05rem; line-height: 1.7; margin: 0 0 1.6rem; max-width: 32ch; }
.contact-mail { margin: 0 0 2.2rem; line-height: 1.7; }
.contact-label { font-size: 0.78rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.55; }
.contact-mail a { color: var(--ink); font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
.contact-intro { font-size: 1.02rem; line-height: 1.8; opacity: 0.78; max-width: 44ch; border-top: 1px solid var(--line); padding-top: 2rem; }

.contact-card { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: clamp(1.6rem, 3vw, 2.6rem); box-shadow: 0 24px 60px rgba(11, 11, 14, 0.07); }
.contact-form-title { font-size: 1.7rem; margin: 0 0 0.5rem; }
.contact-form-text { opacity: 0.62; margin: 0 0 1.8rem; font-size: 0.95rem; }

.frow { display: grid; gap: 1.1rem; margin-bottom: 1.1rem; }
.frow-2 { grid-template-columns: 1fr 1fr; }
.field { display: block; margin-bottom: 1.1rem; }
.field > span { display: block; font-size: 0.82rem; font-weight: 600; letter-spacing: 0.04em; margin-bottom: 0.45rem; }
.field > span em { font-style: normal; font-weight: 400; opacity: 0.5; }
.field input, .field textarea {
  width: 100%; box-sizing: border-box;
  border: 1px solid var(--line); border-radius: 12px;
  padding: 0.85rem 1rem; font: inherit; font-size: 0.95rem;
  background: var(--paper); color: var(--ink);
  transition: border-color 0.25s, box-shadow 0.25s;
}
.field input:focus, .field textarea:focus { outline: none; border-color: var(--ink); box-shadow: 0 0 0 3px rgba(11, 11, 14, 0.08); }
.field textarea { resize: vertical; min-height: 120px; }
.hp { position: absolute; left: -9999px; opacity: 0; height: 0; }

.contact-submit { width: 100%; justify-content: center; margin-top: 0.4rem; }
.contact-submit:disabled { opacity: 0.6; cursor: wait; transform: none; }
.contact-error { color: #b3261e; font-size: 0.9rem; margin: 0 0 1rem; }
.contact-success { text-align: center; padding: 2.5rem 1rem; }
.contact-success-title { font-size: 3rem; color: var(--lime); margin: 0 0 1rem; }
.contact-success p:last-child { font-size: 1.05rem; line-height: 1.7; }

@media (max-width: 860px) {
  .contact-grid { grid-template-columns: 1fr; }
  .frow-2 { grid-template-columns: 1fr; }
}
</style>
