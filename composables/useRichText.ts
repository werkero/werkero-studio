/** Minimal rich-text for L1 copy: **bold** -> <strong>, {hl}..{/hl} -> lime highlight. */
export function useRichText() {
  const rich = (s: string): string =>
    (s ?? '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\{hl\}([\s\S]+?)\{\/hl\}/g, '<em class="hl">$1</em>')
  return { rich }
}
