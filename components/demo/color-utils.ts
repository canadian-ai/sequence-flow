/** Returns "#ffffff" or "#0a0a0a" — whichever contrasts better against the given hex color. */
export function getContrastColor(hex: string): string {
  const clean = hex.replace("#", "")
  const r = Number.parseInt(clean.slice(0, 2), 16) || 0
  const g = Number.parseInt(clean.slice(2, 4), 16) || 0
  const b = Number.parseInt(clean.slice(4, 6), 16) || 0
  // Relative luminance (sRGB, perceptual weighting).
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? "#0a0a0a" : "#ffffff"
}
