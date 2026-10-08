/** Global route guard for /admin/* — no token → /admin/login (login page excluded). */
import { getAdminToken } from '~/composables/useAdminApi'

export default defineNuxtRouteMiddleware((to) => {
  const isAdmin = /(^|\/)admin(\/|$)/.test(to.path)
  if (!isAdmin) return
  const isLogin = /(^|\/)admin\/login/.test(to.path)
  if (isLogin) return
  if (import.meta.client && !getAdminToken()) {
    return navigateTo('/admin/login')
  }
})
