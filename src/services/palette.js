export function isValidHex(h) {
  return typeof h === 'string' && /^#([0-9a-fA-F]{6})$/.test(h)
}

export function extractHexes(text) {
  const m = String(text || '').match(/#[0-9a-fA-F]{6}\b/g)
  return (m || []).map((h) => h.toLowerCase()).slice(0, 4)
}

/**
 * A direction's 4-color palette (primary / secondary / aux1 / aux2).
 * Reads the structured `palette` object, falls back to hex codes inside the `color` text.
 * Returns [] if fewer than 2 usable colors — callers decide how to degrade.
 */
export function directionPalette(d) {
  const p = d && d.palette
  const list = p ? [p.primary, p.secondary, p.aux1, p.aux2].filter(isValidHex) : []
  if (list.length === 4) return list
  const fromColor = extractHexes(d && d.color)
  for (const h of fromColor) {
    if (list.length >= 4) break
    if (!list.includes(h)) list.push(h)
  }
  return list.length >= 2 ? list : []
}