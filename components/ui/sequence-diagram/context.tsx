"use client"

import { createContext, useContext } from "react"

export interface SequenceHoverState {
  hoveredEdge: string | null
  activeParticipants: Set<string>
  setHover: (edge: string | null, participants: string[]) => void
}

export const SequenceHoverContext = createContext<SequenceHoverState>({
  hoveredEdge: null,
  activeParticipants: new Set(),
  setHover: () => {},
})

export function useSequenceHover() {
  return useContext(SequenceHoverContext)
}
