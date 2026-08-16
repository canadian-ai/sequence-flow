/**
 * Minifies Mermaid sequence-diagram source: trims each line, collapses runs
 * of whitespace, and drops blank lines. Preserves `%% tooltip` comments since
 * they carry data this component's parser reads back.
 */
export function minifyMermaid(source: string): string {
  return source
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .filter((line) => line.length > 0)
    .join("\n")
}

export function downloadTextFile(fileName: string, contents: string, mimeType = "text/plain") {
  const blob = new Blob([contents], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
