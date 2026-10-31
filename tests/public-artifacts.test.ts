import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

describe("open-source repository does not ship customer artifacts", () => {
  it("keeps generated/customer artifact directories out of the public application", () => {
    expect(existsSync(join(process.cwd(), "public", "artifacts"))).toBe(false)
    expect(existsSync(join(process.cwd(), "private-journeys"))).toBe(false)
  })

  it("only defines a generic journey route", () => {
    const entries = readdirSync(join(process.cwd(), "app", "journey"))
    expect(entries.sort()).toEqual(["page.tsx"])
  })
})
