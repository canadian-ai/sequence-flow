"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Download } from "lucide-react"

import { JourneyPlayer, downloadJourneyHtml } from "@/components/ui/sequence-diagram"
import { decodeJourneyFragment, type SharedJourneyArtifact } from "@/lib/journey-url"

export function SharedJourney() {
  const [artifact, setArtifact] = useState<SharedJourneyArtifact | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const read = () => {
      try {
        setArtifact(decodeJourneyFragment(window.location.hash))
        setError(null)
      } catch (cause) {
        setArtifact(null)
        setError(cause instanceof Error ? cause.message : "Unable to read journey link.")
      }
    }
    read()
    window.addEventListener("hashchange", read)
    return () => window.removeEventListener("hashchange", read)
  }, [])

  return <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">
    <div className="mx-auto max-w-6xl">
      <Link href="/#editor" className="text-sm font-medium underline underline-offset-4">Sequence Flow / Editor</Link>
      {artifact ? <>
        <div className="mt-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Shared journey · URL artifact</p>
            <h1 className="mt-2 font-serif text-3xl font-bold sm:text-5xl">{artifact.title}</h1>
            {artifact.description ? <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">{artifact.description}</p> : null}
          </div>
          <button type="button" onClick={() => downloadJourneyHtml(artifact.slides, { title: artifact.title.replace(/[^a-z0-9-]+/gi, "-").toLowerCase(), theme: "light" })} className="inline-flex min-h-10 items-center gap-2 border border-border px-4 text-sm hover:bg-secondary"><Download className="size-4" />Export HTML</button>
        </div>
        <div className="mt-8 border border-border bg-card p-2 sm:p-4"><JourneyPlayer slides={artifact.slides} height={520} /></div>
        <p className="mt-5 text-xs text-muted-foreground">This journey is carried in the URL fragment, not saved on Sequence Flow servers. Anyone with the complete link can view its contents. Do not include secrets or confidential data.</p>
      </> : <div role="alert" className="mt-8 border border-border p-6"><h1 className="text-xl font-semibold">Journey unavailable</h1><p className="mt-3 text-sm text-muted-foreground">{error ?? "Loading journey..."}</p><Link href="/#editor" className="mt-4 inline-block text-sm underline">Create a journey</Link></div>}
    </div>
  </main>
}
