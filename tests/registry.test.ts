import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("shadcn registry", () => {
  it("ships every public sequence/journey runtime file", () => {
    const registry = JSON.parse(readFileSync(new URL("../registry.json", import.meta.url), "utf8"))
    const component = registry.items.find((item: { name: string }) => item.name === "sequence-diagram")
    const paths = component.files.map((file: { path: string }) => file.path)

    expect(paths).toEqual(expect.arrayContaining([
      "components/ui/sequence-diagram/sequence-diagram.tsx",
      "components/ui/sequence-diagram/journey-player.tsx",
      "components/ui/sequence-diagram/journey-markdown.ts",
      "components/ui/sequence-diagram/tooltip.tsx",
      "components/ui/sequence-diagram/sequence-diagram.css",
      "components/ui/sequence-diagram/index.ts",
      "registry/skill/SKILL.md",
    ]))
  })
})
