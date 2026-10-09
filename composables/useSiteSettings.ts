/** Site basic settings from site_settings table (public API). */
export async function useSiteSettings() {
  const { data } = await useFetch<Record<string, any>>('/api/settings', {
    key: 'site-settings',
    default: () => ({}),
  })
  const get = (key: string, fallback = ''): string => {
    const v = data.value?.[key]
    if (v == null) return fallback
    return typeof v === 'string' ? v : String(v)
  }
  return { settings: data, get }
}
