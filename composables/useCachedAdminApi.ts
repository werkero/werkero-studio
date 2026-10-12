import { useAdminCacheStore } from '~/stores/adminCache'

/**
 * Cached admin GET: returns cached data if fresh (3 min TTL),
 * otherwise fetches and caches. Mutations should call
 * useAdminCacheStore().invalidate(resourceKey) afterwards.
 *
 * Usage:
 *   const { cachedGet } = useCachedAdminApi()
 *   const list = await cachedGet('works', () => api.get('/api/admin/works', params))
 */
export function useCachedAdminApi() {
  const cache = useAdminCacheStore()
  const { get: _get, set: _set } = cache

  async function cachedGet<T>(key: string, fetcher: () => Promise<T>, params?: Record<string, any>): Promise<T> {
    const cacheKey = params && Object.keys(params).length
      ? `${key}:${JSON.stringify(params)}`
      : key
    const hit = _get(cacheKey)
    if (hit !== undefined) return hit as T
    const data = await fetcher()
    _set(cacheKey, data)
    return data
  }

  function invalidate(key?: string) {
    cache.invalidate(key)
  }

  return { cachedGet, invalidate }
}
