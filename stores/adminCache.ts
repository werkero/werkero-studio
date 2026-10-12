import { defineStore } from 'pinia'

interface CacheEntry {
  data: any
  ts: number
}

// Admin data cache: avoids refetching on every page visit.
// TTL 3 minutes; call invalidate() after create/update/delete.
const TTL = 3 * 60 * 1000

export const useAdminCacheStore = defineStore('adminCache', () => {
  const cache = ref<Record<string, CacheEntry>>({})

  function get(key: string): any | undefined {
    const e = cache.value[key]
    if (!e) return undefined
    if (Date.now() - e.ts > TTL) {
      delete cache.value[key]
      return undefined
    }
    return e.data
  }

  function set(key: string, data: any) {
    cache.value[key] = { data, ts: Date.now() }
  }

  function invalidate(key?: string) {
    if (key) {
      // invalidate exact key + any key with same prefix (e.g. list pages)
      for (const k of Object.keys(cache.value)) {
        if (k === key || k.startsWith(key + ':')) delete cache.value[k]
      }
    } else {
      cache.value = {}
    }
  }

  return { get, set, invalidate }
})
