<template>
  <div class="adm adm-login">
    <div class="adm-login-card">
      <h1>Werkero</h1>
      <p class="sub">{{ t('login') }} · Admin Console</p>
      <div v-if="error" class="adm-error">{{ error }}</div>
      <form @submit.prevent="doLogin">
        <div class="adm-field">
          <label>{{ t('username') }}</label>
          <input v-model="username" class="adm-input" autocomplete="username" required />
        </div>
        <div class="adm-field">
          <label>{{ t('password') }}</label>
          <input v-model="password" type="password" class="adm-input" autocomplete="current-password" required />
        </div>
        <button class="adm-btn primary" style="width:100%;justify-content:center" :disabled="busy">
          {{ busy ? t('loading') : t('signIn') }}
        </button>
      </form>
      <p style="margin-top:16px;font-size:12.5px;text-align:center">
        <NuxtLink to="/">← {{ t('backToSite') }}</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import '~/assets/css/admin.css'
import { setAdminToken, useAdminApi, adminErrorMessage } from '~/composables/useAdminApi'
import { useAdminLocale } from '~/composables/useAdminLocale'

definePageMeta({ layout: false })

const { t } = useAdminLocale()
const api = useAdminApi()
const username = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

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
</script>
