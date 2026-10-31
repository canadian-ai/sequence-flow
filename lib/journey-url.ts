import type { JourneySlide } from "@/components/ui/sequence-diagram"

export interface SharedJourneyArtifact {
  title: string
  description?: string
  slides: JourneySlide[]
}

// Links contain their own data in the URL fragment: no server upload or account required.
const MAX_FRAGMENT_LENGTH = 100_000
const MAX_SOURCE_LENGTH = 65_000
const MAX_SLIDES = 32

export function validateJourneyArtifact(value: unknown): SharedJourneyArtifact {
  if (!value || typeof value !== "object") throw new Error("Invalid journey artifact.")
  const item = value as Record<string, unknown>
  if (typeof item.title !== "string" || !item.title.trim() || item.title.length > 160) {
    throw new Error("Journey needs a title under 160 characters.")
  }
  if (item.description !== undefined && (typeof item.description !== "string" || item.description.length > 2000)) {
    throw new Error("Journey description is too long.")
  }
  if (!Array.isArray(item.slides) || !item.slides.length || item.slides.length > MAX_SLIDES) {
    throw new Error("A journey needs 1 to 32 slides.")
  }
  const ids = new Set<string>()
  for (const slide of item.slides) {
    if (!slide || typeof slide !== "object") throw new Error("Invalid journey slide.")
    const s = slide as Record<string, unknown>
    if (typeof s.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(s.id) || ids.has(s.id)) {
      throw new Error("Slide IDs must be unique and URL-safe.")
    }
    ids.add(s.id)
    if (typeof s.chart !== "string" || !/^\s*sequenceDiagram\b/.test(s.chart) || s.chart.length > 12000) {
      throw new Error("Each slide needs a Mermaid sequenceDiagram.")
    }
    if (s.title !== undefined && (typeof s.title !== "string" || s.title.length > 160)) {
      throw new Error("Slide title is too long.")
    }
    if (s.caption !== undefined && (typeof s.caption !== "string" || s.caption.length > 4000)) {
      throw new Error("Slide caption is too long.")
    }
    if (s.messageCaptions !== undefined && (!Array.isArray(s.messageCaptions) || s.messageCaptions.length > 100 || s.messageCaptions.some(x => typeof x !== "string" || x.length > 2000))) {
      throw new Error("Invalid narration for a slide.")
    }
  }
  return item as unknown as SharedJourneyArtifact
}

export function encodeJourneyFragment(value: SharedJourneyArtifact): string {
  const document = validateJourneyArtifact(value)
  const json = JSON.stringify(document)
  if (json.length > MAX_SOURCE_LENGTH) throw new Error("Journey is too large for URL sharing. Export HTML instead.")
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  const encoded = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  if (encoded.length > MAX_FRAGMENT_LENGTH) throw new Error("Journey is too large for URL sharing.")
  return "#data=" + encoded
}

export function decodeJourneyFragment(hash: string): SharedJourneyArtifact {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash
  const encoded = new URLSearchParams(fragment).get("data")
  if (!encoded || encoded.length > MAX_FRAGMENT_LENGTH || !/^[a-zA-Z0-9_-]+$/.test(encoded)) {
    throw new Error("Journey link is missing or invalid.")
  }
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/")
  const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
  const json = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  if (json.length > MAX_SOURCE_LENGTH) throw new Error("Journey link is too large.")
  return validateJourneyArtifact(JSON.parse(json))
}
