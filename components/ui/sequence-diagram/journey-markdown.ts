import type { JourneySlide } from "./journey-player"

export interface JourneyMarkdownDocument {
  title?: string
  description?: string
  slides: JourneySlide[]
}

const ANNOTATION_RE = /^<!--\s*@([\w-]+)\s*:\s*([\s\S]*?)\s*-->$/

function annotationFrom(line: string) {
  const match = line.trim().match(ANNOTATION_RE)
  if (!match) return null
  return { key: match[1].toLowerCase(), value: match[2].trim() }
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "step"
}

export function parseJourneyMarkdown(markdown: string): JourneyMarkdownDocument {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n")
  let title: string | undefined
  const description: string[] = []
  const slides: JourneySlide[] = []

  let slideTitle: string | undefined
  let slideId: string | undefined
  let caption: string[] = []
  let messageCaptions: string[] = []
  let chart: string[] = []
  let inMermaid = false
  let hasSlide = false

  const flush = () => {
    if (!slideTitle && chart.length === 0 && caption.join("").trim() === "") return
    if (chart.length === 0) throw new Error(`Journey slide "${slideTitle ?? slides.length + 1}" is missing a mermaid code block.`)

    const resolvedTitle = slideTitle ?? `Step ${slides.length + 1}`
    const base = slideId ?? slugify(resolvedTitle)
    let id = base
    let suffix = 2
    while (slides.some((slide) => slide.id === id)) id = `${base}-${suffix++}`

    slides.push({
      id,
      title: resolvedTitle,
      caption: caption.join("\n").trim() || undefined,
      chart: chart.join("\n").trim(),
      ...(messageCaptions.length ? { messageCaptions: [...messageCaptions] } : {}),
    })

    slideTitle = undefined
    slideId = undefined
    caption = []
    messageCaptions = []
    chart = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (inMermaid) {
      if (line.trim().startsWith("```")) inMermaid = false
      else chart.push(raw)
      continue
    }

    if (/^```(?:mermaid|sequenceDiagram)\s*$/i.test(line.trim())) {
      inMermaid = true
      continue
    }

    if (line.startsWith("## ")) {
      if (hasSlide) flush()
      hasSlide = true
      slideTitle = line.slice(3).trim()
      continue
    }

    if (!hasSlide && line.startsWith("# ") && !title) {
      title = line.slice(2).trim()
      continue
    }

    const annotation = annotationFrom(line)
    if (annotation) {
      if (!hasSlide) continue
      if (annotation.key === "id") slideId = annotation.value
      if (annotation.key === "message" || annotation.key === "caption") messageCaptions.push(annotation.value)
      continue
    }

    if (!hasSlide) {
      if (line.trim()) description.push(raw)
    } else {
      caption.push(raw)
    }
  }

  if (inMermaid) throw new Error("Journey markdown contains an unclosed mermaid code block.")
  if (hasSlide) flush()
  if (slides.length === 0) throw new Error("Journey markdown must contain at least one `##` slide section.")

  return { title, description: description.join("\n").trim() || undefined, slides }
}

export function journeySlidesFromMarkdown(markdown: string): JourneySlide[] {
  return parseJourneyMarkdown(markdown).slides
}
