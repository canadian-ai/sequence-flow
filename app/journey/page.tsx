import type { Metadata } from "next"
import { SharedJourney } from "@/components/demo/shared-journey"

export const metadata: Metadata = {
  title: "Shared Journey | Sequence Flow",
  description: "Open a self-contained, shareable Mermaid journey in Sequence Flow.",
}

export default function JourneyPage() {
  return <SharedJourney />
}
