/** Admin API client: Bearer JWT from localStorage, 401 → back to login. */

export const ADMIN_TOKEN_KEY = 'werkero_admin_token'

export function getAdminToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string | null) {
  if (typeof localStorage === 'undefined') return
  if (token) localStorage.setItem(ADMIN_TOKEN_KEY, token)
  else localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function adminAuthHeaders(): Record<string, string> {
  const t = getAdminToken()
  return t ? { Authorization: `Bearer ${t}` } : {}
}

/** Extract a human-readable message from an API error. */
export function adminErrorMessage(e: any): string {
  return (
    e?.data?.error?.message ||
    e?.response?._data?.error?.message ||
    e?.message ||
    'Request failed'
  )
}

export function useAdminApi() {
  async function req<T>(path: string, opts: Record<string, any> = {}): Promise<T> {
    try {
      return await $fetch<T>(path, {
        ...opts,
        headers: { ...adminAuthHeaders(), ...(opts.headers || {}) },
      })
    } catch (e: any) {
      const status = e?.response?.status ?? e?.statusCode
      if (status === 401) {
        setAdminToken(null)
        await navigateTo('/admin/login')
      }
      throw e
    }
  }
  return {
    get: <T>(path: string, query?: Record<string, any>) => req<T>(path, { query }),
    post: <T>(path: string, body?: any) => req<T>(path, { method: 'POST', body }),
    put: <T>(path: string, body?: any) => req<T>(path, { method: 'PUT', body }),
    patch: <T>(path: string, body?: any) => req<T>(path, { method: 'PATCH', body }),
    del: <T>(path: string) => req<T>(path, { method: 'DELETE' }),
  }
}
