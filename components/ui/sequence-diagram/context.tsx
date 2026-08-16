"use client"

import { createContext, useContext } from "react"

export interface SequenceHoverState {
  hoveredEdge: string | null
  /** Participant hovered directly (its own box), independent of any edge. */
  hoveredParticipant: string | null
  /** `box` container (tier grouping) currently hovered, independent of any edge. */
  hoveredBox: string | null
  activeParticipants: Set<string>
  setHover: (edge: string | null, participants: string[]) => void
  setParticipantHover: (participant: string | null) => void
  setBoxHover: (boxId: string | null) => void
}

export const SequenceHoverContext = createContext<SequenceHoverState>({
  hoveredEdge: null,
  hoveredParticipant: null,
  hoveredBox: null,
  activeParticipants: new Set(),
  setHover: () => {},
  setParticipantHover: () => {},
  setBoxHover: () => {},
})

export function useSequenceHover() {
  return useContext(SequenceHoverContext)
}
