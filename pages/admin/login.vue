<template>
  <div class="lg-page">
    <!-- Branding panel -->
    <aside class="lg-brand">
      <div class="lg-orb lg-orb-a"></div>
      <div class="lg-orb lg-orb-b"></div>
      <div class="lg-brand-inner">
        <div>
          <div class="lg-kicker">Admin Console</div>
          <div class="lg-wordmark">Werkero</div>
          <p class="lg-tagline">{{ t('brandTagline') }}</p>
        </div>
        <ul class="lg-feats">
          <li v-for="f in feats" :key="f">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="10" cy="10" r="8.4" stroke-opacity=".35" />
              <path d="M7 10.2l2.2 2.2L13.4 8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>{{ t(f) }}</span>
          </li>
        </ul>
        <div class="lg-brand-foot">© 2026 Werkero</div>
      </div>
    </aside>

    <!-- Form panel -->
    <main class="lg-main">
      <div class="lg-card">
        <h1>{{ t('welcomeBack') }}</h1>
        <p class="lg-sub">{{ t('loginSubtitle') }}</p>

        <div v-if="error" :key="errKey" class="lg-errshake">
          <el-alert type="error" :closable="false" show-icon :title="error" />
        </div>

        <form class="lg-form" @submit.prevent="handleSubmit">
          <div class="lg-field">
            <label>{{ t('username') }}</label>
            <el-input v-model="username" size="large" autocomplete="username" required />
          </div>
          <div class="lg-field">
            <label>{{ t('password') }}</label>
            <el-input
              v-model="password"
              type="password"
              size="large"
              autocomplete="current-password"
              required
              show-password
            />
          </div>
          <div class="lg-row">
            <el-checkbox v-model="rememberMe">{{ t('rememberMe') }}</el-checkbox>
          </div>
          <el-button class="lg-submit" type="primary" native-type="submit" :loading="busy" size="large">
            {{ busy ? t('loading') : t('signIn') }}
          </el-button>
        </form>
      </div>

      <footer class="lg-foot">
        <span>© 2026 Werkero · {{ t('version') }} 1.0</span>
        <NuxtLink to="/">← {{ t('backToSite') }}</NuxtLink>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import 'element-plus/theme-chalk/dark/css-vars.css'
import { setAdminToken, useAdminApi, adminErrorMessage } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: false })
useHead({ htmlAttrs: { class: 'dark' } })

const { t } = useAdminLocale()
const api = useAdminApi()
const username = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)
const rememberMe = ref(true)
const errKey = ref(0)

const feats = ['featContent', 'featMedia', 'featI18n', 'featAccess']
const REMEMBER_USER_KEY = 'werkero_admin_remember_user'

onMounted(() => {
  try {
    const saved = localStorage.getItem(REMEMBER_USER_KEY)
    if (saved) username.value = saved
  } catch {}
})

async function doLogin() {
  error.value = ''
  busy.value = true
  try {
    const res = await api.post<{ token: string }>('/api/admin/login', {
      username: username.value,
      password: password.value,
    })
    setAdminToken(res.token)
    await navigateTo('/admin')
  } catch (e: any) {
    error.value = `${t('loginFailed')}: ${adminErrorMessage(e)}`
  } finally {
    busy.value = false
  }
}

async function handleSubmit() {
  await doLogin()
  if (error.value) errKey.value++
  try {
    if (!error.value && rememberMe.value) localStorage.setItem(REMEMBER_USER_KEY, username.value)
    else if (!rememberMe.value) localStorage.removeItem(REMEMBER_USER_KEY)
  } catch {}
}
</script>

<style scoped>
.lg-page {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  background: #0a0a0d;
  color: #f4f4f5;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* ---------- Branding panel ---------- */
.lg-brand {
  position: relative;
  flex: 1.15;
  overflow: hidden;
  display: flex;
  background: #0d0d12;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}
.lg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.55;
  animation: lg-drift 14s ease-in-out infinite alternate;
  pointer-events: none;
}
.lg-orb-a {
  width: 480px;
  height: 480px;
  left: -140px;
  top: -140px;
  background: radial-gradient(circle, rgba(214, 224, 74, 0.26), transparent 65%);
}
.lg-orb-b {
  width: 440px;
  height: 440px;
  right: -130px;
  bottom: -130px;
  background: radial-gradient(circle, rgba(64, 120, 255, 0.22), transparent 65%);
  animation-delay: -7s;
}
@keyframes lg-drift {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(60px, 40px) scale(1.12); }
}
.lg-brand::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px);
  background-size: 26px 26px;
  -webkit-mask-image: radial-gradient(ellipse at 30% 20%, black 25%, transparent 75%);
  mask-image: radial-gradient(ellipse at 30% 20%, black 25%, transparent 75%);
  pointer-events: none;
}
.lg-brand-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 44px;
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  padding: 64px;
  animation: lg-rise 0.7s ease both;
}
.lg-kicker {
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #d6e04a;
  font-weight: 600;
}
.lg-wordmark {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 64px;
  line-height: 1;
  font-weight: 700;
  color: #faf7f0;
  margin-top: 16px;
}
.lg-tagline {
  margin: 18px 0 0;
  font-size: 15px;
  line-height: 1.7;
  color: #a1a1aa;
  max-width: 380px;
}
.lg-feats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 15px;
}
.lg-feats li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #d4d4d8;
}
.lg-feats svg {
  width: 20px;
  height: 20px;
  flex: none;
  color: #d6e04a;
}
.lg-brand-foot {
  margin-top: auto;
  padding-top: 44px;
  font-size: 12px;
  color: #636366;
}

/* ---------- Form panel ---------- */
.lg-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 24px;
}
.lg-card {
  width: 100%;
  max-width: 380px;
  animation: lg-rise 0.7s 0.12s ease both;
}
.lg-card h1 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 30px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #fafafa;
}
.lg-sub {
  margin: 0 0 28px;
  font-size: 14px;
  color: #8e8e93;
}
.lg-errshake {
  margin-bottom: 18px;
  animation: lg-shake 0.45s ease;
}
@keyframes lg-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-7px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(3px); }
}
.lg-form {
  display: grid;
  gap: 18px;
}
.lg-field label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #c9c9ce;
  margin-bottom: 8px;
}
.lg-field :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--el-color-primary) inset, 0 0 0 3px rgba(64, 158, 255, 0.18);
}
.lg-row {
  display: flex;
  align-items: center;
  margin-top: -6px;
}
.lg-submit {
  width: 100%;
  margin-top: 6px;
  font-weight: 600;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.lg-submit:hover:not(:disabled):not(.is-loading) {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(64, 158, 255, 0.35);
}
.lg-submit:active:not(:disabled) {
  transform: translateY(0);
}
.lg-foot {
  margin-top: 52px;
  width: 100%;
  max-width: 380px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  color: #6e6e73;
}
.lg-foot a {
  color: #8e8e93;
  text-decoration: none;
  transition: color 0.15s ease;
}
.lg-foot a:hover {
  color: #d6e04a;
}
@keyframes lg-rise {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: none; }
}

/* ---------- Mobile ---------- */
@media (max-width: 900px) {
  .lg-page { flex-direction: column; }
  .lg-brand {
    border-right: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .lg-brand-inner {
    padding: 40px 28px 30px;
    gap: 20px;
  }
  .lg-wordmark { font-size: 40px; }
  .lg-tagline { font-size: 13.5px; }
  .lg-feats, .lg-brand-foot { display: none; }
  .lg-main {
    padding: 32px 20px 20px;
    justify-content: flex-start;
  }
  .lg-card h1 { font-size: 25px; }
}
</style>
