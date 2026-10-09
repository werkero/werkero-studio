<template>
  <div style="min-height: 100vh; background: #141414; display: flex; align-items: center; justify-content: center; padding: 16px;">
    <el-card style="width: 100%; max-width: 400px;">
      <template #header>
        <div style="text-align: center;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0;">Werkero</h1>
          <p style="font-size: 13px; color: #909399; margin: 4px 0 0;">{{ t('login') }} · Admin Console</p>
        </div>
      </template>

      <el-alert v-if="error" type="error" :closable="false" :title="error" style="margin-bottom: 16px;" />

      <form @submit.prevent="doLogin">
        <div style="margin-bottom: 16px;">
          <label style="display: block; font-size: 13px; margin-bottom: 6px;">{{ t('username') }}</label>
          <el-input v-model="username" autocomplete="username" required style="width: 100%;" />
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-size: 13px; margin-bottom: 6px;">{{ t('password') }}</label>
          <el-input v-model="password" type="password" autocomplete="current-password" required show-password style="width: 100%;" />
        </div>
        <el-button type="primary" native-type="submit" :loading="busy" style="width: 100%;" size="large">
          {{ busy ? t('loading') : t('signIn') }}
        </el-button>
      </form>

      <template #footer>
        <div style="text-align: center;">
          <NuxtLink to="/" style="font-size: 13px; color: #909399; text-decoration: none;">
            ← {{ t('backToSite') }}
          </NuxtLink>
        </div>
      </template>
    </el-card>
  </div>
</template>

<script setup lang="ts">
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
