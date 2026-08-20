import Image from "next/image"
import Link from "next/link"
import { Github, Star } from "lucide-react"

import { EditorWorkbench } from "@/components/demo/editor-workbench"
import { JourneyCatalog } from "@/components/demo/journey-catalog"
import { HeroInstall } from "@/components/hero-install"
import { ThemeToggle } from "@/components/theme-toggle"

const nativeHtml = `<script type="module" src="/sequence-flow.js"></script>
<sequence-flow-journey theme="dark">
  <script type="application/json">
    [{ "id": "discover", "title": "Discover",
       "chart": "sequenceDiagram\\n  Customer->>Team: Share goal" }]
  </script>
</sequence-flow-journey>`

export default function Page() {
  return <main className="min-h-screen overflow-x-hidden">
    <nav className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur" aria-label="Primary navigation"><div className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"><Link href="#top" className="flex items-center gap-2 font-medium"><Image src="/icon-black.svg" alt="" width={22} height={22} className="size-5 dark:invert" priority /><span>Sequence Flow</span></Link><div className="flex items-center gap-3"><div className="hidden items-center gap-5 font-mono text-xs text-muted-foreground sm:flex"><Link href="#library" className="hover:text-foreground">Use cases</Link><Link href="#editor" className="hover:text-foreground">Editor</Link><Link href="#html" className="hover:text-foreground">Native HTML</Link></div><Link href="https://github.com/canadian-ai/sequence-flow" target="_blank" rel="noreferrer" aria-label="Star Sequence Flow on GitHub" className="group inline-flex h-9 items-center overflow-hidden rounded-full border border-border bg-foreground text-background shadow-sm transition-[width,transform,background-color] duration-300 ease-out hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"><span className="flex size-9 shrink-0 items-center justify-center"><Github className="size-4" aria-hidden="true" /></span><span className="grid w-0 grid-cols-[0fr] items-center overflow-hidden opacity-0 transition-all duration-300 ease-out group-hover:w-[4.4rem] group-hover:grid-cols-[1fr] group-hover:opacity-100 group-focus-visible:w-[4.4rem] group-focus-visible:grid-cols-[1fr] group-focus-visible:opacity-100"><span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap pr-3 font-mono text-xs font-medium"><Star className="size-3.5" aria-hidden="true" />Star</span></span></Link><ThemeToggle /></div></div></nav>

    <header id="top" className="border-b border-border">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.65fr)]">
          <div className="flex max-w-4xl flex-col gap-5"><div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground"><span>Open source</span><span>/</span><span>Business + technical journeys</span><span>/</span><span>MIT</span></div><h1 className="text-balance font-serif text-5xl font-bold leading-[.98] tracking-tight sm:text-7xl">See how work moves, from intent to outcome.</h1><p className="max-w-2xl text-pretty text-base font-medium leading-relaxed text-foreground sm:text-lg">Built for developers.</p><p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">Sequence Flow intentionally stays narrow: installable visualization primitives and portable agent instructions, with no product workspace or proprietary runtime attached. AI has made it easy to generate code, but understanding a system as a whole still leans on Mermaid &mdash; powerful, yet easy to get lost in. This tool makes that legible.</p></div>
          <HeroInstall />
        </div>
        <div id="library"><JourneyCatalog hero /></div>
      </div>
    </header>

    <section id="editor" className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-16 sm:px-6 sm:py-24"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div className="flex max-w-3xl flex-col gap-2"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">01 / Author and export</span><h2 className="text-balance font-serif text-3xl font-bold sm:text-5xl">Start with the journey, not the diagram.</h2></div><p className="max-w-md text-sm leading-relaxed text-muted-foreground">Write a progressive story in annotated Markdown or JSON. Preview narration, choose a theme, copy React code, or download portable HTML.</p></div><EditorWorkbench /></section>

    <section id="html" className="border-y border-border bg-card"><div className="mx-auto grid w-full max-w-7xl lg:grid-cols-2"><div className="flex flex-col gap-6 border-b border-border p-5 sm:p-8 lg:border-r lg:border-b-0"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">02 / Native HTML</span><h2 className="font-serif text-3xl font-bold sm:text-4xl">No React required.</h2><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Register the Web Component once, then provide slides as safe JSON. The custom element owns its accessible controls and isolated styles.</p><pre className="max-w-full overflow-auto border border-border bg-secondary p-4 text-xs leading-relaxed"><code>{nativeHtml}</code></pre></div><div className="flex flex-col gap-6 p-5 sm:p-8"><span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">03 / Portable export</span><h2 className="font-serif text-3xl font-bold sm:text-4xl">One file. Fully interactive.</h2><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Every journey exports as responsive HTML with data, styles, navigation, autoplay, keyboard controls, and dark mode included. It works offline and sends nothing to a server.</p><div className="grid gap-px border border-border bg-border sm:grid-cols-2">{["No network dependency","Safe JSON serialization","Arrow-key navigation","Light and dark themes"].map(item=><div key={item} className="bg-background p-4 text-sm font-medium">{item}</div>)}</div></div></div></section>

    <footer className="border-t border-border"><div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex items-center gap-3"><Image src="/icon-black.svg" alt="Canadian AI" width={22} height={22} className="size-5 dark:invert" /><div className="flex flex-col"><span>Open source from Canadian AI.</span><span className="font-mono text-xs text-muted-foreground/80">Built in Montréal by Canadian AI.</span></div></div><div className="flex gap-5"><Link href="https://github.com/canadian-ai/sequence-flow" className="hover:text-foreground">GitHub</Link><Link href="https://canadian-ai.ca" className="hover:text-foreground">Canadian AI</Link></div></div></footer>
  </main>
}
