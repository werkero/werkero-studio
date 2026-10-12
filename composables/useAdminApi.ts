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
  // Cached GET via Pinia (3 min TTL). Mutations auto-invalidate related cache.
  const cacheKey = (path: string, query?: Record<string, any>) =>
    query && Object.keys(query).length ? `${path}:${JSON.stringify(query)}` : path
  async function cachedGet<T>(path: string, query?: Record<string, any>): Promise<T> {
    // Pinia store only exists client-side after setup; fall back to direct fetch on server
    try {
      const { useAdminCacheStore } = await import('~/stores/adminCache')
      const cache = useAdminCacheStore()
      const key = cacheKey(path, query)
      const hit = cache.get(key)
      if (hit !== undefined) return hit as T
      const data = await req<T>(path, { query })
      cache.set(key, data)
      return data
    } catch {
      return req<T>(path, { query })
    }
  }
  function invalidateCache(path?: string) {
    try {
      // dynamic import to avoid SSR issues
      import('~/stores/adminCache').then(({ useAdminCacheStore }) => {
        useAdminCacheStore().invalidate(path)
      })
    } catch { /* noop */ }
  }
  async function mut<T>(method: string, path: string, body?: any): Promise<T> {
    const data = await req<T>(path, { method, body })
    // invalidate cache for this resource path (e.g. /api/admin/works)
    invalidateCache(path.split('?')[0])
    return data
  }
  return {
    get: cachedGet,
    post: <T>(path: string, body?: any) => mut<T>('POST', path, body),
    put: <T>(path: string, body?: any) => mut<T>('PUT', path, body),
    patch: <T>(path: string, body?: any) => mut<T>('PATCH', path, body),
    del: <T>(path: string) => mut<T>('DELETE', path),
  }
}
