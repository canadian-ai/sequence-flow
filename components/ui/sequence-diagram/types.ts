export type ArrowLine = "solid" | "dashed"
export type ArrowHead = "filled" | "open" | "cross" | "none"
export type NotePlacement = "left" | "right" | "over"

export interface SeqParticipant {
  id: string
  label: string
  /** `actor` keyword renders a person glyph instead of a plain box. */
  actor: boolean
  boxId?: string
  /** Shown in a hover tooltip on the participant's box. Set via `%% tooltip Name: text`. */
  explanation?: string
}

export interface SeqBox {
  id: string
  label: string
  participantIds: string[]
  /** Shown in a hover tooltip on the container. Set via `%% tooltip Label: text`. */
  explanation?: string
}

export interface SeqMessage {
  kind: "message"
  index: number
  from: string
  to: string
  text: string
  line: ArrowLine
  head: ArrowHead
  self: boolean
  /** `+` suffix: activate the target after this message. */
  activateTarget: boolean
  /** `-` suffix: deactivate the source after this message. */
  deactivateSource: boolean
  /** Shown in a hover tooltip on the message label, and used as a JourneyPlayer step caption. Set via trailing `%% tooltip: text`. */
  explanation?: string
}

export interface SeqNote {
  kind: "note"
  index: number
  placement: NotePlacement
  participantIds: string[]
  text: string
  /** Shown in a hover tooltip on the note, and used as a JourneyPlayer step caption. Set via trailing `%% tooltip: text`. */
  explanation?: string
}

export interface SeqActivation {
  kind: "activate" | "deactivate"
  index: number
  participantId: string
}

export type SeqEvent = SeqMessage | SeqNote | SeqActivation

export interface SeqModel {
  title?: string
  participants: SeqParticipant[]
  boxes: SeqBox[]
  events: SeqEvent[]
}

export interface SequenceLayoutOptions {
  /** Horizontal distance between lifeline centers. */
  columnGap?: number
  /** Vertical distance between consecutive messages. */
  messageGap?: number
  /** Repeat the participant boxes at the bottom of the diagram. */
  showBottomActors?: boolean
  /**
   * Play a one-time fade+rise entrance animation on nodes, staggered
   * left-to-right by column. Off by default; used by JourneyPlayer slides.
   */
  animateIn?: boolean
  /**
   * Multiplier applied to every `animateIn` delay/duration. 1 is normal
   * pace, >1 slows the reveal down (more time to read each step), <1
   * speeds it up. Only has an effect when `animateIn` is set.
   */
  speed?: number
}
