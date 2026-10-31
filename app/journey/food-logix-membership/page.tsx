import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { JourneyPlayer, type JourneySlide } from "@/components/ui/sequence-diagram"
import artifact from "@/public/artifacts/food-logix-membership-approval.json"

export const metadata: Metadata = {
  title: "Food Logix Membership Journey | Sequence Flow",
  description: artifact.description,
}

export default function FoodLogixJourneyPage() {
  return <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">
    <div className="mx-auto max-w-6xl">
      <Link href="/" className="flex items-center gap-2 text-sm font-medium">
        <Image src="/icon-black.svg" alt="" width={20} height={20} className="dark:invert" />
        Sequence Flow
      </Link>
      <p className="mt-10 font-mono text-xs uppercase tracking-widest text-muted-foreground">Journey artifact · Food Logix</p>
      <h1 className="mt-3 max-w-4xl font-serif text-3xl font-bold sm:text-5xl">{artifact.title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{artifact.description}</p>
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <a href="/artifacts/food-logix-membership-approval.md" download className="underline underline-offset-4">Download annotated Markdown</a>
        <a href="/artifacts/food-logix-membership-approval.json" download className="underline underline-offset-4">Download JSON artifact</a>
      </div>
      <div className="mt-8 border border-border bg-card p-2 sm:p-4">
        <JourneyPlayer slides={artifact.slides as JourneySlide[]} height={520} />
      </div>
      <p className="mt-5 text-xs text-muted-foreground">Proposed process, not confirmation of a production integration. Company verification and listing review remain separate from billing.</p>
    </div>
  </main>
}
